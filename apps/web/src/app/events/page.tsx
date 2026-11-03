'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Zap,
  PlusCircle,
  Flame,
  CheckCircle2,
  Clock,
  Skull,
  X,
} from 'lucide-react';

interface SeasonalEvent {
  id: string;
  name: string;
  code: string;
  description: string;
  multiplier: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  affectedIngredients: string[];
}

export default function SeasonalEventsPage() {
  const [events, setEvents] = useState<SeasonalEvent[]>([
    {
      id: 'event-001',
      name: 'The Midnight Curse (Spooky Apex)',
      code: 'MIDNIGHT_CURSE_2026',
      description:
        'Occurs annually from Oct 28 to Nov 2. Mystical apothecary demand spikes violently for dark alchemy components.',
      multiplier: 3.0,
      startDate: '2026-10-28',
      endDate: '2026-11-02',
      isActive: true,
      affectedIngredients: ['Bat Wings', 'Mandrake Root', 'Ghost Pepper', 'Dragon Scale'],
    },
    {
      id: 'event-002',
      name: 'Blood Moon Conjunction',
      code: 'BLOOD_MOON_CONJUNCTION',
      description:
        'Celestial alignment amplifying vampiric and restorative potion brewing frequency across the realm.',
      multiplier: 2.2,
      startDate: '2026-11-14',
      endDate: '2026-11-16',
      isActive: false,
      affectedIngredients: ['Blood Orange Extract', 'Crimson Lily Petals'],
    },
    {
      id: 'event-003',
      name: 'Winter Solstice Frost Faire',
      code: 'WINTER_SOLSTICE_2026',
      description:
        'End-of-year festival requiring mass production of Warmth draughts and Frost Resistance elixirs.',
      multiplier: 1.8,
      startDate: '2026-12-20',
      endDate: '2026-12-26',
      isActive: false,
      affectedIngredients: ['Frost Lotus', 'Star Anise', 'Glacial Slime'],
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMultiplier, setNewMultiplier] = useState(2.0);
  const [newStart, setNewStart] = useState('2026-11-05');
  const [newEnd, setNewEnd] = useState('2026-11-08');
  const [newIngredients, setNewIngredients] = useState('Nightshade, Mandrake Root');

  const toggleEventActive = (id: string) => {
    setEvents(
      events.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e)),
    );
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: SeasonalEvent = {
      id: `event-${Date.now()}`,
      name: newName,
      code: newName.toUpperCase().replace(/\s+/g, '_'),
      description: 'Custom seasonal event configured for local apothecary demand curves.',
      multiplier: Number(newMultiplier),
      startDate: newStart,
      endDate: newEnd,
      isActive: true,
      affectedIngredients: newIngredients.split(',').map((s) => s.trim()),
    };
    setEvents([newEvent, ...events]);
    setShowCreateModal(false);
    setNewName('');
  };

  const midnightCurse = events.find((e) => e.code === 'MIDNIGHT_CURSE_2026');

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="sticker-tag bg-hackOrange text-white text-[10px]">
                SEASONAL MULTIPLIERS
              </span>
              <span className="font-mono text-xs font-bold text-ink/70">
                // DYNAMIC FESTIVAL DEMAND
              </span>
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight flex items-center gap-2">
              <span>🎃</span> Seasonal Events & Midnight Curse Engine
            </h1>
            <p className="text-xs text-ink/70 font-medium mt-1">
              Configure mystical events that apply deterministic demand multipliers to specific ingredients.
            </p>
          </div>

          <Button
            size="sm"
            variant="orange"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 font-black"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Seasonal Event</span>
          </Button>
        </div>

        {/* Featured Midnight Curse Banner */}
        {midnightCurse && (
          <div className="p-6 bg-hackAmber border-3 border-ink shadow-retro-xl rounded-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="sticker-tag bg-hackOrange text-white font-mono flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    APEX FESTIVAL EVENT
                  </span>
                  <Badge variant={midnightCurse.isActive ? 'success' : 'outline'}>
                    {midnightCurse.isActive ? '✓ LIVE & MULTIPLYING' : 'INACTIVE'}
                  </Badge>
                </div>

                <h2 className="text-2xl font-black text-ink flex items-center gap-2">
                  <Skull className="w-6 h-6 text-hackOrange" />
                  {midnightCurse.name}
                </h2>
                <p className="text-xs text-ink/80 max-w-xl font-medium">
                  {midnightCurse.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                  <span className="text-ink/70 font-bold">Targeted Ingredients:</span>
                  {midnightCurse.affectedIngredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-2 py-0.5 rounded-md bg-white border-2 border-ink text-xs font-bold text-ink shadow-retro-sm"
                    >
                      {ing} (3.0×)
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <div className="p-3.5 bg-white rounded-xl border-2 border-ink shadow-retro text-center min-w-[120px]">
                  <span className="text-[10px] uppercase font-mono font-bold text-ink/60 block">
                    Multiplier
                  </span>
                  <span className="text-3xl font-black text-hackOrange">3.00×</span>
                </div>

                <Button
                  onClick={() => toggleEventActive(midnightCurse.id)}
                  variant={midnightCurse.isActive ? 'danger' : 'mint'}
                  className="font-black"
                >
                  {midnightCurse.isActive ? 'Deactivate Event' : 'Activate Event'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Event Schedule List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="sticker-tag bg-hackPurple text-white text-[10px]">
              CALENDAR
            </span>
            <h3 className="text-base font-black text-ink flex items-center gap-2 font-mono">
              <Calendar className="w-4 h-4 text-hackOrange" />
              Seasonal Event Schedule
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-5 rounded-xl border-2 border-ink shadow-retro flex flex-col justify-between transition-all bg-white ${
                  event.isActive ? '' : 'opacity-70 bg-sand'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-base text-ink">{event.name}</h4>
                      <p className="text-[10px] font-mono font-bold text-ink/60">{event.code}</p>
                    </div>
                    <Badge variant={event.isActive ? 'success' : 'outline'}>
                      {event.isActive ? 'Active' : 'Off'}
                    </Badge>
                  </div>

                  <p className="text-xs text-ink/80 font-medium">{event.description}</p>

                  <div className="p-3 rounded-lg bg-sand border-2 border-ink/40 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between font-bold">
                      <span className="text-ink/70">Multiplier:</span>
                      <span className="text-hackOrange">{event.multiplier}× Surge</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-ink/70">Duration:</span>
                      <span className="text-ink">
                        {event.startDate} &rarr; {event.endDate}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-ink/60 block mb-1">
                      Affected Ingredients:
                    </span>
                    <div className="flex flex-wrap gap-1 font-mono">
                      {event.affectedIngredients.map((item) => (
                        <span
                          key={item}
                          className="px-1.5 py-0.5 rounded bg-cream text-[10px] text-ink font-bold border border-ink/40"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t-2 border-ink/15 flex items-center justify-between">
                  <span className="text-[11px] text-ink/60 flex items-center gap-1 font-mono font-bold">
                    <Clock className="w-3 h-3 text-hackOrange" />
                    Deterministic Sync
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleEventActive(event.id)}
                    className="h-8 px-2.5 text-xs font-bold"
                  >
                    {event.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 bg-white border-3 border-ink shadow-retro-xl rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <h3 className="text-lg font-black text-ink flex items-center gap-2">
                  <Zap className="w-5 h-5 text-hackOrange" />
                  Create Seasonal Event
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-lg border-2 border-ink bg-sand flex items-center justify-center text-ink hover:bg-cream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3 font-mono">
                <div>
                  <label className="block text-xs font-black text-ink mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lunar Eclipse Gathering"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs font-sans font-bold text-ink focus:outline-none focus:ring-2 focus:ring-hackOrange"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs font-bold text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-ink mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs font-bold text-ink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-ink mb-1">
                    Demand Multiplier ({newMultiplier}×)
                  </label>
                  <input
                    type="range"
                    min="1.1"
                    max="5.0"
                    step="0.1"
                    value={newMultiplier}
                    onChange={(e) => setNewMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-hackOrange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-ink mb-1">
                    Affected Ingredients (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bat Wings, Mandrake Root"
                    value={newIngredients}
                    onChange={(e) => setNewIngredients(e.target.value)}
                    className="w-full p-2 bg-cream border-2 border-ink rounded-xl text-xs font-sans font-bold text-ink"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="orange"
                    size="sm"
                    className="flex items-center gap-1 font-black"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Create Event
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
