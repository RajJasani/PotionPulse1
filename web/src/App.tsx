import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, NavTab } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Skeleton } from './components/Skeleton';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import Hero from './components/ui/animated-shader-hero';

// Lazy-loaded routes for performance & zero layout shift
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const InventoryPage = lazy(() =>
  import('./pages/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);
const CrystalBallPage = lazy(() =>
  import('./pages/CrystalBallPage').then((m) => ({ default: m.CrystalBallPage }))
);
const StrangeHappeningsPage = lazy(() =>
  import('./pages/StrangeHappeningsPage').then((m) => ({ default: m.StrangeHappeningsPage }))
);
const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((m) => ({ default: m.EventsPage }))
);

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const addToast = (toast: ToastMessage) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AuthProvider>
      <div className="min-h-screen text-black flex flex-col transition-colors duration-200 selection:bg-amber-400 selection:text-black">
        {/* Auth Modal */}
        <AuthModal />

        {/* 1. Header Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unresolvedAnomaliesCount={2}
        hasActiveEvent={true}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* 3. Grand Interactive WebGL Animated Shader Hero Section */}
      {activeTab === 'dashboard' && (
        <div className="relative">
          <Hero
            trustBadge={{
              stickers: [
                { text: "EST. 2026", icon: "✨" },
                { text: "100% ARTISANAL POTIONS", icon: "🧪" },
                { text: "REAL-TIME INVENTORY TELEMETRY", icon: "⚡" },
              ],
            }}
            headline={{
              line1: "The Cauldron View",
              line2: "Predictive Demand Prophecies",
            }}
            subtitle="Automated restock charms, LightGBM runout forecasting, and live anomaly sentinels for high-volume alchemical operations."
            buttons={{
              primary: {
                text: "🌕 Full Moon Festival (3.0x Surge)",
                onClick: () => setActiveTab('events'),
              },
              secondary: {
                text: "📦 Audit Pantry Shelves →",
                onClick: () => setActiveTab('inventory'),
              },
            }}
            className="w-full min-h-[580px] sm:min-h-[630px] lg:min-h-[660px] shadow-2xl relative"
          />
          {/* Cartoon background transition blending down into the stage */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 sm:h-24 pointer-events-none z-20"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(250, 245, 255, 0.3) 35%, rgba(250, 245, 255, 0.7) 70%, #FAF5FF 100%)',
            }}
          />
        </div>
      )}

      {/* 4. Main Stage Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Suspense
          fallback={
            <div className="space-y-6 pt-4">
              <Skeleton className="h-10 w-72 rounded-2xl border-2 border-sig-black" />
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-3xl border-2 border-sig-black" />
                ))}
              </div>
              <Skeleton className="h-80 w-full rounded-3xl border-2 border-sig-black" />
            </div>
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && (
                <DashboardPage onNavigateTab={setActiveTab} onShowToast={addToast} />
              )}
              {activeTab === 'inventory' && (
                <InventoryPage onShowToast={addToast} />
              )}
              {activeTab === 'crystal-ball' && (
                <CrystalBallPage onShowToast={addToast} />
              )}
              {activeTab === 'anomalies' && (
                <StrangeHappeningsPage
                  onShowToast={addToast}
                  onNavigateTab={setActiveTab}
                />
              )}
              {activeTab === 'events' && (
                <EventsPage onShowToast={addToast} />
              )}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Playful Cartoon Footer */}
      <footer className="border-t-2 border-slate-950 bg-white/95 backdrop-blur-xl py-8 text-center text-xs font-sans mt-16 shadow-[0_-4px_0px_0px_rgba(15,14,23,0.06)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-display font-black text-xl tracking-tight text-slate-950">
              Potion<span className="text-purple-600">Pulse</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-[#FEE214] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17] uppercase tracking-wider -rotate-1">
              Smart Inventory OS
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] font-sans font-extrabold uppercase tracking-wider text-slate-800">
            <span className="flex items-center gap-1.5 text-amber-700 bg-[#FFFBEB] px-2.5 py-1 rounded-full border border-slate-950 shadow-[1px_1px_0px_#0F0E17]">
              <span>✦</span> 100% Pure Magic
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800 bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-slate-950 shadow-[1px_1px_0px_#0F0E17]">
              <span>✦</span> Zero Negative Stock
            </span>
            <span className="flex items-center gap-1.5 text-purple-800 bg-[#FAF5FF] px-2.5 py-1 rounded-full border border-slate-950 shadow-[1px_1px_0px_#0F0E17]">
              <span>✦</span> FastAPI + LightGBM
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#A2F708] border-2 border-slate-950 font-mono text-[11px] font-black text-slate-950 tracking-wide shadow-[2px_2px_0px_0px_#0F0E17] rotate-1">
            Halloween Hackathon 2026
          </div>
        </div>
      </footer>
    </div>
  </AuthProvider>
  );
}

export default App;
