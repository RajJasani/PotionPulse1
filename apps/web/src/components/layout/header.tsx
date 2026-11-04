'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { Button } from '@/components/ui/button';
import { ClientOnly } from '@/components/ui/client-only';
import { PotionPulseIcon } from '@/components/brand/logo';
import {
  Bell,
  LogOut,
  Plus,
} from 'lucide-react';

export function Header() {
  const { user, activeTenant, logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <header className="h-16 border-b-2 border-ink bg-[#FFFDF9]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Workspace Quick Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <PotionPulseIcon size="sm" />
          <div>
            <span className="text-sm font-black text-ink tracking-tight block leading-tight font-mono">
              {activeTenant?.name || "Madam Hexley's Apothecary"}
            </span>
            <span className="text-[10px] font-mono font-black uppercase bg-sand border border-ink text-ink px-1.5 py-0.2 rounded inline-block">
              {activeTenant?.slug || 'workspace'}
            </span>
          </div>
        </div>

        {/* Live WebSocket Indicator */}
        <ClientOnly
          fallback={
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white border-2 border-ink text-xs font-mono font-black shadow-retro-xs opacity-60">
              <span className="w-2.5 h-2.5 rounded-full border border-ink bg-[#FFBE1A]" />
              <span className="text-[10px] uppercase text-ink">STANDBY</span>
            </div>
          }
        >
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white border-2 border-ink text-xs font-mono font-black shadow-retro-xs">
            <span className={`w-2.5 h-2.5 rounded-full border border-ink ${isConnected ? 'bg-[#06D6A0] animate-pulse' : 'bg-[#FFBE1A]'}`} />
            <span className="text-[10px] uppercase text-ink">
              {isConnected ? 'LIVE SYNC ACTIVE' : 'CONNECTING...'}
            </span>
          </div>
        </ClientOnly>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        <Button href="/sales/new" size="sm" variant="orange" className="hidden md:flex items-center gap-1.5 text-xs font-black">
          <Plus className="w-3.5 h-3.5" />
          <span>Point of Sale</span>
        </Button>

        <Button href="/inventory/adjust" size="sm" variant="success" className="hidden md:flex items-center gap-1.5 text-xs font-black">
          <Plus className="w-3.5 h-3.5" />
          <span>Receive Stock</span>
        </Button>

        <Link href="/notifications" className="relative p-2 text-ink hover:bg-sand rounded-lg border-2 border-ink bg-white shadow-retro-xs transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF5C00] border border-ink animate-pulse" />
        </Link>

        {/* User Info & Logout */}
        <ClientOnly
          fallback={
            <div className="flex items-center gap-2.5 pl-3 border-l-2 border-ink/20">
              <div className="w-8 h-8 rounded-lg bg-[#6320EE] border-2 border-ink flex items-center justify-center text-sm font-black text-white shadow-retro-xs">
                🧙‍♀️
              </div>
            </div>
          }
        >
          <div className="flex items-center gap-2.5 pl-3 border-l-2 border-ink/20">
            <div className="w-8 h-8 rounded-lg bg-[#6320EE] border-2 border-ink flex items-center justify-center text-sm font-black text-white shadow-retro-xs">
              🧙‍♀️
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-mono font-black text-ink leading-tight">
                {user?.displayName || 'Madam Hexley'}
              </div>
              <div className="text-[10px] font-mono text-mutedText leading-tight">
                {user?.email || 'hexley@potionpulse.dev'}
              </div>
            </div>
            <button
              onClick={logout}
              title="Log Out"
              className="p-1.5 text-ink hover:text-white hover:bg-[#E63946] rounded-lg border-2 border-transparent hover:border-ink transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </ClientOnly>
      </div>
    </header>
  );
}
