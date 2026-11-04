import React from 'react';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col items-center justify-center p-6 selection:bg-hackOrange selection:text-white relative">
      <div className="max-w-md w-full bg-white border-3 border-ink shadow-retro-xl rounded-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-hackAmber border-3 border-ink shadow-retro flex items-center justify-center text-4xl -rotate-3 animate-bounce">
          ⚗️
        </div>

        <div className="space-y-2">
          <span className="sticker-tag bg-hackOrange text-white text-xs font-mono font-black uppercase tracking-wider">
            STATUS: 404 NOT FOUND
          </span>
          <h1 className="text-3xl font-black text-ink tracking-tight">
            Lost in the Apothecary?
          </h1>
          <p className="text-xs text-ink/75 font-medium leading-relaxed">
            The page or ingredient recipe you are looking for has vanished into thin air or moved to another shelf in the workshop.
          </p>
        </div>

        <div className="p-4 bg-sand border-2 border-ink rounded-xl text-xs font-mono font-bold text-ink/80 text-left flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-hackOrange flex-shrink-0 mt-0.5" />
          <span>Verify the URL in your browser or return safely to your apothecary control room.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button href="/" variant="outline" className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Landing Page</span>
          </Button>
          <Button href="/dashboard" variant="orange" className="flex-1">
            <Home className="w-4 h-4 mr-1" />
            <span>Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

