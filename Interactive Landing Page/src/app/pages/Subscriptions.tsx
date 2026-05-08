import { motion } from 'motion/react';
import { RefreshCw, DollarSign, TrendingDown, X } from 'lucide-react';

export default function Subscriptions() {
  const subscriptions = [
    { name: 'Netflix', amount: 15.99, frequency: 'Monthly', renewsIn: 12, category: 'Entertainment', active: true },
    { name: 'Spotify', amount: 10.99, frequency: 'Monthly', renewsIn: 5, category: 'Music', active: true },
    { name: 'Adobe Creative Cloud', amount: 54.99, frequency: 'Monthly', renewsIn: 23, category: 'Software', active: true },
    { name: 'Amazon Prime', amount: 139.0, frequency: 'Yearly', renewsIn: 180, category: 'Shopping', active: true },
    { name: 'The New York Times', amount: 17.0, frequency: 'Monthly', renewsIn: 8, category: 'News', active: true },
    { name: 'iCloud Storage', amount: 2.99, frequency: 'Monthly', renewsIn: 16, category: 'Cloud', active: true },
  ];

  const totalMonthly = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (s.frequency === 'Monthly' ? s.amount : s.amount / 12), 0);

  const totalYearly = totalMonthly * 12;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Subscription Manager</h1>
        <p className="text-gray-400">Track and optimize your recurring payments</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/30"
        >
          <RefreshCw className="w-8 h-8 text-indigo-400 mb-4" />
          <div className="text-3xl font-bold mb-2">{subscriptions.filter((s) => s.active).length}</div>
          <div className="text-sm text-gray-400">Active Subscriptions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        >
          <DollarSign className="w-8 h-8 text-emerald-400 mb-4" />
          <div className="text-3xl font-bold mb-2">${totalMonthly.toFixed(2)}</div>
          <div className="text-sm text-gray-400">Monthly Total</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        >
          <TrendingDown className="w-8 h-8 text-amber-400 mb-4" />
          <div className="text-3xl font-bold mb-2">${totalYearly.toFixed(0)}</div>
          <div className="text-sm text-gray-400">Yearly Total</div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Potential Savings Identified</h3>
            <p className="text-sm text-gray-400 mb-4">
              You could save $234/year by switching to annual billing for Adobe Creative Cloud and Spotify.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-all"
            >
              View Recommendations
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {subscriptions.map((sub, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
            className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-6">
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{sub.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>{sub.category}</span>
                      <span>•</span>
                      <span>{sub.frequency}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${sub.amount}</div>
                    <div className="text-xs text-gray-500">{sub.frequency.toLowerCase()}</div>
                  </div>
                </div>

                {/* Renewal Info */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Renews in {sub.renewsIn} days</div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - (sub.renewsIn / 30) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
