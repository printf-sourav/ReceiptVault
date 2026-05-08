import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function ScanningDemo() {
  const [scanStage, setScanStage] = useState(0);
  const [extractedData, setExtractedData] = useState<any[]>([]);

  const stages = ['idle', 'scanning', 'extracting', 'complete'];

  useEffect(() => {
    const interval = setInterval(() => {
      setScanStage((prev) => {
        const next = (prev + 1) % stages.length;
        if (next === 0) {
          setExtractedData([]);
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scanStage === 2) {
      const fields = [
        { label: 'Merchant', value: 'Apple Store', confidence: 99 },
        { label: 'Total', value: '$1,299.00', confidence: 100 },
        { label: 'Date', value: 'May 7, 2026', confidence: 98 },
        { label: 'Items', value: 'MacBook Pro 14"', confidence: 97 },
      ];

      fields.forEach((field, index) => {
        setTimeout(() => {
          setExtractedData((prev) => [...prev, field]);
        }, index * 300);
      });
    }
  }, [scanStage]);

  return (
    <section className="relative z-20 px-6 py-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            AI-powered receipt scanning
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Watch how ReceiptVault instantly transforms receipts into structured data
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Receipt Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10">
              {/* Mock Receipt */}
              <div className="bg-white text-black p-8 rounded-lg shadow-2xl relative overflow-hidden">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gray-900 rounded-full mx-auto mb-3" />
                  <div className="font-bold text-xl">Apple Store</div>
                  <div className="text-sm text-gray-600">Fifth Avenue, New York</div>
                </div>

                <div className="border-t border-b border-dashed border-gray-300 py-4 my-4 space-y-2">
                  <div className="flex justify-between">
                    <span>MacBook Pro 14"</span>
                    <span>$1,299.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span>$103.92</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>TOTAL</span>
                  <span>$1,402.92</span>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <div>May 7, 2026 • 2:34 PM</div>
                  <div>Order #APL-2026-5789</div>
                </div>

                {/* Scanning Beam */}
                <AnimatePresence>
                  {scanStage === 1 && (
                    <motion.div
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                      initial={{ top: 0, opacity: 0 }}
                      animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    >
                      <div className="absolute inset-0 blur-sm bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Scanning Status Badge */}
              <AnimatePresence mode="wait">
                {scanStage > 0 && scanStage < 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-500 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    {scanStage === 1 && 'Scanning receipt...'}
                    {scanStage === 2 && 'Extracting data...'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Extracted Data */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="text-sm uppercase tracking-wider text-gray-500 mb-6">
              Extracted Data
            </div>

            <AnimatePresence mode="popLayout">
              {extractedData.map((field, index) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-400">{field.label}</div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-1 text-emerald-400 text-xs"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {field.confidence}%
                    </motion.div>
                  </div>
                  <div className="text-xl font-semibold">{field.value}</div>

                  {/* Confidence Bar */}
                  <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${field.confidence}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {scanStage === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
              >
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-semibold">Receipt processed successfully</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
