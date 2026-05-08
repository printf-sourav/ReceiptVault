import { motion } from 'motion/react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Receipt,
  Scan,
  TrendingUp,
  Clock,
  RefreshCw,
  Tag,
  Package,
  Settings,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
  { icon: Receipt, label: 'Receipts', path: '/app/receipts' },
  { icon: Scan, label: 'Scan', path: '/app/scan', highlight: true },
  { icon: TrendingUp, label: 'Analytics', path: '/app/analytics' },
  { icon: Clock, label: 'Deadlines', path: '/app/deadlines' },
  { icon: RefreshCw, label: 'Subscriptions', path: '/app/subscriptions' },
  { icon: Tag, label: 'Price Monitor', path: '/app/price-monitor' },
  { icon: Package, label: 'Consumables', path: '/app/consumables' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-72 border-r border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg"
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <div className="font-bold text-lg">ReceiptVault</div>
            <div className="text-xs text-gray-500">AI Financial OS</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-white border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Highlight glow for active item */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-xl blur-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <item.icon className="w-5 h-5 relative z-10" />
                <span className="font-medium relative z-10">{item.label}</span>

                {/* Special highlight for Scan button */}
                {item.highlight && !isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="ml-auto w-2 h-2 bg-emerald-400 rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-semibold">
            JD
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">John Doe</div>
            <div className="text-xs text-gray-500">john@example.com</div>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
