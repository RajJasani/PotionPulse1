import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldCheck,
  Radar,
  CheckCircle,
  Eye,
  Wand2,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '@shared/api-client';
import { Anomaly } from '@shared/api.types';
import { Skeleton } from '../components/Skeleton';
import { ArcaneSparkles } from '../components/ArcaneSparkles';
import { EmptyState } from '../components/EmptyState';

interface StrangeHappeningsPageProps {
  onShowToast: (toast: any) => void;
  onNavigateTab: (tab: any) => void;
}

export const StrangeHappeningsPage: React.FC<StrangeHappeningsPageProps> = ({
  onShowToast,
  onNavigateTab,
}) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNRESOLVED' | 'RESOLVED'>('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [sparklesActive, setSparklesActive] = useState(false);

  const loadAnomaliesAndSuggestions = async () => {
    try {
      setLoading(true);
      const [anoms, suggs] = await Promise.all([
        api.getAnomalies(),
        api.getEventSuggestions(90),
      ]);
      setAnomalies(anoms);
      setSuggestions(suggs);
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Sentinel Blinded',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnomaliesAndSuggestions();
  }, []);

  const handleScanNow = async () => {
    try {
      setScanning(true);
      const res = await api.scanAnomalies();
      onShowToast({
        id: Date.now().toString(),
        type: 'info',
        title: 'Sentinel Sweep Finished',
        message: `Sweep complete. Detected ${res.total_anomalies_detected} total anomalies.`,
      });
      await loadAnomaliesAndSuggestions();
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Sweep Interrupted',
        message: err.message,
      });
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingId) return;

    try {
      await api.resolveAnomaly(resolvingId, {
        status: 'RESOLVED',
        notes: resolveNotes || 'Investigated by pantry keeper and neutralized.',
      });

      setAnomalies((prev) =>
        prev.map((a) =>
          a.id === resolvingId
            ? { ...a, status: 'RESOLVED', resolution_notes: resolveNotes }
            : a
        )
      );

      setSparklesActive(true);
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Discrepancy Warded',
        message: 'The anomaly status has been logged and closed.',
      });

      setResolvingId(null);
      setResolveNotes('');
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Ward Failed',
        message: err.message,
      });
    }
  };

  const filteredAnomalies = anomalies.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-sig-fresa to-pink-600 text-white border border-black/10 uppercase tracking-wider shadow-sm">
              SURVEILLANCE SENTINEL
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-sig-black dark:text-sig-cream flex items-center gap-3">
            <span>Strange Happenings</span>
          </h2>
          <p className="font-sans text-xs font-bold text-sig-black/60 dark:text-sig-cream/60 mt-1">
            Flags unexplained stock depletion, physical theft, sudden volume surges, and seasonal shifts.
          </p>
        </div>

        <button
          onClick={handleScanNow}
          disabled={scanning}
          className="flex items-center gap-2 bg-gradient-to-r from-sig-limon via-[#FFD000] to-[#FF9F06] hover:from-[#FFF700] hover:to-[#FF8A00] text-sig-black border border-black/15 px-5 py-2.5 rounded-full font-sans text-xs font-black uppercase tracking-wider shadow-pro hover:shadow-pro-glow-amber hover:-translate-y-0.5 active:translate-y-0 transition-all min-h-[44px] disabled:opacity-50"
        >
          <Radar className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Sweeping Wards...' : 'Scan For Anomalies'}</span>
        </button>
      </div>

      {/* Suggested Recurring Spikes Banner */}
      {suggestions.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FFF9DC] via-[#FFF1A8] to-[#FFE2BF] dark:from-[#211634] dark:to-[#171328] border border-black/15 dark:border-white/15 shadow-pro space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 fill-amber-600" />
              <h3 className="font-display text-lg font-black text-sig-black dark:text-sig-cream">
                Cluster Divination: Potential High Coven Festival
              </h3>
            </div>
            <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-sig-black text-white">
              {suggestions.length} Co-Occurring Spikes
            </span>
          </div>
          <p className="font-sans text-xs font-bold text-sig-black/80 dark:text-sig-cream/80">
            The sentinel noticed concurrent consumption surges across multiple reagents. This pattern indicates an uncataloged ritual or festival.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => onNavigateTab('events')}
              className="px-4 py-2 rounded-full bg-sig-black text-white dark:bg-sig-limon dark:text-sig-black border border-black/15 font-sans text-xs font-black uppercase tracking-wider shadow-pro-sm hover:shadow-pro hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Catalog Festival in Midnight Curse &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="p-4 rounded-3xl bg-white/85 dark:bg-[#161422]/85 backdrop-blur-xl border border-black/10 dark:border-white/12 shadow-pro flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'UNRESOLVED', 'RESOLVED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-1.5 rounded-full font-sans text-xs font-black uppercase tracking-wider border transition-all ${
                statusFilter === filter
                  ? 'bg-gradient-to-r from-[#181528] to-[#2B2344] text-white dark:from-sig-limon dark:to-[#FFA033] dark:text-sig-black border-transparent shadow-pro-sm scale-[1.02]'
                  : 'bg-[#FAF8F2] dark:bg-[#201D2E] border-black/10 dark:border-white/10 text-sig-black dark:text-sig-cream hover:bg-black/5'
              }`}
            >
              {filter === 'ALL'
                ? `All (${anomalies.length})`
                : filter === 'UNRESOLVED'
                ? `Unresolved (${anomalies.filter((a) => a.status === 'UNRESOLVED').length})`
                : `Resolved (${anomalies.filter((a) => a.status === 'RESOLVED').length})`}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-sig-black/60 dark:text-sig-cream/60">
          <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-500" />
          <span>Residual Z-Score & Stock Delta Active</span>
        </div>
      </div>

      {/* Main Anomalies Feed */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl border-2 border-sig-black" />
          ))}
        </div>
      ) : filteredAnomalies.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#18171F] border-2 border-sig-black shadow-sig">
          <CheckCircle className="w-12 h-12 text-sig-lima fill-sig-lima text-sig-black mx-auto mb-3" />
          <h3 className="font-display text-xl font-black text-sig-black dark:text-sig-cream">
            All Pantry Wards Peaceful
          </h3>
          <p className="font-sans text-xs font-bold text-sig-black/60 dark:text-sig-cream/60 mt-1">
            No active consumption anomalies or unrecorded stock losses in this scope.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnomalies.map((anom) => {
            const isResolved = anom.status === 'RESOLVED';
            const isLoss = anom.anomaly_type === 'SUDDEN_DRAIN';
            const isCritical = anom.severity === 'CRITICAL' || isLoss;

            return (
              <motion.div
                key={anom.id}
                layout
                className={`p-5 rounded-3xl border-2 border-sig-black shadow-sig transition-all ${
                  isResolved
                    ? 'bg-sig-cream/60 dark:bg-[#18171F]/60 opacity-80'
                    : 'bg-white dark:bg-[#18171F]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-black text-base text-sig-black dark:text-sig-cream">
                        {anom.ingredient_name || 'Alchemical Reagent'}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black border border-sig-black uppercase ${
                          isCritical
                            ? 'bg-sig-fresa text-white'
                            : 'bg-sig-limon text-sig-black'
                        }`}
                      >
                        {anom.anomaly_type.replace('_', ' ')}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sig-cream dark:bg-[#2A253F] text-sig-black dark:text-sig-cream border border-sig-black">
                        Date: {anom.detected_at.slice(0, 10)}
                      </span>

                      {isResolved && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-black bg-sig-lima text-sig-black border border-sig-black uppercase">
                          ✓ Warded
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs font-bold text-sig-black/80 dark:text-sig-cream/80 leading-relaxed">
                      Expected baseline consumption was {anom.expected_consumption.toFixed(1)}, but recorded {anom.actual_consumption.toFixed(1)}. Anomaly score: {anom.anomaly_score.toFixed(1)}.
                    </p>

                    <div className="flex items-center gap-4 text-xs font-mono font-bold text-sig-black/60 dark:text-sig-cream/60 pt-1">
                      <span>
                        Recorded: <strong className="text-sig-black dark:text-sig-cream">{anom.actual_consumption}</strong>
                      </span>
                      <span>
                        Expected: <strong className="text-sig-black dark:text-sig-cream">{anom.expected_consumption}</strong>
                      </span>
                      <span>
                        Score: <strong className="text-sig-fresa">{anom.anomaly_score.toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>

                  {!isResolved && (
                    <button
                      onClick={() => setResolvingId(anom.id)}
                      className="self-start sm:self-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 border border-emerald-300/40 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Ward & Resolve</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* RESOLVE DIALOGUE MODAL */}
      <AnimatePresence>
        {resolvingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sig-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-[#18171F] border-2 border-sig-black p-6 sm:p-7 shadow-sig-lg"
            >
              <div className="flex items-center justify-between pb-4 border-b-2 border-sig-black">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sig-lima border-2 border-sig-black flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-sig-black stroke-[2.5]" />
                  </div>
                  <h3 className="font-display text-xl font-black text-sig-black dark:text-sig-cream">
                    Ward Anomaly
                  </h3>
                </div>
                <button
                  onClick={() => setResolvingId(null)}
                  className="p-1 rounded-full border-2 border-sig-black hover:bg-sig-cream"
                >
                  <X className="w-4 h-4 text-sig-black" />
                </button>
              </div>

              <form onSubmit={handleConfirmResolve} className="mt-5 space-y-4">
                <div>
                  <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase tracking-wider mb-1.5">
                    Resolution Notes & Audit Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Confirmed unrecorded potion spill during the goblin festival..."
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    className="w-full bg-sig-cream dark:bg-[#24222E] border-2 border-sig-black rounded-2xl p-3 text-sig-black dark:text-sig-cream font-bold text-xs shadow-sig-sm"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResolvingId(null)}
                    className="flex-1 py-3 rounded-full border-2 border-sig-black bg-white dark:bg-[#24222E] text-sig-black dark:text-sig-cream font-sans text-xs font-black uppercase tracking-wider shadow-sig-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-sans text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    Seal Ward
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ArcaneSparkles active={sparklesActive} onComplete={() => setSparklesActive(false)} />
    </div>
  );
};
