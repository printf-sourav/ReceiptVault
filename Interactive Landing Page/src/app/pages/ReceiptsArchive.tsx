import { motion } from 'motion/react';
import { Search, Filter, Receipt, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';

export default function ReceiptsArchive() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['All', 'Groceries', 'Electronics', 'Food & Drink', 'Shopping', 'Transportation'];

  const receipts = [
    {
      id: '1',
      merchant: 'Whole Foods',
      amount: 87.43,
      date: 'May 7, 2026',
      items: 12,
      category: 'Groceries',
      canReturn: true,
      returnDays: 28,
      confidence: 98,
    },
    {
      id: '2',
      merchant: 'Apple Store',
      amount: 1299.0,
      date: 'May 6, 2026',
      items: 1,
      category: 'Electronics',
      canReturn: true,
      returnDays: 12,
      confidence: 100,
    },
    {
      id: '3',
      merchant: 'Starbucks',
      amount: 12.45,
      date: 'May 5, 2026',
      items: 2,
      category: 'Food & Drink',
      canReturn: false,
      confidence: 96,
    },
    {
      id: '4',
      merchant: 'Amazon',
      amount: 234.99,
      date: 'May 4, 2026',
      items: 5,
      category: 'Shopping',
      canReturn: true,
      returnDays: 25,
      confidence: 99,
    },
    {
      id: '5',
      merchant: 'Target',
      amount: 156.78,
      date: 'May 3, 2026',
      items: 8,
      category: 'Shopping',
      canReturn: true,
      returnDays: 87,
      confidence: 97,
    },
    {
      id: '6',
      merchant: 'Uber',
      amount: 24.5,
      date: 'May 2, 2026',
      items: 1,
      category: 'Transportation',
      canReturn: false,
      confidence: 100,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Receipt Archive</h1>
          <p className="text-gray-400">Your complete financial memory</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl font-medium cursor-pointer"
        >
          <Link to="/app/scan" className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Scan Receipt
          </Link>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by merchant, amount, or item..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-gray-500"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filters
        </motion.button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => setSelectedCategory(category.toLowerCase())}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === category.toLowerCase()
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receipts.map((receipt, index) => (
          <Link key={receipt.id} to={`/app/receipts/${receipt.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
            >
              {/* Hover Glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-cyan-500/0 group-hover:from-indigo-500/10 group-hover:to-cyan-500/10 transition-all duration-300"
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{receipt.merchant}</h3>
                    <p className="text-sm text-gray-400">{receipt.date}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                {/* Amount */}
                <div className="text-3xl font-bold mb-4">${receipt.amount.toFixed(2)}</div>

                {/* Details */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span>{receipt.items} items</span>
                  <span>•</span>
                  <span>{receipt.category}</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {receipt.canReturn && (
                    <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs text-emerald-400">
                      Return: {receipt.returnDays}d left
                    </div>
                  )}
                  <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-400">
                    {receipt.confidence}% confident
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
