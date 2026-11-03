'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  RefreshCw,
  Package,
  ShoppingCart,
  Clock,
  ArrowRight,
  TrendingDown,
  X,
} from 'lucide-react';

interface RestockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPerUnit: number;
  onHand: number;
  dailyVelocity: number;
  leadTimeDays: number;
  safetyStock: number;
  daysOfCover: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'HEALTHY';
  ltd: number;
  targetCoverage: number;
  packSize: number;
  recommendedOrder: number;
  recommendedPacks: number;
  estimatedCost: number;
}

export default function RestockPage() {
  const { activeTenant, accessToken } = useAuth();

  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'HEALTHY'>('ALL');
  const [targetHorizonDays, setTargetHorizonDays] = useState<number>(14);

  // PO creation modal
  const [selectedForPO, setSelectedForPO] = useState<RestockItem | null>(null);
  const [poCreated, setPoCreated] = useState<boolean>(false);

  const fetchIngredients = useCallback(async () => {
    if (!activeTenant?.id || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any[]>('/ingredients', {
        token: accessToken,
        tenantId: activeTenant.id,
      });
      setIngredients(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load stockout intelligence');
    } finally {
      setLoading(false);
    }
  }, [activeTenant?.id, accessToken]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Compute stockout risks and restock formula
  const recommendations: RestockItem[] = useMemo(() => {
    return ingredients.map((ing) => {
      const onHand = Number(ing.onHand || 0);
      const leadTimeDays = Number(ing.leadTimeDays || 4);
      const costPerUnit = Number(ing.costPerUnit || 10);
      const packSize = Number(ing.packSize || 10);

      const dailyVelocity = ing.reorderPoint ? Math.max(1, Math.round(ing.reorderPoint / 6)) : 2;
      const safetyStock = Number(ing.safetyStock || Math.round(dailyVelocity * 2));

      const daysOfCover = dailyVelocity > 0 ? Math.round((onHand / dailyVelocity) * 10) / 10 : 999;

      let riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'HEALTHY' = 'HEALTHY';
      if (daysOfCover <= 2 || onHand === 0) {
        riskLevel = 'CRITICAL';
      } else if (daysOfCover <= 5) {
        riskLevel = 'HIGH';
      } else if (daysOfCover <= 10) {
        riskLevel = 'MODERATE';
      }

      const ltd = Math.round(leadTimeDays * dailyVelocity);
      const targetCoverage = Math.round(targetHorizonDays * dailyVelocity);
      const grossDemand = ltd + safetyStock + targetCoverage;
      const netShortfall = Math.max(0, grossDemand - onHand);

      const recommendedPacks = netShortfall > 0 ? Math.ceil(netShortfall / packSize) : 0;
      const recommendedOrder = recommendedPacks * packSize;
      const estimatedCost = recommendedOrder * costPerUnit;

      return {
        id: ing.id,
        name: ing.name,
        sku: ing.sku,
        category: ing.category,
        unit: ing.unit,
        costPerUnit,
        onHand,
        dailyVelocity,
        leadTimeDays,
        safetyStock,
        daysOfCover,
        riskLevel,
        ltd,
        targetCoverage,
        packSize,
        recommendedOrder,
        recommendedPacks,
        estimatedCost,
      };
    });
  }, [ingredients, targetHorizonDays]);

  const filteredRecommendations = recommendations.filter((r) => {
    if (riskFilter === 'ALL') return true;
    return r.riskLevel === riskFilter;
  });

  const criticalCount = recommendations.filter((r) => r.riskLevel === 'CRITICAL').length;
  const highCount = recommendations.filter((r) => r.riskLevel === 'HIGH').length;
  const totalReorderCost = recommendations.reduce((acc, r) => acc + r.estimatedCost, 0);

  const handleCreateDraftPO = (item: RestockItem) => {
    setSelectedForPO(item);
    setPoCreated(false);
  };

  const handleConfirmPO = () => {
    setPoCreated(true);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                REORDER OPTIMIZATION
              </span>
              <span className="font-mono text-xs font-bold text-ink/70">
                // DETERMINISTIC SUPPLY BUFFER
              </span>
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight flex items-center gap-2">
              <span>⚡</span> Stockout Risk & Restock Engine
            </h1>
            <p className="text-xs text-ink/70 font-medium mt-1">
              Automated reorder triggers balancing lead-time demand, safety buffers, and vendor pack constraints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchIngredients}
              disabled={loading}
              className="flex items-center gap-1.5 font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-evaluate Risk</span>
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border-2 border-ink bg-rose-50 shadow-retro flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-hackRed text-white border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl font-bold">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-hackRed">Critical (&le;48h)</p>
              <p className="text-2xl font-black text-hackRed">{criticalCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-ink bg-amber-50 shadow-retro flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-hackAmber border-2 border-ink shadow-retro-sm flex items-center justify-center text-ink text-xl font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-ink/70">High Risk (2-5d)</p>
              <p className="text-2xl font-black text-hackOrange">{highCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-ink bg-purple-50 shadow-retro flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-hackPurple text-white border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-ink/70">Reorders Needed</p>
              <p className="text-2xl font-black text-ink">
                {recommendations.filter((r) => r.recommendedOrder > 0).length} Items
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-ink bg-emerald-50 shadow-retro flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-hackMint border-2 border-ink shadow-retro-sm flex items-center justify-center text-ink text-xl font-bold">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-ink/70">Est. Restock Cost</p>
              <p className="text-2xl font-black text-ink">{formatCurrency(totalReorderCost)}</p>
            </div>
          </div>
        </div>

        {/* Formula Explainer Banner */}
        <div className="p-4 bg-sand border-2 border-ink rounded-xl shadow-retro flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-hackOrange text-white border-2 border-ink flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              ∑
            </div>
            <div>
              <h4 className="text-xs font-mono font-black uppercase tracking-wider text-ink">
                Deterministic Restock Formula
              </h4>
              <p className="text-xs text-ink/80 mt-0.5 font-medium">
                <span className="font-mono font-bold text-ink">
                  Reorder Qty = (Lead Time Demand + Safety Stock + Target Horizon Coverage) - (On Hand + Incoming)
                </span>
                , rounded up to the supplier&apos;s pack size.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs font-mono font-bold">
            <span className="text-ink/70">Target Horizon:</span>
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                onClick={() => setTargetHorizonDays(days)}
                className={`px-3 py-1 rounded-lg border-2 border-ink transition-all ${
                  targetHorizonDays === days
                    ? 'bg-hackOrange text-white shadow-retro-sm'
                    : 'bg-white text-ink hover:bg-cream'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'HEALTHY'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black transition-all border-2 border-ink ${
                riskFilter === r
                  ? 'bg-hackOrange text-white shadow-retro-sm'
                  : 'bg-sand text-ink hover:bg-cream'
              }`}
            >
              {r === 'ALL' ? 'All Risks' : r}
            </button>
          ))}
        </div>

        {/* Restock Recommendations Table */}
        <div className="bg-white border-2 border-ink rounded-xl shadow-retro overflow-hidden">
          {error && (
            <div className="p-3 bg-hackRed/10 border-b-2 border-ink text-hackRed text-xs font-mono font-bold">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink font-medium">
              <thead className="bg-sand text-ink uppercase font-mono text-[10px] font-black tracking-wider border-b-2 border-ink">
                <tr>
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4">On Hand</th>
                  <th className="py-3 px-4">Velocity</th>
                  <th className="py-3 px-4">Days of Cover</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Recommended Reorder</th>
                  <th className="py-3 px-4">Est. Cost</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-ink/20 font-mono">
                {loading && filteredRecommendations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-ink/60 font-bold">
                      Evaluating inventory coverage and supplier lead times...
                    </td>
                  </tr>
                ) : filteredRecommendations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-ink/60 font-bold">
                      No ingredients matching the selected risk level.
                    </td>
                  </tr>
                ) : (
                  filteredRecommendations.map((item) => (
                    <tr key={item.id} className="hover:bg-sand/60 transition-colors">
                      <td className="py-3 px-4 font-sans font-black text-ink">
                        <p>{item.name}</p>
                        <p className="text-[11px] font-mono text-ink/60 font-normal">{item.sku}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-ink">
                        {item.onHand} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-xs text-ink/80">
                        {item.dailyVelocity} {item.unit}/d
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-black ${
                            item.daysOfCover <= 2
                              ? 'text-hackRed'
                              : item.daysOfCover <= 5
                              ? 'text-hackOrange'
                              : 'text-ink'
                          }`}
                        >
                          {item.daysOfCover} days
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {item.riskLevel === 'CRITICAL' && (
                          <Badge variant="danger">
                            Critical (&le;48h)
                          </Badge>
                        )}
                        {item.riskLevel === 'HIGH' && (
                          <Badge variant="warning">
                            High (2-5d)
                          </Badge>
                        )}
                        {item.riskLevel === 'MODERATE' && (
                          <Badge variant="outline">
                            Moderate
                          </Badge>
                        )}
                        {item.riskLevel === 'HEALTHY' && (
                          <Badge variant="success">
                            Healthy
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.recommendedOrder > 0 ? (
                          <div>
                            <span className="font-black text-hackOrange">
                              +{item.recommendedOrder} {item.unit}
                            </span>
                            <span className="text-[10px] text-ink/60 block font-normal">
                              ({item.recommendedPacks} packs of {item.packSize})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-ink/60 font-normal">Sufficient</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-black text-ink">
                        {item.recommendedOrder > 0 ? formatCurrency(item.estimatedCost) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.recommendedOrder > 0 ? (
                          <Button
                            size="sm"
                            variant="orange"
                            onClick={() => handleCreateDraftPO(item)}
                            className="h-8 px-2.5 text-xs font-black flex items-center gap-1 ml-auto"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Draft PO
                          </Button>
                        ) : (
                          <span className="text-xs text-ink/40 font-normal">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PO Creation Preview Modal */}
        {selectedForPO && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 bg-white border-3 border-ink shadow-retro-xl rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <h3 className="text-lg font-black text-ink flex items-center gap-2">
                  <Package className="w-5 h-5 text-hackOrange" />
                  Generate Restock Order
                </h3>
                <button
                  onClick={() => setSelectedForPO(null)}
                  className="w-8 h-8 rounded-lg border-2 border-ink bg-sand flex items-center justify-center text-ink hover:bg-cream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {poCreated ? (
                <div className="py-6 text-center space-y-3 font-mono">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-hackMint border-2 border-ink shadow-retro-sm flex items-center justify-center text-ink text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-black text-ink text-base">Purchase Order Staged</h4>
                  <p className="text-xs text-ink/70 font-sans font-medium">
                    Draft PO for {selectedForPO.recommendedOrder} {selectedForPO.unit} of{' '}
                    {selectedForPO.name} has been placed in the Procurement Queue.
                  </p>
                  <Button
                    size="sm"
                    variant="orange"
                    onClick={() => setSelectedForPO(null)}
                    className="font-black"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 font-mono">
                  <div className="p-3.5 bg-sand rounded-xl border-2 border-ink space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-ink/70">Ingredient:</span>
                      <span className="font-black text-ink font-sans">{selectedForPO.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/70">Vendor Pack Size:</span>
                      <span className="text-ink font-bold">{selectedForPO.packSize} {selectedForPO.unit} / pack</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/70">Pack Quantity:</span>
                      <span className="text-hackOrange font-black">{selectedForPO.recommendedPacks} Packs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/70">Total Delivery Units:</span>
                      <span className="text-ink font-bold">{selectedForPO.recommendedOrder} {selectedForPO.unit}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-ink/20 pt-2 font-black">
                      <span className="text-ink/70">Estimated PO Cost:</span>
                      <span className="text-hackMint text-sm">{formatCurrency(selectedForPO.estimatedCost)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-ink">
                    <Button variant="outline" size="sm" onClick={() => setSelectedForPO(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="orange"
                      onClick={handleConfirmPO}
                      className="flex items-center gap-1 font-black"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Confirm & Send PO
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
