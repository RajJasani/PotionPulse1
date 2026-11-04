'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface CartItem {
  ingredientId: string;
  name: string;
  sku: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
}

export default function NewSalePage() {
  const { activeTenant, accessToken } = useAuth();
  const router = useRouter();

  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saleNumber, setSaleNumber] = useState('SALE-000000');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState<any | null>(null);

  useEffect(() => {
    setSaleNumber(`SALE-${Date.now().toString().slice(-6)}`);
  }, []);

  // Fetch ingredients
  useEffect(() => {
    if (!activeTenant?.id || !accessToken) return;
    setLoading(true);
    apiClient<any>('/ingredients', { token: accessToken, tenantId: activeTenant.id })
      .then((res) => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw as any)?.items || [];
        setIngredients(list);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load catalog');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeTenant?.id, accessToken]);

  // Cart operations
  const addToCart = (ing: any) => {
    const existing = cart.find((item) => item.ingredientId === ing.id);
    const available = Number(ing.onHand || 0);

    if (existing) {
      if (existing.quantity + 1 > available) {
        alert(`Cannot add more. Only ${available} ${ing.unit} in stock.`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.ingredientId === ing.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      if (available <= 0) {
        alert('This ingredient is out of stock.');
        return;
      }
      const retailPrice = Number(ing.costPerUnit || 10) * 1.5;
      setCart([
        ...cart,
        {
          ingredientId: ing.id,
          name: ing.name,
          sku: ing.sku,
          unit: ing.unit,
          unitPrice: Math.round(retailPrice * 100) / 100,
          quantity: 1,
          availableStock: available,
        },
      ]);
    }
  };

  const updateQuantity = (ingredientId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(ingredientId);
      return;
    }
    const item = cart.find((i) => i.ingredientId === ingredientId);
    if (item && newQty > item.availableStock) {
      alert(`Cannot exceed on-hand balance of ${item.availableStock} ${item.unit}.`);
      return;
    }
    setCart(
      cart.map((i) => (i.ingredientId === ingredientId ? { ...i, quantity: newQty } : i)),
    );
  };

  const removeFromCart = (ingredientId: string) => {
    setCart(cart.filter((item) => item.ingredientId !== ingredientId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [cart],
  );
  const tax = subtotal * 0.05; // 5% mystical apothecary levy
  const grandTotal = subtotal + tax;

  // Submit sale
  const handleCompleteSale = async () => {
    if (cart.length === 0 || !activeTenant?.id || !accessToken) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      saleNumber: saleNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      items: cart.map((i) => ({
        ingredientId: i.ingredientId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      idempotencyKey: `pos-${saleNumber}-${Date.now()}`,
    };

    try {
      const res = await apiClient<any>('/sales', {
        method: 'POST',
        token: accessToken,
        tenantId: activeTenant.id,
        body: payload,
      });
      setSaleSuccess(res.data);
      setCart([]);
    } catch (err: any) {
      setError(err.message || 'Failed to complete sale transaction');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered ingredients
  const filteredIngredients = (Array.isArray(ingredients) ? ingredients : []).filter((ing) => {
    const matchesSearch =
      ing.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || ing.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', 'BOTANICAL', 'MINERAL', 'CREATURE', 'ESSENCE', 'SOLVENT'];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-3">
            <Button href="/sales" variant="outline" size="sm" className="h-10 w-10 p-0 font-bold">
              <ArrowLeft className="w-5 h-5 text-ink" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                  CASHIER TERMINAL
                </span>
                <span className="font-mono text-xs font-bold text-ink/70">
                  // POS REAL-TIME DISPENSING
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
                <span>🛒</span> Point of Sale Register
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="sticker-tag bg-hackMint text-ink flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Register Online
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-hackRed/10 border-2 border-ink rounded-xl text-hackRed text-xs font-mono font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* POS Grid: Catalog on Left (8 cols), Cart on Right (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Catalog Section */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-4 space-y-3 bg-white">
              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border-2 border-ink ${
                      selectedCategory === cat
                        ? 'bg-hackOrange text-white shadow-retro-sm'
                        : 'bg-sand text-ink hover:bg-cream'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" />
                <input
                  type="text"
                  placeholder="Search catalog by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-cream border-2 border-ink rounded-xl text-xs font-mono font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-hackOrange shadow-retro-sm"
                />
              </div>
            </Card>

            {/* Ingredients Grid */}
            {loading ? (
              <div className="py-12 text-center font-mono font-bold text-ink/70">
                Loading ingredients catalog...
              </div>
            ) : filteredIngredients.length === 0 ? (
              <div className="py-12 text-center font-mono font-bold text-ink/70 bg-white rounded-xl border-2 border-ink shadow-retro">
                No matching ingredients found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredIngredients.map((ing) => {
                  const onHand = Number(ing.onHand || 0);
                  const isOutOfStock = onHand <= 0;
                  const estimatedRetail = Math.round(Number(ing.costPerUnit || 10) * 1.5 * 100) / 100;

                  return (
                    <div
                      key={ing.id}
                      className={`p-4 rounded-xl border-2 border-ink flex flex-col justify-between transition-all bg-white shadow-retro-sm hover:shadow-retro ${
                        isOutOfStock ? 'opacity-60 bg-sand' : ''
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-black text-sm text-ink line-clamp-1">{ing.name}</h4>
                          <span className="sticker-tag bg-sand text-ink text-[9px] py-0 px-1 border-ink">
                            {ing.category}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-bold text-ink/60">SKU: {ing.sku || '—'}</p>
                        <div className="flex items-center justify-between text-xs pt-1 font-mono">
                          <span className="text-ink/70">Stock:</span>
                          <span
                            className={`font-black ${
                              isOutOfStock
                                ? 'text-hackRed'
                                : onHand <= (ing.safetyStock || 5)
                                ? 'text-hackOrange'
                                : 'text-hackMint'
                            }`}
                          >
                            {onHand} {ing.unit}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t-2 border-ink/15 flex items-center justify-between">
                        <span className="text-base font-black text-ink font-mono">
                          {formatCurrency(estimatedRetail)}
                        </span>
                        <Button
                          size="sm"
                          disabled={isOutOfStock}
                          onClick={() => addToCart(ing)}
                          variant="orange"
                          className="h-8 px-2.5 text-xs font-black flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Cart / Order Ticket */}
          <div className="lg:col-span-4">
            <div className="p-5 space-y-4 sticky top-20 bg-white border-2 border-ink shadow-retro rounded-xl">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-hackOrange" />
                  <h3 className="font-black text-ink">Register Ticket</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-mono font-black text-hackRed hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Order Meta */}
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] uppercase font-mono font-black text-ink/70 block mb-1">
                    Sale Reference
                  </label>
                  <input
                    type="text"
                    value={saleNumber}
                    onChange={(e) => setSaleNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-cream border-2 border-ink rounded-lg text-xs text-ink font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono font-black text-ink/70 block mb-1">
                    Customer / Note
                  </label>
                  <input
                    type="text"
                    placeholder="Walk-in, wizard order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-cream border-2 border-ink rounded-lg text-xs text-ink font-medium placeholder:text-ink/40"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono font-bold text-ink/50 border-2 border-dashed border-ink/30 rounded-lg">
                    Ticket is empty.
                    <br />
                    Select ingredients from the catalog.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.ingredientId}
                      className="p-2.5 bg-sand/60 rounded-lg border-2 border-ink space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-black text-ink line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-ink/70 font-mono">
                            {formatCurrency(item.unitPrice)} / {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.ingredientId)}
                          className="text-ink/60 hover:text-hackRed p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border-2 border-ink rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(item.ingredientId, item.quantity - 1)}
                            className="px-2 py-0.5 text-ink hover:bg-sand"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-black font-mono text-ink">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.ingredientId, item.quantity + 1)}
                            className="px-2 py-0.5 text-ink hover:bg-sand"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-ink font-mono">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Summary Calculations */}
              {cart.length > 0 && (
                <div className="pt-3 border-t-2 border-ink space-y-1.5 text-xs font-mono font-bold">
                  <div className="flex justify-between text-ink/70">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-ink/70">
                    <span>Apothecary Levy (5%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-ink pt-2 border-t-2 border-ink">
                    <span>Total Due</span>
                    <span className="text-hackOrange font-mono text-lg">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              )}

              {/* Complete Checkout Button */}
              <Button
                disabled={cart.length === 0 || submitting}
                onClick={handleCompleteSale}
                variant="mint"
                className="w-full py-3 text-ink font-black flex items-center justify-center gap-2"
              >
                {submitting ? (
                  'Deducting Inventory...'
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-ink" />
                    Complete Sale ({formatCurrency(grandTotal)})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Receipt Success Dialog */}
        {saleSuccess && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 bg-white border-3 border-ink shadow-retro-xl rounded-2xl space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-hackMint border-2 border-ink shadow-retro-sm flex items-center justify-center text-ink text-2xl font-bold">
                ✓
              </div>

              <div>
                <h3 className="text-xl font-black text-ink">Sale Completed Successfully!</h3>
                <p className="text-xs text-ink/70 mt-1 font-mono font-bold">
                  Receipt #{saleSuccess.saleNumber || saleNumber}
                </p>
                <p className="text-xs text-hackMint font-mono font-bold mt-1">
                  ✓ Stock ledger balances automatically deducted.
                </p>
              </div>

              <div className="bg-sand rounded-xl p-4 border-2 border-ink text-left space-y-2 text-xs font-mono font-bold text-ink">
                <div className="flex justify-between text-ink/70">
                  <span>Total Amount Paid:</span>
                  <span className="font-black text-hackOrange text-base">
                    {formatCurrency(saleSuccess.totalAmount || grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-ink/70">
                  <span>Items Dispensed:</span>
                  <span className="text-ink font-black">
                    {saleSuccess.items?.length || 1} line item(s)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSaleSuccess(null);
                    setSaleNumber(`SALE-${Date.now().toString().slice(-6)}`);
                  }}
                >
                  New Transaction
                </Button>
                <Button
                  size="sm"
                  variant="orange"
                  onClick={() => router.push('/sales')}
                >
                  View in Sales Ledger
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
