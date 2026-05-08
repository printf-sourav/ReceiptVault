import { motion } from 'motion/react';
import { Search, Bell, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function CommandBar() {
  const [notificationCount] = useState(3);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4 px-8 py-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search receipts, merchants, or ask AI..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-gray-500"
          />
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <kbd className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20 text-gray-400">⌘</kbd>
            <kbd className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20 text-gray-400">K</kbd>
          </motion.div>
        </div>

        {/* AI Assistant Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 rounded-xl text-sm font-medium hover:from-indigo-500/30 hover:to-cyan-500/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Assistant</span>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold"
            >
              {notificationCount}
            </motion.div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
