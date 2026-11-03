'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Caught Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col items-center justify-center p-6 selection:bg-hackOrange selection:text-white">
      <div className="max-w-md w-full bg-white border-3 border-ink shadow-retro-xl rounded-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-100 border-3 border-ink shadow-retro flex items-center justify-center text-4xl -rotate-3">
          💥
        </div>

        <div className="space-y-2">
          <span className="sticker-tag bg-hackRed text-white text-xs font-mono font-black uppercase tracking-wider">
            UNEXPECTED REACTION
          </span>
          <h1 className="text-2xl font-black text-ink tracking-tight">
            Cauldron Boiling Over!
          </h1>
          <p className="text-xs text-ink/75 font-medium leading-relaxed">
            An unexpected error occurred while processing this component.
          </p>
        </div>

        <div className="p-3 bg-sand border-2 border-ink rounded-xl text-[11px] font-mono font-bold text-ink/70 text-left overflow-x-auto max-h-28">
          {error.message || 'Unknown Alchemical Error'}
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={() => reset()} variant="orange" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Try Again</span>
          </Button>
          <Button href="/dashboard" variant="outline" className="flex-1">
            <Home className="w-4 h-4 mr-1.5" />
            <span>Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
