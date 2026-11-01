import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, NavTab } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Skeleton } from './components/Skeleton';
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
    <div className="min-h-screen text-black flex flex-col transition-colors duration-200 selection:bg-amber-400 selection:text-black">
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
            className="w-full min-h-[520px] lg:min-h-[580px] shadow-2xl relative"
          />
          {/* Subtle bottom fade to blend the fiery shader smoothly into the colorful light theme below */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FBF8F1] via-[#FBF8F1]/40 to-transparent pointer-events-none z-20" />
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

      {/* Siglitos Playful Footer */}
      <footer className="border-t border-amber-200/80 bg-white/95 backdrop-blur-xl py-8 text-center text-xs font-sans mt-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-display font-black text-base tracking-tight text-slate-900">
              Potion<span className="text-amber-500">Pulse</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] text-black border border-amber-500/40 uppercase tracking-wider -rotate-1 shadow-sm">
              Smart Inventory OS
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] font-sans font-extrabold uppercase tracking-wider text-slate-700">
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="text-amber-500">✦</span> 100% Pure Magic
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="text-emerald-500">✦</span> No Artificial Glitches
            </span>
            <span className="flex items-center gap-1.5 text-violet-700">
              <span className="text-violet-500">✦</span> FastAPI + LightGBM
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 font-mono text-[11px] font-black text-amber-950 tracking-wide shadow-sm">
            Halloween Hackathon 2026
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
