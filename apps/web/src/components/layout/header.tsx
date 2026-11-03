'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { Button } from '@/components/ui/button';
import {
  Bell,
  LogOut,
  ExternalLink,
  Plus,
} from 'lucide-react';

export function Header() {
  const { user, activeTenant, logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <header className="h-16 border-b-2 border-purple-500/20 bg-[#160E26]/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 shadow-md">
      {/* Workspace Quick Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center border-2 border-purple-300/40 text-sm shadow-[0_2px_0_0_#4C1D95]">
            <span>🧙‍♀️</span>
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight block leading-tight">
              {activeTenant?.name || "Madam Hexley's Apothecary"}
            </span>
            <span className="text-[10px] font-extrabold uppercase bg-purple-500/20 border border-purple-400/40 text-purple-200 px-2 py-0.2 rounded-full inline-block">
              {activeTenant?.slug || 'workspace'}
            </span>
          </div>
        </div>

        {/* Live WebSocket Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F1433] border-2 border-purple-400/30 text-xs shadow-inner">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <span className="text-[11px] font-black text-purple-200">
            {isConnected ? '✨ Real-Time Sync Active' : 'Connecting Sync...'}
          </span>
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        <Button href="/sales/new" size="sm" variant="orange" className="hidden md:flex items-center gap-1.5 text-xs">
          <Plus className="w-4 h-4" />
          <span>Point of Sale</span>
        </Button>

        <Button href="/inventory/adjust" size="sm" variant="success" className="hidden md:flex items-center gap-1.5 text-xs">
          <Plus className="w-4 h-4" />
          <span>Receive Stock</span>
        </Button>

        <Link
          href="http://localhost:4000/api/docs"
          target="_blank"
          className="text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-purple-400/30 bg-purple-950/30 hover:bg-purple-900/40 transition-colors shadow-[0_2px_0_0_#140824]"
        >
          <span>Swagger API</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <Link href="/notifications" className="relative p-2.5 text-purple-200 hover:text-white rounded-xl border-2 border-purple-400/30 bg-purple-950/30 hover:bg-purple-900/40 transition-colors shadow-[0_2px_0_0_#140824]">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white animate-pulse" />
        </Link>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2.5 pl-3 border-l-2 border-purple-500/20">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-purple-300/50 flex items-center justify-center text-sm font-black shadow-[0_2px_0_0_#5B21B6]">
            <span>🧙‍♀️</span>
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-black text-white leading-tight">
              {user?.displayName || 'Madam Hexley'}
            </div>
            <div className="text-[10px] font-bold text-purple-300/80 leading-tight">
              {user?.email || 'hexley@potionpulse.dev'}
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-purple-300 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors border-2 border-transparent hover:border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
