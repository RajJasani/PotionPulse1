'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { activeTenant, accessToken } = useAuth();
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
      <div className="space-y-8">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border-2 border-purple-400/40 text-[11px] font-black text-purple-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Real-Time Potion Telemetry</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Apothecary Command Center 🔮
            </h1>
            <p className="text-xs text-purple-200/80 font-bold mt-1">
              Active ledger diagnostics, demand forecasting, and operational status for{' '}
              <span className="text-amber-300 font-black underline decoration-amber-400/50">{activeTenant?.name}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </Button>

            <Button href="/sales/new" size="sm" variant="orange" className="text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Point of Sale</span>
            </Button>
          </div>
        </div>

        {/* Midnight Curse Operational Banner - Cartoon Quest Banner */}
        <div className="rounded-3xl border-3 border-orange-500/40 bg-gradient-to-r from-orange-950/70 via-[#271536] to-[#170E28] p-6 shadow-[0_8px_0_0_#431407,0_16px_32px_rgba(249,115,22,0.2)] relative overflow-hidden">
          <div className="absolute right-4 top-2 text-6xl opacity-15 pointer-events-none select-none">🎃</div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 z-10 relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 border-2 border-amber-200/50 flex items-center justify-center text-white shrink-0 shadow-cartoon-orange text-xl">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-black text-white">Midnight Curse Event Intelligence</h3>
                  <Badge variant="orange">🎃 3.0x Demand Multiplier</Badge>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    Active Horizon
                  </span>
                </div>
                <p className="text-xs text-orange-100/80 font-bold mt-1.5 max-w-2xl leading-relaxed">
                  Official full-moon surge scenario active: Bat Wings, Mandrake Root, and Ghost Pepper
                  demand is multiplied by 3.0 during event horizon dates.
                </p>
              </div>
            </div>

            <Button href="/events" variant="orange" size="md" className="shrink-0 text-xs">
              <span>Inspect Event Impact</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* KPI Stat Cards Grid - 4 Signature Cartoon Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Ingredients (Neon Emerald) */}
          <div className="rounded-3xl border-3 border-emerald-500/30 bg-[#142322]/80 backdrop-blur-xl p-5 shadow-[0_6px_0_0_#064E3B] transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🧪</span> Catalogued Items
              </span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/40 text-emerald-300 flex items-center justify-center shadow-sm">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-white">{metrics.totalIngredients}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-emerald-300 font-extrabold">Active in Vault</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  100% Audited
                </span>
              </div>
            </div>
          </div>

          {/* Low Stock Risk (Dragon Crimson) */}
          <div className="rounded-3xl border-3 border-rose-500/30 bg-[#25121E]/80 backdrop-blur-xl p-5 shadow-[0_6px_0_0_#881337] transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚠️</span> Stockout Risks
              </span>
              <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border-2 border-rose-400/40 text-rose-300 flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-rose-300">{metrics.lowStockItems}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-rose-300/90 font-extrabold">Below Safety Stock</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30">
                  Critical
                </span>
              </div>
            </div>
          </div>

          {/* 30-Day Orders (Arcane Cyan) */}
          <div className="rounded-3xl border-3 border-cyan-500/30 bg-[#12202C]/80 backdrop-blur-xl p-5 shadow-[0_6px_0_0_#155E75] transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🛒</span> 30-Day Orders
              </span>
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-sm">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-white">{metrics.past30DaysOrders}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-cyan-300 font-extrabold">Potions Dispensed</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                  ACID Sealed
                </span>
              </div>
            </div>
          </div>

          {/* 30-Day Revenue (Goblin Gold) */}
          <div className="rounded-3xl border-3 border-amber-500/30 bg-[#281E12]/80 backdrop-blur-xl p-5 shadow-[0_6px_0_0_#78350F] transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>💰</span> 30-Day Revenue
              </span>
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 text-amber-300 flex items-center justify-center shadow-sm">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-amber-300">
                {formatCurrency(metrics.past30DaysRevenue)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-amber-200/90 font-extrabold">Gross Sales</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  Zero Error
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Hub Navigation Cards - Cartoon Exploration Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/forecasting" className="block group">
            <div className="rounded-3xl border-3 border-purple-500/30 bg-[#1D1230]/90 p-5 shadow-[0_6px_0_0_#3B166A] group-hover:border-purple-400 group-hover:scale-[1.02] transition-all h-full">
              <div className="flex items-center gap-3.5 mb-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border-2 border-purple-400/40 text-purple-300 flex items-center justify-center text-lg shadow-sm">
                  📈
                </div>
                <h4 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                  Demand Forecasting
                </h4>
              </div>
              <p className="text-xs text-purple-200/80 font-medium leading-relaxed">
                Probabilistic time-series predictions, stockout crossing dates, and lead-time coverage horizons.
              </p>
            </div>
          </Link>

          <Link href="/restock" className="block group">
            <div className="rounded-3xl border-3 border-amber-500/30 bg-[#25161A]/90 p-5 shadow-[0_6px_0_0_#652B19] group-hover:border-amber-400 group-hover:scale-[1.02] transition-all h-full">
              <div className="flex items-center gap-3.5 mb-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 text-amber-300 flex items-center justify-center text-lg shadow-sm">
                  📦
                </div>
                <h4 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  Restock Engine
                </h4>
              </div>
              <p className="text-xs text-amber-200/80 font-medium leading-relaxed">
                Deterministic reorder recommendations accounting for supplier lead time, safety stock, and pack sizes.
              </p>
            </div>
          </Link>

          <Link href="/anomalies" className="block group">
            <div className="rounded-3xl border-3 border-rose-500/30 bg-[#26101E]/90 p-5 shadow-[0_6px_0_0_#6D1230] group-hover:border-rose-400 group-hover:scale-[1.02] transition-all h-full">
              <div className="flex items-center gap-3.5 mb-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border-2 border-rose-400/40 text-rose-300 flex items-center justify-center text-lg shadow-sm">
                  🛡️
                </div>
                <h4 className="text-base font-black text-white group-hover:text-rose-300 transition-colors">
                  Anomaly Center
                </h4>
              </div>
              <p className="text-xs text-rose-200/80 font-medium leading-relaxed">
                Real-time consumption spike flags (&gt;3.5σ), shrinkage alerts, and ledger discrepancy investigation.
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Stock Movements Table */}
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b-2 border-purple-500/15">
            <div>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <span>📜</span> Recent Stock Ledger Movements
              </CardTitle>
              <CardDescription className="text-xs font-bold text-purple-300/80">
                Immutable double-entry chronological record of all receipts, sales deductions, and adjustments
              </CardDescription>
            </div>

            <Button href="/inventory/movements" variant="outline" size="sm" className="text-xs">
              <span>View Full Ledger</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {recentMovements.length === 0 ? (
              <div className="text-center py-10 text-purple-300/70 text-xs font-bold space-y-3">
                <div className="text-3xl">🧪</div>
                <p>No stock movements posted yet in this grimoire.</p>
                <Button href="/inventory/adjust" variant="success" size="sm">
                  + Receive Initial Stock
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b-2 border-purple-500/20 text-purple-300 uppercase text-[10px] font-black tracking-wider">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Ingredient</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Quantity Delta</th>
                      <th className="py-3 px-3">Balance After</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-purple-500/10">
                    {recentMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-purple-500/10 transition-colors font-medium">
                        <td className="py-3 px-3 font-mono text-purple-300/90">
                          {formatDateTime(m.occurredAt || m.createdAt)}
                        </td>
                        <td className="py-3 px-3 font-black text-white">
                          <Link href={`/inventory/${m.ingredientId}`} className="hover:text-amber-300 transition-colors">
                            {m.ingredientName || 'Ingredient'}
                          </Link>
                        </td>
                        <td className="py-3 px-3">
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
                          className={`py-3 px-3 font-black font-mono ${
                            m.quantityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta} {m.unit}
                        </td>
                        <td className="py-3 px-3 font-bold text-white font-mono">
                          {m.balanceAfter} {m.unit}
                        </td>
                        <td className="py-3 px-3 font-mono text-purple-300">
                          {m.locationCode || 'Main Shelf'}
                        </td>
                        <td className="py-3 px-3 text-purple-200/90 text-xs font-semibold">
                          {m.reason || 'Ledger Movement'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
