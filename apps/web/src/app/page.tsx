'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  ArrowRight,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#110C1D] text-paleLavender flex flex-col justify-between selection:bg-potionPurple selection:text-white relative overflow-hidden">
      {/* Mystical Atmospheric Ambient Cartoon Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[160px] opacity-35 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[400px] rounded-full blur-[140px] opacity-25 bg-emerald-500" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-orange-500" />
      </div>

      {/* Floating Cartoon Particle Decorators */}
      <div className="fixed top-24 left-10 text-4xl opacity-50 animate-bubble-float pointer-events-none select-none z-10">🧪</div>
      <div className="fixed top-36 right-16 text-3xl opacity-50 animate-bounce-subtle pointer-events-none select-none z-10">✨</div>
      <div className="fixed bottom-24 left-16 text-4xl opacity-40 animate-wiggle-slow pointer-events-none select-none z-10">🦇</div>
      <div className="fixed bottom-36 right-24 text-4xl opacity-50 animate-bubble-float pointer-events-none select-none z-10">🎃</div>

      {/* Navigation Header */}
      <header className="relative z-20 border-b-2 border-purple-500/20 backdrop-blur-xl bg-[#140D22]/85 sticky top-0 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-potionPurple to-pink-500 flex items-center justify-center text-white border-2 border-white/40 shadow-cartoon-purple group-hover:scale-105 group-hover:rotate-3 transition-transform text-xl">
              🔮
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-white block leading-tight">
                PotionPulse
              </span>
              <span className="text-[10px] tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 font-black block">
                Predict. Manage. Thrive.
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-black text-purple-200/80">
            <a href="#features" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span>⚡</span> Features
            </a>
            <a href="#intelligence" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span>📈</span> Forecasting
            </a>
            <a href="#pos" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span>🛒</span> Point of Sale
            </a>
            <a href="#architecture" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span>🏛️</span> Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button href="/auth/login" variant="ghost" size="sm" className="text-xs">
              Sign In 🧙‍♀️
            </Button>
            <Button href="/dashboard" size="sm" variant="primary" className="text-xs flex items-center gap-1.5">
              <span>Enter Grimoire</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-950/90 to-purple-950/90 border-2 border-orange-400/50 text-xs font-black text-amber-300 shadow-cartoon-orange animate-bounce-subtle">
          <Flame className="w-4 h-4 fill-orange-400 text-orange-400 animate-pulse" />
          <span>The Midnight Curse is Active • 3.0x Demand Surge Applied! 🎃</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1] drop-shadow-lg">
          Next-Generation Inventory Intelligence for{' '}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent underline decoration-purple-500/40">
            Apothecaries & Magical SaaS
          </span>
        </h1>

        <p className="text-base sm:text-lg text-purple-200/90 max-w-2xl font-bold leading-relaxed">
          Say goodbye to stockouts and cauldron spoilage. PotionPulse combines immutable double-entry ledger mechanics, probabilistic demand curves, and automated restock triggers into an enterprise-grade platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Button href="/dashboard" size="lg" variant="primary" className="px-8 py-4 text-sm shadow-cartoon-purple">
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>Launch Live Dashboard</span>
          </Button>
          <Button href="/sales/new" size="lg" variant="orange" className="px-8 py-4 text-sm shadow-cartoon-orange">
            <ShoppingCart className="w-5 h-5" />
            <span>Open POS Terminal</span>
          </Button>
        </div>

        {/* Live Dashboard Preview Card - Colorful Cartoon Terminal */}
        <div className="w-full pt-10">
          <Card className="p-7 bg-[#1C1230]/95 border-3 border-purple-500/30 shadow-[0_12px_0_0_#0D0717,0_24px_48px_rgba(139,92,246,0.25)] rounded-3xl text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-purple-500/15 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs uppercase font-mono tracking-widest text-emerald-300 font-black">
                  PotionPulse Live Core v1.0.0 • Connected to NestJS Realtime Gateway
                </span>
              </div>
              <div className="flex gap-2">
                <Link href="/inventory">
                  <Badge variant="cyan" className="cursor-pointer">
                    🧪 View Catalog
                  </Badge>
                </Link>
                <Link href="/forecasting">
                  <Badge variant="orange" className="cursor-pointer">
                    📈 Forecast Models
                  </Badge>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#142322] border-2 border-emerald-500/30 shadow-[0_4px_0_0_#064E3B]">
                <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-black block">
                  Catalogued Items
                </span>
                <span className="text-2xl font-black text-white mt-1 block">8 Active</span>
                <span className="text-[11px] text-emerald-400 font-mono font-bold">100% Ledger Audited</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#25121E] border-2 border-rose-500/30 shadow-[0_4px_0_0_#881337]">
                <span className="text-[11px] uppercase tracking-wider text-rose-300 font-black block">
                  Stockout Risk Alerts
                </span>
                <span className="text-2xl font-black text-rose-300 mt-1 block">3 Critical</span>
                <span className="text-[11px] text-amber-400 font-mono font-bold">≤ 48h cover</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#281A12] border-2 border-orange-500/30 shadow-[0_4px_0_0_#7C2D12]">
                <span className="text-[11px] uppercase tracking-wider text-amber-300 font-black block">
                  Surge Multiplier
                </span>
                <span className="text-2xl font-black text-amber-300 mt-1 block">3.0x Apex</span>
                <span className="text-[11px] text-purple-200/80 font-mono font-bold">Midnight Curse</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1D1230] border-2 border-purple-500/30 shadow-[0_4px_0_0_#3B166A]">
                <span className="text-[11px] uppercase tracking-wider text-purple-300 font-black block">
                  Ledger Transactions
                </span>
                <span className="text-2xl font-black text-purple-200 mt-1 block">Zero Error</span>
                <span className="text-[11px] text-emerald-400 font-mono font-bold">ACID Enforced</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature Grid Section */}
        <section id="features" className="w-full pt-16 space-y-8 text-left">
          <div className="text-center space-y-2">
            <Badge variant="purple">✨ The Master Alchemist Toolset</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Engineered for Precision, Speed and Scale
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl mx-auto font-medium">
              Every workflow conforms strictly to enterprise SaaS standards with full tenant isolation and zero fake metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3.5 bg-[#1B112C]/90 border-3 border-purple-500/30 hover:border-purple-400 hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border-2 border-purple-400/40 flex items-center justify-center text-2xl shadow-sm">
                📦
              </div>
              <h3 className="font-black text-lg text-white">Immutable Stock Ledger</h3>
              <p className="text-xs text-purple-200/80 font-medium leading-relaxed">
                Stock balances are never overwritten in place. Every receipt, sale, and adjustment is recorded as an immutable ledger movement with idempotency keys.
              </p>
              <Link href="/inventory/movements" className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-bold pt-2">
                <span>Inspect Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>

            <Card className="p-6 space-y-3.5 bg-[#25161A]/90 border-3 border-orange-500/30 hover:border-orange-400 hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border-2 border-orange-400/40 flex items-center justify-center text-2xl shadow-sm">
                📈
              </div>
              <h3 className="font-black text-lg text-white">Probabilistic Demand Curves</h3>
              <p className="text-xs text-orange-100/80 font-medium leading-relaxed">
                7-day, 14-day, and 30-day horizons with dynamic seasonal surge multipliers for high-velocity ingredients like Bat Wings and Mandrake Root.
              </p>
              <Link href="/forecasting" className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-bold pt-2">
                <span>View Forecasts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>

            <Card className="p-6 space-y-3.5 bg-[#142322]/90 border-3 border-emerald-500/30 hover:border-emerald-400 hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-2xl shadow-sm">
                🛒
              </div>
              <h3 className="font-black text-lg text-white">Point of Sale & Atomicity</h3>
              <p className="text-xs text-emerald-100/80 font-medium leading-relaxed">
                Front-line cashier terminal with live stock level checks, quantity steppers, negative balance prevention, and instant customer receipt generation.
              </p>
              <Link href="/sales" className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 font-bold pt-2">
                <span>Manage Transactions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>

            <Card className="p-6 space-y-3.5 bg-[#1E1130]/90 border-3 border-violet-500/30 hover:border-violet-400 hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border-2 border-violet-400/40 flex items-center justify-center text-2xl shadow-sm">
                ⚡
              </div>
              <h3 className="font-black text-lg text-white">Stockout Risk & Reorders</h3>
              <p className="text-xs text-purple-200/80 font-medium leading-relaxed">
                Deterministic calculation: (Lead Time Demand + Safety Stock + Horizon Coverage) - (On Hand + Incoming), rounded to vendor pack sizes.
              </p>
              <Link href="/restock" className="text-xs text-violet-300 hover:text-white flex items-center gap-1 font-bold pt-2">
                <span>Run Reorder Plan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>

            <Card className="p-6 space-y-3.5 bg-[#26101E]/90 border-3 border-rose-500/30 hover:border-rose-400 hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border-2 border-rose-400/40 flex items-center justify-center text-2xl shadow-sm">
                🛡️
              </div>
              <h3 className="font-black text-lg text-white">Anomaly Detection Guard</h3>
              <p className="text-xs text-rose-100/80 font-medium leading-relaxed">
                Flags unexplained shrinkage, consumption spikes (&gt;3.5σ), and blocked negative balance attempts with full resolution workflows.
              </p>
              <Link href="/anomalies" className="text-xs text-rose-300 hover:text-white flex items-center gap-1 font-bold pt-2">
                <span>Open Anomaly Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>

            <Card className="p-6 space-y-3.5 bg-[#1B122D]/90 border-3 border-pink-500/30 hover:border-pink-400 hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border-2 border-pink-400/40 flex items-center justify-center text-2xl shadow-sm">
                🔒
              </div>
              <h3 className="font-black text-lg text-white">Multi-Tenant RBAC</h3>
              <p className="text-xs text-pink-100/80 font-medium leading-relaxed">
                Strict multi-tenant security guarantees. Shop owners, managers, staff, and analysts only access their isolated workspace resources.
              </p>
              <Link href="/team" className="text-xs text-pink-300 hover:text-white flex items-center gap-1 font-bold pt-2">
                <span>Manage Team & Roles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="w-full pt-12 pb-6 space-y-6 text-left">
          <Card className="p-7 bg-[#19102B]/90 border-3 border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl">
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-amber-300 font-mono font-black flex items-center gap-1">
                <span>🏛️</span> Monorepo Tech Stack
              </span>
              <h3 className="text-2xl font-black text-white">Built for High Concurrency & Portability</h3>
              <p className="text-xs text-purple-200/80 max-w-xl font-medium">
                Next.js 14 Web + Expo Android + NestJS Monolithic Core + MongoDB Atlas + WebSocket Realtime Gateway.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <span className="px-3.5 py-1.5 rounded-2xl bg-purple-950/60 border-2 border-purple-400/40 text-xs font-mono font-bold text-purple-200">
                TypeScript Strict
              </span>
              <span className="px-3.5 py-1.5 rounded-2xl bg-purple-950/60 border-2 border-purple-400/40 text-xs font-mono font-bold text-purple-200">
                MongoDB Sharded
              </span>
              <span className="px-3.5 py-1.5 rounded-2xl bg-purple-950/60 border-2 border-purple-400/40 text-xs font-mono font-bold text-purple-200">
                Socket.io Realtime
              </span>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-purple-500/20 bg-[#140D22]/90 px-6 py-6 text-xs text-purple-300/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-bold">
          <div className="flex items-center gap-2">
            <span className="font-black text-white flex items-center gap-1">🔮 PotionPulse</span> — Predictive Inventory Intelligence for Modern Alchemists.
          </div>
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="hover:text-amber-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/inventory" className="hover:text-amber-300 transition-colors">
              Inventory
            </Link>
            <Link href="/sales" className="hover:text-amber-300 transition-colors">
              Sales
            </Link>
            <Link href="/settings" className="hover:text-amber-300 transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
