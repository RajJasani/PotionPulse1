'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Anomaly {
  id: string;
  title: string;
  ingredientName: string;
  type: 'CONSUMPTION_SPIKE' | 'SHRINKAGE' | 'NEGATIVE_PREVENTION' | 'OFF_HOURS_MOVEMENT';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  detectedAt: string;
  expectedValue: string;
  observedValue: string;
  deviation: string;
  description: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([
    {
      id: 'anom-001',
      title: 'Sudden Consumption Surge Detected',
      ingredientName: 'Bat Wings',
      type: 'CONSUMPTION_SPIKE',
      severity: 'CRITICAL',
      status: 'OPEN',
      detectedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      expectedValue: '12 units / day',
      observedValue: '68 units / 4 hours',
      deviation: '+466% (3.8σ spike)',
      description:
        'Consumption rate exceeded 3.5 standard deviations above 30-day baseline without corresponding purchase orders recorded.',
    },
    {
      id: 'anom-002',
      title: 'Unexplained Stock Shrinkage',
      ingredientName: 'Phoenix Feather',
      type: 'SHRINKAGE',
      severity: 'WARNING',
      status: 'OPEN',
      detectedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
      expectedValue: '25 units (ledger)',
      observedValue: '18 units (shelf audit)',
      deviation: '-28% discrepancy',
      description:
        'Physical count on Vault Shelf A-1 was lower than ledger balance by 7 units. Possible unaccounted spill or shrinkage.',
    },
    {
      id: 'anom-003',
      title: 'Negative Balance Attempt Blocked',
      ingredientName: 'Ghost Pepper Essence',
      type: 'NEGATIVE_PREVENTION',
      severity: 'CRITICAL',
      status: 'ACKNOWLEDGED',
      detectedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      expectedValue: '>= 0 balance constraint',
      observedValue: 'Deduction of 15 from 4 on-hand',
      deviation: 'Enforced Atomically',
      description:
        'An API sale request attempted to dispense 15 units when only 4 remained. The transaction was rejected safely by ACID transaction safeguards.',
    },
    {
      id: 'anom-004',
      title: 'Off-Hours Manual Stock Adjustment',
      ingredientName: 'Mandrake Root',
      type: 'OFF_HOURS_MOVEMENT',
      severity: 'INFO',
      status: 'RESOLVED',
      detectedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      expectedValue: 'Business hours (08:00 - 20:00)',
      observedValue: 'Adjustment at 03:14 AM',
      deviation: 'Temporal anomaly',
      description: 'Stock increase adjustment entered during closed hours. Verified as emergency shipment receipt.',
      resolvedBy: 'Archmage Theron (Owner)',
      resolutionNote: 'Emergency delivery received from Northern Foragers Guild.',
    },
  ]);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');

  const handleAcknowledge = (id: string) => {
    setAnomalies(
      anomalies.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a)),
    );
  };

  const handleResolve = (id: string) => {
    if (!resolutionInput.trim()) return;
    setAnomalies(
      anomalies.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'RESOLVED',
              resolvedBy: 'Active User',
              resolutionNote: resolutionInput.trim(),
            }
          : a,
      ),
    );
    setSelectedAnomaly(null);
    setResolutionInput('');
  };

  const filtered = anomalies.filter((a) => (statusFilter === 'ALL' ? true : a.status === statusFilter));

  const openCount = anomalies.filter((a) => a.status === 'OPEN').length;
  const criticalCount = anomalies.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="sticker-tag bg-hackRed text-white text-[10px]">
                LEDGER INTEGRITY
              </span>
              <span className="font-mono text-xs font-bold text-ink/70">
                // AUTOMATED ANOMALY RADAR
              </span>
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight flex items-center gap-2">
              <span>🛡️</span> Anomaly Monitoring & Integrity Guard
            </h1>
            <p className="text-xs text-ink/70 font-medium mt-1">
              Statistical detection engine flagging sudden consumption spikes (&gt;3.5σ), shrinkage, and ledger divergences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
              className="flex items-center gap-1.5 font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-scan Ledger</span>
            </Button>
          </div>
        </div>

        {/* Status Ribbons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border-2 border-ink bg-rose-50 shadow-retro flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-hackRed text-white border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl font-bold">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-hackRed">Active Critical Alerts</p>
              <p className="text-2xl font-black text-hackRed">{criticalCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-ink bg-amber-50 shadow-retro flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-hackAmber border-2 border-ink shadow-retro-sm flex items-center justify-center text-ink text-xl font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-ink/70">Unresolved Open</p>
              <p className="text-2xl font-black text-ink">{openCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-ink bg-emerald-50 shadow-retro flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-hackMint border-2 border-ink shadow-retro-sm flex items-center justify-center text-ink text-xl font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono font-black text-ink/70">Ledger Safeguards</p>
              <p className="text-2xl font-black text-hackMint">Enforcing ACID</p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black transition-all border-2 border-ink ${
                statusFilter === filter
                  ? 'bg-hackOrange text-white shadow-retro-sm'
                  : 'bg-sand text-ink hover:bg-cream'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Anomaly Cards List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center font-mono font-bold text-ink/60 bg-white rounded-xl border-2 border-ink shadow-retro">
              No anomalies found in this category. All ledger checks passing normal thresholds.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border-2 border-ink shadow-retro transition-all bg-white ${
                  item.severity === 'CRITICAL'
                    ? 'border-l-8 border-l-hackRed'
                    : item.severity === 'WARNING'
                    ? 'border-l-8 border-l-hackAmber'
                    : 'border-l-8 border-l-hackMint'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-base text-ink">{item.title}</h3>
                      <span className="sticker-tag bg-sand text-ink font-mono text-[10px]">
                        {item.ingredientName}
                      </span>
                      {item.severity === 'CRITICAL' && <Badge variant="danger">Critical</Badge>}
                      {item.severity === 'WARNING' && <Badge variant="warning">Warning</Badge>}
                      {item.severity === 'INFO' && <Badge variant="outline">Info</Badge>}
                      <Badge
                        variant={
                          item.status === 'OPEN'
                            ? 'danger'
                            : item.status === 'ACKNOWLEDGED'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-ink/80 font-medium">{item.description}</p>

                    {/* Evidence Comparison Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-sand border-2 border-ink/30">
                        <span className="text-ink/60 block text-[10px] uppercase font-bold">
                          Expected Value
                        </span>
                        <span className="text-ink font-bold">{item.expectedValue}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 border-2 border-ink/30">
                        <span className="text-ink/60 block text-[10px] uppercase font-bold">
                          Observed Value
                        </span>
                        <span className="text-hackOrange font-bold">
                          {item.observedValue}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-rose-50 border-2 border-ink/30">
                        <span className="text-ink/60 block text-[10px] uppercase font-bold">
                          Deviation / Significance
                        </span>
                        <span className="text-hackRed font-bold">{item.deviation}</span>
                      </div>
                    </div>

                    {item.resolutionNote && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border-2 border-ink/30 text-xs">
                        <span className="font-bold text-hackMint block font-mono">
                          Resolved by {item.resolvedBy}:
                        </span>
                        <span className="text-ink/80">{item.resolutionNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Timestamp */}
                  <div className="flex flex-col items-end justify-between shrink-0 space-y-3">
                    <span className="text-[11px] text-ink/60 flex items-center gap-1 font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-hackOrange" />
                      {formatDateTime(item.detectedAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.status === 'OPEN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(item.id)}
                          className="h-8 px-2.5 text-xs font-bold"
                        >
                          Acknowledge
                        </Button>
                      )}
                      {item.status !== 'RESOLVED' && (
                        <Button
                          size="sm"
                          variant="mint"
                          onClick={() => {
                            setSelectedAnomaly(item);
                            setResolutionInput('');
                          }}
                          className="h-8 px-2.5 text-xs font-black flex items-center gap-1 text-ink"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resolution Modal */}
        {selectedAnomaly && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 bg-white border-3 border-ink shadow-retro-xl rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <h3 className="text-lg font-black text-ink flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-hackMint" />
                  Resolve Anomaly
                </h3>
                <button
                  onClick={() => setSelectedAnomaly(null)}
                  className="w-8 h-8 rounded-lg border-2 border-ink bg-sand flex items-center justify-center text-ink hover:bg-cream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-xs text-ink/70 mb-2 font-medium">
                  Resolving <strong className="text-ink">{selectedAnomaly.title}</strong> for{' '}
                  <span className="text-hackOrange font-bold">{selectedAnomaly.ingredientName}</span>.
                </p>
                <label className="block text-xs font-mono font-black text-ink mb-1">
                  Resolution / Investigation Note
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this occurred (e.g. verified recipe batch, vendor correction)..."
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  className="w-full p-2.5 bg-cream border-2 border-ink rounded-xl text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-hackMint"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-ink">
                <Button variant="outline" size="sm" onClick={() => setSelectedAnomaly(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="mint"
                  disabled={!resolutionInput.trim()}
                  onClick={() => handleResolve(selectedAnomaly.id)}
                  className="font-black text-ink"
                >
                  Mark as Resolved
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
