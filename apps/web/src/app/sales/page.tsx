'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  ShoppingCart,
  PlusCircle,
  RefreshCw,
  Search,
  Eye,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Receipt,
  X,
} from 'lucide-react';

interface SaleItem {
  ingredientId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  ingredient?: {
    name: string;
    sku: string;
    unit: string;
  };
}

interface Sale {
  id: string;
  saleNumber: string;
  status: 'COMPLETED' | 'REFUNDED' | 'CANCELLED';
  totalAmount: number;
  itemCount: number;
  items: SaleItem[];
  notes?: string;
  refundReason?: string;
  createdAt: string;
}

export default function SalesPage() {
  const { activeTenant, accessToken } = useAuth();
  const { socket } = useSocket();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected sale for detail modal
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Refund modal state
  const [refundingSale, setRefundingSale] = useState<Sale | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [restockInventory, setRestockInventory] = useState(true);
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const fetchSales = useCallback(async () => {
    if (!activeTenant?.id || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<Sale[]>(`/sales?page=${page}&limit=15`, {
        token: accessToken,
        tenantId: activeTenant.id,
      });
      const rawSales = res.data;
      setSales(Array.isArray(rawSales) ? rawSales : (rawSales as any)?.items || []);
      if (res.meta) {
        setTotalPages(Math.ceil((res.meta.total || 0) / (res.meta.limit || 15)) || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  }, [activeTenant?.id, accessToken, page]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Live WebSocket updates
  useEffect(() => {
    if (!socket) return;
    const handleSaleEvent = () => {
      fetchSales();
    };
    socket.on('sale.created', handleSaleEvent);
    socket.on('sale.refunded', handleSaleEvent);
    return () => {
      socket.off('sale.created', handleSaleEvent);
      socket.off('sale.refunded', handleSaleEvent);
    };
  }, [socket, fetchSales]);

  // Open detail view
  const handleViewDetails = async (saleId: string) => {
    if (!activeTenant?.id || !accessToken) return;
    setDetailLoading(true);
    try {
      const res = await apiClient<Sale>(`/sales/${saleId}`, {
        token: accessToken,
        tenantId: activeTenant.id,
      });
      setSelectedSale(res.data);
    } catch (err: any) {
      alert(`Could not load sale detail: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  // Submit refund
  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingSale || !activeTenant?.id || !accessToken) return;
    setRefundSubmitting(true);
    try {
      await apiClient(`/sales/${refundingSale.id}/refunds`, {
        method: 'POST',
        token: accessToken,
        tenantId: activeTenant.id,
        body: {
          restock: restockInventory,
          reason: refundReason || 'Customer return',
        },
      });
      setRefundingSale(null);
      setRefundReason('');
      fetchSales();
    } catch (err: any) {
      alert(`Refund failed: ${err.message}`);
    } finally {
      setRefundSubmitting(false);
    }
  };

  // KPI calculations
  const totalRevenue = sales.reduce((acc, s) => acc + (s.status === 'COMPLETED' ? s.totalAmount : 0), 0);
  const completedCount = sales.filter((s) => s.status === 'COMPLETED').length;
  const refundedCount = sales.filter((s) => s.status === 'REFUNDED').length;

  const filteredSales = sales.filter(
    (s) =>
      s.saleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                TRANSACTIONS // POS
              </span>
              <span className="font-mono text-xs font-bold text-ink/70">
                // REAL-TIME AUDITED REGISTER
              </span>
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight flex items-center gap-2">
              <span>🛒</span> Sales & POS Transactions
            </h1>
            <p className="text-xs text-ink/70 font-medium mt-1">
              Live transaction ledger with atomic stock deduction and instant receipt issuance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSales}
              disabled={loading}
              className="flex items-center gap-1.5 font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </Button>
            <Button href="/sales/new" size="sm" variant="orange" className="flex items-center gap-1.5 font-black">
              <PlusCircle className="w-4 h-4" />
              <span>Open POS Register</span>
            </Button>
          </div>
        </div>

        {/* KPI Metrics - 3 Distinct Retro Color Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border-2 border-ink bg-amber-50 p-5 shadow-retro flex items-center gap-4 transition-transform hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-hackAmber border-2 border-ink shadow-retro-sm flex items-center justify-center text-ink text-2xl font-bold">
              💰
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-ink/70 tracking-wider">Page Revenue</p>
              <p className="text-2xl font-black text-ink">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>

          <div className="rounded-xl border-2 border-ink bg-emerald-50 p-5 shadow-retro flex items-center gap-4 transition-transform hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-hackMint border-2 border-ink shadow-retro-sm flex items-center justify-center text-ink text-2xl font-bold">
              ✓
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-ink/70 tracking-wider">Completed Sales</p>
              <p className="text-2xl font-black text-ink">{completedCount}</p>
            </div>
          </div>

          <div className="rounded-xl border-2 border-ink bg-rose-50 p-5 shadow-retro flex items-center gap-4 transition-transform hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-hackRed text-white border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl font-bold">
              ↺
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-hackRed tracking-wider">Refunded Orders</p>
              <p className="text-2xl font-black text-hackRed">{refundedCount}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" />
            <input
              type="text"
              placeholder="Search by sale number or customer notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-cream border-2 border-ink rounded-xl text-xs font-mono font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-hackOrange shadow-retro-sm"
            />
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white border-2 border-ink rounded-xl shadow-retro overflow-hidden">
          {error && (
            <div className="p-3 bg-hackRed/10 border-b-2 border-ink text-hackRed font-mono text-xs font-bold">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink font-medium">
              <thead className="bg-sand text-ink uppercase font-mono text-[10px] font-black tracking-wider border-b-2 border-ink">
                <tr>
                  <th className="py-3 px-4">Sale Number</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-ink/20">
                {loading && sales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink/60 font-mono font-bold">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-hackOrange mb-2" />
                      Loading sales ledger...
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink/60 font-mono font-bold">
                      <Receipt className="w-8 h-8 mx-auto text-ink/30 mb-2" />
                      No sales recorded yet. Click &apos;Open POS Register&apos; to process your first order.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-sand/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-ink">
                        {sale.saleNumber}
                      </td>
                      <td suppressHydrationWarning className="py-3 px-4 font-mono text-ink/75">
                        {formatDateTime(sale.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-ink">{sale.itemCount || sale.items?.length || 1}</span> items
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-ink text-sm">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        {sale.status === 'COMPLETED' && (
                          <Badge variant="success" className="flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </Badge>
                        )}
                        {sale.status === 'REFUNDED' && (
                          <Badge variant="warning" className="flex items-center gap-1 w-fit">
                            <RotateCcw className="w-3 h-3" />
                            Refunded
                          </Badge>
                        )}
                        {sale.status === 'CANCELLED' && (
                          <Badge variant="danger" className="flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            Cancelled
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(sale.id)}
                          className="h-8 px-2.5 text-xs font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                        {sale.status === 'COMPLETED' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setRefundingSale(sale);
                              setRefundReason('');
                              setRestockInventory(true);
                            }}
                            className="h-8 px-2.5 text-xs font-bold"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3.5 border-t-2 border-ink bg-sand/40 flex items-center justify-between text-xs font-mono font-bold text-ink">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedSale && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg p-6 bg-white border-3 border-ink shadow-retro-xl rounded-2xl space-y-4 text-ink">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <div>
                  <h3 className="text-lg font-black text-ink flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-hackOrange" />
                    Sale Details
                  </h3>
                  <p className="text-xs font-mono font-bold text-ink/70">{selectedSale.saleNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="w-8 h-8 rounded-lg border-2 border-ink bg-sand flex items-center justify-center text-ink hover:bg-cream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {detailLoading ? (
                <div className="py-8 text-center font-mono text-ink/70">Loading order details...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs bg-sand p-3.5 rounded-xl border-2 border-ink">
                    <div>
                      <span className="font-mono text-ink/70 block uppercase text-[10px]">Date</span>
                      <span suppressHydrationWarning className="text-ink font-mono font-bold">{formatDateTime(selectedSale.createdAt)}</span>
                    </div>
                    <div>
                      <span className="font-mono text-ink/70 block uppercase text-[10px]">Status</span>
                      <Badge variant={selectedSale.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {selectedSale.status}
                      </Badge>
                    </div>
                    {selectedSale.notes && (
                      <div className="col-span-2 mt-1">
                        <span className="font-mono text-ink/70 block uppercase text-[10px]">Notes</span>
                        <span className="text-ink font-bold">{selectedSale.notes}</span>
                      </div>
                    )}
                    {selectedSale.refundReason && (
                      <div className="col-span-2 mt-1 text-hackRed">
                        <span className="font-mono font-black block uppercase text-[10px]">Refund Reason:</span>
                        <span className="font-bold">{selectedSale.refundReason}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-mono font-black uppercase text-ink/70 mb-2">Line Items</h4>
                    <div className="border-2 border-ink rounded-xl divide-y-2 border-ink overflow-hidden">
                      {selectedSale.items?.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs bg-cream">
                          <div>
                            <p className="font-black text-ink">
                              {item.ingredient?.name || `Ingredient #${item.ingredientId.slice(-6)}`}
                            </p>
                            <p className="text-ink/60 font-mono text-[11px]">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <span className="font-black text-ink font-mono text-sm">
                            {formatCurrency(item.subtotal || item.quantity * item.unitPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t-2 border-ink flex items-center justify-between text-base font-black text-ink">
                    <span>Total Amount</span>
                    <span className="text-hackOrange font-mono text-xl">{formatCurrency(selectedSale.totalAmount)}</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedSale(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refund Processing Modal */}
        {refundingSale && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 bg-white border-3 border-ink shadow-retro-xl rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <h3 className="text-lg font-black text-hackRed flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-hackRed" />
                  Refund Sale #{refundingSale.saleNumber}
                </h3>
                <button
                  onClick={() => setRefundingSale(null)}
                  className="w-8 h-8 rounded-lg border-2 border-ink bg-sand flex items-center justify-center text-ink hover:bg-cream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleProcessRefund} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-black text-ink mb-1">
                    Refund Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe reason for returning items..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full p-2.5 bg-cream border-2 border-ink rounded-xl text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-hackRed shadow-retro-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="restockCheckbox"
                    checked={restockInventory}
                    onChange={(e) => setRestockInventory(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-ink accent-hackOrange"
                  />
                  <label htmlFor="restockCheckbox" className="text-xs font-mono font-bold text-ink cursor-pointer">
                    Restock inventory ledger with returned items
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRefundingSale(null)}
                    disabled={refundSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                    disabled={refundSubmitting || !refundReason.trim()}
                  >
                    {refundSubmitting ? 'Processing...' : 'Confirm Refund'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
