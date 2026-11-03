'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Package,
} from 'lucide-react';

interface IngredientSummary {
  id: string;
  name: string;
  sku?: string;
  category: string;
  baseUnit: string;
  reorderPoint: number;
  safetyStock: number;
  leadTimeDays: number;
  costPerUnit: number;
  onHand: number;
  reserved: number;
  available: number;
  isLowStock: boolean;
}

export default function InventoryPage() {
  const { activeTenant, accessToken } = useAuth();
  const [ingredients, setIngredients] = useState<IngredientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchIngredients = async () => {
    if (!activeTenant?.id || !accessToken) return;
    setLoading(true);
    try {
      const res = await apiClient<IngredientSummary[]>('/ingredients', {
        token: accessToken,
        tenantId: activeTenant.id,
        params: {
          search: search || undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          lowStock: lowStockOnly ? 'true' : undefined,
        },
      });

      if (res.data) {
        setIngredients(res.data);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [activeTenant?.id, accessToken, selectedCategory, lowStockOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIngredients();
  };

  const categories = ['ALL', ...Array.from(new Set(ingredients.map((i) => i.category).filter(Boolean)))];

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'botanical':
        return 'success';
      case 'animal':
        return 'orange';
      case 'mineral':
        return 'cyan';
      case 'liquid':
        return 'purple';
      default:
        return 'pink';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                INVENTORY CATALOG
              </span>
              <span className="font-mono text-xs font-bold text-ink/70">
                // {ingredients.length} TOTAL AUDITED ITEMS
              </span>
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight flex items-center gap-2.5">
              <span>⚗️</span> Apothecary Ingredient Catalog
            </h1>
            <p className="text-xs text-ink/70 font-medium mt-1">
              Live stock levels, shelf assignments, and reorder point thresholds tracked on the ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button href="/inventory/adjust" variant="amber" size="sm">
              <PlusCircle className="w-4 h-4 mr-1 text-ink" />
              <span>Receive / Adjust Stock</span>
            </Button>

            <Button href="/inventory/new" variant="orange" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              <span>New Ingredient</span>
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <Card className="p-4 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-ink/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ingredient by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border-2 border-ink bg-cream text-xs font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-hackOrange shadow-retro-sm"
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="h-10 px-4 text-xs font-black">
                Search
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold text-ink select-none bg-sand px-3 py-2 rounded-xl border-2 border-ink shadow-retro-sm">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded border-2 border-ink text-hackOrange focus:ring-hackOrange w-4 h-4"
                />
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-hackRed" />
                  <span>Low stock only</span>
                </span>
              </label>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchIngredients}
                className="h-10 px-3 text-xs flex items-center gap-1.5 font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t-2 border-ink/15 overflow-x-auto">
              <span className="text-[10px] uppercase font-mono font-black text-ink/70 flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-black transition-all shrink-0 border-2 border-ink ${
                    selectedCategory === cat
                      ? 'bg-hackOrange text-white shadow-retro-sm translate-x-0.5'
                      : 'bg-sand text-ink hover:bg-cream'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Ingredients Table */}
        <div className="bg-white border-2 border-ink rounded-xl shadow-retro overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-ink bg-sand text-ink font-mono uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">On-Hand</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Reorder Point</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-ink/20 font-medium">
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-ink/70">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2 font-mono font-bold text-ink">
                          <RefreshCw className="w-5 h-5 animate-spin text-hackOrange" />
                          <span>Querying inventory ledger...</span>
                        </div>
                      ) : (
                        <div className="space-y-3 font-mono font-bold">
                          <Package className="w-10 h-10 mx-auto text-ink/40" />
                          <p>No ingredients found matching the selected filter.</p>
                          <Button href="/inventory/new" size="sm" variant="orange">
                            + Add First Ingredient
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-sand/60 transition-colors">
                      <td className="py-3 px-4 font-black text-ink text-sm">
                        <Link
                          href={`/inventory/${ing.id}`}
                          className="hover:text-hackOrange transition-colors flex items-center gap-1.5"
                        >
                          <span>🧪</span>
                          <span>{ing.name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-ink/70">{ing.sku || '—'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getCategoryBadgeVariant(ing.category) as any}>
                          {ing.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-black font-mono text-sm text-ink">
                        {ing.onHand} {ing.baseUnit}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-hackMint">
                        {ing.available} {ing.baseUnit}
                      </td>
                      <td className="py-3 px-4 font-mono text-ink/70">
                        {ing.reorderPoint} {ing.baseUnit}
                      </td>
                      <td className="py-3 px-4 font-mono text-ink font-bold">
                        {formatCurrency(ing.costPerUnit || 0)}
                      </td>
                      <td className="py-3 px-4">
                        {ing.isLowStock ? (
                          <Badge variant="danger" className="animate-pulse">
                            ⚠️ Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success">
                            ✓ Healthy
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button href={`/inventory/${ing.id}`} variant="outline" size="sm" className="h-8 text-xs px-2.5 font-bold">
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
