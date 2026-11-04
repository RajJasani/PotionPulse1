'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/brand/logo';
import { ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError('Please provide name, email, and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(email.trim().toLowerCase(), password, displayName.trim(), shopName?.trim() || undefined);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Unable to reach')) {
        setError('Cannot connect to the PotionPulse API server. Ensure the backend service on port 4000 is running.');
      } else {
        setError(msg || 'Registration failed. Please check your information.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center items-center p-6 relative selection:bg-hackOrange selection:text-white">
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Logo href="/" size="lg" className="justify-center mb-3" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FAF5EE] border-2 border-ink text-xs font-mono font-black text-ink shadow-retro-xs">
            <span>✨</span> PROVISION NEW APOTHECARY
          </div>
        </div>

        <Card className="border-2 border-ink bg-white shadow-retro-lg rounded-2xl p-7">
          <CardHeader className="p-0 pb-5 text-center">
            <CardTitle className="text-2xl font-black text-ink flex items-center justify-center gap-2 font-mono">
              CREATE APOTHECARY
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-mutedText">
              Create an owner account and provision your isolated shop workspace.
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
                label="Your Full Name"
                placeholder="Madam Hexley"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              <Input
                label="Shop / Business Name"
                placeholder="Hexley's Potion Pantry"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                helperText="Leave empty to use default name"
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="hexley@potionpulse.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password (min. 8 chars)"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                <span>Provision Shop Workspace</span>
                <ArrowRight className="w-5 h-5 ml-1.5" />
              </Button>
            </form>

            <div className="pt-2 text-center text-xs font-bold text-mutedText">
              Already have a shop workspace?{' '}
              <Link href="/auth/login" className="text-hackOrange hover:underline font-black">
                Sign in here →
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs font-mono font-bold text-mutedText flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF5EE] border-2 border-ink shadow-retro-xs">
          <ShieldCheck className="w-4 h-4 text-[#06D6A0]" />
          <span>TENANT-ISOLATED SESSION // SHA-256 RBAC</span>
        </div>
      </div>
    </div>
  );
}
