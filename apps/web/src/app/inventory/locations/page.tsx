'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import { Layers, Plus, ArrowLeft, RefreshCw } from 'lucide-react';

export default function LocationsPage() {
  const { activeTenant, accessToken } = useAuth();
  const [locations, setLocations] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('shelf');
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    if (!activeTenant?.id || !accessToken) return;
    setLoading(true);
    try {
      const res = await apiClient<any>('/locations', {
        token: accessToken,
        tenantId: activeTenant.id,
      });
      const raw = res.data;
      setLocations(Array.isArray(raw) ? raw : (raw as any)?.items || []);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [activeTenant?.id, accessToken]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      setError('Please provide location name and code.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiClient('/locations', {
        method: 'POST',
        token: accessToken || undefined,
        tenantId: activeTenant?.id,
        body: JSON.stringify({
          name,
          code: code.toUpperCase(),
          type,
          isDefault,
        }),
      });

      setName('');
      setCode('');
      setIsDefault(false);
      fetchLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to create location.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-3">
            <Button href="/inventory" variant="outline" size="sm" className="h-9 px-2.5 text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                  STORAGE STRUCTURE
                </span>
                <span className="font-mono text-xs font-bold text-ink/70">
                  // VAULT ZONING
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
                <Layers className="w-6 h-6 text-hackOrange" />
                Shelves & Storage Locations
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchLocations}
            className="text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Location Card */}
          <div className="bg-white border-2 border-ink shadow-retro rounded-xl p-5 h-fit">
            <div className="border-b-2 border-ink pb-3 mb-4">
              <h2 className="text-base font-black text-ink flex items-center gap-2 font-mono">
                <Plus className="w-4 h-4 text-hackOrange" />
                Add Shelf / Location
              </h2>
              <p className="text-xs text-ink/70 font-medium mt-1">
                Define new physical storage zones with a unique code within this shop.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border-2 border-ink text-hackRed text-xs font-mono font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono font-bold">
              <Input
                label="Location Name"
                placeholder="e.g. Cauldron Storage Shelf B"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Location Code"
                placeholder="e.g. SHELF-B2"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                helperText="Unique uppercase identifier"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-black uppercase tracking-wider text-ink/70">
                  Storage Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-11 rounded-xl border-2 border-ink bg-cream px-4 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                >
                  <option value="shelf">Shelf</option>
                  <option value="room">Storage Room</option>
                  <option value="bin">Ingredient Bin</option>
                  <option value="refrigerator">Cold Storage / Refrigerator</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-2 border-ink accent-hackOrange"
                />
                <span className="text-ink text-xs font-mono font-bold">Set as default intake shelf</span>
              </label>

              <Button type="submit" variant="orange" className="w-full mt-2 font-black" isLoading={submitting}>
                Create Storage Location
              </Button>
            </form>
          </div>

          {/* Locations List */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-ink rounded-xl shadow-retro overflow-hidden">
              <div className="p-4 border-b-2 border-ink bg-sand flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-ink font-mono uppercase">Active Storage Shelves</h3>
                  <p className="text-xs text-ink/70 font-medium">Locations configured for physical balance tracking.</p>
                </div>
                <span className="sticker-tag bg-white text-ink text-[10px]">
                  {locations.length} SHELVES
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-ink font-medium">
                  <thead>
                    <tr className="border-b-2 border-ink bg-cream text-ink uppercase font-mono text-[10px] font-black tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Default</th>
                      <th className="py-3 px-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 border-ink/20 font-mono">
                    {locations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-ink/60 font-bold">
                          No locations configured yet.
                        </td>
                      </tr>
                    ) : (
                      locations.map((loc) => (
                        <tr key={loc.id} className="hover:bg-sand/60 transition-colors">
                          <td className="py-3 px-4 font-sans font-black text-ink">{loc.name}</td>
                          <td className="py-3 px-4 font-bold text-hackOrange">{loc.code}</td>
                          <td className="py-3 px-4 text-ink capitalize">{loc.type}</td>
                          <td className="py-3 px-4">
                            {loc.isDefault ? (
                              <Badge variant="success">Default Shelf</Badge>
                            ) : (
                              <span className="text-ink/40">—</span>
                            )}
                          </td>
                          <td suppressHydrationWarning className="py-3 px-4 text-ink/70">{formatDateTime(loc.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
