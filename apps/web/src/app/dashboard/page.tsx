'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  Plus,
  RefreshCw,
  Flame,
  ShieldCheck,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, activeTenant, accessToken } = useAuth();
  const { lastEvent } = useSocket();

  const [metrics, setMetrics] = useState<{
    totalIngredients: number;
    lowStockItems: number;
    past30DaysOrders: number;
    past30DaysRevenue: number;
  }>({
    totalIngredients: 0,
    lowStockItems: 0,
    past30DaysOrders: 0,
    past30DaysRevenue: 0,
  });

  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!activeTenant?.id || !accessToken) return;
    setLoading(true);
    try {
      const [overviewRes, movementsRes] = await Promise.all([
        apiClient<any>('/analytics/overview', {
          token: accessToken,
          tenantId: activeTenant.id,
        }),
        apiClient<any>('/inventory/movements', {
          token: accessToken,
          tenantId: activeTenant.id,
          params: { limit: 6 },
        }),
      ]);

      if (overviewRes.data) {
        setMetrics(overviewRes.data);
      }
      if (movementsRes.data) {
        setRecentMovements(movementsRes.data);
      }
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTenant?.id, accessToken]);

  // Real-time refresh when a socket event arrives
  useEffect(() => {
    if (lastEvent) {
      fetchDashboardData();
    }
  }, [lastEvent]);

  return (
    <AppShell>
      <div className="space-y-6 selection:bg-hackOrange selection:text-white">
        {/* Executive Welcome & Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b-2 border-sandDark">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">👋</span>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight font-mono">
                Welcome back, {user?.displayName || 'Madam Hexley'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-medium text-ink/75">
              Overview for <strong className="text-ink font-bold">{activeTenant?.name || "Madam Hexley's Apothecary"}</strong> • Real-time inventory intelligence & ledger telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
              className="text-xs flex items-center gap-1.5 font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </Button>

            <Button href="/sales/new" size="sm" variant="orange" className="text-xs flex items-center gap-1.5 font-mono font-black">
              <Plus className="w-4 h-4" />
              <span>Record Sale</span>
            </Button>

            <Button href="/inventory/adjust" size="sm" variant="mint" className="text-xs flex items-center gap-1.5 font-mono font-black">
              <span>Receive Stock</span>
            </Button>
          </div>
        </div>

        {/* 4 Unified KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Catalog Size */}
          <div className="rounded-2xl border-2 border-ink bg-white p-5 shadow-retro-sm hover:shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-ink/70 uppercase tracking-wider">
                Audited Ingredients
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border-2 border-ink text-[#05BF8E] flex items-center justify-center shadow-retro-xs">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-ink tracking-tight">
                {metrics.totalIngredients}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10 text-xs">
                <span className="text-ink/70 font-medium">Catalog items</span>
                <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-[#05BF8E]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Tracked
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Stockout Risk */}
          <div className="rounded-2xl border-2 border-ink bg-white p-5 shadow-retro-sm hover:shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-ink/70 uppercase tracking-wider">
                Stockout Watch
              </span>
              <div className={`w-9 h-9 rounded-xl border-2 border-ink flex items-center justify-center shadow-retro-xs ${
                metrics.lowStockItems > 0 ? 'bg-rose-50 text-hackRed' : 'bg-emerald-50 text-[#05BF8E]'
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-3xl font-black font-mono tracking-tight ${
                metrics.lowStockItems > 0 ? 'text-hackRed' : 'text-ink'
              }`}>
                {metrics.lowStockItems}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10 text-xs">
                <span className="text-ink/70 font-medium">Critical items</span>
                <span className={`font-mono font-bold text-xs ${
                  metrics.lowStockItems > 0 ? 'text-hackRed' : 'text-[#05BF8E]'
                }`}>
                  {metrics.lowStockItems > 0 ? 'Action Needed' : '● Safe Buffers'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: 30-Day Orders */}
          <div className="rounded-2xl border-2 border-ink bg-white p-5 shadow-retro-sm hover:shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-ink/70 uppercase tracking-wider">
                30-Day Orders
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 border-2 border-ink text-hackPurple flex items-center justify-center shadow-retro-xs">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-ink tracking-tight">
                {metrics.past30DaysOrders}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10 text-xs">
                <span className="text-ink/70 font-medium">Completed orders</span>
                <span className="font-mono font-bold text-xs text-hackPurple">
                  ACID Sealed
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: 30-Day Sales Volume */}
          <div className="rounded-2xl border-2 border-ink bg-white p-5 shadow-retro-sm hover:shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-ink/70 uppercase tracking-wider">
                30-Day Gross Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border-2 border-ink text-hackOrange flex items-center justify-center shadow-retro-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-ink tracking-tight">
                {formatCurrency(metrics.past30DaysRevenue)}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10 text-xs">
                <span className="text-ink/70 font-medium">Gross receipts</span>
                <span className="font-mono font-bold text-xs text-hackOrange">
                  Zero Defect
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 / 12) — Operational Highlights & Ledger */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Festival Banner (Midnight Curse) */}
            <div className="rounded-2xl border-2 border-ink bg-[#FFF4ED] p-5 shadow-retro-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FF5C00] border-2 border-ink flex items-center justify-center text-white shrink-0 shadow-retro-xs text-xl">
                  <Flame className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-ink font-mono">
                      The Midnight Curse Event
                    </h3>
                    <Badge variant="orange">3.0× MULTIPLIER</Badge>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#06D6A0] text-ink border border-ink shadow-retro-xs">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-ink/80 font-medium mt-1 leading-relaxed">
                    Surge active for <strong className="text-ink">Bat Wings</strong>, <strong className="text-ink">Mandrake Root</strong>, and <strong className="text-ink">Ghost Pepper</strong> with baseline demand multiplied by 3.0× during festival dates.
                  </p>
                </div>
              </div>

              <Button href="/events" variant="orange" size="sm" className="shrink-0 text-xs font-mono font-bold">
                <span>Inspect Impact</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {/* Recent Stock Movements Table */}
            <div className="rounded-2xl border-2 border-ink bg-white shadow-retro-sm overflow-hidden">
              <div className="p-5 border-b-2 border-ink flex items-center justify-between gap-3 bg-[#FAF5EE]">
                <div>
                  <h2 className="text-base font-black font-mono text-ink flex items-center gap-2">
                    <span>📜</span> Recent Stock Ledger Movements
                  </h2>
                  <p className="text-xs text-ink/70 font-medium mt-0.5">
                    Immutable chronological record of receipts, counter deductions, and adjustments.
                  </p>
                </div>

                <Button href="/inventory/movements" variant="outline" size="sm" className="text-xs font-mono shrink-0">
                  <span>Full Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              <div className="p-0">
                {recentMovements.length === 0 ? (
                  <div className="text-center py-12 text-mutedText text-xs font-medium space-y-3">
                    <div className="text-3xl">🧪</div>
                    <p className="font-bold text-ink">No stock movements recorded yet.</p>
                    <p className="text-xs text-ink/60 max-w-sm mx-auto">
                      Receive initial ingredient stock or launch the point of sale register to start logging audit movements.
                    </p>
                    <div className="pt-2 flex justify-center gap-3">
                      <Button href="/inventory/adjust" variant="mint" size="sm">
                        + Receive Initial Stock
                      </Button>
                      <Button href="/sales/new" variant="orange" size="sm">
                        Open POS Register
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b-2 border-ink bg-sand/60 text-ink uppercase text-[10px] font-mono font-black tracking-wider">
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Ingredient</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Delta</th>
                          <th className="py-3 px-4">Balance</th>
                          <th className="py-3 px-4">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-sandDark font-medium">
                        {recentMovements.map((m) => (
                          <tr key={m.id} className="hover:bg-sand/40 transition-colors">
                            <td suppressHydrationWarning className="py-3 px-4 font-mono font-bold text-mutedText text-[11px]">
                              {formatDateTime(m.occurredAt || m.createdAt)}
                            </td>
                            <td className="py-3 px-4 font-black text-ink font-mono text-xs">
                              <Link href={`/inventory/${m.ingredientId}`} className="hover:text-hackOrange transition-colors flex items-center gap-1.5">
                                <span>🧪</span>
                                <span>{m.ingredientName || 'Ingredient'}</span>
                              </Link>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  m.type === 'RECEIPT' || m.type === 'INITIAL'
                                    ? 'success'
                                    : m.type === 'SALE'
                                    ? 'orange'
                                    : 'purple'
                                }
                              >
                                {m.type}
                              </Badge>
                            </td>
                            <td
                              className={`py-3 px-4 font-black font-mono text-xs ${
                                m.quantityDelta > 0 ? 'text-[#05BF8E]' : 'text-[#D02936]'
                              }`}
                            >
                              {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta} {m.unit}
                            </td>
                            <td className="py-3 px-4 font-bold text-ink font-mono text-xs">
                              {m.balanceAfter} {m.unit}
                            </td>
                            <td className="py-3 px-4 font-mono text-mutedText text-xs">
                              {m.locationCode || 'Main Shelf'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (4 / 12) — Structured Shortcuts & System Status */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Panel */}
            <div className="rounded-2xl border-2 border-ink bg-white p-5 shadow-retro-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-ink/10">
                <span className="text-xs font-mono font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-hackOrange" />
                  Quick Actions
                </span>
                <span className="text-[10px] font-mono text-mutedText font-bold">SHORTCUTS</span>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1 font-mono text-xs">
                <Link
                  href="/sales/new"
                  className="p-3 rounded-xl border-2 border-ink bg-amber-50/60 hover:bg-amber-100 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-between group shadow-retro-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-hackAmber border border-ink flex items-center justify-center text-ink text-sm font-bold">
                      🛒
                    </span>
                    <div>
                      <span className="font-black text-ink block group-hover:text-hackOrange transition-colors">
                        POS Register
                      </span>
                      <span className="text-[10px] text-ink/60 font-sans block">Instant customer checkout</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink/40 group-hover:text-hackOrange group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/forecasting"
                  className="p-3 rounded-xl border-2 border-ink bg-purple-50/60 hover:bg-purple-100 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-between group shadow-retro-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-hackPurple border border-ink flex items-center justify-center text-white text-sm font-bold">
                      📈
                    </span>
                    <div>
                      <span className="font-black text-ink block group-hover:text-hackPurple transition-colors">
                        Demand Forecasting
                      </span>
                      <span className="text-[10px] text-ink/60 font-sans block">7, 14 & 30-day horizons</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink/40 group-hover:text-hackPurple group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/restock"
                  className="p-3 rounded-xl border-2 border-ink bg-emerald-50/60 hover:bg-emerald-100 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-between group shadow-retro-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#06D6A0] border border-ink flex items-center justify-center text-ink text-sm font-bold">
                      📦
                    </span>
                    <div>
                      <span className="font-black text-ink block group-hover:text-emerald-700 transition-colors">
                        Restock Planner
                      </span>
                      <span className="text-[10px] text-ink/60 font-sans block">Lead-time recommendations</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink/40 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/anomalies"
                  className="p-3 rounded-xl border-2 border-ink bg-rose-50/60 hover:bg-rose-100 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-between group shadow-retro-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-rose-200 border border-ink flex items-center justify-center text-hackRed text-sm font-bold">
                      🛡️
                    </span>
                    <div>
                      <span className="font-black text-ink block group-hover:text-hackRed transition-colors">
                        Anomaly Radar
                      </span>
                      <span className="text-[10px] text-ink/60 font-sans block">Spike & shrinkage alerts</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink/40 group-hover:text-hackRed group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>

            {/* Storage Shelves & System Health Card */}
            <div className="rounded-2xl border-2 border-ink bg-sand/60 p-5 shadow-retro-sm space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b-2 border-ink/10">
                <span className="font-black text-ink flex items-center gap-1.5 uppercase">
                  <Layers className="w-3.5 h-3.5 text-hackOrange" />
                  Storage Topology
                </span>
                <Link href="/inventory/locations" className="text-[11px] font-bold text-hackOrange hover:underline">
                  Manage →
                </Link>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white border-2 border-ink shadow-retro-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ink block text-xs">Main Shelf A</span>
                    <span className="text-[10px] text-ink/60 font-sans">Primary ingredient vault</span>
                  </div>
                  <span className="sticker-tag bg-sand text-ink text-[9px]">DEFAULT</span>
                </div>

                <div className="p-3 rounded-xl bg-white border-2 border-ink shadow-retro-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ink block text-xs">Cold Cauldron Storage</span>
                    <span className="text-[10px] text-ink/60 font-sans">Perishable ingredients</span>
                  </div>
                  <span className="sticker-tag bg-emerald-100 text-[#05BF8E] border-ink text-[9px]">ACTIVE</span>
                </div>
              </div>

              {/* Security & Isolation Pill */}
              <div className="pt-2 border-t-2 border-ink/10 flex items-center justify-between text-[11px] font-bold text-ink/70">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#05BF8E]" />
                  <span>Tenant Isolation</span>
                </span>
                <span className="text-[#05BF8E] font-black">ENCRYPTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
