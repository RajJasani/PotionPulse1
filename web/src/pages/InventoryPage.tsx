import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Coins,
  Package,
  Layers,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { api } from '@shared/api-client';
import { Ingredient, Shelf, SaleCreate, IngredientCreate } from '@shared/api.types';
import { PotionBottleGauge } from '@shared/PotionBottleGauge';
import { Skeleton } from '../components/Skeleton';
import { ArcaneSparkles } from '../components/ArcaneSparkles';
import { EmptyState } from '../components/EmptyState';

interface InventoryPageProps {
  onShowToast: (toast: any) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onShowToast }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedShelf, setSelectedShelf] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'cost'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [saleModalReagent, setSaleModalReagent] = useState<Ingredient | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<number>(1);
  const [customerType, setCustomerType] = useState<string>('Sorcerer');
  const [submittingSale, setSubmittingSale] = useState(false);
  const [sparklesActive, setSparklesActive] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newReagent, setNewReagent] = useState<IngredientCreate>({
    name: '',
    category: 'Herb',
    unit: 'g',
    current_stock: 50,
    minimum_threshold: 10,
    reorder_point: 25,
    lead_time_days: 3,
    unit_cost_gold: 2.5,
    shelf_id: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [ings, shlfs] = await Promise.all([
        api.getIngredients(),
        api.getShelves(),
      ]);
      setIngredients(ings);
      setShelves(shlfs);
      if (shlfs.length > 0 && !newReagent.shelf_id) {
        setNewReagent((prev) => ({ ...prev, shelf_id: shlfs[0].id }));
      }
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Shelf Audit Failed',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleModalReagent) return;

    if (saleQuantity <= 0) {
      onShowToast({
        id: Date.now().toString(),
        type: 'warning',
        title: 'Invalid Scoop',
        message: 'Sale quantity must be greater than zero.',
      });
      return;
    }

    if (saleQuantity > saleModalReagent.current_stock) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Cauldron Denied',
        message: `Requested ${saleQuantity} ${saleModalReagent.unit}, but only ${saleModalReagent.current_stock.toFixed(1)} remain.`,
      });
      return;
    }

    try {
      setSubmittingSale(true);
      const calculatedPrice = Math.round(saleQuantity * saleModalReagent.unit_cost_gold * 1.6 * 100) / 100;
      
      const res = await api.recordSale({
        ingredient_id: saleModalReagent.id,
        quantity: saleQuantity,
        sale_price_gold: calculatedPrice,
        customer_type: customerType,
      });

      setIngredients((prev) =>
        prev.map((item) =>
          item.id === saleModalReagent.id
            ? { ...item, current_stock: res.remaining_stock }
            : item
        )
      );

      setSparklesActive(true);
      onShowToast({
        id: Date.now().toString(),
        type: res.warning ? 'warning' : 'success',
        title: 'Potion Dispensed!',
        message: `Sold ${saleQuantity} ${saleModalReagent.unit} to ${customerType}. Remaining: ${res.remaining_stock.toFixed(1)} ${saleModalReagent.unit}.${res.warning ? ` (${res.warning})` : ''}`,
      });

      setSaleModalReagent(null);
      setSaleQuantity(1);
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Sale Registration Error',
        message: err.message,
      });
    } finally {
      setSubmittingSale(false);
    }
  };

  const handleCreateReagent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createIngredient(newReagent);
      setIngredients((prev) => [...prev, created]);
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'New Reagent Consecrated',
        message: `${created.name} successfully registered on shelf.`,
      });
      setAddModalOpen(false);
      setNewReagent({
        name: '',
        category: 'Herb',
        unit: 'g',
        current_stock: 50,
        minimum_threshold: 10,
        reorder_point: 25,
        lead_time_days: 3,
        unit_cost_gold: 2.5,
        shelf_id: shelves[0]?.id || '',
      });
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Cataloging Error',
        message: err.message,
      });
    }
  };

  const categories = ['ALL', 'Herb', 'Fauna Reagent', 'Mineral', 'Essence', 'Mushroom'];

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || ing.category === selectedCategory;
    const matchesShelf =
      selectedShelf === 'ALL' || ing.shelf_id === selectedShelf;
    const matchesLowStock = lowStockOnly
      ? ing.current_stock <= ing.reorder_point
      : true;

    return matchesSearch && matchesCategory && matchesShelf && matchesLowStock;
  });

  const sortedIngredients = [...filteredIngredients].sort((a, b) => {
    let factor = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') return factor * a.name.localeCompare(b.name);
    if (sortBy === 'stock') return factor * (a.current_stock - b.current_stock);
    if (sortBy === 'cost') return factor * (a.unit_cost_gold - b.unit_cost_gold);
    return 0;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] text-black border border-amber-500/40 uppercase tracking-wider shadow-sm">
              INVENTORY VAULT
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>The Pantry Shelves</span>
          </h2>
          <p className="font-sans text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
            Manage raw reagents, monitor physical tiers, dispense potion sales, and audit levels.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] hover:from-[#FFE033] hover:to-[#FFA000] text-black border border-amber-500/40 px-5 py-2.5 rounded-full font-sans text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Reagent</span>
        </button>
      </div>

      {/* Filter & Search Bar in Glass Card */}
      <div className="p-5 rounded-3xl bg-white/95 dark:bg-[#151221] backdrop-blur-xl border border-slate-200 dark:border-white/15 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by reagent name, scent, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F2] dark:bg-[#1E192D] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-sans font-bold text-sm rounded-full pl-11 pr-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] placeholder:text-slate-400 dark:placeholder:text-slate-400"
            />
          </div>

          {/* Shelf Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedShelf}
              onChange={(e) => setSelectedShelf(e.target.value)}
              className="bg-[#FAF8F2] dark:bg-[#1E192D] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-sans font-bold text-xs rounded-full px-4 py-2.5 shadow-sm min-h-[44px]"
            >
              <option value="ALL">All Shelves ({shelves.length})</option>
              {shelves.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-4 py-2 rounded-full font-sans text-xs font-black uppercase tracking-wider border transition-all min-h-[44px] flex items-center gap-2 shadow-sm ${
              lowStockOnly
                ? 'bg-rose-500 text-white border-rose-600 shadow-md'
                : 'bg-[#FAF8F2] dark:bg-[#1E192D] border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Low Stock Only</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-sans text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border min-h-[36px] ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] text-black border-amber-500/40 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-[#1E192D] border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {cat === 'ALL' ? 'All Reagents' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Shelves Table in Glass Card */}
      <div className="rounded-3xl bg-white/95 dark:bg-[#151221] backdrop-blur-xl border border-slate-200 dark:border-white/15 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl border border-black/10 dark:border-white/10" />
            ))}
          </div>
        ) : sortedIngredients.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-display text-xl font-black text-slate-900 dark:text-white">
              No matching reagents on the shelves
            </h3>
            <p className="font-sans text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
              Try adjusting your search criteria or consecrate a new mystical reagent.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-slate-100 dark:bg-[#1A162B] border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-black">
                <tr>
                  <th className="py-4 px-4">Flask</th>
                  <th
                    className="py-4 px-4 cursor-pointer hover:underline"
                    onClick={() => {
                      setSortBy('name');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Reagent Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-4">Shelf Tier</th>
                  <th
                    className="py-4 px-4 text-right cursor-pointer hover:underline"
                    onClick={() => {
                      setSortBy('stock');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Current Stock</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-4 text-right">Reorder Threshold</th>
                  <th
                    className="py-4 px-4 text-right cursor-pointer hover:underline"
                    onClick={() => {
                      setSortBy('cost');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Unit Cost</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {sortedIngredients.map((ing) => {
                  const isStockedOut = ing.current_stock <= 0;
                  const isCritical = ing.current_stock <= ing.minimum_threshold;
                  const isLow = ing.current_stock <= ing.reorder_point;

                  return (
                    <motion.tr
                      key={ing.id}
                      layout
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* Mini Bottle Gauge */}
                      <td className="py-3 px-4 w-16">
                        <PotionBottleGauge
                          currentStock={ing.current_stock}
                          maxCapacity={ing.reorder_point * 2.5}
                          unit={ing.unit}
                          minimumThreshold={ing.minimum_threshold}
                          reorderPoint={ing.reorder_point}
                          size="sm"
                          showLabels={false}
                        />
                      </td>

                      {/* Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {ing.name}
                        </div>
                        <span className="text-[10px] uppercase font-mono font-bold text-amber-600 dark:text-amber-300">
                          {ing.category}
                        </span>
                      </td>

                      {/* Shelf */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-800 dark:text-amber-200 font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/10">
                          {ing.shelf_name || 'Shelf Vault'}
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4 text-right font-mono font-black">
                        <span
                          className={
                            isStockedOut
                              ? 'text-rose-500 font-extrabold'
                              : isCritical
                              ? 'text-rose-500 font-extrabold'
                              : isLow
                              ? 'text-amber-400 font-extrabold'
                              : 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                          }
                        >
                          {ing.current_stock.toFixed(1)} {ing.unit}
                        </span>
                        {isStockedOut && (
                          <div className="text-[9px] uppercase font-black text-rose-500">
                            DEPLETED
                          </div>
                        )}
                      </td>

                      {/* Thresholds */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                        <div>Reorder: {ing.reorder_point} {ing.unit}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Min: {ing.minimum_threshold} {ing.unit} &bull; Lead: {ing.lead_time_days}d
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right font-mono text-slate-900 dark:text-white font-extrabold">
                        {ing.unit_cost_gold.toFixed(2)} G
                      </td>

                      {/* Quick Dispense Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSaleModalReagent(ing);
                            setSaleQuantity(1);
                          }}
                          disabled={isStockedOut}
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border border-amber-500/40 text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 mx-auto disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Dispense</span>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK SALE MODAL */}
      <AnimatePresence>
        {saleModalReagent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sig-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-[#18171F] border-2 border-sig-black p-6 sm:p-7 shadow-sig-lg relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
                    <ShoppingCart className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  </div>
                  <h3 className="font-display text-xl font-black text-slate-900 dark:text-white">
                    Dispense Reagent
                  </h3>
                </div>
                <button
                  onClick={() => setSaleModalReagent(null)}
                  className="p-1 rounded-full border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRecordSale} className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#251F36] border border-slate-200 dark:border-white/15 flex items-center justify-between">
                  <div>
                    <h4 className="font-sans font-black text-slate-900 dark:text-white text-base">
                      {saleModalReagent.name}
                    </h4>
                    <p className="font-sans text-xs font-semibold text-slate-600 dark:text-slate-300">
                      In Stock:{' '}
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {saleModalReagent.current_stock.toFixed(1)} {saleModalReagent.unit}
                      </strong>
                    </p>
                  </div>
                  <PotionBottleGauge
                    currentStock={saleModalReagent.current_stock}
                    unit={saleModalReagent.unit}
                    size="sm"
                    showLabels={false}
                  />
                </div>

                {/* Quantity Stepper */}
                <div>
                  <label className="block font-sans text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Quantity to Dispense ({saleModalReagent.unit})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSaleQuantity(Math.max(0.5, saleQuantity - 1))}
                      className="w-12 h-11 rounded-2xl bg-slate-100 dark:bg-[#251F36] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono text-lg font-black shadow-sm active:translate-y-0.5"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max={saleModalReagent.current_stock}
                      value={saleQuantity}
                      onChange={(e) => setSaleQuantity(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-slate-50 dark:bg-[#251F36] border border-slate-300 dark:border-white/15 text-center font-mono text-base font-black text-slate-900 dark:text-white rounded-2xl py-2.5 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSaleQuantity(
                          Math.min(saleModalReagent.current_stock, saleQuantity + 1)
                        )
                      }
                      className="w-12 h-11 rounded-2xl bg-slate-100 dark:bg-[#251F36] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono text-lg font-black shadow-sm active:translate-y-0.5"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Customer Type */}
                <div>
                  <label className="block font-sans text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Customer Archtype
                  </label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#251F36] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-sans font-bold text-xs rounded-2xl px-4 py-3 shadow-sm"
                  >
                    <option value="Sorcerer">Sorcerer</option>
                    <option value="Witch">Witch</option>
                    <option value="Apprentice">Apprentice</option>
                    <option value="Guild Alchemist">Guild Alchemist</option>
                    <option value="Townsperson">Townsperson</option>
                  </select>
                </div>

                {/* Price summary */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 border border-amber-500/40 flex items-center justify-between text-xs font-mono font-black shadow-sm">
                  <span>Total Gold Due:</span>
                  <span className="text-base flex items-center gap-1">
                    <Coins className="w-4 h-4 text-slate-950 fill-current" />
                    {(saleQuantity * saleModalReagent.unit_cost_gold * 1.6).toFixed(2)} Gold
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSaleModalReagent(null)}
                    className="flex-1 py-3 rounded-full border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-[#251F36] text-slate-800 dark:text-slate-200 font-sans text-xs font-black uppercase tracking-wider shadow-sm hover:bg-slate-200 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSale || saleQuantity <= 0 || saleQuantity > saleModalReagent.current_stock}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] hover:from-[#FFE033] hover:to-[#FFA000] text-black border border-amber-500/40 font-sans text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40"
                  >
                    {submittingSale ? 'Dispensing...' : 'Confirm Sale'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD REAGENT MODAL */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sig-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#18171F] border-2 border-sig-black p-6 sm:p-7 shadow-sig-lg"
            >
              <div className="flex items-center justify-between pb-4 border-b-2 border-sig-black">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sig-limon border-2 border-sig-black flex items-center justify-center">
                    <Plus className="w-4 h-4 text-sig-black stroke-[3]" />
                  </div>
                  <h3 className="font-display text-xl font-black text-sig-black dark:text-sig-cream">
                    Catalog New Reagent
                  </h3>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="p-1 rounded-full border-2 border-sig-black hover:bg-sig-cream"
                >
                  <X className="w-4 h-4 text-sig-black" />
                </button>
              </div>

              <form onSubmit={handleCreateReagent} className="mt-5 space-y-4">
                <div>
                  <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase mb-1">
                    Reagent Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phoenix Feather, Dragon Scale"
                    value={newReagent.name}
                    onChange={(e) =>
                      setNewReagent({ ...newReagent, name: e.target.value })
                    }
                    className="w-full bg-white dark:bg-[#24222E] border-2 border-sig-black rounded-2xl px-4 py-2.5 text-sig-black dark:text-sig-cream font-bold text-sm shadow-sig-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={newReagent.category}
                      onChange={(e) =>
                        setNewReagent({ ...newReagent, category: e.target.value })
                      }
                      className="w-full bg-white dark:bg-[#24222E] border-2 border-sig-black rounded-2xl px-3 py-2.5 text-sig-black dark:text-sig-cream font-bold text-xs shadow-sig-sm"
                    >
                      <option value="Herb">Herb</option>
                      <option value="Fauna Reagent">Fauna Reagent</option>
                      <option value="Mineral">Mineral</option>
                      <option value="Essence">Essence</option>
                      <option value="Mushroom">Mushroom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase mb-1">
                      Unit of Measure
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. g, oz, vials"
                      value={newReagent.unit}
                      onChange={(e) =>
                        setNewReagent({ ...newReagent, unit: e.target.value })
                      }
                      className="w-full bg-white dark:bg-[#24222E] border-2 border-sig-black rounded-2xl px-3 py-2.5 text-sig-black dark:text-sig-cream font-bold text-xs shadow-sig-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newReagent.current_stock}
                      onChange={(e) =>
                        setNewReagent({
                          ...newReagent,
                          current_stock: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white dark:bg-[#24222E] border-2 border-sig-black rounded-2xl px-3 py-2 text-sig-black dark:text-sig-cream font-bold text-xs shadow-sig-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase mb-1">
                      Min Alert
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newReagent.minimum_threshold}
                      onChange={(e) =>
                        setNewReagent({
                          ...newReagent,
                          minimum_threshold: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white dark:bg-[#24222E] border-2 border-sig-black rounded-2xl px-3 py-2 text-sig-black dark:text-sig-cream font-bold text-xs shadow-sig-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase mb-1">
                      Reorder Pt
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newReagent.reorder_point}
                      onChange={(e) =>
                        setNewReagent({
                          ...newReagent,
                          reorder_point: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white dark:bg-[#24222E] border-2 border-sig-black rounded-2xl px-3 py-2 text-sig-black dark:text-sig-cream font-bold text-xs shadow-sig-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase mb-1">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newReagent.lead_time_days}
                      onChange={(e) =>
                        setNewReagent({
                          ...newReagent,
                          lead_time_days: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full bg-white dark:bg-[#24222E] border-2 border-sig-black rounded-2xl px-3 py-2 text-sig-black dark:text-sig-cream font-bold text-xs shadow-sig-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase mb-1">
                      Unit Cost (Gold)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newReagent.unit_cost_gold}
                      onChange={(e) =>
                        setNewReagent({
                          ...newReagent,
                          unit_cost_gold: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white dark:bg-[#24222E] border-2 border-sig-black rounded-2xl px-3 py-2 text-sig-black dark:text-sig-cream font-bold text-xs shadow-sig-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-black text-sig-black dark:text-sig-cream uppercase mb-1">
                    Shelf Vault Location
                  </label>
                  <select
                    value={newReagent.shelf_id}
                    onChange={(e) =>
                      setNewReagent({ ...newReagent, shelf_id: e.target.value })
                    }
                    className="w-full bg-white dark:bg-[#24222E] border-2 border-sig-black rounded-2xl px-3 py-2.5 text-sig-black dark:text-sig-cream font-bold text-xs shadow-sig-sm"
                  >
                    {shelves.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) {s.description ? `- ${s.description}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="flex-1 py-3 rounded-full border-2 border-sig-black bg-white dark:bg-[#24222E] text-sig-black dark:text-sig-cream font-sans text-xs font-black uppercase tracking-wider shadow-sig-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-sig-limon text-sig-black border-2 border-sig-black font-sans text-xs font-black uppercase tracking-wider shadow-sig hover:shadow-sig-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Catalog Reagent
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ArcaneSparkles active={sparklesActive} onComplete={() => setSparklesActive(false)} />
    </div>
  );
};
