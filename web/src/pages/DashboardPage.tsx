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
import { BubblingCauldron } from '../components/BubblingCauldron';

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
      {/* Operational Overview Telemetry Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-amber-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 text-[11px] font-sans font-black uppercase tracking-widest mb-1.5 shadow-sm border border-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
            <span>APOTHECARY TELEMETRY MATRIX</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            Live Inventory Intelligence
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-block px-3.5 py-1.5 rounded-full text-xs font-sans font-black bg-amber-100/80 text-amber-900 border border-amber-300 uppercase tracking-wider shadow-sm">
            ★ 100% ARTISANAL POTIONS ★
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-sans font-black bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-slate-950 border border-amber-500/40 uppercase tracking-wider shadow-md">
            EST. 2026
          </span>
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
      <div className="rounded-3xl luxury-glass p-6 sm:p-8 border border-amber-300/80 shadow-xl relative overflow-hidden">
        {/* Subtle warm sunset background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-orange-400/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-amber-200/80 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900">
                Lowest-Stock Potion Flash Tubes
              </h3>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-rose-500 to-pink-600 text-white uppercase shadow-md shadow-rose-500/30 animate-pulse tracking-wider">
                CRITICAL
              </span>
            </div>
            <p className="font-sans text-xs font-semibold text-slate-600 mt-1">
              Live volumetric liquid gauges with animated meniscus and slosh physics.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/90 hover:bg-amber-200 border border-amber-300 font-sans text-xs font-black uppercase text-amber-950 shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <span>All Shelves</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-52 w-full rounded-3xl border border-amber-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {criticalFlasks.map((ing, idx) => (
              <motion.div
                key={ing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="flex flex-col items-center justify-between p-5 rounded-3xl bg-gradient-to-b from-amber-50/90 via-white to-orange-50/70 border border-amber-300/80 hover:border-amber-500 shadow-md hover:shadow-xl hover:shadow-amber-500/15 transition-all duration-300 group relative overflow-hidden cursor-default"
              >
                {/* Micro backlight */}
                <div className="absolute inset-0 bg-radial from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="text-center mb-3 w-full relative z-10">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-widest mb-1.5 shadow-sm">
                    {ing.category}
                  </span>
                  <h4 className="font-display font-black text-sm text-slate-900 truncate w-full" title={ing.name}>
                    {ing.name}
                  </h4>
                </div>

                <div className="my-2 transform group-hover:scale-110 transition-transform relative z-10">
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
                  className="mt-4 w-full py-2 px-3 rounded-full bg-amber-100 hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-400 hover:text-slate-950 text-amber-950 border border-amber-300 text-xs font-sans font-black uppercase tracking-wider transition-all duration-200 shadow-sm relative z-10 hover:scale-105 active:scale-95"
                >
                  Manage Stock
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Main Asymmetric Bento: Prophecy Panel vs Restock & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Prophecy Engine & Runout Countdown */}
        <div className="lg:col-span-7 rounded-3xl luxury-glass p-6 sm:p-8 border border-amber-300/80 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-amber-200/80">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>The Prophecy Engine</span>
                </h3>
                <p className="font-sans text-xs font-semibold text-slate-600 mt-1">
                  ML-projected inventory depletion trajectories and stockout timelines.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('crystal-ball')}
                className="font-sans text-xs font-black uppercase text-amber-900 hover:text-amber-950 flex items-center gap-1 hover:underline tracking-wider"
              >
                <span>Full Charts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-2xl border border-amber-200" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-amber-300/80 text-amber-950 font-black uppercase tracking-wider text-[11px] bg-amber-100/60 rounded-xl">
                      <th className="py-3 px-3">Reagent</th>
                      <th className="py-3 px-3 text-right">Stock</th>
                      <th className="py-3 px-3 text-right">Burn Rate</th>
                      <th className="py-3 px-3 text-right">Prophesied Runout</th>
                      <th className="py-3 px-3 text-center">Urgency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/80">
                    {prophecies.slice(0, 6).map((p) => {
                      const urgencyBadge = {
                        CRITICAL: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/25',
                        WARNING: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black shadow-amber-500/25',
                        HEALTHY: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black shadow-emerald-500/25',
                      }[p.urgency] || 'bg-amber-100 text-amber-950';

                      return (
                        <tr
                          key={p.ingredient_id}
                          className="hover:bg-amber-50/70 transition-colors group"
                        >
                          <td className="py-3.5 px-3 font-black text-slate-900 text-sm group-hover:text-amber-800 transition-colors">
                            {p.name}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800">
                            {p.current_stock.toFixed(1)} {p.unit}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-purple-900">
                            ~{p.depletion_rate_per_day.toFixed(1)}/d
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-black text-amber-950">
                            {p.is_stocked_out ? (
                              <span className="text-rose-600 font-extrabold uppercase tracking-wide">EXHAUSTED</span>
                            ) : (
                              `${p.days_until_stockout.toFixed(1)} days`
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-black/5 inline-block ${urgencyBadge}`}
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

          <div className="mt-6 pt-4 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold text-slate-600">
            <span>
              Powered by Histogram Gradient Boosting Regressor (18.4% WAPE).
            </span>
            <span className="inline-flex items-center gap-1 font-sans text-emerald-700 font-black">
              <ShieldCheck className="w-4 h-4 fill-current text-emerald-600" />
              <span>95% Service Buffer</span>
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Top Restock Recommendations & Strange Happenings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Restock Spell Box with Purple/Violet Gradient Aura */}
          <div className="rounded-3xl luxury-glass p-6 border border-purple-300/80 shadow-xl glow-violet-card relative overflow-hidden bg-gradient-to-br from-[#FAF5FF] via-white to-[#F5F3FF]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-200/80">
              <h3 className="font-display text-xl font-black text-purple-950 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                <span>The Restock Spell</span>
              </h3>
              <span className="font-mono text-xs font-black px-3 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                {recommendations.length} to reorder
              </span>
            </div>

            {loading ? (
              <Skeleton className="h-32 w-full rounded-2xl border border-purple-200" />
            ) : recommendations.length === 0 ? (
              <div className="text-center py-6 text-purple-900 text-xs font-bold">
                ✨ All shelves adequately provisioned with safety stock.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <motion.div
                    key={rec.ingredient_id}
                    whileHover={{ x: 4, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-2xl bg-white/90 border border-purple-200/80 hover:border-purple-400 shadow-md flex items-start justify-between gap-3 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans font-black text-sm text-purple-950">
                          {rec.ingredient_name}
                        </h4>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-sm">
                          +{rec.recommended_quantity} {rec.unit}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] font-medium text-slate-700 mt-1 leading-snug line-clamp-2">
                        {rec.reasoning}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] font-mono font-bold text-amber-900">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          {rec.estimated_cost_gold} Gold
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCastRestock(rec)}
                      disabled={castingRestockId === rec.ingredient_id}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>{castingRestockId === rec.ingredient_id ? 'Brewing...' : 'Restock'}</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Live Strange Happenings Alert Box */}
          <div className="rounded-3xl luxury-glass p-6 border border-rose-300/80 shadow-xl glow-magenta-card relative overflow-hidden bg-gradient-to-br from-[#FFF1F2] via-white to-[#FFF7ED]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-200/80">
              <h3 className="font-display text-lg font-black text-rose-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
                <span>Strange Happenings Sentinel</span>
              </h3>
              <button
                onClick={() => onNavigateTab('anomalies')}
                className="font-sans text-xs font-black uppercase text-rose-900 hover:text-rose-950 hover:underline tracking-wider"
              >
                Feed &rarr;
              </button>
            </div>

            {loading ? (
              <Skeleton className="h-28 w-full rounded-2xl border border-rose-200" />
            ) : anomalies.length === 0 ? (
              <div className="text-center py-5 text-xs font-bold flex items-center justify-center gap-2 text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                <span>Pantry wards intact. No unauthorized spikes or missing stock detected.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.slice(0, 2).map((anom) => (
                  <motion.div
                    key={anom.id}
                    whileHover={{ x: 4, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-2xl bg-white/90 border border-rose-200/80 hover:border-rose-400 shadow-md transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">
                          {anom.ingredient_name || 'Reagent'}
                        </span>
                        <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm tracking-wide">
                          {anom.anomaly_type}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-slate-700 mt-1 leading-snug">
                        Actual: <strong className="text-rose-700 font-black">{anom.actual_consumption}</strong> vs expected{' '}
                        <strong className="text-slate-900 font-bold">{anom.expected_consumption}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleResolveAnomaly(anom.id)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-sans font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                    >
                      Ward
                    </button>
                  </motion.div>
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
