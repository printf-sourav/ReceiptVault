import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface Receipt {
  id: string;
  store: string;
  storeLogo: string;
  item: string;
  amount: number;
  date: Date;
  category: 'Electronics' | 'Food' | 'Fashion' | 'Groceries' | 'Health' | 'Other';
  paymentMode: string;
  returnDeadline: Date | null;
  warrantyExpiry: Date | null;
  imageUrl: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  aiExtracted: boolean;
}

export interface CategoryBreakdown {
  name: string;
  emoji: string;
  percent: number;
  amount: number;
  color: string;
}

export interface SpendingData {
  day?: string;
  month?: string;
  amount: number;
}

export interface TopMerchant {
  rank: number;
  store: string;
  amount: number;
}

export interface DashboardStats {
  totalReceipts: number;
  returnsExpiring: number;
  warrantyActive: number;
  thisMonthSpend: number;
}

export const useData = () => {
  const { userPhone } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [spendingByWeek, setSpendingByWeek] = useState<SpendingData[]>([]);
  const [spendingByMonth, setSpendingByMonth] = useState<SpendingData[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [topMerchants, setTopMerchants] = useState<TopMerchant[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userPhone) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = { 'X-User-Phone': userPhone };

      // Fetch all data in parallel
      const [
        receiptsRes,
        spendingWeekRes,
        spendingMonthRes,
        categoriesRes,
        merchantsRes,
        statsRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/api/receipts`, { headers }),
        axios.get(`${API_URL}/api/analytics/spending?period=week`, { headers }),
        axios.get(`${API_URL}/api/analytics/spending?period=month`, { headers }),
        axios.get(`${API_URL}/api/analytics/categories`, { headers }),
        axios.get(`${API_URL}/api/analytics/top-merchants`, { headers }),
        axios.get(`${API_URL}/api/dashboard/stats`, { headers }),
      ]);

      // Parse dates in receipts
      const parsedReceipts = (receiptsRes.data || []).map((r: any) => ({
        ...r,
        date: new Date(r.date),
        returnDeadline: r.returnDeadline ? new Date(r.returnDeadline) : null,
        warrantyExpiry: r.warrantyExpiry ? new Date(r.warrantyExpiry) : null,
      }));

      setReceipts(parsedReceipts);
      setSpendingByWeek(spendingWeekRes.data || []);
      setSpendingByMonth(spendingMonthRes.data || []);
      setCategoryBreakdown(categoriesRes.data || []);
      setTopMerchants(merchantsRes.data || []);
      setDashboardStats(statsRes.data || null);
    } catch (err: any) {
      console.error('[useData] Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [userPhone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    receipts,
    spendingByWeek,
    spendingByMonth,
    categoryBreakdown,
    topMerchants,
    dashboardStats,
    loading,
    error,
    refetch: fetchData,
  };
};
