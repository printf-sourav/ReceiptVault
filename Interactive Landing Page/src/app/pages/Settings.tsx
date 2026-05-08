import { motion } from 'motion/react';
import { User, Mail, Bell, Moon, Shield, Download, Trash2, ChevronRight } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8 max-w-[1000px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
      >
        <h2 className="text-xl font-semibold mb-6">Profile</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-semibold">
            JD
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">John Doe</h3>
            <p className="text-gray-400">john@example.com</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition-all"
          >
            Edit Profile
          </motion.button>
        </div>

        <div className="space-y-4">
          <SettingRow icon={User} label="Full Name" value="John Doe" />
          <SettingRow icon={Mail} label="Email" value="john@example.com" />
        </div>
      </motion.div>

      {/* Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
      >
        <h2 className="text-xl font-semibold mb-6">Integrations</h2>
        <div className="space-y-4">
          <IntegrationRow
            icon={Mail}
            label="Gmail"
            description="Automatically scan receipts from email"
            connected={true}
          />
          <IntegrationRow
            icon={Mail}
            label="WhatsApp"
            description="Receive receipt reminders and alerts"
            connected={false}
          />
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
      >
        <h2 className="text-xl font-semibold mb-6">Notifications</h2>
        <div className="space-y-4">
          <ToggleRow label="Price Drop Alerts" enabled={true} />
          <ToggleRow label="Return Reminders" enabled={true} />
          <ToggleRow label="Subscription Renewals" enabled={true} />
          <ToggleRow label="Consumable Reorders" enabled={false} />
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
      >
        <h2 className="text-xl font-semibold mb-6">Preferences</h2>
        <div className="space-y-4">
          <ToggleRow icon={Moon} label="Dark Mode" enabled={true} />
          <ToggleRow icon={Bell} label="Quiet Hours (10PM - 8AM)" enabled={true} />
        </div>
      </motion.div>

      {/* Data & Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
      >
        <h2 className="text-xl font-semibold mb-6">Data & Privacy</h2>
        <div className="space-y-4">
          <ActionRow icon={Download} label="Export Data" description="Download all your receipt data" />
          <ActionRow icon={Shield} label="Privacy Settings" description="Manage data collection preferences" />
        </div>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
      >
        <h2 className="text-xl font-semibold mb-6">Account</h2>
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium mb-1">Sign Out</div>
            <div className="text-sm text-gray-400">Sign out from your account</div>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function IntegrationRow({ icon: Icon, label, description, connected }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="font-medium mb-1">{label}</div>
          <div className="text-sm text-gray-400">{description}</div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          connected
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-white/10 border border-white/20 hover:bg-white/20'
        }`}
      >
        {connected ? 'Connected' : 'Connect'}
      </motion.button>
    </div>
  );
}

function ToggleRow({ icon, label, enabled }: any) {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
        <span className="font-medium">{label}</span>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-emerald-500' : 'bg-gray-600'
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
        />
      </motion.button>
    </div>
  );
}

function ActionRow({ icon: Icon, label, description, danger }: any) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
        danger
          ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30'
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-4">
        <Icon className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-gray-400'}`} />
        <div className="text-left">
          <div className={`font-medium mb-1 ${danger ? 'text-red-400' : ''}`}>{label}</div>
          <div className="text-sm text-gray-400">{description}</div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500" />
    </motion.button>
  );
}
