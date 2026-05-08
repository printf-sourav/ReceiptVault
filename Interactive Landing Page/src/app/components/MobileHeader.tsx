import { motion } from 'motion/react';
import { Sparkles, Bell, Search } from 'lucide-react';
import { Link } from 'react-router';

export default function MobileHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 md:hidden bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/app/dashboard">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">ReceiptVault</div>
              <div className="text-[10px] text-gray-500">AI Financial OS</div>
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Search className="w-5 h-5 text-gray-400" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
              3
            </span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
