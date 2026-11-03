'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('hexley@potionpulse.dev');
    setPassword('HexleyMagic2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#110C1D] flex flex-col justify-center items-center p-6 relative overflow-hidden selection:bg-potionPurple selection:text-white">
      {/* Mystical Floating Cartoon Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-30 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 animate-pulse-glow" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-20 bg-emerald-500" />

      {/* Floating Cartoon Particle Decorators */}
      <div className="fixed top-12 left-12 text-3xl opacity-60 animate-bubble-float pointer-events-none select-none">🧪</div>
      <div className="fixed top-24 right-16 text-3xl opacity-60 animate-bounce-subtle pointer-events-none select-none">✨</div>
      <div className="fixed bottom-16 left-20 text-3xl opacity-50 animate-wiggle-slow pointer-events-none select-none">🦇</div>
      <div className="fixed bottom-20 right-20 text-4xl opacity-60 animate-bubble-float pointer-events-none select-none">🎃</div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Cartoon Header Brand */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-2 group">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-violet-600 via-potionPurple to-pink-500 flex items-center justify-center border-3 border-white/50 shadow-cartoon-purple group-hover:scale-105 group-hover:rotate-3 transition-transform text-2xl">
              🔮
            </div>
            <div className="text-left">
              <span className="text-3xl font-black text-white tracking-tight flex items-center gap-1.5 drop-shadow-md">
                PotionPulse
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 block">
                Predict. Manage. Thrive.
              </span>
            </div>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 border-2 border-purple-400/30 text-[11px] font-extrabold text-purple-200">
            <span>✨</span> Multi-Tenant Inventory Intelligence Platform
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="border-3 border-purple-500/30 bg-[#1D132D]/95 backdrop-blur-2xl shadow-[0_12px_0_0_#0D0717,0_20px_40px_rgba(139,92,246,0.25)] rounded-3xl p-7">
          <CardHeader className="p-0 pb-5 text-center">
            <CardTitle className="text-2xl font-black text-white flex items-center justify-center gap-2">
              Sign in to your shop 🧙‍♀️
            </CardTitle>
            <CardDescription className="text-xs font-bold text-purple-300/80">
              Enter your credentials to access your inventory and demand intelligence.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/20 border-2 border-rose-400 text-rose-200 text-xs font-black flex items-center gap-2.5 shadow-sm animate-wiggle-slow">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="hexley@potionpulse.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                <span>Access Shop Workspace</span>
                <ArrowRight className="w-5 h-5 ml-1.5" />
              </Button>
            </form>

            {/* Evaluation Options Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-purple-500/20" />
              </div>
              <span className="relative bg-[#1D132D] px-4 text-[11px] uppercase tracking-wider text-amber-300 font-black">
                ⚡ Evaluation Options
              </span>
            </div>

            {/* Quick Demo Credentials Button */}
            <Button
              type="button"
              variant="orange"
              size="md"
              className="w-full flex items-center justify-center gap-2"
              onClick={fillDemoAccount}
            >
              <Zap className="w-4 h-4 text-yellow-200 fill-yellow-200 animate-pulse" />
              <span>Fill Demo Credentials (Madam Hexley)</span>
            </Button>

            <div className="pt-2 text-center text-xs font-bold text-purple-300/80">
              Don&apos;t have a shop workspace yet?{' '}
              <Link href="/auth/register" className="text-amber-400 hover:text-amber-300 underline font-black">
                Create new shop 🪄
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security / Isolation Footer Pill */}
        <div className="text-center text-xs font-bold text-purple-300/80 flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-purple-950/40 border-2 border-purple-500/20 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Tenant-isolated server session with encrypted RBAC</span>
        </div>
      </div>
    </div>
  );
}
