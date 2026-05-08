import { motion } from 'motion/react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Receipt, Scan, TrendingUp, Settings } from 'lucide-react';

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/app/dashboard' },
  { icon: Receipt, label: 'Receipts', path: '/app/receipts' },
  { icon: Scan, label: 'Scan', path: '/app/scan' },
  { icon: TrendingUp, label: 'Stats', path: '/app/analytics' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

export default function MobileNav() {
  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe"
    >
      <div className="mx-3 mb-3 rounded-2xl bg-[#13131a]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all flex-1 ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <item.icon className={`w-6 h-6 ${isActive ? 'text-indigo-400' : ''}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
