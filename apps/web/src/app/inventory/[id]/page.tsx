'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Layers,
  PlusCircle,
  Archive,
  RefreshCw,
} from 'lucide-react';

export default function IngredientDetailPage() {
  const { id } = useParams() as { id: string };
  const { activeTenant, accessToken } = useAuth();
  const router = useRouter();

  const [ingredient, setIngredient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  const fetchIngredient = async () => {
    if (!id || !activeTenant?.id || !accessToken) return;
    setLoading(true);
    try {
      const res = await apiClient<any>(`/ingredients/${id}`, {
        token: accessToken,
        tenantId: activeTenant.id,
      });
      setIngredient(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load ingredient.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredient();
  }, [id, activeTenant?.id, accessToken]);

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this ingredient? Historical sales and ledger movements will remain intact.')) {
      return;
    }

    setArchiving(true);
    try {
      await apiClient(`/ingredients/${id}`, {
        method: 'DELETE',
        token: accessToken || undefined,
        tenantId: activeTenant?.id,
      });
      router.push('/inventory');
    } catch (err: any) {
      alert(err.message || 'Failed to archive ingredient');
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24 text-ink/70 font-mono text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-hackOrange" />
          Querying ingredient ledger...
        </div>
      </AppShell>
    );
  }

  if (error || !ingredient) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <p className="text-hackRed font-mono font-bold text-sm">{error || 'Ingredient not found'}</p>
          <Button href="/inventory" variant="outline" size="sm">
            Return to Catalog
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-3">
            <Button href="/inventory" variant="outline" size="sm" className="h-9 px-2.5 text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Catalog
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">{ingredient.name}</h1>
                <Badge variant={ingredient.isLowStock ? 'danger' : 'success'}>
                  {ingredient.isLowStock ? '⚠️ Low Stock' : '✓ Healthy Balance'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-ink/70 mt-1">
                <span>SKU: {ingredient.sku || 'None'}</span>
                <span>•</span>
                <span>Category: {ingredient.category}</span>
                <span>•</span>
                <span>Base Unit: {ingredient.baseUnit}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button href={`/inventory/adjust?ingredientId=${ingredient.id}`} size="sm" variant="orange" className="text-xs font-black flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              Adjust / Intake Stock
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleArchive}
              isLoading={archiving}
              className="text-xs text-hackRed border-2 border-ink font-bold hover:bg-rose-50"
            >
              <Archive className="w-3.5 h-3.5 mr-1" />
              Archive
            </Button>
          </div>
        </div>

        {/* Stock Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border-2 border-ink bg-white shadow-retro">
            <span className="text-[10px] font-mono font-black text-ink/70 uppercase tracking-wider block">
              On-Hand Physical Stock
            </span>
            <div className="mt-2 text-3xl font-black font-mono text-ink">
              {ingredient.onHand}{' '}
              <span className="text-sm font-normal text-ink/70">{ingredient.baseUnit}</span>
            </div>
            <p className="text-[11px] font-mono text-ink/60 mt-1">Verified on physical shelves</p>
          </div>

          <div className="p-5 rounded-xl border-2 border-ink bg-amber-50 shadow-retro">
            <span className="text-[10px] font-mono font-black text-ink/70 uppercase tracking-wider block">
              Reserved / In-Process
            </span>
            <div className="mt-2 text-3xl font-black font-mono text-hackOrange">
              {ingredient.reserved}{' '}
              <span className="text-sm font-normal text-ink/70">{ingredient.baseUnit}</span>
            </div>
            <p className="text-[11px] font-mono text-ink/60 mt-1">Committed to active orders</p>
          </div>

          <div className="p-5 rounded-xl border-2 border-ink bg-purple-50 shadow-retro">
            <span className="text-[10px] font-mono font-black text-ink/70 uppercase tracking-wider block">
              Available to Promise
            </span>
            <div className="mt-2 text-3xl font-black font-mono text-hackPurple">
              {ingredient.available}{' '}
              <span className="text-sm font-normal text-ink/70">{ingredient.baseUnit}</span>
            </div>
            <p className="text-[11px] font-mono text-ink/60 mt-1">Usable for immediate sales</p>
          </div>
        </div>

        {/* Thresholds & Procurement Card */}
        <div className="bg-white border-2 border-ink shadow-retro rounded-xl p-6 space-y-4">
          <div className="border-b-2 border-ink pb-3">
            <h2 className="text-base font-black text-ink font-mono uppercase">Procurement & Buffer Parameters</h2>
            <p className="text-xs text-ink/70 font-medium mt-1">
              Inventory intelligence inputs used for stockout risk prediction and reorder quantity calculation.
            </p>
          </div>
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-sand border-2 border-ink">
                <span className="text-ink/70 font-bold block text-[10px] uppercase">Reorder Point:</span>
                <div className="text-base font-black text-ink mt-1">
                  {ingredient.reorderPoint} {ingredient.baseUnit}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-sand border-2 border-ink">
                <span className="text-ink/70 font-bold block text-[10px] uppercase">Safety Stock Buffer:</span>
                <div className="text-base font-black text-ink mt-1">
                  {ingredient.safetyStock} {ingredient.baseUnit}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-sand border-2 border-ink">
                <span className="text-ink/70 font-bold block text-[10px] uppercase">Supplier Lead Time:</span>
                <div className="text-base font-black text-ink mt-1">
                  {ingredient.leadTimeDays} days
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-sand border-2 border-ink">
                <span className="text-ink/70 font-bold block text-[10px] uppercase">Cost per Unit:</span>
                <div className="text-base font-black text-hackOrange mt-1">
                  {formatCurrency(ingredient.costPerUnit || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shelf & Location Breakdown */}
        <div className="bg-white border-2 border-ink shadow-retro rounded-xl overflow-hidden">
          <div className="p-4 border-b-2 border-ink bg-sand flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-ink font-mono uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-hackOrange" />
                Shelf & Storage Distribution
              </h3>
              <p className="text-xs text-ink/70 font-medium">Multi-shelf inventory breakdown for physical stock audits.</p>
            </div>
          </div>
          <div>
            {ingredient.locationBalances?.length === 0 ? (
              <div className="text-center py-6 text-xs font-mono font-bold text-ink/60">
                No storage locations assigned yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-ink font-medium">
                  <thead>
                    <tr className="border-b-2 border-ink bg-cream text-ink uppercase font-mono text-[10px] font-black">
                      <th className="py-2.5 px-3">Location Name</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">On-Hand Quantity</th>
                      <th className="py-2.5 px-3">Reserved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 border-ink/20 font-mono">
                    {ingredient.locationBalances?.map((b: any) => (
                      <tr key={b.locationId} className="hover:bg-sand/60 transition-colors">
                        <td className="py-3 px-3 font-sans font-black text-ink">
                          {b.locationName || 'Main Vault Shelf'}
                        </td>
                        <td className="py-3 px-3 font-bold text-hackOrange">{b.locationCode}</td>
                        <td className="py-3 px-3 font-black text-ink">
                          {b.onHand} {ingredient.baseUnit}
                        </td>
                        <td className="py-3 px-3 text-ink/70">
                          {b.reserved} {ingredient.baseUnit}
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
    </AppShell>
  );
}
