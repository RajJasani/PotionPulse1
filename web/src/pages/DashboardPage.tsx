import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckSquare,
  Square,
  RefreshCw,
  Plus,
  Compass,
  Eye,
  Activity,
  Flame,
  UserCheck,
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
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigateTab: (tab: any) => void;
  onShowToast: (toast: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onShowToast,
}) => {
  const { user, switchRole, openLogin } = useAuth();
  const [selectedPreviewRole, setSelectedPreviewRole] = useState<string>('Master Alchemist');

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [prophecies, setProphecies] = useState<ProphecyStockout[]>([]);
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [events, setEvents] = useState<PotionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [castingRestockId, setCastingRestockId] = useState<string | null>(null);
  const [isBatchRestocking, setIsBatchRestocking] = useState(false);
  const [isScanningAnomalies, setIsScanningAnomalies] = useState(false);
  const [sparklesActive, setSparklesActive] = useState(false);

  // Apprentice chore tracking state
  const [completedChores, setCompletedChores] = useState<Record<string, boolean>>({
    chore_weigh_dragon: true,
  });

  // Effective role: Use logged in user's role, or preview role if guest
  const activeRole = useMemo(() => {
    return user?.role || selectedPreviewRole;
  }, [user?.role, selectedPreviewRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ingsRes, prophsRes, recsRes, anomsRes, evtsRes] = await Promise.allSettled([
        api.getIngredients(),
        api.getStockoutProphecies(),
        api.getReorderRecommendations(),
        api.getAnomalies('UNRESOLVED'),
        api.getEvents(true),
      ]);

      if (ingsRes.status === 'fulfilled') setIngredients(ingsRes.value);
      if (prophsRes.status === 'fulfilled') setProphecies(prophsRes.value);
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value);
      if (anomsRes.status === 'fulfilled') setAnomalies(anomsRes.value);
      if (evtsRes.status === 'fulfilled') setEvents(evtsRes.value);
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

  // 1. Master Alchemist: Cast Restock Charm for Single Item
  const handleCastRestock = async (rec: ReorderRecommendation) => {
    try {
      setCastingRestockId(rec.ingredient_id);
      await api.adjustStock({
        ingredient_id: rec.ingredient_id,
        delta: rec.recommended_quantity,
        reason: 'Restock Spell Cast by Arch-Mage',
      });

      setSparklesActive(true);
      setTimeout(() => setSparklesActive(false), 2500);

      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Restock Spell Completed!',
        message: `Replenished +${rec.recommended_quantity} ${rec.unit} of ${rec.ingredient_name}.`,
      });

      await loadDashboardData();
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Spell Disrupted',
        message: err.message,
      });
    } finally {
      setCastingRestockId(null);
    }
  };

  // 2. Master Alchemist: Batch Restock All Top Reorders
  const handleBatchRestock = async () => {
    if (recommendations.length === 0) return;
    try {
      setIsBatchRestocking(true);
      const batchItems = recommendations.slice(0, 4);
      for (const rec of batchItems) {
        await api.adjustStock({
          ingredient_id: rec.ingredient_id,
          delta: rec.recommended_quantity,
          reason: 'Master Arch-Mage Grand Reorder Charm',
        });
      }

      setSparklesActive(true);
      setTimeout(() => setSparklesActive(false), 3000);

      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Grand Reorder Charm Executed!',
        message: `Batch replenished ${batchItems.length} critical reagents across all shelves.`,
      });

      await loadDashboardData();
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Grand Charm Interrupted',
        message: err.message,
      });
    } finally {
      setIsBatchRestocking(false);
    }
  };

  // 3. Guild Apprentice: Instant Reagent Top-Up
  const handleApprenticeQuickRefill = async (ing: Ingredient, amount: number = 10) => {
    try {
      await api.adjustStock({
        ingredient_id: ing.id,
        delta: amount,
        reason: 'Apprentice physical pantry shelf replenishment',
      });
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: `${ing.name} Refilled!`,
        message: `Added +${amount} ${ing.unit} to the shelf jar.`,
      });
      await loadDashboardData();
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Refill Failed',
        message: err.message,
      });
    }
  };

  // 4. Potions Master / Seer: Trigger Anomaly Scan
  const handleTriggerAnomalyScan = async () => {
    try {
      setIsScanningAnomalies(true);
      const res = await api.scanAnomalies();
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Celestial Radar Sweep Complete',
        message: `Analyzed demand variance. Recorded ${res.total_anomalies_detected} historical anomalies (${res.new_anomalies_recorded} newly flagged).`,
      });
      await loadDashboardData();
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Sweep Disrupted',
        message: err.message,
      });
    } finally {
      setIsScanningAnomalies(false);
    }
  };

  // Anomaly Resolution
  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      await api.resolveAnomaly(anomalyId, {
        status: 'RESOLVED',
        notes: 'Arcane ward placed by alchemist on duty',
      });
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Ward Cast!',
        message: 'The strange happening has been warded and logged.',
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

  const toggleChore = (choreId: string) => {
    setCompletedChores((prev) => {
      const next = !prev[choreId];
      if (next) {
        onShowToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'Chore Completed!',
          message: 'Pantry chores recorded in apprentice journal.',
        });
      }
      return { ...prev, [choreId]: next };
    });
  };

  const criticalFlasks = [...ingredients]
    .sort((a, b) => a.current_stock - b.current_stock)
    .slice(0, 5);

  const criticalPropheciesCount = prophecies.filter(
    (p) => p.urgency === 'CRITICAL' || p.is_stocked_out
  ).length;

  const totalReorderCost = recommendations.reduce(
    (acc, r) => acc + (r.estimated_cost_gold || 0),
    0
  );

  const pendingChoresCount = 4 - Object.values(completedChores).filter(Boolean).length;

  return (
    <div className="space-y-8 pb-16">
      <ArcaneSparkles active={sparklesActive} />

      {/* ========================================================================= */}
      {/* ROLE PERSPECTIVE SWITCHER & HERO BANNER                                    */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-100 via-[#FFF9EE] to-orange-100 border-[2.5px] border-slate-950 rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#0F0E17] flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <span className="text-3xl sm:text-4xl p-2.5 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex-shrink-0">
            {activeRole === 'Guild Apprentice'
              ? '🧪'
              : activeRole === 'Potions Master'
              ? '🦇'
              : '🧙‍♀️'}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-amber-300 border border-black shadow-sm">
                {activeRole === 'Guild Apprentice'
                  ? 'Apprentice Workbench'
                  : activeRole === 'Potions Master'
                  ? "Seer's Observatory"
                  : 'Arch-Mage Executive View'}
              </span>
              <span className="text-xs font-black text-neutral-800">
                {user ? `Active: ${user.username} (${user.role})` : 'Guest Preview Perspective'}
              </span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-black leading-tight">
              {activeRole === 'Guild Apprentice'
                ? 'Pantry Floor Operations, Shelf Audits & Reagent Tasks'
                : activeRole === 'Potions Master'
                ? 'Celestial Demand Seer, LightGBM Models & Anomaly Radar'
                : 'Executive Alchemical Telemetry, Stockout Prophecies & Grand Restocks'}
            </h2>
          </div>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600 sm:hidden">
            Switch Dashboard View:
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] overflow-x-auto no-scrollbar">
            <button
              onClick={() => (user ? switchRole('Master Alchemist') : setSelectedPreviewRole('Master Alchemist'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeRole === 'Master Alchemist'
                  ? 'bg-amber-400 text-black border border-black shadow-sm'
                  : 'text-neutral-700 hover:text-black hover:bg-amber-50'
              }`}
            >
              <span>👑</span>
              <span>Master Alchemist</span>
            </button>
            <button
              onClick={() => (user ? switchRole('Guild Apprentice') : setSelectedPreviewRole('Guild Apprentice'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeRole === 'Guild Apprentice'
                  ? 'bg-emerald-400 text-black border border-black shadow-sm'
                  : 'text-neutral-700 hover:text-black hover:bg-emerald-50'
              }`}
            >
              <span>🧪</span>
              <span>Apprentice</span>
            </button>
            <button
              onClick={() => (user ? switchRole('Potions Master') : setSelectedPreviewRole('Potions Master'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeRole === 'Potions Master'
                  ? 'bg-violet-400 text-black border border-black shadow-sm'
                  : 'text-neutral-700 hover:text-black hover:bg-violet-50'
              }`}
            >
              <span>🦇</span>
              <span>Seer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ROLE-TAILORED BENTO STAT CARDS                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeRole === 'Master Alchemist' && (
          <>
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
              value={loading ? '...' : '3.0x'}
              subtitle="Full Moon Festival Surge"
              icon={Moon}
              variant="amber"
            />
            <StatCard
              title="Restock Capital Required"
              value={loading ? '...' : `${Math.round(totalReorderCost)} G`}
              subtitle={`${recommendations.length} purchase orders ready`}
              icon={Coins}
              variant="violet"
            />
          </>
        )}

        {activeRole === 'Guild Apprentice' && (
          <>
            <StatCard
              title="Pantry Shelf Jars"
              value={loading ? '...' : ingredients.length}
              subtitle="Physical containers monitored"
              icon={Sparkles}
              variant="brass"
            />
            <StatCard
              title="Empty / Low Tubes"
              value={loading ? '...' : criticalFlasks.length}
              subtitle="Need immediate refilling"
              icon={AlertTriangle}
              variant="magenta"
              trend="REFILL NOW"
            />
            <StatCard
              title="Daily Floor Chores"
              value={loading ? '...' : `${pendingChoresCount} Left`}
              subtitle="Pantry maintenance checklist"
              icon={CheckSquare}
              variant="amber"
            />
            <StatCard
              title="Jars Audited Today"
              value={loading ? '...' : '11 / 15'}
              subtitle="Tier 1 & Tier 2 verified"
              icon={ShieldCheck}
              variant="lime"
            />
          </>
        )}

        {activeRole === 'Potions Master' && (
          <>
            <StatCard
              title="Active LightGBM Models"
              value={loading ? '...' : ingredients.length}
              subtitle="Histogram regressors fit"
              icon={Activity}
              variant="violet"
            />
            <StatCard
              title="Model Accuracy (WAPE)"
              value="18.4%"
              subtitle="Weighted absolute percentage"
              icon={Sparkles}
              variant="lime"
            />
            <StatCard
              title="Flagged Anomalies"
              value={loading ? '...' : anomalies.length}
              subtitle="Strange happenings active"
              icon={AlertTriangle}
              variant="magenta"
              trend="UNRESOLVED"
            />
            <StatCard
              title="Lunar Synodic Phase"
              value="Day 20"
              subtitle="66% Illumination (Full Moon)"
              icon={Moon}
              variant="amber"
            />
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. ROLE-SPECIFIC WORKBENCH & ACTION PANELS                                */}
      {/* ========================================================================= */}

      {/* -------------------- MASTER ALCHEMIST VIEW -------------------- */}
      {activeRole === 'Master Alchemist' && (
        <div className="space-y-8">
          {/* Executive Grand Reorder Command Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black border border-black inline-block mb-1">
                Arch-Mage Executive Restock Charm
              </span>
              <h3 className="font-display font-black text-2xl text-amber-200">
                Replenish All Critical Reagents with 1-Click
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Execute batch purchase orders for {recommendations.slice(0, 4).length} highest-urgency reagents totaling approximately {Math.round(totalReorderCost)} Gold.
              </p>
            </div>

            <button
              onClick={handleBatchRestock}
              disabled={isBatchRestocking || recommendations.length === 0}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isBatchRestocking ? 'Brewing Batch...' : 'Cast Grand Restock Charm'}</span>
            </button>
          </div>

          {/* Lowest-Stock Potion Flash Tubes */}
          <div className="rounded-3xl luxury-glass p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-black/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-xl sm:text-2xl font-black text-black">
                    Lowest-Stock Reagent Flash Tubes
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black tracking-wider uppercase">
                    Critical
                  </span>
                </div>
                <p className="font-sans text-xs font-semibold text-neutral-600">
                  Volumetric liquid gauges with live meniscus slosh physics.
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('inventory')}
                className="font-sans text-xs font-black uppercase text-black hover:text-amber-600 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-black hover:shadow-sm transition-all"
              >
                <span>Audit All Shelves</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {criticalFlasks.map((ing) => (
                <div
                  key={ing.id}
                  className="flex flex-col items-center justify-between p-4 rounded-3xl bg-gradient-to-b from-amber-50/90 via-white to-orange-50/70 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all group"
                >
                  <div className="text-center mb-2 w-full">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-200 text-black border border-black uppercase tracking-wider mb-1">
                      {ing.category}
                    </span>
                    <h4 className="font-display font-black text-xs text-black truncate w-full" title={ing.name}>
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
                    className="mt-3 w-full py-1.5 px-2.5 rounded-full bg-amber-300 hover:bg-amber-200 text-black border border-black text-[11px] font-black uppercase tracking-wider shadow-sm transition-all"
                  >
                    Manage Stock
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- GUILD APPRENTICE VIEW -------------------- */}
      {activeRole === 'Guild Apprentice' && (
        <div className="space-y-8">
          {/* Apprentice Daily Chore Checklist */}
          <div className="p-6 rounded-3xl bg-[#FFFDF7] border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-1 bg-amber-100 rounded-xl border border-black">📋</span>
                <div>
                  <h3 className="font-display font-black text-xl text-black">
                    Apprentice Daily Floor Checklist
                  </h3>
                  <p className="text-xs text-neutral-600 font-semibold">
                    Complete physical checks, wipe jars, and restock depleted flasks.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-300 text-black border border-black">
                {4 - pendingChoresCount} / 4 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div
                onClick={() => toggleChore('chore_weigh_dragon')}
                className={`p-4 rounded-2xl border-2 border-black cursor-pointer transition-all flex items-start gap-3 ${
                  completedChores['chore_weigh_dragon']
                    ? 'bg-emerald-100/70 border-emerald-600 shadow-sm'
                    : 'bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-amber-50'
                }`}
              >
                {completedChores['chore_weigh_dragon'] ? (
                  <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-black ${completedChores['chore_weigh_dragon'] ? 'line-through text-neutral-600' : 'text-black'}`}>
                    Audit Dragon Scale Jars (Tier 2 Mineral Shelf)
                  </h4>
                  <p className="text-xs text-neutral-600 font-medium mt-0.5">
                    Weigh raw scales and inspect jar seals for fire spillage.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleChore('chore_mandrake_ward')}
                className={`p-4 rounded-2xl border-2 border-black cursor-pointer transition-all flex items-start gap-3 ${
                  completedChores['chore_mandrake_ward']
                    ? 'bg-emerald-100/70 border-emerald-600 shadow-sm'
                    : 'bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-amber-50'
                }`}
              >
                {completedChores['chore_mandrake_ward'] ? (
                  <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-black ${completedChores['chore_mandrake_ward'] ? 'line-through text-neutral-600' : 'text-black'}`}>
                    Sweep Mandrake Spillage in Dark Alcove
                  </h4>
                  <p className="text-xs text-neutral-600 font-medium mt-0.5">
                    Silence echoing screams and re-pack roots in damp peat moss.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleChore('chore_stock_count')}
                className={`p-4 rounded-2xl border-2 border-black cursor-pointer transition-all flex items-start gap-3 ${
                  completedChores['chore_stock_count']
                    ? 'bg-emerald-100/70 border-emerald-600 shadow-sm'
                    : 'bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-amber-50'
                }`}
              >
                {completedChores['chore_stock_count'] ? (
                  <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-black ${completedChores['chore_stock_count'] ? 'line-through text-neutral-600' : 'text-black'}`}>
                    Count Powdered Unicorn Horn Vials
                  </h4>
                  <p className="text-xs text-neutral-600 font-medium mt-0.5">
                    Ensure silver sigil seal is unbroken on top shelf vault.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleChore('chore_refill_batwings')}
                className={`p-4 rounded-2xl border-2 border-black cursor-pointer transition-all flex items-start gap-3 ${
                  completedChores['chore_refill_batwings']
                    ? 'bg-emerald-100/70 border-emerald-600 shadow-sm'
                    : 'bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-amber-50'
                }`}
              >
                {completedChores['chore_refill_batwings'] ? (
                  <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-black ${completedChores['chore_refill_batwings'] ? 'line-through text-neutral-600' : 'text-black'}`}>
                    Fetch Dried Bat Wings from Attic Racks
                  </h4>
                  <p className="text-xs text-neutral-600 font-medium mt-0.5">
                    Critical stockout forecasted; prepare 25 fresh pairs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Apprentice Interactive Flash Tube Workbench */}
          <div className="p-6 rounded-3xl bg-white border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-xl text-black">
                    Apprentice Rapid Refill Station
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-black border border-black">
                    Interactive
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-semibold">
                  Tap the "+10 Refill" button on any flask to replenish shelf jars on the floor.
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('inventory')}
                className="px-4 py-2 rounded-full bg-amber-300 hover:bg-amber-400 text-black text-xs font-black uppercase border border-black shadow-sm"
              >
                + Dispense Sale
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {criticalFlasks.map((ing) => (
                <div
                  key={ing.id}
                  className="p-4 rounded-2xl bg-amber-50/70 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between gap-3 text-center"
                >
                  <div>
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-200 border border-black text-black">
                      {ing.category}
                    </span>
                    <h4 className="font-display font-black text-sm text-black mt-1">
                      {ing.name}
                    </h4>
                    <p className="font-mono text-xs font-black text-neutral-700">
                      {ing.current_stock.toFixed(1)} {ing.unit} left
                    </p>
                  </div>

                  <PotionBottleGauge
                    currentStock={ing.current_stock}
                    maxCapacity={ing.reorder_point * 2.5}
                    unit={ing.unit}
                    minimumThreshold={ing.minimum_threshold}
                    reorderPoint={ing.reorder_point}
                    size="sm"
                  />

                  <button
                    onClick={() => handleApprenticeQuickRefill(ing, 10)}
                    className="w-full py-1.5 px-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+10 Refill</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- POTIONS MASTER / SEER VIEW -------------------- */}
      {activeRole === 'Potions Master' && (
        <div className="space-y-8">
          {/* Seer's Machine Learning Telemetry Matrix */}
          <div className="p-6 rounded-3xl bg-[#13111C] text-white border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-purple-950 rounded-2xl border border-purple-400">🔮</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-violet-500 text-white">
                      LightGBM v1.0 Hist Regressor
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">● Active 15 Models</span>
                  </div>
                  <h3 className="font-display font-black text-xl text-amber-200 mt-0.5">
                    The Celestial Prophecy Engine & Anomaly Sentinels
                  </h3>
                </div>
              </div>

              <button
                onClick={handleTriggerAnomalyScan}
                disabled={isScanningAnomalies}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-black text-xs uppercase tracking-wider border border-purple-300 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanningAnomalies ? 'animate-spin' : ''}`} />
                <span>{isScanningAnomalies ? 'Scanning Stars...' : 'Scan Anomaly Radar'}</span>
              </button>
            </div>

            {/* Model Diagnostics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/30">
                <span className="text-[10px] font-mono uppercase text-slate-400">Lag Window</span>
                <p className="font-mono text-base font-black text-amber-300 mt-0.5">7 & 14 Days</p>
                <span className="text-[10px] text-slate-400">Autoregressive features</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/30">
                <span className="text-[10px] font-mono uppercase text-slate-400">Rolling Features</span>
                <p className="font-mono text-base font-black text-emerald-300 mt-0.5">7-Day Mean & Std</p>
                <span className="text-[10px] text-slate-400">Volatility index</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/30">
                <span className="text-[10px] font-mono uppercase text-slate-400">Astrological Factors</span>
                <p className="font-mono text-base font-black text-pink-300 mt-0.5">3.0x Full Moon Surge</p>
                <span className="text-[10px] text-slate-400">Active multiplier</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/30">
                <span className="text-[10px] font-mono uppercase text-slate-400">Safety Buffer</span>
                <p className="font-mono text-base font-black text-cyan-300 mt-0.5">Z=1.65 (95% SL)</p>
                <span className="text-[10px] text-slate-400">Zero stockout policy</span>
              </div>
            </div>
          </div>

          {/* Active Strange Happenings Sentinel Radar */}
          <div className="p-6 rounded-3xl bg-[#FFFDF7] border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl p-1 bg-rose-100 rounded-xl border border-black">⚠️</span>
                <div>
                  <h3 className="font-display font-black text-xl text-black">
                    Live Anomaly Sentinel Feed
                  </h3>
                  <p className="text-xs text-neutral-600 font-semibold">
                    Statistical spikes and unaccounted nocturnal consumption detected by the sentinel.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-400 text-black border border-black">
                {anomalies.length} Unresolved
              </span>
            </div>

            {anomalies.length === 0 ? (
              <div className="p-8 text-center bg-amber-50/60 rounded-2xl border-2 border-dashed border-amber-300 text-neutral-700 text-xs font-bold">
                ✨ No strange happenings detected. The pantry wards hold strong!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className="p-4 rounded-2xl bg-rose-50 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-rose-500 text-white">
                          {anom.anomaly_type}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-neutral-600">
                          Anomaly Score: +{anom.anomaly_score.toFixed(2)}
                        </span>
                      </div>
                      <h4 className="font-display font-black text-sm text-black">
                        {anom.ingredient_name || anom.ingredient_id}
                      </h4>
                      <p className="text-xs text-neutral-700 mt-1 leading-snug">
                        Window: {new Date(anom.window_start).toLocaleDateString()} to {new Date(anom.window_end).toLocaleDateString()}
                      </p>
                      <div className="mt-2 text-[11px] font-mono font-bold text-neutral-800">
                        Observed: <span className="text-rose-600">{anom.actual_consumption}</span> vs Expected: {anom.expected_consumption}
                      </div>
                    </div>

                    <button
                      onClick={() => handleResolveAnomaly(anom.id)}
                      className="w-full py-2 px-3 rounded-full bg-rose-400 hover:bg-rose-300 text-black font-black text-xs uppercase tracking-wider border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Cast Ward & Dismiss</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. COMMON ASYMMETRIC BENTO: RUNOUT PROPHECIES & RESTOCK CHARMS           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): The Prophecy Engine */}
        <div className="lg:col-span-7 rounded-3xl luxury-glass p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative overflow-hidden bg-white">
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-black/10">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-black flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>The Prophecy Engine</span>
                </h3>
                <p className="font-sans text-xs font-semibold text-neutral-600 mt-1">
                  ML-projected inventory depletion trajectories and stockout timelines.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('crystal-ball')}
                className="font-sans text-xs font-black uppercase text-black hover:text-amber-700 flex items-center gap-1 hover:underline tracking-wider"
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
                    <tr className="border-b-2 border-black/15 text-black font-black uppercase tracking-wider text-[11px] bg-amber-100 rounded-xl">
                      <th className="py-3 px-3">Reagent</th>
                      <th className="py-3 px-3 text-right">Stock</th>
                      <th className="py-3 px-3 text-right">Burn Rate</th>
                      <th className="py-3 px-3 text-right">Prophesied Runout</th>
                      <th className="py-3 px-3 text-center">Urgency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {prophecies.slice(0, 6).map((p) => {
                      const urgencyBadge = {
                        CRITICAL: 'bg-rose-500 text-white',
                        WARNING: 'bg-amber-400 text-black',
                        HEALTHY: 'bg-emerald-400 text-black',
                      }[p.urgency] || 'bg-amber-100 text-black';

                      return (
                        <tr
                          key={p.ingredient_id}
                          className="hover:bg-amber-50/70 transition-colors group"
                        >
                          <td className="py-3.5 px-3 font-black text-black text-sm">
                            {p.name}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-800">
                            {p.current_stock.toFixed(1)} {p.unit}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-purple-900">
                            ~{p.depletion_rate_per_day.toFixed(1)}/d
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-black text-black">
                            {p.is_stocked_out ? (
                              <span className="text-rose-600 font-extrabold uppercase tracking-wide">EXHAUSTED</span>
                            ) : (
                              `${p.days_until_stockout.toFixed(1)} days`
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-black shadow-sm inline-block ${urgencyBadge}`}
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

          <div className="mt-6 pt-4 border-t-2 border-black/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold text-neutral-600">
            <span>
              Powered by Histogram Gradient Boosting Regressor (18.4% WAPE).
            </span>
            <span className="inline-flex items-center gap-1 font-sans text-emerald-800 font-black">
              <ShieldCheck className="w-4 h-4 fill-current text-emerald-600" />
              <span>95% Service Level Buffer</span>
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Top Restock Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl luxury-glass p-6 border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden bg-gradient-to-br from-[#FAF5FF] via-white to-[#F5F3FF]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-purple-200">
              <h3 className="font-display text-xl font-black text-purple-950 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                <span>The Restock Spell</span>
              </h3>
              <span className="font-mono text-xs font-black px-3 py-0.5 rounded-full bg-emerald-400 text-black border border-black shadow-sm">
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
                    whileHover={{ x: 3 }}
                    className="p-4 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-start justify-between gap-3 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans font-black text-sm text-purple-950">
                          {rec.ingredient_name}
                        </h4>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-400 text-black border border-black">
                          +{rec.recommended_quantity} {rec.unit}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] font-medium text-neutral-700 mt-1 leading-snug line-clamp-2">
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
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>{castingRestockId === rec.ingredient_id ? 'Brewing...' : 'Restock'}</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
