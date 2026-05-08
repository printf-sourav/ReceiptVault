import { Outlet } from 'react-router';
import { motion } from 'motion/react';
import Sidebar from './Sidebar';
import CommandBar from './CommandBar';
import MobileNav from './MobileNav';
import MobileHeader from './MobileHeader';
import NeuralBackground from './NeuralBackground';
import { useState } from 'react';

export default function AppLayout() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Neural Background */}
      <div className="fixed inset-0 opacity-30">
        <NeuralBackground mouseX={mousePosition.x} mouseY={mousePosition.y} />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar Navigation - Desktop Only */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <MobileHeader />

          {/* Command Bar - Desktop Only */}
          <div className="hidden md:block">
            <CommandBar />
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-4 md:p-8 pb-24 md:pb-8"
              onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
