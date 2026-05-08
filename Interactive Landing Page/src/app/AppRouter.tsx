import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import LandingPage from './components/LandingPage';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import ReceiptsArchive from './pages/ReceiptsArchive';
import ReceiptDetail from './pages/ReceiptDetail';
import ScanReceipt from './pages/ScanReceipt';
import Analytics from './pages/Analytics';
import Deadlines from './pages/Deadlines';
import Subscriptions from './pages/Subscriptions';
import PriceMonitor from './pages/PriceMonitor';
import ConsumableTracker from './pages/ConsumableTracker';
import Settings from './pages/Settings';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated App Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="receipts" element={<ReceiptsArchive />} />
          <Route path="receipts/:id" element={<ReceiptDetail />} />
          <Route path="scan" element={<ScanReceipt />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="deadlines" element={<Deadlines />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="price-monitor" element={<PriceMonitor />} />
          <Route path="consumables" element={<ConsumableTracker />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
