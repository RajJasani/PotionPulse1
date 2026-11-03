'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#110C1D] flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center animate-bounce shadow-cartoon-purple border-2 border-white/40 mb-4 text-2xl">
          🔮
        </div>
        <p className="text-base font-black tracking-tight text-purple-200">
          Conjuring PotionPulse Workspace...
        </p>
        <span className="text-xs text-purple-400/80 font-bold mt-1">Stirring cauldron ingredients</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#110C1D] flex text-paleLavender selection:bg-potionPurple selection:text-white relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
