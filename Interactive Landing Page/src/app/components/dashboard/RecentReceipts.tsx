import { motion } from 'motion/react';
import { Receipt, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export default function RecentReceipts() {
  const receipts = [
    {
      id: '1',
      merchant: 'Whole Foods',
      amount: 87.43,
      date: '2 hours ago',
      items: 12,
      category: 'Groceries',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: '2',
      merchant: 'Apple Store',
      amount: 1299.0,
      date: 'Yesterday',
      items: 1,
      category: 'Electronics',
      color: 'from-indigo-500 to-cyan-500',
    },
    {
      id: '3',
      merchant: 'Starbucks',
      amount: 12.45,
      date: '2 days ago',
      items: 2,
      category: 'Food & Drink',
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: '4',
      merchant: 'Amazon',
      amount: 234.99,
      date: '3 days ago',
      items: 5,
      category: 'Shopping',
      color: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Recent Receipts</h2>
        <Link
          to="/app/receipts"
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group"
        >
          View All
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="space-y-3">
        {receipts.map((receipt, index) => (
          <Link key={receipt.id} to={`/app/receipts/${receipt.id}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${receipt.color} flex items-center justify-center flex-shrink-0`}>
                  <Receipt className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-medium truncate pr-2">{receipt.merchant}</div>
                    <div className="text-sm font-bold flex-shrink-0">${receipt.amount.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{receipt.date}</span>
                    <span>•</span>
                    <span>{receipt.items} items</span>
                    <span>•</span>
                    <span>{receipt.category}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
