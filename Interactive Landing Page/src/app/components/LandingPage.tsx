import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { Sparkles, Scan, TrendingUp, Shield, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import Navigation from './Navigation';
import Footer from './Footer';
import FloatingReceipts from './FloatingReceipts';
import NeuralBackground from './NeuralBackground';
import HeroVisual from './HeroVisual';
import InteractiveMetrics from './InteractiveMetrics';
import ScanningDemo from './ScanningDemo';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  const springConfig = { stiffness: 100, damping: 30 };
  const mouseX = useSpring(useMotionValue(0), springConfig);
  const mouseY = useSpring(useMotionValue(0), springConfig);

  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const y = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });
      mouseX.set(clientX);
      mouseY.set(clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Neural Network Background */}
      <NeuralBackground mouseX={mousePosition.x} mouseY={mousePosition.y} />

      {/* Floating Receipts Background */}
      <FloatingReceipts mouseX={mousePosition.x} mouseY={mousePosition.y} />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f] pointer-events-none z-10" />

      {/* Hero Section */}
      <motion.section
        className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 pt-20"
        style={{ opacity, scale }}
      >
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
            whileHover={{ scale: 1.05, borderColor: 'rgba(99, 102, 241, 0.3)' }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-medium">
              AI-Powered Financial Memory
            </span>
          </motion.div>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center max-w-5xl"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="block bg-gradient-to-br from-white via-white to-gray-400 bg-clip-text text-transparent">
              Your purchases
            </span>
            <span className="block bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              finally remember themselves.
            </span>
          </h1>
        </motion.div>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl text-center mb-12 leading-relaxed"
        >
          AI-powered receipt intelligence, return tracking, subscription monitoring,
          and autonomous financial insights—all in one elegant system.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/app/dashboard">
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl font-medium overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span className="relative z-10 flex items-center gap-2">
                Open Dashboard
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>

          <Link to="/app/scan">
            <motion.button
              className="group px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Watch AI Scan Demo
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-20"
        >
          <HeroVisual />
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-gray-500"
          >
            <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-gray-500/30 flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
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
              Intelligence built into every layer
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A premium financial operating system that thinks ahead
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Scanning Demo Section */}
      <ScanningDemo />

      {/* Interactive Metrics Section */}
      <InteractiveMetrics />

      {/* Stats Section */}
      <section className="relative z-20 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-20 px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative p-12 md:p-20 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden">
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-emerald-500/10"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Ready to remember everything?
              </h2>
              <p className="text-xl text-gray-400 mb-10">
                Join thousands of users who never lose track of a purchase again.
              </p>
              <Link to="/app/dashboard">
                <motion.button
                  className="px-10 py-5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl font-medium text-lg shadow-2xl"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free Trial
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

const features = [
  {
    icon: Scan,
    title: 'AI Receipt Scanning',
    description: 'Automatically extract and structure data from any receipt in seconds with computer vision.',
    gradient: 'from-indigo-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics',
    description: 'Smart spending insights, consumable reorder predictions, and price drop monitoring.',
    gradient: 'from-cyan-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Return & Warranty Tracking',
    description: 'Never miss a return window or warranty expiration with intelligent deadline management.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Subscription Intelligence',
    description: 'Track recurring payments, identify savings opportunities, and manage renewals effortlessly.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Sparkles,
    title: 'Smart Categorization',
    description: 'Purchases automatically organized by merchant, category, and spending patterns.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: 'Financial Memory',
    description: 'Your complete purchase history searchable and accessible in one elegant interface.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

const stats = [
  { value: '99.2%', label: 'OCR Accuracy', sublabel: 'Industry-leading precision' },
  { value: '<2s', label: 'Processing Time', sublabel: 'Average scan speed' },
  { value: '$847', label: 'Avg. Yearly Savings', sublabel: 'From insights & alerts' },
];

function FeatureCard({ icon: Icon, title, description, gradient, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      {/* Gradient Glow on Hover */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`}
      />

      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function StatCard({ value, label, sublabel, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <motion.div
        className="text-6xl md:text-7xl font-bold bg-gradient-to-br from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
      >
        {value}
      </motion.div>
      <div className="text-xl font-semibold mb-2">{label}</div>
      <div className="text-gray-500">{sublabel}</div>
    </motion.div>
  );
}
