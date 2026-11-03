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
  Zap,
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
      <div className="space-y-8 selection:bg-hackOrange selection:text-white">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FFF0EB] border-2 border-ink text-xs font-mono font-black text-ink shadow-retro-xs mb-2">
              <Zap className="w-3.5 h-3.5 text-[#FF5C00] fill-[#FF5C00]" />
              <span>LIVE TELEMETRY // SHOP: {activeTenant?.slug?.toUpperCase() || 'CORE'}</span>
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight font-mono flex items-center gap-2">
              APOTHECARY COMMAND CENTER ⚡
            </h1>
            <p className="text-xs font-semibold text-mutedText mt-1">
              Active ledger diagnostics, demand forecasting, and operational status for{' '}
              <span className="text-ink font-black bg-sand px-1.5 py-0.5 rounded border border-ink">
                {activeTenant?.name}
              </span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
              className="text-xs flex items-center gap-1.5 font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>SYNC</span>
            </Button>

            <Button href="/sales/new" size="sm" variant="orange" className="text-xs flex items-center gap-1.5 font-mono">
              <Plus className="w-4 h-4" />
              <span>POINT OF SALE</span>
            </Button>
          </div>
        </div>

        {/* Midnight Curse Operational Banner — Hacktoberfest Event Pass */}
        <div className="rounded-2xl border-2 border-ink bg-[#FFF0EB] p-6 shadow-retro-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 z-10 relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF5C00] border-2 border-ink flex items-center justify-center text-white shrink-0 shadow-retro-xs text-2xl">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-ink font-mono">
                    THE MIDNIGHT CURSE // OFFICIAL SCENARIO
                  </h3>
                  <Badge variant="orange">3.0X MULTIPLIER</Badge>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#06D6A0] text-ink border border-ink shadow-[1px_1px_0px_#1A1523]">
                    ACTIVE FESTIVAL
                  </span>
                </div>
                <p className="text-xs text-ink/80 font-semibold mt-1.5 max-w-2xl leading-relaxed">
                  Official full-moon surge scenario active: Bat Wings, Mandrake Root, and Ghost Pepper
                  demand is multiplied by 3.0 during event horizon dates.
                </p>
              </div>
            </div>

            <Button href="/events" variant="orange" size="md" className="shrink-0 text-xs font-mono">
              <span>INSPECT EVENT IMPACT</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* KPI Stat Cards Grid — 4 Hacktoberfest-Inspired Light Color Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Ingredients (Mint Light) */}
          <div className="rounded-2xl border-2 border-ink bg-[#E8FAF5] p-5 shadow-retro transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-retro-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-ink uppercase tracking-wider flex items-center gap-1.5">
                <span>🧪</span> TOTAL ITEMS
              </span>
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-ink text-ink flex items-center justify-center shadow-retro-xs">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-ink">{metrics.totalIngredients}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10">
                <span className="text-[11px] font-bold text-ink/70">In Grimoire</span>
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-white text-ink border border-ink">
                  100% AUDITED
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Low Stock Risk (Flame Red Light) */}
          <div className="rounded-2xl border-2 border-ink bg-[#FDECEE] p-5 shadow-retro transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-retro-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-hackRed uppercase tracking-wider flex items-center gap-1.5">
                <span>⚠️</span> STOCKOUT RISK
              </span>
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-ink text-hackRed flex items-center justify-center shadow-retro-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-hackRed">{metrics.lowStockItems}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10">
                <span className="text-[11px] font-bold text-ink/70">Below Reorder</span>
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-white text-hackRed border border-ink">
                  CRITICAL
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: 30-Day Orders (Potion Purple Light) */}
          <div className="rounded-2xl border-2 border-ink bg-[#F3EDFF] p-5 shadow-retro transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-retro-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-hackPurple uppercase tracking-wider flex items-center gap-1.5">
                <span>🛒</span> 30-DAY ORDERS
              </span>
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-ink text-hackPurple flex items-center justify-center shadow-retro-xs">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-ink">{metrics.past30DaysOrders}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10">
                <span className="text-[11px] font-bold text-ink/70">Completed Sales</span>
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-white text-hackPurple border border-ink">
                  ACID SEALED
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: 30-Day Volume (Goldenrod Light) */}
          <div className="rounded-2xl border-2 border-ink bg-[#FFF9E6] p-5 shadow-retro transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-retro-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-ink uppercase tracking-wider flex items-center gap-1.5">
                <span>💰</span> 30-DAY REVENUE
              </span>
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-ink text-ink flex items-center justify-center shadow-retro-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-ink">
                {formatCurrency(metrics.past30DaysRevenue)}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10">
                <span className="text-[11px] font-bold text-ink/70">Gross Receipts</span>
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-white text-ink border border-ink">
                  ZERO DEFECT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Hub Navigation Cards — Hard Offset Paper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/forecasting" className="block group">
            <div className="rounded-2xl border-2 border-ink bg-white p-5 shadow-retro group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-retro-lg transition-all h-full">
              <div className="flex items-center gap-3.5 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] border-2 border-ink text-hackPurple flex items-center justify-center text-lg shadow-retro-xs font-black">
                  📈
                </div>
                <h4 className="text-base font-black text-ink group-hover:text-hackOrange transition-colors font-mono">
                  DEMAND FORECASTING
                </h4>
              </div>
              <p className="text-xs text-mutedText font-semibold leading-relaxed">
                Probabilistic time-series predictions, stockout crossing dates, and lead-time coverage horizons.
              </p>
            </div>
          </Link>

          <Link href="/restock" className="block group">
            <div className="rounded-2xl border-2 border-ink bg-white p-5 shadow-retro group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-retro-lg transition-all h-full">
              <div className="flex items-center gap-3.5 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] border-2 border-ink text-ink flex items-center justify-center text-lg shadow-retro-xs font-black">
                  📦
                </div>
                <h4 className="text-base font-black text-ink group-hover:text-hackOrange transition-colors font-mono">
                  RESTOCK ENGINE
                </h4>
              </div>
              <p className="text-xs text-mutedText font-semibold leading-relaxed">
                Deterministic reorder recommendations accounting for supplier lead time, safety stock, and pack sizes.
              </p>
            </div>
          </Link>

          <Link href="/anomalies" className="block group">
            <div className="rounded-2xl border-2 border-ink bg-white p-5 shadow-retro group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-retro-lg transition-all h-full">
              <div className="flex items-center gap-3.5 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FDECEE] border-2 border-ink text-hackRed flex items-center justify-center text-lg shadow-retro-xs font-black">
                  🛡️
                </div>
                <h4 className="text-base font-black text-ink group-hover:text-hackOrange transition-colors font-mono">
                  ANOMALY CENTER
                </h4>
              </div>
              <p className="text-xs text-mutedText font-semibold leading-relaxed">
                Real-time consumption spike flags (&gt;3.5σ), shrinkage alerts, and ledger discrepancy investigation.
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Stock Movements Table — Clean Light Grid */}
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b-2 border-sandDark">
            <div>
              <CardTitle className="text-lg font-black font-mono flex items-center gap-2">
                <span>📜</span> RECENT STOCK LEDGER MOVEMENTS
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-mutedText">
                Immutable double-entry chronological record of all receipts, sales deductions, and adjustments
              </CardDescription>
            </div>

            <Button href="/inventory/movements" variant="secondary" size="sm" className="text-xs font-mono">
              <span>VIEW FULL LEDGER</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {recentMovements.length === 0 ? (
              <div className="text-center py-10 text-mutedText text-xs font-bold space-y-3">
                <div className="text-3xl">🧪</div>
                <p>No stock movements recorded yet.</p>
                <Button href="/inventory/adjust" variant="success" size="sm">
                  + Receive Initial Stock
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b-2 border-ink bg-sand text-ink uppercase text-[10px] font-mono font-black tracking-wider">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Ingredient</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Quantity Delta</th>
                      <th className="py-3 px-3">Balance After</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-b-2 border-ink divide-sandDark font-medium">
                    {recentMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-sand/60 transition-colors">
                        <td suppressHydrationWarning className="py-3 px-3 font-mono font-bold text-mutedText">
                          {formatDateTime(m.occurredAt || m.createdAt)}
                        </td>
                        <td className="py-3 px-3 font-black text-ink font-mono text-sm">
                          <Link href={`/inventory/${m.ingredientId}`} className="hover:text-hackOrange transition-colors flex items-center gap-1.5">
                            <span>🧪</span>
                            <span>{m.ingredientName || 'Ingredient'}</span>
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
                          className={`py-3 px-3 font-black font-mono text-sm ${
                            m.quantityDelta > 0 ? 'text-[#05BF8E]' : 'text-[#D02936]'
                          }`}
                        >
                          {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta} {m.unit}
                        </td>
                        <td className="py-3 px-3 font-bold text-ink font-mono text-sm">
                          {m.balanceAfter} {m.unit}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-mutedText">
                          {m.locationCode || 'Main Shelf'}
                        </td>
                        <td className="py-3 px-3 text-ink/80 text-xs font-semibold">
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
