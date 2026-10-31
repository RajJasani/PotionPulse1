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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-amber-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-rose-500 to-pink-600 text-white uppercase tracking-wider shadow-sm">
              SURVEILLANCE SENTINEL
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <span>Strange Happenings</span>
          </h2>
          <p className="font-sans text-xs font-semibold text-slate-600 mt-1">
            Flags unexplained stock depletion, physical theft, sudden volume surges, and seasonal shifts.
          </p>
        </div>

        <button
          onClick={handleScanNow}
          disabled={scanning}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-500 text-slate-950 border border-amber-500/40 px-5 py-2.5 rounded-full font-sans text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all min-h-[44px] disabled:opacity-50"
        >
          <Radar className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Sweeping Wards...' : 'Scan For Anomalies'}</span>
        </button>
      </div>

      {/* Suggested Recurring Spikes Banner */}
      {suggestions.length > 0 && (
        <div className="p-6 rounded-3xl luxury-glass border border-amber-300/80 shadow-xl space-y-3 relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50/70">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between pb-2 border-b border-amber-200/80 relative z-10">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="font-display text-lg font-black text-slate-900">
                Cluster Divination: Potential High Coven Festival
              </h3>
            </div>
            <span className="text-[10px] font-mono font-black px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
              {suggestions.length} Co-Occurring Spikes
            </span>
          </div>
          <p className="font-sans text-xs font-medium text-slate-700 relative z-10">
            The sentinel noticed concurrent consumption surges across multiple reagents. This pattern indicates an uncataloged ritual or festival.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 relative z-10">
            <button
              onClick={() => onNavigateTab('events')}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-slate-950 font-sans text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              Catalog Festival in Midnight Curse &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="p-4 rounded-3xl luxury-glass border border-amber-300/80 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'UNRESOLVED', 'RESOLVED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-1.5 rounded-full font-sans text-xs font-black uppercase tracking-wider border transition-all ${
                statusFilter === filter
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-slate-950 border-amber-500/40 shadow-md scale-[1.02]'
                  : 'bg-amber-50/80 border-amber-200/80 text-slate-700 hover:text-slate-950 hover:bg-amber-100'
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

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-500" />
          <span>Residual Z-Score & Stock Delta Active</span>
        </div>
      </div>

      {/* Main Anomalies Feed */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl border border-amber-200" />
          ))}
        </div>
      ) : filteredAnomalies.length === 0 ? (
        <div className="p-12 text-center rounded-3xl luxury-glass border border-emerald-300 shadow-xl bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <CheckCircle className="w-12 h-12 text-emerald-600 fill-emerald-500/20 mx-auto mb-3" />
          <h3 className="font-display text-xl font-black text-slate-900">
            All Pantry Wards Peaceful
          </h3>
          <p className="font-sans text-xs font-semibold text-slate-600 mt-1">
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
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isResolved
                    ? 'luxury-glass border-amber-200/60 opacity-80'
                    : 'luxury-glass border-rose-300/80 shadow-md bg-gradient-to-br from-rose-50/70 via-white to-orange-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-display font-black text-base text-slate-900">
                        {anom.ingredient_name || 'Alchemical Reagent'}
                      </span>

                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-sans font-black uppercase tracking-wider shadow-sm ${
                          isCritical
                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white'
                            : 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950'
                        }`}
                      >
                        {anom.anomaly_type.replace('_', ' ')}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-950 border border-amber-300">
                        Date: {anom.detected_at.slice(0, 10)}
                      </span>

                      {isResolved && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                          ✓ Warded
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs font-medium text-slate-700 leading-relaxed">
                      Expected baseline consumption was <strong className="text-slate-900 font-bold">{anom.expected_consumption.toFixed(1)}</strong>, but recorded <strong className="text-amber-700 font-bold">{anom.actual_consumption.toFixed(1)}</strong>. Anomaly score: {anom.anomaly_score.toFixed(1)}.
                    </p>

                    <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-600 pt-1">
                      <span>
                        Recorded: <strong className="text-rose-700 font-black">{anom.actual_consumption}</strong>
                      </span>
                      <span>
                        Expected: <strong className="text-slate-900 font-black">{anom.expected_consumption}</strong>
                      </span>
                      <span>
                        Score: <strong className="text-amber-800 font-black">{anom.anomaly_score.toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>

                  {!isResolved && (
                    <button
                      onClick={() => setResolvingId(anom.id)}
                      className="self-start sm:self-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-sans font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all border border-emerald-400/50 flex items-center gap-1.5"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-3xl bg-white/95 border border-amber-300 p-6 sm:p-7 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-amber-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
                    <Wand2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  </div>
                  <h3 className="font-display text-xl font-black text-slate-900">
                    Ward Anomaly
                  </h3>
                </div>
                <button
                  onClick={() => setResolvingId(null)}
                  className="p-1.5 rounded-full border border-amber-200 text-slate-600 hover:text-black hover:bg-amber-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmResolve} className="mt-5 space-y-4">
                <div>
                  <label className="block font-sans text-xs font-black text-amber-950 uppercase tracking-wider mb-1.5">
                    Resolution Notes & Audit Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Confirmed unrecorded potion spill during the goblin festival..."
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    className="w-full bg-amber-50/70 border border-amber-300 rounded-2xl p-3 text-slate-900 font-bold text-xs shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResolvingId(null)}
                    className="flex-1 py-3 rounded-full border border-amber-300 bg-amber-50 text-slate-800 font-sans text-xs font-black uppercase tracking-wider shadow-sm hover:bg-amber-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-sans text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
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
