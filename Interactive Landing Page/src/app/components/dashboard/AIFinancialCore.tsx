import { motion } from 'motion/react';
import { Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AIFinancialCore() {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-4 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <radialGradient id="coreGradient">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Central Hub */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="60"
            fill="url(#coreGradient)"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Orbiting Nodes */}
          {[0, 60, 120, 180, 240, 300].map((angle, index) => {
            const x = 50 + Math.cos((angle * Math.PI) / 180) * 35;
            const y = 50 + Math.sin((angle * Math.PI) / 180) * 35;

            return (
              <g key={index}>
                <line
                  x1="50%"
                  y1="50%"
                  x2={`${x}%`}
                  y2={`${y}%`}
                  stroke={activeNode === index ? '#6366f1' : '#ffffff'}
                  strokeWidth="1"
                  opacity={activeNode === index ? '0.5' : '0.1'}
                  strokeDasharray="4"
                />
                <motion.circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="8"
                  fill={activeNode === index ? '#6366f1' : '#ffffff'}
                  opacity={activeNode === index ? '0.8' : '0.2'}
                  animate={{
                    scale: activeNode === index ? [1, 1.3, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
              <h2 className="text-lg md:text-2xl font-bold">AI Financial Intelligence</h2>
            </div>
            <p className="text-sm md:text-base text-gray-400">Real-time insights from your purchase data</p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center flex-shrink-0"
          >
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricBlock
            label="This Month"
            value="$3,847.23"
            change="+$234.51"
            trend="up"
            percentage="+6.5%"
          />
          <MetricBlock
            label="Avg Daily Spend"
            value="$123.45"
            change="-$12.34"
            trend="down"
            percentage="-9.1%"
          />
          <MetricBlock
            label="Predicted This Month"
            value="$4,120.00"
            sublabel="Based on patterns"
            isProjection
          />
        </div>
      </div>
    </motion.div>
  );
}

function MetricBlock({ label, value, change, trend, percentage, sublabel, isProjection }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
    >
      <div className="text-xs md:text-sm text-gray-400 mb-2">{label}</div>
      <div className="text-2xl md:text-3xl font-bold mb-2">{value}</div>
      {change && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="text-sm font-medium">{change}</span>
          </div>
          <span className="text-sm text-gray-500">{percentage}</span>
        </div>
      )}
      {sublabel && <div className="text-xs text-gray-500 mt-2">{sublabel}</div>}
      {isProjection && (
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '75%' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
          />
        </div>
      )}
    </motion.div>
  );
}
