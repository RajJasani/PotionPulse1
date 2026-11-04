'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Save, PlusCircle, CheckCircle2 } from 'lucide-react';
import { StockMovementType } from '@potionpulse/contracts';

function AdjustStockPageContent() {
  const searchParams = useSearchParams();
  const preselectedIngredientId = searchParams.get('ingredientId') || '';
  const { activeTenant, accessToken } = useAuth();

  const [ingredients, setIngredients] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState(preselectedIngredientId);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [movementType, setMovementType] = useState<StockMovementType>(StockMovementType.RECEIPT);
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any | null>(null);

  useEffect(() => {
    if (!activeTenant?.id || !accessToken) return;
    setLoading(true);

    Promise.all([
      apiClient<any[]>('/ingredients', { token: accessToken, tenantId: activeTenant.id }),
      apiClient<any[]>('/locations', { token: accessToken, tenantId: activeTenant.id }),
    ])
      .then(([ingRes, locRes]) => {
        const rawIng = ingRes.data;
        const ingList = Array.isArray(rawIng) ? rawIng : (rawIng as any)?.items || [];
        const rawLoc = locRes.data;
        const locList = Array.isArray(rawLoc) ? rawLoc : (rawLoc as any)?.items || [];

        setIngredients(ingList);
        setLocations(locList);

        if (!selectedIngredientId && ingList.length > 0) {
          setSelectedIngredientId(ingList[0].id);
        }

        const defLoc = locList.find((l: any) => l.isDefault) || locList[0];
        if (defLoc) {
          setSelectedLocationId(defLoc.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTenant?.id, accessToken]);

  const selectedIngredient = (Array.isArray(ingredients) ? ingredients : []).find(
    (i) => i.id === selectedIngredientId,
  );
  const isNegativeOperation =
    movementType === StockMovementType.WASTAGE ||
    movementType === StockMovementType.ADJUSTMENT_OUT;

  const signedQuantityDelta = isNegativeOperation ? -Math.abs(quantity) : Math.abs(quantity);
  const projectedBalance = selectedIngredient
    ? selectedIngredient.onHand + signedQuantityDelta
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId || !reason) {
      setError('Please select an ingredient and specify an audit reason.');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const idempotencyKey = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const res = await apiClient<any>('/inventory/movements', {
        method: 'POST',
        token: accessToken || undefined,
        tenantId: activeTenant?.id,
        idempotencyKey,
        body: JSON.stringify({
          ingredientId: selectedIngredientId,
          locationId: selectedLocationId || undefined,
          type: movementType,
          quantityDelta: signedQuantityDelta,
          reason,
        }),
      });

      setSuccess(res.data);
      setReason('');

      const updatedList = await apiClient<any>('/ingredients', {
        token: accessToken || undefined,
        tenantId: activeTenant?.id,
      });
      const rawUp = updatedList.data;
      setIngredients(Array.isArray(rawUp) ? rawUp : (rawUp as any)?.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to post stock movement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-ink pb-4">
          <Button href="/inventory" variant="outline" size="sm" className="h-9 px-2.5 text-xs font-bold">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                LEDGER ENTRY
              </span>
              <span className="font-mono text-xs font-bold text-ink/70">
                // STOCK RECEIPT & ADJUSTMENT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-hackOrange" />
              Receive & Adjust Inventory
            </h1>
          </div>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border-2 border-ink shadow-retro text-ink text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-5 h-5 text-hackMint" />
              <span>
                Movement committed! New balance for <strong>{success.ingredientName}</strong>:{' '}
                <strong>{success.balanceAfter} {success.unit}</strong>.
              </span>
            </div>
            <Link href="/inventory/movements" className="underline font-mono font-black text-hackOrange ml-2">
              View in Ledger
            </Link>
          </div>
        )}

        <div className="bg-white border-2 border-ink shadow-retro rounded-xl p-6">
          <div className="border-b-2 border-ink pb-4 mb-4">
            <h2 className="text-base font-black text-ink font-mono uppercase">Movement Parameters</h2>
            <p className="text-xs text-ink/70 font-medium mt-1">
              Every stock change generates an immutable ledger record with balance versioning and actor audit trail.
            </p>
          </div>

          <div>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border-2 border-ink text-hackRed text-xs font-mono font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono font-bold">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-black uppercase tracking-wider text-ink/70">
                  Target Ingredient
                </label>
                <select
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full h-11 rounded-xl border-2 border-ink bg-cream px-4 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  disabled={loading}
                  required
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.sku || 'No SKU'}) — Current On-Hand: {ing.onHand} {ing.baseUnit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-ink/70">
                    Operation Type
                  </label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                    className="w-full h-11 rounded-xl border-2 border-ink bg-cream px-4 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  >
                    <option value={StockMovementType.RECEIPT}>Receipt (Stock Intake from Supplier)</option>
                    <option value={StockMovementType.ADJUSTMENT_IN}>Manual Adjustment (+) Increase</option>
                    <option value={StockMovementType.ADJUSTMENT_OUT}>Manual Adjustment (-) Decrease</option>
                    <option value={StockMovementType.WASTAGE}>Wastage / Spoilage Deduction (-)</option>
                    <option value={StockMovementType.RETURN}>Customer Return / Restock (+)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-ink/70">
                    Target Shelf / Location
                  </label>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="w-full h-11 rounded-xl border-2 border-ink bg-cream px-4 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code}) {loc.isDefault ? '— Default' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`Quantity (${selectedIngredient?.baseUnit || 'units'})`}
                  type="number"
                  min="0.01"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                />

                <Input
                  label="Audit Reason (Required)"
                  placeholder="e.g. Delivery PO-401 from Ravenwood Herbs"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              {/* Balance Impact Preview */}
              {selectedIngredient && (
                <div className="p-4 rounded-xl bg-sand border-2 border-ink flex items-center justify-between">
                  <span className="text-ink/70">Projected Physical Balance:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-ink/80 font-mono">
                      {selectedIngredient.onHand} {selectedIngredient.baseUnit}
                    </span>
                    <span className="text-ink">→</span>
                    <span
                      className={`text-base font-black font-mono ${
                        (projectedBalance ?? 0) < 0 ? 'text-hackRed' : 'text-hackMint'
                      }`}
                    >
                      {projectedBalance} {selectedIngredient.baseUnit}
                    </span>
                    {(projectedBalance ?? 0) < 0 && (
                      <Badge variant="danger">Negative Stock Blocked</Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t-2 border-ink">
                <Button href="/inventory" type="button" variant="outline">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="orange"
                  isLoading={submitting}
                  disabled={(projectedBalance ?? 0) < 0}
                  className="font-black"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Post Movement to Ledger
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function AdjustStockPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center font-mono text-ink/70">Loading adjustment form...</div>}>
      <AdjustStockPageContent />
    </Suspense>
  );
}
