import { motion } from 'motion/react';
import { Clock, AlertCircle, Shield, Calendar } from 'lucide-react';

export default function Deadlines() {
  const deadlines = [
    {
      merchant: 'Best Buy',
      item: 'MacBook Pro 14"',
      type: 'return',
      daysLeft: 3,
      amount: 1299.0,
      urgent: true,
    },
    {
      merchant: 'Apple',
      item: 'AirPods Pro',
      type: 'warranty',
      daysLeft: 28,
      amount: 249.0,
      urgent: false,
    },
    {
      merchant: 'Amazon',
      item: 'Office Chair',
      type: 'return',
      daysLeft: 7,
      amount: 234.99,
      urgent: false,
    },
    {
      merchant: 'Target',
      item: 'Kitchen Mixer',
      type: 'return',
      daysLeft: 15,
      amount: 156.78,
      urgent: false,
    },
    {
      merchant: 'Sony',
      item: 'WH-1000XM5 Headphones',
      type: 'warranty',
      daysLeft: 342,
      amount: 348.0,
      urgent: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Deadlines Center</h1>
        <p className="text-gray-400">Track return windows and warranty expirations</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'Returns', 'Warranties', 'Urgent'].map((filter) => (
          <motion.button
            key={filter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'All'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {filter}
          </motion.button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30"
        >
          <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
          <div className="text-3xl font-bold mb-2">3</div>
          <div className="text-sm text-gray-400">Urgent Deadlines</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        >
          <Clock className="w-8 h-8 text-amber-400 mb-4" />
          <div className="text-3xl font-bold mb-2">4</div>
          <div className="text-sm text-gray-400">Return Windows</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        >
          <Shield className="w-8 h-8 text-indigo-400 mb-4" />
          <div className="text-3xl font-bold mb-2">2</div>
          <div className="text-sm text-gray-400">Active Warranties</div>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {deadlines.map((deadline, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
            className={`p-6 rounded-2xl backdrop-blur-xl border transition-all cursor-pointer ${
              deadline.urgent
                ? 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/30 hover:border-red-500/50'
                : 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  deadline.type === 'return' ? 'bg-amber-500/20' : 'bg-indigo-500/20'
                }`}
              >
                {deadline.type === 'return' ? (
                  <Clock className="w-7 h-7 text-amber-400" />
                ) : (
                  <Shield className="w-7 h-7 text-indigo-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{deadline.merchant}</h3>
                      {deadline.urgent && <AlertCircle className="w-5 h-5 text-red-400" />}
                    </div>
                    <p className="text-gray-400">{deadline.item}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${deadline.urgent ? 'text-red-400' : 'text-emerald-400'}`}>
                      {deadline.daysLeft}d
                    </div>
                    <div className="text-sm text-gray-500">remaining</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {deadline.type === 'return' ? 'Return Window' : 'Warranty Period'}
                  </div>
                  <span>•</span>
                  <span>${deadline.amount.toFixed(2)}</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(10, (deadline.daysLeft / 365) * 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                    className={`h-full rounded-full ${
                      deadline.urgent
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
