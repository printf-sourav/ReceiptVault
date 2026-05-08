import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  Tag,
  Package,
  AlertCircle,
  Sparkles,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import AIFinancialCore from '../components/dashboard/AIFinancialCore';
import RecentReceipts from '../components/dashboard/RecentReceipts';

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Overview</h1>
          <p className="text-gray-400">Your intelligent financial memory at a glance</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 rounded-xl"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium">AI Active</span>
        </motion.div>
      </div>

      {/* AI Financial Core */}
      <AIFinancialCore />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          label="Monthly Spending"
          value="$3,847.23"
          change="+12.3%"
          trend="up"
          color="from-indigo-500 to-cyan-500"
        />
        <StatCard
          icon={Clock}
          label="Pending Returns"
          value="4"
          sublabel="3 expire this week"
          color="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={RefreshCw}
          label="Active Subscriptions"
          value="$847/mo"
          sublabel="12 services"
          color="from-violet-500 to-purple-500"
        />
        <StatCard
          icon={Tag}
          label="Price Drops"
          value="8 alerts"
          sublabel="Save $234.99"
          color="from-emerald-500 to-teal-500"
        />
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InsightCard
          icon={TrendingUp}
          title="Spending Insight"
          description="Food spending increased 18% this week compared to your average."
          action="View Details"
          color="from-orange-500 to-red-500"
        />
        <InsightCard
          icon={Package}
          title="Reorder Prediction"
          description="Milk depletion predicted in 2 days based on consumption patterns."
          action="Set Reminder"
          color="from-blue-500 to-cyan-500"
        />
        <InsightCard
          icon={Tag}
          title="Price Drop Alert"
          description="Sony WH-1000XM5 dropped 14% on Amazon. Now $298 (was $348)."
          action="View Product"
          color="from-emerald-500 to-green-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Larger */}
        <div className="lg:col-span-2 space-y-6">
          <RecentReceipts />
          <UpcomingDeadlines />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <ConsumablePredictions />
          <ActiveSubscriptions />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, trend, sublabel, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all overflow-hidden"
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {change}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-400 mb-2">{label}</div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
      </div>
    </motion.div>
  );
}

function InsightCard({ icon: Icon, title, description, action, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">{description}</p>

      <button className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors group-hover:gap-3">
        {action}
        <ChevronRight className="w-4 h-4 transition-all" />
      </button>
    </motion.div>
  );
}

function UpcomingDeadlines() {
  const deadlines = [
    { merchant: 'Best Buy', item: 'MacBook Pro', type: 'Return Window', daysLeft: 3, urgent: true },
    { merchant: 'Apple', item: 'AirPods Pro', type: 'Warranty', daysLeft: 28, urgent: false },
    { merchant: 'Amazon', item: 'Office Chair', type: 'Return Window', daysLeft: 7, urgent: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Upcoming Deadlines</h2>
        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View All</button>
      </div>

      <div className="space-y-3">
        {deadlines.map((deadline, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl bg-white/5 border ${
              deadline.urgent ? 'border-red-500/30 bg-red-500/5' : 'border-white/10'
            } hover:bg-white/10 transition-all`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{deadline.merchant}</span>
                  {deadline.urgent && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>
                <div className="text-sm text-gray-400 mb-2">{deadline.item}</div>
                <div className="text-xs text-gray-500">{deadline.type}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${deadline.urgent ? 'text-red-400' : 'text-emerald-400'}`}>
                  {deadline.daysLeft}d
                </div>
                <div className="text-xs text-gray-500">remaining</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ConsumablePredictions() {
  const predictions = [
    { item: 'Milk', brand: 'Organic Valley', depleteIn: 2, confidence: 94 },
    { item: 'Coffee', brand: 'Lavazza', depleteIn: 5, confidence: 87 },
    { item: 'Bread', brand: 'Dave\'s Killer', depleteIn: 4, confidence: 91 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
    >
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold">Consumable Predictions</h2>
      </div>

      <div className="space-y-3">
        {predictions.map((pred, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium mb-1">{pred.item}</div>
                <div className="text-sm text-gray-400">{pred.brand}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-400">{pred.depleteIn}d</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pred.confidence}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                />
              </div>
              <span>{pred.confidence}% confident</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ActiveSubscriptions() {
  const subscriptions = [
    { name: 'Netflix', amount: 15.99, renewsIn: 12 },
    { name: 'Spotify', amount: 10.99, renewsIn: 5 },
    { name: 'Adobe CC', amount: 54.99, renewsIn: 23 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
    >
      <div className="flex items-center gap-2 mb-6">
        <RefreshCw className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-semibold">Active Subscriptions</h2>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{sub.name}</span>
              <span className="text-sm font-bold">${sub.amount}</span>
            </div>
            <div className="text-xs text-gray-500">Renews in {sub.renewsIn} days</div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl text-sm font-medium hover:from-violet-500/30 hover:to-purple-500/30 transition-all"
      >
        Manage All Subscriptions
      </motion.button>
    </motion.div>
  );
}
