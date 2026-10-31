import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  Moon,
  TrendingDown,
  Wand2,
  CheckCircle,
  Clock,
  Coins,
  ArrowRight,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@shared/api-client';
import {
  Ingredient,
  ProphecyStockout,
  ReorderRecommendation,
  Anomaly,
  PotionEvent,
} from '@shared/api.types';
import { PotionBottleGauge } from '@shared/PotionBottleGauge';
import { StatCard } from '../components/StatCard';
import { Skeleton } from '../components/Skeleton';
import { ArcaneSparkles } from '../components/ArcaneSparkles';

interface DashboardPageProps {
  onNavigateTab: (tab: any) => void;
  onShowToast: (toast: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onShowToast,
}) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [prophecies, setProphecies] = useState<ProphecyStockout[]>([]);
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [events, setEvents] = useState<PotionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [castingRestockId, setCastingRestockId] = useState<string | null>(null);
  const [sparklesActive, setSparklesActive] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ings, prophs, recs, anoms, evts] = await Promise.all([
        api.getIngredients(),
        api.getStockoutProphecies(),
        api.getReorderRecommendations(),
        api.getAnomalies('UNRESOLVED'),
        api.getEvents(true),
      ]);
      setIngredients(ings);
      setProphecies(prophs);
      setRecommendations(recs);
      setAnomalies(anoms);
      setEvents(evts);
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Divination Interrupted',
        message: err.message || 'Could not communicate with the arcane server.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCastRestock = async (rec: ReorderRecommendation) => {
    try {
      setCastingRestockId(rec.ingredient_id);
      await api.adjustStock({
        ingredient_id: rec.ingredient_id,
        delta: rec.recommended_quantity,
        reason: 'RESTOCK_SPELL',
        notes: `Restock spell batch: +${rec.recommended_quantity} ${rec.unit}`,
      });
      setSparklesActive(true);
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Restock Spell Cast!',
        message: `Replenished ${rec.recommended_quantity} ${rec.unit} of ${rec.ingredient_name}.`,
      });
      await loadDashboardData();
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Spell Failed',
        message: err.message,
      });
    } finally {
      setCastingRestockId(null);
    }
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      await api.resolveAnomaly(anomalyId, {
        status: 'RESOLVED',
        notes: 'Acknowledged and resolved from Cauldron View dashboard.',
      });
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Strange Happening Resolved',
        message: 'The anomaly has been warded and archived.',
      });
      setAnomalies((prev) => prev.filter((a) => a.id !== anomalyId));
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Ward Failed',
        message: err.message,
      });
    }
  };

  const criticalFlasks = [...ingredients]
    .sort((a, b) => a.current_stock - b.current_stock)
    .slice(0, 5);

  const criticalPropheciesCount = prophecies.filter(
    (p) => p.urgency === 'CRITICAL' || p.is_stocked_out
  ).length;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Luminous Professional Hero Masthead Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#FFF9DC] via-[#FFF0B3] to-[#FFD8C2] dark:from-[#211636] dark:via-[#1B142A] dark:to-[#12202C] border border-black/15 dark:border-white/15 p-6 sm:p-8 shadow-pro-lg overflow-hidden">
        {/* Soft Ambient Radiance Blooms */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-amber-400/25 via-pink-400/20 to-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-lime-400/20 to-emerald-400/15 blur-2xl pointer-events-none" />

        {/* Floating playful stamps */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-sans font-black bg-white dark:bg-[#1E1933] text-slate-900 dark:text-amber-300 border border-slate-300 dark:border-amber-400/30 uppercase tracking-wider -rotate-2 shadow-sm">
            ★ 100% ARTISANAL POTIONS ★
          </span>
          <span className="px-3.5 py-1 rounded-full text-xs font-sans font-black bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] text-black border border-amber-500/40 uppercase tracking-wider rotate-1 shadow-md">
            EST. 2026
          </span>
        </div>

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sig-black/90 dark:bg-white/10 backdrop-blur-md text-white text-[11px] font-sans font-black uppercase tracking-widest mb-3 shadow-pro-sm border border-white/10">
            <Zap className="w-3.5 h-3.5 text-sig-limon fill-sig-limon" />
            <span>REAL-TIME INVENTORY TELEMETRY</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-2">
            The Cauldron View
          </h2>

          <p className="font-sans text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed mb-6">
            Predictive demand prophecies, automated restock charms, and live anomaly sentinels for high-volume alchemical operations.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('events')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#181528] to-[#2E2448] dark:from-[#FEE214] dark:via-[#FFC400] dark:to-[#FF8A00] text-white dark:text-sig-black border border-black/20 dark:border-white/20 font-sans font-black text-xs uppercase tracking-wider shadow-pro hover:shadow-pro-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Moon className="w-4 h-4 text-pink-400 dark:text-sig-black fill-current" />
              <span>Full Moon Festival (3.0x Surge)</span>
              <span className="w-2 h-2 rounded-full bg-sig-fresa animate-ping" />
            </button>

            <button
              onClick={() => onNavigateTab('inventory')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 dark:bg-[#161422]/90 text-sig-black dark:text-white border border-black/15 dark:border-white/15 font-sans font-black text-xs uppercase tracking-wider shadow-pro hover:shadow-pro-lg hover:-translate-y-0.5 active:translate-y-0 transition-all backdrop-blur-md"
            >
              <span>Audit Pantry Shelves &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bento Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cataloged Reagents"
          value={loading ? '...' : ingredients.length}
          subtitle="Monitored across 4 shelves"
          icon={Sparkles}
          variant="brass"
        />
        <StatCard
          title="Imminent Stockouts"
          value={loading ? '...' : criticalPropheciesCount}
          subtitle="Runout forecasted ≤ 72h"
          icon={TrendingDown}
          variant="magenta"
          trend="ACTION REQUIRED"
        />
        <StatCard
          title="Active Celestial Events"
          value={loading ? '...' : events.length > 0 ? events[0].multiplier + 'x' : 'None'}
          subtitle={events.length > 0 ? events[0].name : 'Standard celestial tides'}
          icon={Moon}
          variant="amber"
        />
        <StatCard
          title="Strange Happenings"
          value={loading ? '...' : anomalies.length}
          subtitle="Active unwarded discrepancies"
          icon={AlertTriangle}
          variant={anomalies.length > 0 ? 'magenta' : 'lime'}
        />
      </div>

      {/* 3. Potion Flash Bottles Showcase with Glass Sheen */}
      <div className="rounded-3xl bg-white/95 dark:bg-[#151221] backdrop-blur-xl border border-slate-200 dark:border-white/15 p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Lowest-Stock Potion Flash Tubes
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-rose-500 text-white uppercase shadow-sm animate-pulse">
                CRITICAL
              </span>
            </div>
            <p className="font-sans text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              Live volumetric liquid gauges with animated meniscus and slosh physics.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300 dark:border-white/15 font-sans text-xs font-black uppercase text-slate-900 dark:text-white shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <span>All Shelves</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl border border-black/10 dark:border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {criticalFlasks.map((ing) => (
              <div
                key={ing.id}
                className="flex flex-col items-center justify-between p-4 rounded-3xl bg-white/95 dark:bg-[#1E192E] border border-slate-200 dark:border-white/15 shadow-sm hover:shadow-xl hover:border-amber-400/50 dark:hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="text-center mb-2 w-full">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-400/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30 dark:border-amber-400/30 uppercase tracking-wider mb-1 shadow-sm">
                    {ing.category}
                  </span>
                  <h4 className="font-display font-black text-sm text-slate-900 dark:text-white truncate w-full" title={ing.name}>
                    {ing.name}
                  </h4>
                </div>

                <div className="my-2 transform group-hover:scale-105 transition-transform">
                  <PotionBottleGauge
                    currentStock={ing.current_stock}
                    maxCapacity={ing.reorder_point * 2.5}
                    unit={ing.unit}
                    minimumThreshold={ing.minimum_threshold}
                    reorderPoint={ing.reorder_point}
                    size="md"
                  />
                </div>

                <button
                  onClick={() => onNavigateTab('inventory')}
                  className="mt-3 w-full py-1.5 px-3 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 hover:text-black dark:hover:from-amber-400 dark:hover:to-amber-500 dark:hover:text-black text-slate-900 dark:text-white border border-slate-300 dark:border-white/15 text-xs font-sans font-black uppercase tracking-wider transition-all shadow-sm"
                >
                  Manage Stock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Main Asymmetric Bento: Prophecy Panel vs Restock & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Prophecy Engine & Runout Countdown */}
        <div className="lg:col-span-7 rounded-3xl bg-white/85 dark:bg-[#161422]/85 backdrop-blur-xl border border-black/10 dark:border-white/12 p-6 sm:p-7 shadow-pro flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>The Prophecy Engine</span>
                </h3>
                <p className="font-sans text-xs font-semibold text-slate-600 dark:text-slate-300">
                  ML-projected inventory depletion trajectories and stockout timelines.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('crystal-ball')}
                className="font-sans text-xs font-black uppercase text-amber-600 dark:text-[#FFE58F] flex items-center gap-1 hover:underline"
              >
                <span>Full Charts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-2xl border border-black/10 dark:border-white/10" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
                      <th className="pb-3">Reagent</th>
                      <th className="pb-3 text-right">Stock</th>
                      <th className="pb-3 text-right">Burn Rate</th>
                      <th className="pb-3 text-right">Prophesied Runout</th>
                      <th className="pb-3 text-center">Urgency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {prophecies.slice(0, 6).map((p) => {
                      const urgencyBadge = {
                        CRITICAL: 'bg-gradient-to-r from-sig-fresa to-pink-600 text-white',
                        WARNING: 'bg-gradient-to-r from-sig-naranja to-amber-500 text-white',
                        HEALTHY: 'bg-gradient-to-r from-sig-lima to-emerald-500 text-sig-black',
                      }[p.urgency] || 'bg-sig-gray text-sig-black';

                      return (
                        <tr
                          key={p.ingredient_id}
                          className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 font-extrabold text-slate-900 dark:text-white">
                            {p.name}
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                            {p.current_stock.toFixed(1)} {p.unit}
                          </td>
                          <td className="py-3 text-right font-mono font-semibold text-slate-600 dark:text-slate-300">
                            ~{p.depletion_rate_per_day.toFixed(1)}/d
                          </td>
                          <td className="py-3 text-right font-mono font-black text-slate-900 dark:text-white">
                            {p.is_stocked_out ? (
                              <span className="text-rose-500 font-extrabold">EXHAUSTED</span>
                            ) : (
                              `${p.days_until_stockout.toFixed(1)} days`
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-black/10 ${urgencyBadge}`}
                            >
                              {p.is_stocked_out ? 'DEPLETED' : p.urgency}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>
              Powered by Histogram Gradient Boosting Regressor (18.4% WAPE).
            </span>
            <span className="inline-flex items-center gap-1 font-sans text-emerald-600 dark:text-emerald-400 font-black">
              <ShieldCheck className="w-4 h-4 fill-current" />
              <span>95% Service Buffer</span>
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Top Restock Recommendations & Strange Happenings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Restock Spell Box with Purple/Violet Gradient Aura */}
          <div className="rounded-3xl bg-gradient-to-br from-white via-white to-[#F8F0FE] dark:from-[#211634] dark:via-[#191228] dark:to-[#120C1F] border border-black/10 dark:border-white/12 p-6 shadow-pro">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10 dark:border-white/10">
              <h3 className="font-display text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500" />
                <span>The Restock Spell</span>
              </h3>
              <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-white border border-emerald-600/30">
                {recommendations.length} to reorder
              </span>
            </div>

            {loading ? (
              <Skeleton className="h-32 w-full rounded-2xl border border-black/10 dark:border-white/10" />
            ) : recommendations.length === 0 ? (
              <div className="text-center py-6 text-slate-600 dark:text-slate-300 text-xs font-bold">
                ✨ All shelves adequately provisioned with safety stock.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.ingredient_id}
                    className="p-4 rounded-2xl bg-white/90 dark:bg-[#281F3E]/90 border border-black/10 dark:border-white/10 shadow-pro-sm flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans font-black text-sm text-slate-900 dark:text-white">
                          {rec.ingredient_name}
                        </h4>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-500/40">
                          +{rec.recommended_quantity} {rec.unit}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1 leading-snug line-clamp-2">
                        {rec.reasoning}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {rec.estimated_cost_gold} Gold
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCastRestock(rec)}
                      disabled={castingRestockId === rec.ingredient_id}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-purple-400/40 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>{castingRestockId === rec.ingredient_id ? 'Brewing...' : 'Restock'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Strange Happenings Alert Box */}
          <div className="rounded-3xl bg-white dark:bg-[#1A1424] border border-slate-200 dark:border-white/15 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-display text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
                <span>Strange Happenings Sentinel</span>
              </h3>
              <button
                onClick={() => onNavigateTab('anomalies')}
                className="font-sans text-xs font-black uppercase text-amber-500 dark:text-amber-400 hover:underline"
              >
                Feed &rarr;
              </button>
            </div>

            {loading ? (
              <Skeleton className="h-28 w-full rounded-2xl border border-black/10 dark:border-white/10" />
            ) : anomalies.length === 0 ? (
              <div className="text-center py-5 text-xs font-bold flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500 text-white" />
                <span>Pantry wards intact. No unauthorized spikes or missing stock detected.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.slice(0, 2).map((anom) => (
                  <div
                    key={anom.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1F192C] border border-slate-200 dark:border-white/15 shadow-sm hover:border-emerald-400/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {anom.ingredient_name || 'Reagent'}
                        </span>
                        <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm tracking-wide">
                          {anom.anomaly_type}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                        Actual: <strong className="text-rose-500 dark:text-rose-400 font-black">{anom.actual_consumption}</strong> vs expected{' '}
                        <strong className="text-slate-900 dark:text-slate-200 font-bold">{anom.expected_consumption}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleResolveAnomaly(anom.id)}
                      className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-sans font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all border border-emerald-300/40 flex-shrink-0"
                    >
                      Ward
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Celebratory Arcane Sparkles on Restock Spell */}
      <ArcaneSparkles active={sparklesActive} onComplete={() => setSparklesActive(false)} />
    </div>
  );
};
