'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeftRight, ArrowLeft, RefreshCw, Filter, PlusCircle } from 'lucide-react';

export default function StockMovementsPage() {
  const { activeTenant, accessToken } = useAuth();
  const [movements, setMovements] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    if (!activeTenant?.id || !accessToken) return;
    setLoading(true);
    try {
      const res = await apiClient<any[]>('/inventory/movements', {
        token: accessToken,
        tenantId: activeTenant.id,
        params: {
          type: typeFilter !== 'ALL' ? typeFilter : undefined,
          page,
          limit: 15,
        },
      });

      setMovements(res.data || []);
      if (res.meta?.totalPages) {
        setTotalPages(res.meta.totalPages);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [activeTenant?.id, accessToken, typeFilter, page]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-3">
            <Button href="/inventory" variant="outline" size="sm" className="h-9 px-2.5 text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Inventory
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                  DOUBLE-ENTRY LEDGER
                </span>
                <span className="font-mono text-xs font-bold text-ink/70">
                  // AUDIT TRAIL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
                <ArrowLeftRight className="w-6 h-6 text-hackOrange" />
                Immutable Stock Movement Ledger
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button href="/inventory/adjust" size="sm" variant="orange" className="text-xs font-black flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              Post Movement
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchMovements}
              className="text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-3 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[10px] font-mono font-black uppercase text-ink/70 flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3 h-3" />
              Movement Type:
            </span>
            {['ALL', 'RECEIPT', 'SALE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RETURN', 'WASTAGE'].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => {
                    setTypeFilter(type);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border-2 border-ink shrink-0 ${
                    typeFilter === type
                      ? 'bg-hackOrange text-white shadow-retro-sm'
                      : 'bg-sand text-ink hover:bg-cream'
                  }`}
                >
                  {type}
                </button>
              ),
            )}
          </div>
        </Card>

        {/* Movements Table */}
        <div className="bg-white border-2 border-ink rounded-xl shadow-retro overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-ink font-medium">
              <thead>
                <tr className="border-b-2 border-ink bg-sand text-ink uppercase font-mono text-[10px] font-black tracking-wider">
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Delta</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                  <th className="py-3 px-4">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-ink/20 font-mono">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ink/60 font-bold">
                      {loading ? 'Consulting ledger records...' : 'No ledger movements found.'}
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-sand/60 transition-colors">
                      <td suppressHydrationWarning className="py-3 px-4 text-ink/75 whitespace-nowrap">
                        {formatDateTime(m.occurredAt)}
                      </td>
                      <td className="py-3 px-4 font-sans font-black text-ink">
                        <Link href={`/inventory/${m.ingredientId}`} className="hover:text-hackOrange">
                          {m.ingredientName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-ink/75">
                        {m.locationCode || 'Vault Shelf'}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <Badge
                          variant={
                            m.type === 'RECEIPT'
                              ? 'success'
                              : m.type === 'SALE'
                              ? 'purple'
                              : m.type === 'RETURN'
                              ? 'orange'
                              : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {m.type}
                        </Badge>
                      </td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          m.quantityDelta > 0 ? 'text-hackMint' : 'text-hackRed'
                        }`}
                      >
                        {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta} {m.unit}
                      </td>
                      <td className="py-3 px-4 font-bold text-ink">
                        {m.balanceAfter} {m.unit}
                      </td>
                      <td className="py-3 px-4 text-ink/80 max-w-xs truncate font-sans text-xs" title={m.reason}>
                        {m.reason}
                      </td>
                      <td className="py-3 px-4 text-ink/75 font-sans">
                        {m.actor?.displayName || 'System'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3.5 border-t-2 border-ink bg-sand/40 flex items-center justify-between text-xs font-mono font-bold text-ink">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-3 text-xs"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-3 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
