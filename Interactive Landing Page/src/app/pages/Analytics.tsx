import { motion } from 'motion/react';
import { TrendingUp, DollarSign, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const spendingData = [
    { month: 'Jan', amount: 2400 },
    { month: 'Feb', amount: 2800 },
    { month: 'Mar', amount: 3200 },
    { month: 'Apr', amount: 2900 },
    { month: 'May', amount: 3847 },
  ];

  const categoryData = [
    { name: 'Groceries', value: 1200, color: '#10b981' },
    { name: 'Electronics', value: 1500, color: '#6366f1' },
    { name: 'Food & Drink', value: 600, color: '#f59e0b' },
    { name: 'Shopping', value: 400, color: '#8b5cf6' },
    { name: 'Transportation', value: 147, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Spending Analytics</h1>
        <p className="text-gray-400">AI-powered insights into your financial patterns</p>
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {['Week', 'Month', 'Quarter', 'Year'].map((period) => (
          <motion.button
            key={period}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'Month'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {period}
          </motion.button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label="Total Spent" value="$3,847.23" change="+12.3%" trend="up" />
        <StatCard icon={TrendingUp} label="Avg Transaction" value="$123.45" change="-5.2%" trend="down" />
        <StatCard icon={PieChartIcon} label="Categories" value="8" sublabel="Most: Groceries" />
        <StatCard icon={Calendar} label="Transactions" value="31" sublabel="This month" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
        >
          <h2 className="text-xl font-semibold mb-6">Spending Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                }}
              />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fill="url(#lineGradient)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
        >
          <h2 className="text-xl font-semibold mb-6">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                <span className="text-sm text-gray-400">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
      >
        <h2 className="text-xl font-semibold mb-6">Monthly Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={spendingData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
              }}
            />
            <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, trend, sublabel }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
    >
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-8 h-8 text-indigo-400" />
        {change && (
          <div className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {change}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
    </motion.div>
  );
}
