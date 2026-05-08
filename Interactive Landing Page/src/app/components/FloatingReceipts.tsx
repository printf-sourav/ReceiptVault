import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Receipt {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  duration: number;
  delay: number;
}

export default function FloatingReceipts({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    const generated: Receipt[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: 0.3 + Math.random() * 0.4,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * 5,
    }));
    setReceipts(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {receipts.map((receipt) => {
        const parallaxX = (mouseX - window.innerWidth / 2) * (receipt.scale * 0.02);
        const parallaxY = (mouseY - window.innerHeight / 2) * (receipt.scale * 0.02);

        return (
          <motion.div
            key={receipt.id}
            className="absolute"
            style={{
              left: `${receipt.x}%`,
              top: `${receipt.y}%`,
              scale: receipt.scale,
            }}
            initial={{
              x: parallaxX,
              y: parallaxY,
              rotate: receipt.rotation,
              opacity: 0,
            }}
            animate={{
              x: parallaxX,
              y: parallaxY + [-20, 20],
              rotate: [receipt.rotation, receipt.rotation + 10, receipt.rotation],
              opacity: [0, 0.15, 0.15, 0],
            }}
            transition={{
              duration: receipt.duration,
              delay: receipt.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-32 h-40 md:w-40 md:h-52 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 shadow-2xl p-4">
              {/* Receipt Header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400/30 to-cyan-400/30" />
                <div className="flex-1 h-2 bg-white/20 rounded" />
              </div>

              {/* Receipt Lines */}
              <div className="space-y-2">
                {[0.8, 0.6, 0.9, 0.7, 0.5].map((width, i) => (
                  <div
                    key={i}
                    className="h-1.5 bg-white/10 rounded"
                    style={{ width: `${width * 100}%` }}
                  />
                ))}
              </div>

              {/* Receipt Total */}
              <div className="mt-4 pt-2 border-t border-white/20">
                <div className="h-2 w-3/4 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 rounded" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
