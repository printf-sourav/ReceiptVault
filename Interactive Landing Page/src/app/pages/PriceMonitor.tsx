import { motion } from 'motion/react';
import { TrendingDown, Bell, ExternalLink } from 'lucide-react';

export default function PriceMonitor() {
  const products = [
    {
      name: 'Sony WH-1000XM5',
      currentPrice: 298.0,
      originalPrice: 348.0,
      dropPercentage: 14,
      merchant: 'Amazon',
      tracked: true,
    },
    {
      name: 'Apple Watch Series 9',
      currentPrice: 379.0,
      originalPrice: 429.0,
      dropPercentage: 12,
      merchant: 'Best Buy',
      tracked: true,
    },
    {
      name: 'Dyson V15 Detect',
      currentPrice: 549.99,
      originalPrice: 649.99,
      dropPercentage: 15,
      merchant: 'Target',
      tracked: true,
    },
    {
      name: 'iPad Air M2',
      currentPrice: 579.0,
      originalPrice: 599.0,
      dropPercentage: 3,
      merchant: 'Apple',
      tracked: true,
    },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Price Monitor</h1>
        <p className="text-gray-400">Track price drops on your purchased items</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
        >
          <TrendingDown className="w-8 h-8 text-emerald-400 mb-4" />
          <div className="text-3xl font-bold mb-2">8</div>
          <div className="text-sm text-gray-400">Price Drop Alerts</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        >
          <Bell className="w-8 h-8 text-indigo-400 mb-4" />
          <div className="text-3xl font-bold mb-2">23</div>
          <div className="text-sm text-gray-400">Products Tracked</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        >
          <TrendingDown className="w-8 h-8 text-amber-400 mb-4" />
          <div className="text-3xl font-bold mb-2">$234.99</div>
          <div className="text-sm text-gray-400">Potential Savings</div>
        </motion.div>
      </div>

      {/* Price Drop Alerts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Price Drops</h2>
        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
            className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-start gap-6">
              {/* Product Image Placeholder */}
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0" />

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                    <div className="text-sm text-gray-400">{product.merchant}</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">{product.dropPercentage}% off</span>
                  </div>
                </div>

                {/* Price Comparison */}
                <div className="flex items-baseline gap-3 mb-4">
                  <div className="text-3xl font-bold text-emerald-400">${product.currentPrice.toFixed(2)}</div>
                  <div className="text-lg text-gray-500 line-through">${product.originalPrice.toFixed(2)}</div>
                  <div className="text-sm text-emerald-400 font-medium">
                    Save ${(product.originalPrice - product.currentPrice).toFixed(2)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Deal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition-all"
                  >
                    Stop Tracking
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
