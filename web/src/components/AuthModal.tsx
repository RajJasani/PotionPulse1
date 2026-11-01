import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  Eye,
  EyeOff,
  Flame,
  Wand2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openLogin,
    openSignup,
    closeAuthModal,
    login,
    register,
    isLoading,
    demoUsers,
    loginAsDemo,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Master Alchemist');
  const [title, setTitle] = useState('Keeper of the Cauldron');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (authModalMode === 'login') {
        await login({ email, password });
      } else {
        if (!username.trim()) {
          setError('Please provide your Alchemist Name.');
          return;
        }
        await register({
          email,
          password,
          username,
          role,
          title,
        });
      }
    } catch (err: any) {
      setError(err.message || 'An arcane disruption occurred while verifying credentials.');
    }
  };

  const handleDemoSelect = async (demo: any) => {
    setError(null);
    try {
      await loginAsDemo(demo);
    } catch (err: any) {
      setError(err.message || 'Could not channel demo alchemist session.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl border-3 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden z-10 text-black flex flex-col"
        >
          {/* Top Decorative Alchemical Header Banner */}
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-6 py-5 border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1 bg-white/90 rounded-xl border border-black shadow-sm">
                🔮
              </span>
              <div>
                <h2 className="font-display font-black text-lg text-black tracking-tight leading-tight">
                  Madam Hexley's Council
                </h2>
                <p className="text-xs font-semibold text-neutral-900">
                  {authModalMode === 'login' ? 'Sign into the Apothecary' : 'Register New Grimoire Page'}
                </p>
              </div>
            </div>

            <button
              onClick={closeAuthModal}
              className="w-8 h-8 rounded-full bg-black/10 hover:bg-black text-black hover:text-white flex items-center justify-center transition-all cursor-pointer border border-black/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Mode Toggle Tabs */}
            <div className="flex rounded-xl bg-amber-100 p-1 border-2 border-black">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openLogin();
                }}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                  authModalMode === 'login'
                    ? 'bg-amber-400 text-black border border-black shadow-sm'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openSignup();
                }}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                  authModalMode === 'signup'
                    ? 'bg-amber-400 text-black border border-black shadow-sm'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-100 border-2 border-rose-500 rounded-xl flex items-start gap-2.5 text-xs text-rose-950 font-medium"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* 1-Click Fast Demo Logins */}
            {demoUsers && demoUsers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-neutral-600">
                  <span>Fast Demo Sign-In</span>
                  <span className="text-[10px] text-amber-700 font-bold">1-Click Access</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {demoUsers.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleDemoSelect(demo)}
                      disabled={isLoading}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-200 border-2 border-black/80 hover:border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-left flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <span className="text-xl">{demo.avatar}</span>
                      <span className="font-black text-[11px] text-black text-center line-clamp-1">
                        {demo.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] font-bold text-neutral-600 line-clamp-1 text-center">
                        {demo.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-black/20 w-full" />
              <span className="bg-[#FFFDF7] px-3 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Or With Credentials
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authModalMode === 'signup' && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-1">
                    Alchemist Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master Corvus"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-1">
                  Arcane Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    type="email"
                    required
                    placeholder="alchemist@potionpulse.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-1">
                  Secret Rune / Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authModalMode === 'signup' && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-1">
                    Council Rank / Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="Master Alchemist">🧙‍♀️ Master Alchemist (Full Privileges)</option>
                    <option value="Potions Master">🦇 Potions Master (Demand & Telemetry)</option>
                    <option value="Guild Apprentice">🧪 Guild Apprentice (Stock & Sales)</option>
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-black font-black text-sm uppercase tracking-wider rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Channeling Magic...
                  </span>
                ) : (
                  <>
                    <span>{authModalMode === 'login' ? 'Enter The Apothecary' : 'Inscribe Grimoire'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
