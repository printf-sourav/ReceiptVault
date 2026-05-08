import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function HeroVisual() {
  const [activeRing, setActiveRing] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRing((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto h-[400px] flex items-center justify-center">
      {/* Central Orb */}
      <motion.div
        className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/30 via-cyan-500/30 to-emerald-500/30 backdrop-blur-xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/40 to-cyan-400/40 blur-xl" />
      </motion.div>

      {/* Pulsing Rings */}
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="absolute rounded-full border border-white/10"
          style={{
            width: 160 + index * 80,
            height: 160 + index * 80,
          }}
          animate={{
            scale: activeRing === index ? [1, 1.05, 1] : 1,
            opacity: activeRing === index ? [0.3, 0.6, 0.3] : 0.2,
            borderColor: activeRing === index ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.1)',
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      ))}

      {/* Orbiting Data Points */}
      {[
        { angle: 0, color: 'from-indigo-500 to-cyan-500', icon: '📄' },
        { angle: 90, color: 'from-cyan-500 to-emerald-500', icon: '💳' },
        { angle: 180, color: 'from-emerald-500 to-teal-500', icon: '📊' },
        { angle: 270, color: 'from-violet-500 to-purple-500', icon: '🔔' },
      ].map((item, index) => (
        <motion.div
          key={index}
          className={`absolute w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} backdrop-blur-xl border border-white/20 flex items-center justify-center text-2xl shadow-2xl`}
          animate={{
            rotate: [item.angle, item.angle + 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformOrigin: '0 0',
            left: '50%',
            top: '50%',
            x: Math.cos((item.angle * Math.PI) / 180) * 180,
            y: Math.sin((item.angle * Math.PI) / 180) * 180,
          }}
        >
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            {item.icon}
          </motion.div>
        </motion.div>
      ))}

      {/* Scanning Effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 340deg, rgba(99, 102, 241, 0.3) 360deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
