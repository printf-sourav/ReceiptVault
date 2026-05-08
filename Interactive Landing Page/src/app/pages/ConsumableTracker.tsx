import { motion } from 'motion/react';
import { Package, TrendingUp, ShoppingCart, Calendar } from 'lucide-react';

export default function ConsumableTracker() {
  const consumables = [
    { item: 'Milk', brand: 'Organic Valley', depleteIn: 2, confidence: 94, frequency: 7, lastPurchase: '5 days ago' },
    { item: 'Coffee', brand: 'Lavazza Espresso', depleteIn: 5, confidence: 87, frequency: 14, lastPurchase: '9 days ago' },
    { item: 'Bread', brand: 'Dave\'s Killer Bread', depleteIn: 4, confidence: 91, frequency: 5, lastPurchase: '1 day ago' },
    { item: 'Eggs', brand: 'Organic Free Range', depleteIn: 6, confidence: 89, frequency: 10, lastPurchase: '4 days ago' },
    { item: 'Oat Milk', brand: 'Oatly', depleteIn: 8, confidence: 85, frequency: 12, lastPurchase: '4 days ago' },
    { item: 'Greek Yogurt', brand: 'Fage Total', depleteIn: 3, confidence: 92, frequency: 7, lastPurchase: '4 days ago' },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Consumable Tracker</h1>
        <p className="text-gray-400">AI-powered predictions for your repeat purchases</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30"
        >
          <Package className="w-8 h-8 text-cyan-400 mb-4" />
          <div className="text-3xl font-bold mb-2">{consumables.length}</div>
          <div className="text-sm text-gray-400">Tracked Items</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30"
        >
          <TrendingUp className="w-8 h-8 text-amber-400 mb-4" />
          <div className="text-3xl font-bold mb-2">3</div>
          <div className="text-sm text-gray-400">Reorder Soon</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        >
          <ShoppingCart className="w-8 h-8 text-emerald-400 mb-4" />
          <div className="text-3xl font-bold mb-2">91%</div>
          <div className="text-sm text-gray-400">Avg Confidence</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        >
          <Calendar className="w-8 h-8 text-indigo-400 mb-4" />
          <div className="text-3xl font-bold mb-2">8d</div>
          <div className="text-sm text-gray-400">Avg Frequency</div>
        </motion.div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consumables.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`p-6 rounded-2xl backdrop-blur-xl border transition-all ${
              item.depleteIn <= 3
                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
                : 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              {item.depleteIn <= 3 && (
                <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-400 font-medium">
                  Reorder Soon
                </div>
              )}
            </div>

            {/* Item Info */}
            <h3 className="text-lg font-semibold mb-1">{item.item}</h3>
            <p className="text-sm text-gray-400 mb-4">{item.brand}</p>

            {/* Prediction */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Depletes in</span>
                <span className={`font-bold ${item.depleteIn <= 3 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {item.depleteIn} days
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Buy every</span>
                <span className="font-medium">{item.frequency} days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last purchase</span>
                <span className="font-medium">{item.lastPurchase}</span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>AI Confidence</span>
                <span>{item.confidence}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.confidence}%` }}
                  transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                />
              </div>
            </div>

            {/* Actions */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.depleteIn <= 3
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              {item.depleteIn <= 3 ? 'Reorder Now' : 'Set Reminder'}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
