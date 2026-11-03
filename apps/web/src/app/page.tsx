'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  ArrowRight,
  ShoppingCart,
  Zap,
  Package,
  LineChart,
  ShieldCheck,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col justify-between selection:bg-hackOrange selection:text-white relative">
      {/* Top Banner: Midnight Curse Festival Alert */}
      <div className="bg-hackAmber border-b-2 border-ink px-4 py-2 text-center text-xs font-black tracking-wide flex items-center justify-center gap-2">
        <span className="sticker-tag bg-hackOrange text-white border-ink text-[10px] py-0.5">
          FESTIVAL DISPATCH
        </span>
        <Flame className="w-4 h-4 text-ink inline fill-hackOrange" />
        <span>The Midnight Curse is Live • 3.0× Exponential Surge Active Across Solitary Nightshade & Ghost Lily!</span>
        <Link href="/events" className="underline font-black text-ink hover:text-hackOrange ml-1">
          Inspect Event &rarr;
        </Link>
      </div>

      {/* Navigation Header */}
      <header className="border-b-2 border-ink bg-white/95 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-hackOrange text-white border-2 border-ink shadow-retro flex items-center justify-center text-2xl group-hover:-translate-y-0.5 group-hover:shadow-retro-lg transition-all">
              ⚗️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-ink">
                  PotionPulse
                </span>
                <span className="sticker-tag bg-hackPink text-white border-ink text-[9px] py-0 px-1.5">
                  v1.0.0
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-ink/70 block">
                Predictive Inventory Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-bold uppercase tracking-wider text-ink">
            <a href="#features" className="hover:text-hackOrange hover:underline decoration-2 underline-offset-4">
              // Features
            </a>
            <a href="#forecasting" className="hover:text-hackOrange hover:underline decoration-2 underline-offset-4">
              // Forecasting
            </a>
            <a href="#pos" className="hover:text-hackOrange hover:underline decoration-2 underline-offset-4">
              // Point-of-Sale
            </a>
            <a href="#architecture" className="hover:text-hackOrange hover:underline decoration-2 underline-offset-4">
              // Tech-Stack
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button href="/auth/login" variant="outline" size="sm">
              Sign In
            </Button>
            <Button href="/dashboard" size="sm" variant="orange">
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center space-y-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border-2 border-ink shadow-retro">
          <span className="w-3 h-3 rounded-full bg-hackMint border border-ink animate-pulse" />
          <span className="font-mono text-xs font-black uppercase tracking-wider text-ink">
            Hacktoberfest-Inspired Open Intelligence Engine
          </span>
          <span className="sticker-tag bg-hackPurple text-white text-[10px]">
            ALCHEMIST EDITION
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-ink max-w-5xl leading-[1.08]">
          Predictive Inventory Intelligence for{' '}
          <span className="bg-hackAmber px-3 py-0.5 border-2 border-ink shadow-retro inline-block -rotate-1 mt-1">
            Potion Masters
          </span>{' '}
          and Modern Apothecaries.
        </h1>

        <p className="text-base sm:text-lg text-ink/80 max-w-3xl font-medium leading-relaxed">
          Zero stockouts. Zero wasted dragon tears. Powered by deterministic exponential smoothing, 
          immutable double-entry stock movement ledgers, and real-time multi-tenant synchronization.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Button href="/dashboard" size="lg" variant="orange" className="px-8 py-4 text-sm font-black">
            <Zap className="w-5 h-5 fill-white" />
            <span>Open Apothecary Dashboard</span>
          </Button>
          <Button href="/sales/new" size="lg" variant="amber" className="px-8 py-4 text-sm font-black">
            <ShoppingCart className="w-5 h-5" />
            <span>Point of Sale Register</span>
          </Button>
          <Button href="/auth/register" size="lg" variant="outline" className="px-8 py-4 text-sm font-black">
            <span>Register New Shop</span>
          </Button>
        </div>

        {/* Terminal / Live Telemetry Preview Card */}
        <div className="w-full pt-6">
          <div className="bg-white border-3 border-ink shadow-retro-xl rounded-2xl p-6 text-left space-y-6">
            {/* Window title bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-ink pb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-hackRed border-2 border-ink" />
                  <div className="w-3.5 h-3.5 rounded-full bg-hackAmber border-2 border-ink" />
                  <div className="w-3.5 h-3.5 rounded-full bg-hackMint border-2 border-ink" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-hackOrange" />
                  POTIONPULSE-RUNTIME // NODE-NESTJS-SOCKETIO // STATUS: HEALTHY
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="sticker-tag bg-hackMint text-ink">
                  ● IN-MEMORY MONGODB LIVE
                </span>
                <span className="sticker-tag bg-sand text-ink">
                  PORT: 4000 ⇄ 3000
                </span>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-sand border-2 border-ink shadow-retro-sm">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-ink/70">
                  <span>AUDITED CATALOG</span>
                  <Package className="w-4 h-4 text-hackOrange" />
                </div>
                <div className="text-3xl font-black text-ink mt-2">8 Items</div>
                <div className="text-[11px] font-mono font-bold text-hackMint mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-ink" /> 100% Shelf-Tracked
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border-2 border-ink shadow-retro-sm">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-hackRed">
                  <span>STOCKOUT WATCH</span>
                  <AlertTriangle className="w-4 h-4 text-hackRed" />
                </div>
                <div className="text-3xl font-black text-hackRed mt-2">3 Critical</div>
                <div className="text-[11px] font-mono font-bold text-ink/70 mt-1">
                  Coverage &lt; 48 hours
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border-2 border-ink shadow-retro-sm">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-ink/80">
                  <span>CURSE MULTIPLIER</span>
                  <Flame className="w-4 h-4 text-hackOrange fill-hackOrange" />
                </div>
                <div className="text-3xl font-black text-hackOrange mt-2">3.00× Surge</div>
                <div className="text-[11px] font-mono font-bold text-ink/70 mt-1">
                  Midnight Festival Apex
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border-2 border-ink shadow-retro-sm">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-hackPurple">
                  <span>LEDGER ACCURACY</span>
                  <ShieldCheck className="w-4 h-4 text-hackPurple" />
                </div>
                <div className="text-3xl font-black text-hackPurple mt-2">ACID Safe</div>
                <div className="text-[11px] font-mono font-bold text-hackMint mt-1">
                  Double-Entry Ledger
                </div>
              </div>
            </div>

            {/* Quick action bar inside preview card */}
            <div className="bg-sand/60 rounded-xl p-4 border-2 border-ink flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <span className="font-bold text-ink">
                Quick Explorer Links:
              </span>
              <div className="flex flex-wrap gap-2">
                <Button href="/inventory" size="sm" variant="outline">
                  Browse Catalog
                </Button>
                <Button href="/forecasting" size="sm" variant="purple">
                  Predictive Curves
                </Button>
                <Button href="/restock" size="sm" variant="amber">
                  Restock Planner
                </Button>
                <Button href="/inventory/movements" size="sm" variant="mint">
                  Audit Movements
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="w-full pt-16 space-y-8 text-left">
          <div className="text-center space-y-3">
            <span className="sticker-tag bg-hackOrange text-white text-xs">
              CORE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-ink">
              Meticulously Crafted for Real Alchemical Commerce
            </h2>
            <p className="text-sm text-ink/70 max-w-xl mx-auto font-medium">
              Every workflow is tested end-to-end with real database transactions, negative balance guards, and real-time WebSockets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <Card className="p-6 space-y-4 hover:-translate-y-1 hover:shadow-retro-lg transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-hackOrange text-white border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl">
                📦
              </div>
              <h3 className="font-black text-xl text-ink">Immutable Stock Ledger</h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                Balances are never blindly updated in place. Every transaction generates an immutable double-entry movement with user audit stamps, timestamps, and idempotency guarantees.
              </p>
              <div className="pt-2">
                <Link href="/inventory/movements" className="text-xs font-mono font-black text-hackOrange hover:underline flex items-center gap-1">
                  INSPECT AUDIT TRAIL &rarr;
                </Link>
              </div>
            </Card>

            <Card className="p-6 space-y-4 hover:-translate-y-1 hover:shadow-retro-lg transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-hackAmber text-ink border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl">
                📈
              </div>
              <h3 className="font-black text-xl text-ink">Time-Series Forecasting</h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                Moving average and exponential smoothing models predict consumption rates over 7, 14, and 30 day horizons. Includes dynamic seasonal curve adjustment for the Midnight Curse.
              </p>
              <div className="pt-2">
                <Link href="/forecasting" className="text-xs font-mono font-black text-hackOrange hover:underline flex items-center gap-1">
                  VIEW DEMAND CHARTS &rarr;
                </Link>
              </div>
            </Card>

            <Card className="p-6 space-y-4 hover:-translate-y-1 hover:shadow-retro-lg transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-hackMint text-ink border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl">
                🛒
              </div>
              <h3 className="font-black text-xl text-ink">Cashier POS Terminal</h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                High-speed cashier checkout terminal with instant stock availability checks, customer receipt generation, and real-time inventory deductions.
              </p>
              <div className="pt-2">
                <Link href="/sales/new" className="text-xs font-mono font-black text-hackOrange hover:underline flex items-center gap-1">
                  LAUNCH REGISTER &rarr;
                </Link>
              </div>
            </Card>

            <Card className="p-6 space-y-4 hover:-translate-y-1 hover:shadow-retro-lg transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-hackPurple text-white border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl">
                ⚡
              </div>
              <h3 className="font-black text-xl text-ink">Stockout Prevention</h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                Predicts exact stockout dates by calculating days of cover against supplier lead times and safety stock buffers, flagging high-risk ingredients before cauldrons run cold.
              </p>
              <div className="pt-2">
                <Link href="/restock" className="text-xs font-mono font-black text-hackOrange hover:underline flex items-center gap-1">
                  RUN REORDER PLAN &rarr;
                </Link>
              </div>
            </Card>

            <Card className="p-6 space-y-4 hover:-translate-y-1 hover:shadow-retro-lg transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-hackPink text-white border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl">
                🛡️
              </div>
              <h3 className="font-black text-xl text-ink">Anomaly Detection</h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                Automated statistical anomaly detection flags abnormal consumption spikes (&gt;3.5σ), unauthorized inventory shrinkage, and blocked negative balance attempts.
              </p>
              <div className="pt-2">
                <Link href="/anomalies" className="text-xs font-mono font-black text-hackOrange hover:underline flex items-center gap-1">
                  VIEW ANOMALY LOGS &rarr;
                </Link>
              </div>
            </Card>

            <Card className="p-6 space-y-4 hover:-translate-y-1 hover:shadow-retro-lg transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-hackCyan text-ink border-2 border-ink shadow-retro-sm flex items-center justify-center text-xl">
                🏢
              </div>
              <h3 className="font-black text-xl text-ink">Multi-Tenant RBAC</h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                Full cryptographic tenant isolation. Manage shop owners, alchemists, apprentice clerks, and auditors with granular role-based permissions and session tokens.
              </p>
              <div className="pt-2">
                <Link href="/auth/register" className="text-xs font-mono font-black text-hackOrange hover:underline flex items-center gap-1">
                  REGISTER TENANT &rarr;
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Tech Stack Banner */}
        <section id="architecture" className="w-full pt-10 pb-6 text-left">
          <div className="bg-sand border-3 border-ink shadow-retro-lg rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                  ARCHITECTURE
                </span>
                <span className="font-mono text-xs font-bold text-ink/70">
                  CENTRALIZED MONOREPO
                </span>
              </div>
              <h3 className="text-2xl font-black text-ink">
                Built for High-Concurrency Alchemical Operations
              </h3>
              <p className="text-xs text-ink/75 max-w-xl font-medium">
                Next.js 14 App Router + Expo React Native + NestJS Central Monolithic API + MongoDB Atlas with WebSocket Real-Time Gateway.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="sticker-tag bg-white text-ink">TypeScript 5</span>
              <span className="sticker-tag bg-white text-ink">NestJS 10</span>
              <span className="sticker-tag bg-white text-ink">Next.js 14</span>
              <span className="sticker-tag bg-white text-ink">Socket.io</span>
              <span className="sticker-tag bg-white text-ink">Tailwind CSS</span>
              <span className="sticker-tag bg-white text-ink">Expo Mobile</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-ink bg-white px-6 py-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-hackOrange text-white border-2 border-ink shadow-retro-sm flex items-center justify-center font-bold text-base">
              ⚗️
            </div>
            <div>
              <span className="font-black text-sm text-ink block">PotionPulse Platform</span>
              <span className="text-[11px] font-mono text-ink/70">Handcrafted Hacktoberfest Edition • MIT License</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs font-bold uppercase">
            <Link href="/dashboard" className="hover:text-hackOrange">Dashboard</Link>
            <Link href="/inventory" className="hover:text-hackOrange">Inventory</Link>
            <Link href="/sales" className="hover:text-hackOrange">Sales</Link>
            <Link href="/forecasting" className="hover:text-hackOrange">Forecasting</Link>
            <Link href="/events" className="hover:text-hackOrange">Events</Link>
            <Link href="/auth/login" className="hover:text-hackOrange">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
