import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Save,
  Zap,
} from 'lucide-react';
import { api } from '@shared/api-client';
import { Ingredient, PotionEvent, EventCreate } from '@shared/api.types';
import { Skeleton } from '../components/Skeleton';
import { FlyingBat } from '../components/FlyingBat';

interface EventsPageProps {
  onShowToast: (toast: any) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onShowToast }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [events, setEvents] = useState<PotionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [batActive, setBatActive] = useState(false);

  // Form State
  const [eventName, setEventName] = useState('Full Moon Festival');
  const [multiplier, setMultiplier] = useState<number>(3.0);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([
    'ing_wolfsbane',
    'ing_silver_leaf',
    'ing_nightshade',
  ]);
  const [startsAt, setStartsAt] = useState('2026-11-05T00:00:00');
  const [endsAt, setEndsAt] = useState('2026-11-08T23:59:59');

  const loadEventsData = async () => {
    try {
      setLoading(true);
      const [ings, evts] = await Promise.all([
        api.getIngredients(),
        api.getEvents(false),
      ]);
      setIngredients(ings);
      setEvents(evts);
      if (evts.length > 0) {
        const primary = evts[0];
        setEventName(primary.name);
        setMultiplier(primary.multiplier);
        setSelectedIngredientIds(primary.affected_ingredient_ids);
        setStartsAt(primary.starts_at.slice(0, 19));
        setEndsAt(primary.ends_at.slice(0, 19));
      }
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Astrolabe Misaligned',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventsData();
  }, []);

  const handleToggleIngredient = (id: string) => {
    setSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIngredientIds.length === 0) {
      onShowToast({
        id: Date.now().toString(),
        type: 'warning',
        title: 'No Reagents Selected',
        message: 'Please select at least one ingredient targeted by this celestial event.',
      });
      return;
    }

    try {
      setSaving(true);
      const payload: EventCreate = {
        name: eventName,
        multiplier,
        starts_at: startsAt.endsWith('Z') ? startsAt : `${startsAt}Z`,
        ends_at: endsAt.endsWith('Z') ? endsAt : `${endsAt}Z`,
        affected_ingredient_ids: selectedIngredientIds,
      };

      await api.createEvent(payload);
      setBatActive(true);

      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Celestial Surge Cast!',
        message: `Saved '${eventName}'. Demand predictions have multiplied by ${multiplier}x.`,
      });

      await loadEventsData();
    } catch (err: any) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Ritual Failed',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-amber-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-rose-500 to-pink-600 text-white uppercase tracking-wider shadow-sm">
              MIDNIGHT CURSE MODULATOR
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <span>Celestial Surge Engine</span>
          </h2>
          <p className="font-sans text-xs font-semibold text-slate-600 mt-1">
            Injects ritual gatherings, full moons, and seasonal spikes directly into ML forecasts and reorder spells.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 rounded-full text-xs font-sans font-black bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-slate-950 border border-amber-500/40 uppercase tracking-wider shadow-sm">
            ⚡ {multiplier.toFixed(1)}X SURGE MULTIPLIER
          </span>
        </div>
      </div>

      {/* Main Grid: Form (Left) vs Live Impact Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Event Config Form */}
        <div className="lg:col-span-7 rounded-3xl luxury-glass border border-amber-300/80 p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/80">
            <h3 className="font-display text-xl font-black text-slate-900 flex items-center gap-2">
              <Moon className="w-5 h-5 text-rose-500 fill-current" />
              <span>Configure Festival Ward</span>
            </h3>
            <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
              Dynamic Horizon Modulator
            </span>
          </div>

          <form onSubmit={handleSaveEvent} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-black text-amber-950 uppercase tracking-wider mb-1">
                Event Designation
              </label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Full Moon Gathering, Solstice Bazaar"
                className="w-full bg-amber-50/70 border border-amber-300 rounded-2xl px-4 py-2.5 text-slate-900 font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
              />
            </div>

            {/* Multiplier Slider & Stepper */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-sans text-xs font-black text-amber-950 uppercase tracking-wider">
                  Demand Surge Factor
                </label>
                <span className="font-mono font-black text-base px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border border-amber-500/40 shadow-sm">
                  {multiplier.toFixed(1)}x Normal Volume
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                className="w-full h-3 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-amber-300"
              />
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600 mt-1">
                <span>1.0x (Baseline)</span>
                <span>3.0x (Midnight Curse Standard)</span>
                <span>5.0x (High Coven Peak)</span>
              </div>
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-black text-amber-950 uppercase tracking-wider mb-1">
                  Surge Begins
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startsAt.slice(0, 16)}
                  onChange={(e) => setStartsAt(e.target.value + ':00')}
                  className="w-full bg-amber-50/70 border border-amber-300 rounded-2xl px-3 py-2 text-slate-900 font-mono font-bold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-black text-amber-950 uppercase tracking-wider mb-1">
                  Surge Concludes
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endsAt.slice(0, 16)}
                  onChange={(e) => setEndsAt(e.target.value + ':00')}
                  className="w-full bg-amber-50/70 border border-amber-300 rounded-2xl px-3 py-2 text-slate-900 font-mono font-bold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Affected Reagents Multi-Select Chips */}
            <div>
              <label className="block font-sans text-xs font-black text-amber-950 uppercase tracking-wider mb-2">
                Target Reagents Affected ({selectedIngredientIds.length} Selected)
              </label>

              {loading ? (
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 rounded-full border border-amber-200" />
                  <Skeleton className="h-8 w-24 rounded-full border border-amber-200" />
                  <Skeleton className="h-8 w-24 rounded-full border border-amber-200" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {ingredients.map((ing) => {
                    const isSelected = selectedIngredientIds.includes(ing.id);
                    return (
                      <button
                        type="button"
                        key={ing.id}
                        onClick={() => handleToggleIngredient(ing.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-black uppercase tracking-wider border transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-transparent shadow-sm scale-[1.02]'
                            : 'bg-amber-50 border-amber-200 text-slate-800 hover:text-black hover:bg-amber-100'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {ing.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-500 text-slate-950 border border-amber-500/40 font-sans text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{saving ? 'Casting Festival Ward...' : 'Cast Festival Ward (Apply Surge)'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Before vs After Comparison */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl luxury-glass border border-amber-300/80 p-6 shadow-xl">
            <h3 className="font-display text-xl font-black text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-amber-200/80">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Before vs After Surge Impact</span>
            </h3>

            <div className="space-y-4">
              {selectedIngredientIds.slice(0, 3).map((id) => {
                const ing = ingredients.find((i) => i.id === id);
                if (!ing) return null;
                const baselineDemand = Math.round(ing.reorder_point * 0.35 * 10) / 10;
                const surgedDemand = Math.round(baselineDemand * multiplier * 10) / 10;

                return (
                  <div
                    key={id}
                    className="p-4 rounded-2xl bg-white/95 border border-amber-200 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-black text-sm text-slate-900">
                        {ing.name}
                      </span>
                      <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm">
                        +{multiplier}x SURGE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold pt-1">
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                        <span className="text-[10px] text-slate-600 block uppercase font-sans font-bold">
                          Baseline Burn
                        </span>
                        <span className="text-slate-900 font-black">
                          {baselineDemand} {ing.unit}/day
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-950 shadow-sm">
                        <span className="text-[10px] block uppercase font-sans font-black text-amber-900">
                          Surged Burn
                        </span>
                        <span className="font-black text-amber-950">
                          {surgedDemand} {ing.unit}/day
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Playful Flying Bat Micro-Interaction */}
      <FlyingBat active={batActive} onComplete={() => setBatActive(false)} />
    </div>
  );
};
