import { motion, AnimatePresence } from 'motion/react';
import { Upload, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';

export default function ScanReceipt() {
  const [scanStage, setScanStage] = useState<'idle' | 'scanning' | 'extracting' | 'complete'>('idle');
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleScan = () => {
    setScanStage('scanning');
    setTimeout(() => {
      setScanStage('extracting');
      setExtractedData({
        merchant: 'Whole Foods',
        amount: 87.43,
        date: 'May 7, 2026',
        items: [
          { name: 'Organic Milk', price: 6.99 },
          { name: 'Sourdough Bread', price: 5.49 },
          { name: 'Avocados (3)', price: 8.97 },
        ],
      });
      setTimeout(() => setScanStage('complete'), 2000);
    }, 3000);
  };

  const handleReset = () => {
    setScanStage('idle');
    setExtractedData(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">AI Receipt Scanner</h1>
        <p className="text-xl text-gray-400">Upload or capture a receipt to extract data instantly</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {scanStage === 'idle' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div
              onClick={handleScan}
              className="group relative p-16 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-cyan-500/0 group-hover:from-indigo-500/10 group-hover:to-cyan-500/10 transition-all duration-500"
              />

              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-8"
                >
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold mb-4">Drop receipt here or click to upload</h2>
                <p className="text-gray-400 mb-8">Supports JPG, PNG, PDF • Max 10MB</p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl font-medium shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Choose File
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {(scanStage === 'scanning' || scanStage === 'extracting' || scanStage === 'complete') && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Receipt Preview */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10">
                <h2 className="font-semibold mb-4">Processing Receipt</h2>
                <div className="relative bg-white rounded-xl p-6 text-black overflow-hidden">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gray-900 rounded-full mx-auto mb-3" />
                    <div className="font-bold text-xl">Whole Foods</div>
                    <div className="text-sm text-gray-600">Market Street</div>
                  </div>

                  <div className="border-t border-b border-dashed border-gray-300 py-4 my-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Organic Milk</span>
                      <span>$6.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sourdough Bread</span>
                      <span>$5.49</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avocados (3)</span>
                      <span>$8.97</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-bold">
                    <span>TOTAL</span>
                    <span>$87.43</span>
                  </div>

                  {/* Scanning Beam */}
                  {scanStage === 'scanning' && (
                    <motion.div
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                      initial={{ top: 0, opacity: 0 }}
                      animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute inset-0 blur-sm bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                    </motion.div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {scanStage === 'scanning' && (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                      </motion.div>
                      <span className="text-sm font-medium">Scanning receipt...</span>
                    </>
                  )}
                  {scanStage === 'extracting' && (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                      </motion.div>
                      <span className="text-sm font-medium">Extracting data...</span>
                    </>
                  )}
                  {scanStage === 'complete' && (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Complete!</span>
                    </>
                  )}
                </div>
              </div>

              {/* Extracted Data */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10">
                <h2 className="font-semibold mb-4">Extracted Data</h2>

                {extractedData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <DataField label="Merchant" value={extractedData.merchant} confidence={99} delay={0} />
                    <DataField label="Total Amount" value={`$${extractedData.amount}`} confidence={100} delay={0.1} />
                    <DataField label="Date" value={extractedData.date} confidence={98} delay={0.2} />
                    <DataField label="Items" value={`${extractedData.items.length} items`} confidence={97} delay={0.3} />

                    {scanStage === 'complete' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="pt-4 space-y-3"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl font-medium"
                        >
                          Save Receipt
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleReset}
                          className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Scan Another
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {!extractedData && (
                  <div className="text-center text-gray-500 py-12">
                    Waiting for scan results...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DataField({ label, value, confidence, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-gray-400">{label}</div>
        <div className="flex items-center gap-1 text-emerald-400 text-xs">
          <CheckCircle2 className="w-3 h-3" />
          {confidence}%
        </div>
      </div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        />
      </div>
    </motion.div>
  );
}
