'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/brand/logo';
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
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center items-center p-6 relative selection:bg-hackOrange selection:text-white">
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Logo href="/" size="lg" className="justify-center mb-3" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FAF5EE] border-2 border-ink text-xs font-mono font-black text-ink shadow-retro-xs">
            <span>🧙‍♀️</span> APOTHECARY WORKSPACE
          </div>
        </div>

        {/* Login Card — Clean Paper Pass with Hard Retro Shadow */}
        <Card className="border-2 border-ink bg-white shadow-retro-lg rounded-2xl p-7">
          <CardHeader className="p-0 pb-5 text-center">
            <CardTitle className="text-2xl font-black text-ink flex items-center justify-center gap-2 font-mono">
              SIGN IN TO SHOP
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-mutedText">
              Enter your credentials to access your inventory and demand intelligence.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#FDECEE] border-2 border-hackRed text-hackRed text-xs font-mono font-bold flex items-center gap-2.5 shadow-retro-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-hackRed" />
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
                <div className="w-full border-t-2 border-sandDark" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-mono font-black uppercase tracking-wider text-mutedText">
                EVALUATION OPTIONS
              </span>
            </div>

            {/* Quick Demo Credentials Button */}
            <Button
              type="button"
              variant="amber"
              size="md"
              className="w-full flex items-center justify-center gap-2"
              onClick={fillDemoAccount}
            >
              <Zap className="w-4 h-4 text-ink fill-ink" />
              <span>Fill Demo Credentials (Madam Hexley)</span>
            </Button>

            <div className="pt-2 text-center text-xs font-bold text-mutedText">
              Don&apos;t have a shop workspace yet?{' '}
              <Link href="/auth/register" className="text-hackOrange hover:underline font-black">
                Create new shop →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security / Isolation Footer Pill */}
        <div className="text-center text-xs font-mono font-bold text-mutedText flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF5EE] border-2 border-ink shadow-retro-xs">
          <ShieldCheck className="w-4 h-4 text-[#06D6A0]" />
          <span>TENANT-ISOLATED SESSION // SHA-256 RBAC</span>
        </div>
      </div>
    </div>
  );
}
