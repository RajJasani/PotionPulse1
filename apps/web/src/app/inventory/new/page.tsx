'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Save, Plus } from 'lucide-react';

export default function NewIngredientPage() {
  const { activeTenant, accessToken } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Magical Flora');
  const [baseUnit, setBaseUnit] = useState('piece');
  const [reorderPoint, setReorderPoint] = useState(20);
  const [safetyStock, setSafetyStock] = useState(10);
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [costPerUnit, setCostPerUnit] = useState(5.0);
  const [defaultLocationId, setDefaultLocationId] = useState('');
  const [locations, setLocations] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTenant?.id || !accessToken) return;
    apiClient<any[]>('/locations', { token: accessToken, tenantId: activeTenant.id })
      .then((res) => {
        setLocations(res.data || []);
        const def = (res.data || []).find((l) => l.isDefault);
        if (def) setDefaultLocationId(def.id);
      })
      .catch(() => {});
  }, [activeTenant?.id, accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseUnit) {
      setError('Please provide at least a name and base measurement unit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient('/ingredients', {
        method: 'POST',
        token: accessToken || undefined,
        tenantId: activeTenant?.id,
        body: JSON.stringify({
          name,
          sku: sku || undefined,
          category,
          baseUnit,
          reorderPoint: Number(reorderPoint) || 0,
          safetyStock: Number(safetyStock) || 0,
          leadTimeDays: Number(leadTimeDays) || 1,
          costPerUnit: Number(costPerUnit) || 0,
          defaultLocationId: defaultLocationId || undefined,
        }),
      });

      router.push('/inventory');
    } catch (err: any) {
      setError(err.message || 'Failed to create ingredient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-ink pb-4">
          <Button href="/inventory" variant="outline" size="sm" className="h-9 px-2.5 text-xs font-bold">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Catalog
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                CATALOG DEFINITION
              </span>
              <span className="font-mono text-xs font-bold text-ink/70">
                // INGREDIENT REGISTRATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
              <Plus className="w-6 h-6 text-hackOrange" />
              Add New Ingredient
            </h1>
          </div>
        </div>

        <div className="bg-white border-2 border-ink shadow-retro rounded-xl p-6">
          <div className="border-b-2 border-ink pb-4 mb-4">
            <h2 className="text-base font-black text-ink font-mono uppercase">Ingredient Specifications</h2>
            <p className="text-xs text-ink/70 font-medium mt-1">
              Requires unique SKU within shop, explicit base measurement unit, and non-negative reorder thresholds.
            </p>
          </div>

          <div>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border-2 border-ink text-hackRed text-xs font-mono font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono font-bold text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ingredient Name"
                  placeholder="e.g. Mandrake Root"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="SKU Code"
                  placeholder="e.g. ING-MND-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  helperText="Optional, unique per shop"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-ink/70">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 rounded-xl border-2 border-ink bg-cream px-4 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  >
                    <option value="Magical Flora">Magical Flora</option>
                    <option value="Animal Parts">Animal Parts</option>
                    <option value="Minerals & Crystals">Minerals & Crystals</option>
                    <option value="Liquids & Essences">Liquids & Essences</option>
                    <option value="Spices & Seasoning">Spices & Seasoning</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-ink/70">
                    Base Measurement Unit
                  </label>
                  <select
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    className="w-full h-11 rounded-xl border-2 border-ink bg-cream px-4 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  >
                    <option value="piece">Piece (individual items)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="oz">Ounce (oz)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <Input
                  label="Reorder Threshold"
                  type="number"
                  min="0"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(Number(e.target.value))}
                  helperText="Triggers low-stock warning"
                />

                <Input
                  label="Safety Stock Buffer"
                  type="number"
                  min="0"
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(Number(e.target.value))}
                  helperText="Buffer for demand spikes"
                />

                <Input
                  label="Supplier Lead Time (Days)"
                  type="number"
                  min="0"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  helperText="Days from order to delivery"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <Input
                  label="Cost per Unit ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(Number(e.target.value))}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-ink/70">
                    Default Storage Shelf
                  </label>
                  <select
                    value={defaultLocationId}
                    onChange={(e) => setDefaultLocationId(e.target.value)}
                    className="w-full h-11 rounded-xl border-2 border-ink bg-cream px-4 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  >
                    <option value="">Select location...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code}) {loc.isDefault ? '— Default' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t-2 border-ink">
                <Button href="/inventory" type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" variant="orange" className="font-black" isLoading={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Ingredient
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
