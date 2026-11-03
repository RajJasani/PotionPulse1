'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/ui/client-only';
import {
  LayoutDashboard,
  Package,
  Layers,
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  Truck,
  FileText,
  FlaskConical,
  ShoppingCart,
  Users,
  Shield,
  FileSpreadsheet,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core Operations',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Inventory Vault', href: '/inventory', icon: Package },
      { label: 'Storage Shelves', href: '/inventory/locations', icon: Layers },
      { label: 'Stock Movement Ledger', href: '/inventory/movements', icon: ArrowLeftRight },
      { label: 'Point of Sale (POS)', href: '/sales', icon: ShoppingCart },
    ],
  },
  {
    title: 'Intelligence & Supply',
    items: [
      { label: 'Demand Forecasting', href: '/forecasting', icon: TrendingUp },
      { label: 'Restock Recommendations', href: '/restock', icon: AlertTriangle, badge: 'AUTO' },
      { label: 'Midnight Curse Events', href: '/events', icon: Flame, badge: '3.0x' },
      { label: 'Anomaly Radar', href: '/anomalies', icon: Shield },
      { label: 'Suppliers Directory', href: '/suppliers', icon: Truck },
      { label: 'Purchase Orders', href: '/purchase-orders', icon: FileText },
      { label: 'Potion Formulations', href: '/recipes', icon: FlaskConical },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Guild Team & RBAC', href: '/team', icon: Users },
      { label: 'Audit Trail', href: '/audit', icon: Shield },
      { label: 'Import / Export', href: '/import-export', icon: FileSpreadsheet },
      { label: 'Shop Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { activeTenant, memberships, switchTenant } = useAuth();

  return (
    <aside
      className={cn(
        'w-64 bg-[#FAF5EE] border-r-2 border-ink flex flex-col h-screen sticky top-0 overflow-y-auto selection:bg-hackOrange selection:text-white',
        className,
      )}
    >
      {/* Brand Header with Hacktoberfest Fire & Alchemist Badge */}
      <div className="p-4 border-b-2 border-ink bg-[#FFFDF9]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#FF5C00] border-2 border-ink flex items-center justify-center text-white shadow-retro-sm group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-ink tracking-tight font-mono">
                PotionPulse
              </h1>
              <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-[#FFBE1A] text-ink border border-ink uppercase">
                2026
              </span>
            </div>
            <p className="text-[10px] text-mutedText font-mono font-bold uppercase tracking-wider">
              Open Apothecary Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Tenant Switcher Selector */}
      <div className="p-3 border-b-2 border-ink bg-white">
        <ClientOnly
          fallback={
            <div className="h-14 flex items-center justify-between px-1 text-xs font-mono font-bold text-ink/70">
              <span>Loading workspace...</span>
            </div>
          }
        >
          <div className="text-[10px] font-mono font-black uppercase tracking-wider text-mutedText px-1 mb-1.5 flex justify-between items-center">
            <span className="flex items-center gap-1 text-ink font-bold">
              <span>🏛️</span> Active Shop
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#6320EE] text-white border border-ink font-mono font-black uppercase">
              {activeTenant?.role || 'Staff'}
            </span>
          </div>
          <div className="relative">
            <select
              value={activeTenant?.id || ''}
              onChange={(e) => switchTenant(e.target.value)}
              className="w-full text-xs font-mono font-bold bg-[#FAF5EE] border-2 border-ink text-ink rounded-lg px-2.5 py-1.5 appearance-none focus:outline-none focus:border-hackOrange cursor-pointer shadow-retro-xs"
            >
              {memberships.map((m) => (
                <option key={m.tenantId} value={m.tenantId}>
                  {m.tenantName} ({m.role})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-ink absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </ClientOnly>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="text-[10px] font-mono font-black uppercase tracking-widest text-mutedText px-2 mb-2">
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
                    'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-100',
                    isActive
                      ? 'bg-[#FF5C00] text-white border-2 border-ink shadow-retro-sm translate-x-[-1px] translate-y-[-1px]'
                      : 'text-ink/80 hover:text-ink hover:bg-white border-2 border-transparent hover:border-ink hover:shadow-retro-xs',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-ink/70')} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-[#FFBE1A] text-ink border border-ink shadow-[1px_1px_0px_#1A1523]">
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
      <div className="p-3 border-t-2 border-ink bg-white text-[10px] font-mono font-black text-ink flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <span>📜</span> TRACK-01
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#06D6A0] text-ink border border-ink shadow-[1px_1px_0px_#1A1523]">
          <span className="w-1.5 h-1.5 rounded-full bg-ink animate-pulse" />
          ONLINE
        </span>
      </div>
    </aside>
  );
}
