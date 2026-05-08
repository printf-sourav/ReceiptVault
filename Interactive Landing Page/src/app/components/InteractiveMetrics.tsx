import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Zap } from 'lucide-react';

export default function InteractiveMetrics() {
  return (
    <section className="relative z-20 px-6 py-32">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            See it in action
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real-time insights from your purchase data
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <MetricCard
            icon={TrendingUp}
            title="Smart Predictions"
            value="+24%"
            subtitle="Accuracy improvement"
            description="AI learns your spending patterns"
            color="from-indigo-500 to-cyan-500"
            delay={0}
          />
          <MetricCard
            icon={DollarSign}
            title="Cost Savings"
            value="$2,847"
            subtitle="Saved this year"
            description="From price alerts & returns"
            color="from-emerald-500 to-teal-500"
            delay={0.1}
          />
          <MetricCard
            icon={Zap}
            title="Time Saved"
            value="18hrs"
            subtitle="Per month average"
            description="Automated tracking & organization"
            color="from-violet-500 to-purple-500"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, title, value, subtitle, description, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden"
    >
      {/* Animated Background Gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg`}
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-300 mb-4">{title}</h3>

        <div className="mb-4">
          <motion.div
            className="text-4xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {value}
          </motion.div>
          <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>

        {/* Animated Progress Bar */}
        <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${color}`}
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Corner Accent */}
      <motion.div
        className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
