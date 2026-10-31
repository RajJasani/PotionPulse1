import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, NavTab } from './components/Navbar';
import { SiglitosTicker } from './components/SiglitosTicker';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Skeleton } from './components/Skeleton';

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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
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
    <div className={`min-h-screen ${isDarkMode ? 'dark text-slate-100' : 'text-slate-900'} flex flex-col transition-colors duration-200 selection:bg-amber-400 selection:text-black`}>
      {/* 1. Signature Siglitos Running Marquee */}
      <SiglitosTicker unresolvedCount={2} hasActiveEvent={true} />

      {/* 2. Siglitos Header Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unresolvedAnomaliesCount={2}
        hasActiveEvent={true}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* 3. Main Stage Content */}
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

      {/* Siglitos Playful Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0E0C16]/95 backdrop-blur-xl py-8 text-center text-xs font-sans transition-colors mt-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-display font-black text-base tracking-tight text-slate-900 dark:text-white">
              Potion<span className="text-amber-500 dark:text-amber-400">Pulse</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] text-black border border-amber-500/40 uppercase tracking-wider -rotate-1 shadow-sm">
              Smart Inventory OS
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] font-sans font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
              <span className="text-amber-400">✦</span> 100% Pure Magic
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="text-emerald-400">✦</span> No Artificial Glitches
            </span>
            <span className="flex items-center gap-1.5 text-violet-600 dark:text-violet-300">
              <span className="text-violet-400">✦</span> FastAPI + LightGBM
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 font-mono text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-wide shadow-sm">
            Halloween Hackathon 2026
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
