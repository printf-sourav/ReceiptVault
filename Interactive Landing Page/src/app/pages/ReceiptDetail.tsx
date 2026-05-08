import { motion } from 'motion/react';
import { ArrowLeft, Download, Share2, Sparkles, Clock, Shield, TrendingDown, Package } from 'lucide-react';
import { Link } from 'react-router';

export default function ReceiptDetail() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Back Button */}
      <Link to="/app/receipts">
        <motion.button
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Receipts
        </motion.button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Apple Store</h1>
          <p className="text-gray-400">Purchase on May 6, 2026 • Order #APL-2026-5789</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Receipt Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-8 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10">
            <h2 className="font-semibold mb-4">Original Receipt</h2>
            <div className="bg-white rounded-xl p-6 text-black">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gray-900 rounded-full mx-auto mb-3" />
                <div className="font-bold text-xl">Apple Store</div>
                <div className="text-sm text-gray-600">Fifth Avenue, New York</div>
              </div>

              <div className="border-t border-b border-dashed border-gray-300 py-4 my-4 space-y-2">
                <div className="flex justify-between">
                  <span>MacBook Pro 14"</span>
                  <span>$1,299.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>$103.92</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg mb-4">
                <span>TOTAL</span>
                <span>$1,402.92</span>
              </div>

              <div className="text-center text-sm text-gray-600">
                <div>May 6, 2026 • 2:34 PM</div>
                <div>Order #APL-2026-5789</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>100% AI extraction confidence</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Purchase Summary */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Purchase Summary</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Total Amount</div>
                <div className="text-3xl font-bold">$1,402.92</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Payment Method</div>
                <div className="text-lg font-semibold">•••• 4242</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Category</div>
                <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-sm text-indigo-400 inline-block">
                  Electronics
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Items</div>
                <div className="text-lg font-semibold">1 item</div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightCard
              icon={Clock}
              title="Return Window"
              description="12 days remaining"
              status="active"
              color="from-emerald-500 to-teal-500"
            />
            <InsightCard
              icon={Shield}
              title="Warranty"
              description="365 days AppleCare+"
              status="active"
              color="from-indigo-500 to-cyan-500"
            />
            <InsightCard
              icon={TrendingDown}
              title="Price Tracking"
              description="No price drops detected"
              status="monitoring"
              color="from-violet-500 to-purple-500"
            />
            <InsightCard
              icon={Package}
              title="Consumable"
              description="Not a repeat purchase"
              status="info"
              color="from-amber-500 to-orange-500"
            />
          </div>

          {/* Line Items */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Items</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">MacBook Pro 14"</h3>
                  <p className="text-sm text-gray-400 mb-2">M3 Pro, 18GB RAM, 512GB SSD</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">Qty: 1</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold">$1,299.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>$1,299.00</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax</span>
                <span>$103.92</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total</span>
                <span>$1,402.92</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Purchase Metadata</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Merchant</div>
                <div className="font-medium">Apple Store</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Location</div>
                <div className="font-medium">Fifth Avenue, New York</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Date & Time</div>
                <div className="font-medium">May 6, 2026 at 2:34 PM</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Order Number</div>
                <div className="font-medium">APL-2026-5789</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, description, status, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.div>
  );
}
