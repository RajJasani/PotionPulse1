'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import {
  Truck,
  PlusCircle,
  Search,
  Star,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  leadTimeDays: number;
  rating: number;
  paymentTerms: string;
  categories: string[];
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: 'sup-001',
      name: 'Northern Foragers Guild',
      code: 'NFG-01',
      contactEmail: 'orders@northernforagers.realm',
      contactPhone: '+1 (555) 482-9102',
      leadTimeDays: 4,
      rating: 4.8,
      paymentTerms: 'Net 30',
      categories: ['BOTANICAL', 'ESSENCE'],
    },
    {
      id: 'sup-002',
      name: 'Obsidian Cavern Miners Co.',
      code: 'OCM-02',
      contactEmail: 'supply@obsidianminers.realm',
      contactPhone: '+1 (555) 392-1144',
      leadTimeDays: 7,
      rating: 4.5,
      paymentTerms: 'Net 15',
      categories: ['MINERAL'],
    },
    {
      id: 'sup-003',
      name: 'Midnight Aviary & Chiroptera',
      code: 'MAC-03',
      contactEmail: 'batwings@midnightaviary.realm',
      contactPhone: '+1 (555) 902-8819',
      leadTimeDays: 3,
      rating: 4.9,
      paymentTerms: 'Due on Receipt',
      categories: ['CREATURE'],
    },
    {
      id: 'sup-004',
      name: 'Alchemical Distillates Syndicate',
      code: 'ADS-04',
      contactEmail: 'orders@alchemicalsyndicate.realm',
      contactPhone: '+1 (555) 203-9941',
      leadTimeDays: 5,
      rating: 4.7,
      paymentTerms: 'Net 30',
      categories: ['SOLVENT', 'ESSENCE'],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [leadTime, setLeadTime] = useState(4);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      contactEmail: email,
      contactPhone: phone,
      leadTimeDays: Number(leadTime),
      rating: 5.0,
      paymentTerms,
      categories: ['BOTANICAL'],
    };
    setSuppliers([newSup, ...suppliers]);
    setShowAddModal(false);
    setName('');
    setCode('');
    setEmail('');
    setPhone('');
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                SUPPLIER DIRECTORY
              </span>
              <span className="font-mono text-xs font-bold text-ink/70">
                // VENDOR CATALOG & SLAs
              </span>
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight flex items-center gap-2">
              <Truck className="w-7 h-7 text-hackOrange" />
              Supplier Management & Vendor Directory
            </h1>
            <p className="text-xs text-ink/70 font-medium mt-1">
              Maintain supplier SLAs, lead times, reliability ratings, and procurement terms.
            </p>
          </div>

          <Button
            size="sm"
            variant="orange"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 font-black"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Supplier</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" />
          <input
            type="text"
            placeholder="Search suppliers by name or vendor code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-cream border-2 border-ink rounded-xl text-xs font-mono font-bold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-hackOrange shadow-retro-sm"
          />
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((sup) => (
            <div key={sup.id} className="p-5 rounded-xl border-2 border-ink shadow-retro bg-white space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-ink text-base">{sup.name}</h3>
                  <span className="text-xs font-mono font-bold text-hackOrange">{sup.code}</span>
                </div>
                <div className="flex items-center gap-1 bg-sand px-2.5 py-1 rounded-lg border-2 border-ink text-xs font-mono font-black text-ink shadow-retro-sm">
                  <Star className="w-3.5 h-3.5 fill-hackAmber text-hackAmber" />
                  <span>{sup.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-sand p-3.5 rounded-xl border-2 border-ink/40 font-mono">
                <div className="flex items-center gap-2 text-ink font-bold">
                  <Clock className="w-3.5 h-3.5 text-hackOrange" />
                  <span>Lead Time: <strong className="text-hackOrange">{sup.leadTimeDays} days</strong></span>
                </div>
                <div className="text-ink font-bold">
                  <span>Terms: <strong>{sup.paymentTerms}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-ink/80 col-span-2">
                  <Mail className="w-3.5 h-3.5 text-hackPurple" />
                  <span className="truncate">{sup.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-ink/80 col-span-2">
                  <Phone className="w-3.5 h-3.5 text-hackPurple" />
                  <span>{sup.contactPhone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1">
                  {sup.categories.map((c) => (
                    <span key={c} className="sticker-tag bg-cream text-ink text-[10px] py-0.5 border-ink">
                      {c}
                    </span>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="text-xs font-bold h-8 px-2.5">
                  View Contracts
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Supplier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 bg-white border-3 border-ink shadow-retro-xl rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <h3 className="text-lg font-black text-ink flex items-center gap-2">
                  <Truck className="w-5 h-5 text-hackOrange" />
                  Add New Supplier
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-lg border-2 border-ink bg-sand flex items-center justify-center text-ink hover:bg-cream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSupplier} className="space-y-3 font-mono font-bold text-xs">
                <div>
                  <label className="block text-xs font-mono font-black text-ink mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starfall Reagents Ltd."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs font-sans text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-black text-ink mb-1">
                      Vendor Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SRL-05"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-black text-ink mb-1">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={leadTime}
                      onChange={(e) => setLeadTime(Number(e.target.value))}
                      className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-black text-ink mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="orders@starfall.realm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-black text-ink mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 019-2831"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-black text-ink mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange font-bold"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="orange"
                    size="sm"
                    className="font-black"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Save Supplier
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
