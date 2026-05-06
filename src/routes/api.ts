import { Router, Request, Response } from "express";
import multer from "multer";
import { supabase, insertReceipt } from "../services/supabaseWriter";
import { extractReceiptData } from "../services/geminiVision";
import { validateReceiptData } from "../validators/receiptSchema";
import { uploadToR2 } from "../services/r2Uploader";
import { log, logError } from "../utils/logger";
import { sendOtp, verifyOtp } from "../services/otpService";
import { google } from "googleapis";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

// ---------- PUBLIC AUTH ROUTES (no auth required) ----------

// POST /api/auth/send-otp — sends OTP to WhatsApp
router.post("/auth/send-otp", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: "Valid phone number required" });
    }
    const result = await sendOtp(phone);
    if (result.success) {
      res.json({ success: true, message: "OTP sent to your WhatsApp" });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (e: any) {
    logError("API /auth/send-otp error", e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/verify-otp — verifies OTP and creates/returns user
router.post("/auth/verify-otp", async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP required" });
    }

    const result = verifyOtp(phone, otp);
    if (!result.valid) {
      return res.status(401).json({ success: false, error: result.error });
    }

    // OTP valid — get or create user
    const normalized = phone.replace(/[\s\-\+]/g, "");
    const fullPhone = normalized.length === 10 ? `+91${normalized}` : `+${normalized}`;

    const { data: user } = await supabase
      .from("users")
      .select("id, phone, created_at")
      .eq("phone", fullPhone)
      .single();

    if (user) {
      return res.json({ success: true, user, isNew: false });
    }

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({ phone: fullPhone })
      .select("id, phone, created_at")
      .single();

    if (error) throw error;
    res.json({ success: true, user: newUser, isNew: true });
  } catch (e: any) {
    logError("API /auth/verify-otp error", e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auth/oauth-config — returns available OAuth providers
router.get("/auth/oauth-config", (_req: Request, res: Response) => {
  const googleConfigured = Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  res.json({
    success: true,
    providers: {
      google: googleConfigured,
    },
  });
});

// GET /api/auth/google-url — generate Google OAuth consent URL
router.get("/api/auth/google-url", (_req: Request, res: Response) => {
  try {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(400).json({
        success: false,
        error: "Google OAuth is not configured on the server",
      });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
    });

    res.json({ success: true, url });
  } catch (e: any) {
    logError("API /auth/google-url error", e);
    res.status(500).json({ success: false, error: "Failed to generate Google OAuth URL" });
  }
});

// ---------- AUTH MIDDLEWARE ----------
function requirePhone(req: Request, res: Response, next: Function) {
  const phone = req.headers["x-user-phone"] as string;
  if (!phone) {
    return res.status(401).json({ error: "Missing X-User-Phone header" });
  }
  (req as any).userPhone = phone;
  next();
}

router.use(requirePhone);

// ---------- POST /api/upload-receipt ----------
router.post("/upload-receipt", upload.single("receipt"), async (req: Request, res: Response) => {
  try {
    const phone = (req as any).userPhone;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No receipt image uploaded" });
    }

    log(`[upload] Received ${file.size} bytes from ${phone}`);

    // 1. Upload to R2
    let r2Url = "";
    try {
      r2Url = await uploadToR2(file.buffer, phone.replace(/\+/g, ""));
    } catch (e: any) {
      logError("[upload] R2 upload failed, continuing without image URL", e);
    }

    // 2. Extract receipt data with Gemini Vision
    const rawData = await extractReceiptData(file.buffer);

    // 3. Validate with Zod
    const validated = validateReceiptData(rawData);

    // 4. Insert into Supabase
    const receiptId = await insertReceipt(validated, r2Url, phone);

    // 5. Return the new receipt
    const { data: receipt } = await supabase
      .from("receipts")
      .select("*, receipt_items(*)")
      .eq("id", receiptId)
      .single();

    res.json({
      success: true,
      receipt: receipt ? mapReceipt(receipt) : { id: receiptId },
    });
  } catch (e: any) {
    logError("API /upload-receipt error", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- GET /api/receipts ----------
router.get("/receipts", async (req: Request, res: Response) => {
  try {
    const phone = (req as any).userPhone;
    const { category, search, limit } = req.query;

    let query = supabase
      .from("receipts")
      .select("*, receipt_items(*)")
      .eq("user_phone", phone)
      .order("purchase_date", { ascending: false });

    if (limit) query = query.limit(Number(limit));

    const { data, error } = await query;
    if (error) throw error;

    let receipts = data || [];
    if (category && category !== "All") {
      receipts = receipts.filter(
        (r: any) =>
          (r.category || guessCategory(r.store_name, r.receipt_items)).toLowerCase() ===
          (category as string).toLowerCase()
      );
    }
    if (search) {
      const q = (search as string).toLowerCase();
      receipts = receipts.filter(
        (r: any) =>
          r.store_name?.toLowerCase().includes(q) ||
          r.receipt_items?.some((i: any) => i.name?.toLowerCase().includes(q))
      );
    }

    res.json(receipts.map(mapReceipt));
  } catch (e: any) {
    logError("API /receipts error", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- GET /api/receipts/:id ----------
router.get("/receipts/:id", async (req: Request, res: Response) => {
  try {
    const phone = (req as any).userPhone;
    const { id } = req.params;

    const { data: receipt, error } = await supabase
      .from("receipts")
      .select("*, receipt_items(*)")
      .eq("id", id)
      .eq("user_phone", phone)
      .single();

    if (error || !receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    res.json(mapReceipt(receipt));
  } catch (e: any) {
    logError("API /receipts/:id error", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- GET /api/analytics/spending ----------
router.get("/analytics/spending", async (req: Request, res: Response) => {
  try {
    const phone = (req as any).userPhone;
    const { period = "week" } = req.query;

    const { data, error } = await supabase
      .from("receipts")
      .select("total_amount, purchase_date")
      .eq("user_phone", phone);

    if (error) throw error;

    const receipts = data || [];
    const now = new Date();
    let grouped: Record<string, number> = {};

    if (period === "week") {
      // Group by day of week
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      daysOfWeek.forEach((day) => (grouped[day] = 0));

      receipts.forEach((r: any) => {
        const date = new Date(r.purchase_date);
        const dayOfWeek = daysOfWeek[date.getDay()];
        grouped[dayOfWeek] += r.total_amount || 0;
      });

      const result = Object.entries(grouped).map(([day, amount]) => ({
        day,
        amount: Math.round(amount),
      }));
      return res.json(result);
    }

    if (period === "month") {
      // Group by month (last 6 months)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        grouped[months[date.getMonth()]] = 0;
      }

      receipts.forEach((r: any) => {
        const date = new Date(r.purchase_date);
        const month = months[date.getMonth()];
        grouped[month] += r.total_amount || 0;
      });

      const result = Object.keys(grouped)
        .reverse()
        .map((month) => ({
          month,
          amount: Math.round(grouped[month]),
        }));
      return res.json(result);
    }

    if (period === "year") {
      // Group by month for last year
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        grouped[months[date.getMonth()]] = 0;
      }

      receipts.forEach((r: any) => {
        const date = new Date(r.purchase_date);
        if (date.getFullYear() === now.getFullYear() || date.getFullYear() === now.getFullYear() - 1) {
          const month = months[date.getMonth()];
          grouped[month] += r.total_amount || 0;
        }
      });

      const result = Object.keys(grouped)
        .reverse()
        .map((month) => ({
          month,
          amount: Math.round(grouped[month]),
        }));
      return res.json(result);
    }

    res.json([]);
  } catch (e: any) {
    logError("API /analytics/spending error", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- GET /api/analytics/categories ----------
router.get("/analytics/categories", async (req: Request, res: Response) => {
  try {
    const phone = (req as any).userPhone;

    const { data, error } = await supabase
      .from("receipts")
      .select("store_name, total_amount, receipt_items(*)")
      .eq("user_phone", phone);

    if (error) throw error;

    const receipts = data || [];
    const categoryMap: Record<string, { amount: number; emoji: string; color: string }> = {
      Electronics: { amount: 0, emoji: "⚡", color: "#63B3ED" },
      Food: { amount: 0, emoji: "🍕", color: "#F6AD55" },
      Fashion: { amount: 0, emoji: "👗", color: "#B794F4" },
      Groceries: { amount: 0, emoji: "🛒", color: "#68D391" },
      Health: { amount: 0, emoji: "💊", color: "#FC8181" },
      Other: { amount: 0, emoji: "📦", color: "#4A5568" },
    };

    receipts.forEach((r: any) => {
      const category = guessCategory(r.store_name, r.receipt_items || []);
      const cat = categoryMap[category] || categoryMap["Other"];
      cat.amount += r.total_amount || 0;
    });

    const total = Object.values(categoryMap).reduce((s, c) => s + c.amount, 0);
    const result = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        amount: Math.round(data.amount),
        percent: total > 0 ? Math.round((data.amount / total) * 100) : 0,
        emoji: data.emoji,
        color: data.color,
      }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    res.json(result);
  } catch (e: any) {
    logError("API /analytics/categories error", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- GET /api/analytics/top-merchants ----------
router.get("/analytics/top-merchants", async (req: Request, res: Response) => {
  try {
    const phone = (req as any).userPhone;

    const { data, error } = await supabase
      .from("receipts")
      .select("store_name, total_amount")
      .eq("user_phone", phone);

    if (error) throw error;

    const receipts = data || [];
    const merchantMap: Record<string, number> = {};

    receipts.forEach((r: any) => {
      merchantMap[r.store_name] = (merchantMap[r.store_name] || 0) + (r.total_amount || 0);
    });

    const result = Object.entries(merchantMap)
      .map(([store, amount], index) => ({
        rank: index + 1,
        store,
        amount: Math.round(amount),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    res.json(result);
  } catch (e: any) {
    logError("API /analytics/top-merchants error", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- GET /api/dashboard/stats ----------
router.get("/dashboard/stats", async (req: Request, res: Response) => {
  try {
    const phone = (req as any).userPhone;

    const { data, error } = await supabase
      .from("receipts")
      .select("return_deadline_date, warranty_expiry_date, purchase_date, total_amount")
      .eq("user_phone", phone);

    if (error) throw error;

    const receipts = data || [];
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      totalReceipts: receipts.length,
      returnsExpiring: receipts.filter(
        (r: any) => r.return_deadline_date && new Date(r.return_deadline_date) <= oneWeekFromNow && new Date(r.return_deadline_date) >= now
      ).length,
      warrantyActive: receipts.filter(
        (r: any) => r.warranty_expiry_date && new Date(r.warranty_expiry_date) >= now
      ).length,
      thisMonthSpend: Math.round(
        receipts
          .filter((r: any) => new Date(r.purchase_date) >= oneMonthAgo)
          .reduce((s: number, r: any) => s + (r.total_amount || 0), 0)
      ),
    };

    res.json(stats);
  } catch (e: any) {
    logError("API /dashboard/stats error", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- HELPERS ----------
function guessCategory(storeName: string, items: any[]): string {
  const name = storeName.toLowerCase();
  if (name.includes("grocery") || name.includes("supermarket")) return "Groceries";
  if (name.includes("pharmacy") || name.includes("medical")) return "Health";
  if (name.includes("restaurant") || name.includes("cafe")) return "Food";
  if (name.includes("electronic")) return "Electronics";
  return "Other";
}

function mapReceipt(receipt: any) {
  return {
    id: receipt.id,
    store: receipt.store_name,
    storeLogo: receipt.store_name?.substring(0, 2).toUpperCase() || "RCP",
    item: receipt.receipt_items?.[0]?.name || "Receipt",
    amount: receipt.total_amount,
    date: receipt.purchase_date,
    category: guessCategory(receipt.store_name, receipt.receipt_items || []),
    paymentMode: "Unknown",
    returnDeadline: receipt.return_deadline_date,
    warrantyExpiry: receipt.warranty_expiry_date,
    imageUrl: receipt.r2_image_url,
    items: (receipt.receipt_items || []).map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.unit_price || item.total_price,
    })),
    aiExtracted: true,
  };
}

export default router;
