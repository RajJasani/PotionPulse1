'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Layers,
  ArrowLeftRight,
  PlusCircle,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Flame,
  Truck,
  FileText,
  FlaskConical,
  BarChart3,
  Bell,
  Users,
  Database,
  History,
  Settings,
  ChevronDown,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Core Operations',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, color: 'text-violet-400' },
      { label: 'Inventory Catalog', href: '/inventory', icon: Package, color: 'text-emerald-400' },
      { label: 'Shelves & Locations', href: '/inventory/locations', icon: Layers, color: 'text-cyan-400' },
      { label: 'Stock Movements', href: '/inventory/movements', icon: ArrowLeftRight, color: 'text-amber-400' },
      { label: 'Receive / Adjust', href: '/inventory/adjust', icon: PlusCircle, color: 'text-pink-400' },
      { label: 'Sales Orders', href: '/sales', icon: ShoppingCart, color: 'text-orange-400' },
      { label: 'Point of Sale', href: '/sales/new', icon: PlusCircle, color: 'text-emerald-300' },
    ],
  },
  {
    title: 'Inventory Intelligence',
    items: [
      { label: 'Demand Forecasting', href: '/forecasting', icon: TrendingUp, color: 'text-purple-400' },
      { label: 'Restock Engine', href: '/restock', icon: Package, color: 'text-cyan-400' },
      { label: 'Anomaly Center', href: '/anomalies', icon: AlertTriangle, color: 'text-rose-400' },
      { label: 'Midnight Curse', href: '/events', icon: Flame, badge: '3x Event', color: 'text-orange-500' },
    ],
  },
  {
    title: 'Procurement & Recipes',
    items: [
      { label: 'Suppliers', href: '/suppliers', icon: Truck, color: 'text-amber-300' },
      { label: 'Purchase Orders', href: '/purchase-orders', icon: FileText, color: 'text-blue-400' },
      { label: 'Potion Recipes', href: '/recipes', icon: FlaskConical, color: 'text-emerald-400' },
    ],
  },
  {
    title: 'System & Platform',
    items: [
      { label: 'Analytics & Reports', href: '/analytics', icon: BarChart3, color: 'text-pink-400' },
      { label: 'Notifications', href: '/notifications', icon: Bell, color: 'text-yellow-400' },
      { label: 'Team & RBAC', href: '/team', icon: Users, color: 'text-indigo-400' },
      { label: 'Import / Export', href: '/import-export', icon: Database, color: 'text-teal-400' },
      { label: 'Audit Trail', href: '/audit', icon: History, color: 'text-purple-300' },
      { label: 'Shop Settings', href: '/settings', icon: Settings, color: 'text-gray-400' },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { activeTenant, memberships, switchTenant } = useAuth();

  return (
    <aside
      className={cn(
        'w-64 bg-[#140D22] border-r-2 border-purple-500/20 flex flex-col h-screen sticky top-0 overflow-y-auto selection:bg-potionPurple shadow-xl',
        className,
      )}
    >
      {/* Brand Header with Cartoon Flask */}
      <div className="p-4 border-b-2 border-purple-500/15 flex items-center justify-between bg-[#19102B]/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-potionPurple to-pink-500 flex items-center justify-center border-2 border-violet-300/40 shadow-cartoon-purple group-hover:scale-105 transition-transform">
            <span className="text-xl">🔮</span>
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              PotionPulse
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold">v1</span>
            </h1>
            <p className="text-[10px] text-purple-300/80 font-bold">Predict. Manage. Thrive.</p>
          </div>
        </Link>
      </div>

      {/* Cartoon Tenant Selector Box */}
      <div className="p-3 border-b-2 border-purple-500/15 bg-[#1C1230]">
        <div className="text-[10px] font-black uppercase tracking-wider text-purple-300/80 px-1 mb-1.5 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span>🧙‍♀️</span> Active Shop
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-potionPurple/30 border border-purple-400/40 text-purple-200 font-extrabold uppercase">
            {activeTenant?.role || 'Staff'}
          </span>
        </div>
        <div className="relative">
          <select
            value={activeTenant?.id || ''}
            onChange={(e) => switchTenant(e.target.value)}
            className="w-full text-xs font-bold bg-[#120A1E] border-2 border-purple-400/30 text-white rounded-xl px-3 py-2 appearance-none focus:outline-none focus:border-purple-400 cursor-pointer shadow-inner"
          >
            {memberships.map((m) => (
              <option key={m.tenantId} value={m.tenantId}>
                {m.tenantName} ({m.role})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-purple-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-purple-300/60 px-2 mb-2">
              {section.title}
            </h3>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150',
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/40 to-pink-500/20 text-white border-2 border-violet-400/60 shadow-[0_3px_0_0_#4C1D95] scale-[1.02]'
                      : 'text-purple-200/70 hover:text-white hover:bg-white/5 border border-transparent',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-violet-300' : item.color)} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-500/25 text-orange-300 border-2 border-orange-400/50 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t-2 border-purple-500/15 bg-[#170F28] text-[10px] font-bold text-purple-300/70 flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <span>🧪</span> PotionCore 2026
        </span>
        <span className="text-emerald-400 flex items-center gap-1.5 font-black px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Sync
        </span>
      </div>
    </aside>
  );
}
