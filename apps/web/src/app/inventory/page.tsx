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
  Sparkles,
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

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'botanical':
        return 'emerald';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 text-[11px] font-black text-emerald-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vault Catalog Diagnostics</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>🧪</span> Apothecary Ingredient Catalog
            </h1>
            <p className="text-xs text-purple-200/80 font-bold mt-1">
              Live stock levels, storage shelf assignments, and reorder point thresholds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button href="/inventory/adjust" variant="secondary" size="sm" className="text-xs flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Receive / Adjust Stock</span>
            </Button>

            <Button href="/inventory/new" variant="primary" size="sm" className="text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>New Ingredient</span>
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <Card className="p-5 border-3 border-purple-500/25">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-purple-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ingredient by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-2xl border-2 border-purple-500/30 bg-[#140D22] text-xs font-bold text-white placeholder:text-purple-300/40 focus:outline-none focus:border-purple-400 shadow-inner"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" className="h-11 px-4 text-xs font-bold">
                Search
              </Button>
            </form>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-200 select-none bg-purple-950/40 px-3 py-2 rounded-xl border-2 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded border-purple-400/40 bg-[#140D22] text-potionPurple focus:ring-potionPurple w-4 h-4"
                />
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Low stock only</span>
                </span>
              </label>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchIngredients}
                className="h-10 px-3 text-xs flex items-center gap-1.5 text-purple-200 border-2 border-purple-500/20 rounded-xl"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 mt-4 pt-3.5 border-t-2 border-purple-500/15 overflow-x-auto">
              <span className="text-[10px] uppercase font-black text-purple-300 flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-[0_3px_0_0_#4C1D95] border-2 border-white/30 scale-105'
                      : 'bg-white/5 text-purple-200/80 hover:text-white hover:bg-white/10 border-2 border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Ingredients Table */}
        <Card className="p-0 overflow-hidden border-3 border-purple-500/25">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-purple-500/20 bg-purple-950/40 text-purple-300 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3.5 px-4">Ingredient</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">On-Hand</th>
                  <th className="py-3.5 px-4">Available</th>
                  <th className="py-3.5 px-4">Reorder Point</th>
                  <th className="py-3.5 px-4">Unit Cost</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-purple-500/10">
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-purple-300">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2 font-bold">
                          <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                          <span>Consulting inventory grimoire...</span>
                        </div>
                      ) : (
                        <div className="space-y-3 font-bold">
                          <div className="text-3xl">🧪</div>
                          <p>No ingredients found matching your search filter.</p>
                          <Button href="/inventory/new" size="sm" variant="primary">
                            + Add First Ingredient
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-purple-500/10 transition-colors font-medium">
                      <td className="py-3.5 px-4 font-black text-white text-sm">
                        <Link
                          href={`/inventory/${ing.id}`}
                          className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                        >
                          <span>🧪</span>
                          <span>{ing.name}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-300">{ing.sku || '—'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getCategoryColor(ing.category) as any}>
                          {ing.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-black font-mono text-sm text-white">
                        {ing.onHand} {ing.baseUnit}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {ing.available} {ing.baseUnit}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-300">
                        {ing.reorderPoint} {ing.baseUnit}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-300 font-bold">
                        {formatCurrency(ing.costPerUnit || 0)}
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-right">
                        <Button href={`/inventory/${ing.id}`} variant="outline" size="sm" className="h-8 text-xs px-3">
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
        </Card>
      </div>
    </AppShell>
  );
}
