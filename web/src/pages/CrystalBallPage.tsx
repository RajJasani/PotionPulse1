import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Calendar,
  Sparkles,
  TrendingUp,
  Moon,
  Info,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '@shared/api-client';
import {
  Ingredient,
  ForecastResponse,
  DemandHistoryResponse,
  PotionEvent,
} from '@shared/api.types';
import { PotionBottleGauge } from '@shared/PotionBottleGauge';
import { Skeleton } from '../components/Skeleton';

interface CrystalBallPageProps {
  onShowToast: (toast: any) => void;
}

export const CrystalBallPage: React.FC<CrystalBallPageProps> = ({ onShowToast }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [historyData, setHistoryData] = useState<DemandHistoryResponse | null>(null);
  const [events, setEvents] = useState<PotionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [ings, evts] = await Promise.all([
          api.getIngredients(),
          api.getEvents(false),
        ]);
        setIngredients(ings);
        setEvents(evts);
        if (ings.length > 0) {
          const def = ings.find((i) => i.id === 'ing_wolfsbane') || ings[0];
          setSelectedIngredientId(def.id);
        }
      } catch (err: any) {
        onShowToast({
          id: Date.now().toString(),
          type: 'error',
          title: 'Scrying Failed',
          message: err.message,
        });
      }
    };
    fetchInit();
  }, []);

  useEffect(() => {
    if (!selectedIngredientId) return;

    const fetchChartData = async () => {
      try {
        setLoading(true);
        const [fcst, hist] = await Promise.all([
          api.getForecast(selectedIngredientId, horizonDays),
          api.getDemandHistory(selectedIngredientId, 30),
        ]);
        setForecastData(fcst);
        setHistoryData(hist);
      } catch (err: any) {
        onShowToast({
          id: Date.now().toString(),
          type: 'error',
          title: 'Crystal Ball Clouded',
          message: err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedIngredientId, horizonDays]);

  const currentIngredient = ingredients.find((i) => i.id === selectedIngredientId);

  const combinedChartData: any[] = [];

  if (historyData) {
    historyData.history.forEach((h) => {
      combinedChartData.push({
        date: h.date.slice(5),
        fullDate: h.date,
        type: 'history',
        actualDemand: h.total_quantity,
        predictedDemand: null,
        lowerBound: null,
        upperBound: null,
        eventMultiplier: 1.0,
      });
    });
  }

  if (forecastData && forecastData.forecast.length > 0) {
    if (combinedChartData.length > 0) {
      const lastHist = combinedChartData[combinedChartData.length - 1];
      lastHist.predictedDemand = lastHist.actualDemand;
      lastHist.lowerBound = lastHist.actualDemand;
      lastHist.upperBound = lastHist.actualDemand;
    }

    forecastData.forecast.forEach((f) => {
      combinedChartData.push({
        date: f.date.slice(5),
        fullDate: f.date,
        type: 'forecast',
        actualDemand: null,
        predictedDemand: f.predicted_demand,
        lowerBound: f.lower_bound,
        upperBound: f.upper_bound,
        eventMultiplier: f.event_multiplier,
        appliedEventName: f.applied_event_name,
      });
    });
  }

  const activeEvent = events.find(
    (e) =>
      e.is_active &&
      e.affected_ingredient_ids.includes(selectedIngredientId)
  );

  const CustomSiglitosTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isForecast = data.type === 'forecast';

    return (
      <div className="rounded-2xl luxury-glass border border-amber-400/30 p-4 shadow-2xl text-xs font-sans">
        <div className="font-mono text-[11px] font-black border-b border-white/10 pb-1.5 mb-2 flex items-center justify-between gap-4">
          <span className="text-white">Date: {data.fullDate}</span>
          <span className={`uppercase text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm ${
            isForecast ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black' : 'bg-cyan-500 text-slate-950 font-black'
          }`}>
            {isForecast ? 'ML Forecast' : 'Historical Sales'}
          </span>
        </div>

        {data.actualDemand !== null && (
          <div className="flex items-center justify-between gap-4 py-0.5 font-bold">
            <span className="text-purple-200/80">Actual Sold:</span>
            <span className="font-mono text-sm text-cyan-300 font-black">
              {data.actualDemand.toFixed(1)} {currentIngredient?.unit}
            </span>
          </div>
        )}

        {data.predictedDemand !== null && (
          <div className="space-y-1 font-bold">
            <div className="flex items-center justify-between gap-4 py-0.5">
              <span className="text-white">Prophesied Demand:</span>
              <span className="font-mono text-sm text-amber-300 font-black">
                {data.predictedDemand.toFixed(1)} {currentIngredient?.unit}
              </span>
            </div>
            {data.lowerBound !== null && (
              <div className="flex items-center justify-between gap-4 text-[10px] text-purple-200/70">
                <span>95% Confidence Aura:</span>
                <span className="font-mono font-bold text-slate-200">
                  [{data.lowerBound.toFixed(1)} – {data.upperBound.toFixed(1)}]
                </span>
              </div>
            )}
          </div>
        )}

        {data.eventMultiplier > 1.0 && (
          <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center gap-1.5 text-rose-400 font-black text-[10px]">
            <Moon className="w-3.5 h-3.5 fill-rose-400" />
            <span>
              {data.appliedEventName || 'Event Surge'}: {data.eventMultiplier}x Multiplier Applied
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-amber-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 uppercase tracking-wider shadow-sm">
              ALCHEMICAL DIVINATION
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-black flex items-center gap-3">
            <span>The Crystal Ball</span>
          </h2>
          <p className="font-sans text-xs font-bold text-black/80 mt-1">
            Divines future consumption curves using Histogram Gradient Boosting, lag features, and event multipliers.
          </p>
        </div>

        {/* Horizon selector buttons */}
        <div className="flex items-center gap-1.5 bg-amber-100/80 p-1.5 rounded-full border border-amber-300 shadow-sm backdrop-blur-md">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setHorizonDays(days)}
              className={`px-4 py-1.5 rounded-full font-sans text-xs font-black uppercase tracking-wider transition-all min-h-[36px] ${
                horizonDays === days
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-slate-950 shadow-md border border-amber-500/40 scale-[1.02]'
                  : 'text-slate-700 hover:text-black hover:bg-amber-200/60'
              }`}
            >
              {days}d Horizon
            </button>
          ))}
        </div>
      </div>

      {/* Control Strip & Product Selector */}
      <div className="p-5 rounded-3xl luxury-glass border border-amber-300/80 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Ingredient Picker */}
        <div className="flex items-center gap-3">
          <label className="font-sans text-xs font-black text-amber-950 uppercase tracking-wider whitespace-nowrap">
            Scry Reagent:
          </label>
          <select
            value={selectedIngredientId}
            onChange={(e) => setSelectedIngredientId(e.target.value)}
            className="bg-amber-50/70 border border-amber-300 text-slate-900 font-sans text-xs font-bold rounded-full px-4 py-2.5 shadow-inner min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name} ({ing.current_stock.toFixed(1)} {ing.unit} on shelf)
              </option>
            ))}
          </select>
        </div>

        {/* Current Reagent Snapshot */}
        {currentIngredient && (
          <div className="flex items-center gap-4 bg-amber-50/90 px-4 py-2.5 rounded-2xl border border-amber-300/80 shadow-sm">
            <PotionBottleGauge
              currentStock={currentIngredient.current_stock}
              unit={currentIngredient.unit}
              size="sm"
              showLabels={false}
            />
            <div className="text-xs">
              <span className="text-slate-600 font-bold">Current Stock: </span>
              <strong className="font-mono text-slate-900 font-black text-sm">
                {currentIngredient.current_stock.toFixed(1)} {currentIngredient.unit}
              </strong>
              <div className="text-[10px] text-amber-800 font-mono font-bold mt-0.5">
                Reorder point: {currentIngredient.reorder_point} {currentIngredient.unit}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Surge Alert Callout */}
      {activeEvent && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white border border-amber-400 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-sm">
              <Moon className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-sans font-black text-sm flex items-center gap-2">
                <span>{activeEvent.name}</span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 font-black shadow-sm">
                  {activeEvent.multiplier}x Multiplier Active
                </span>
              </h4>
              <p className="font-sans text-xs font-semibold text-white/95 mt-0.5">
                Demand trajectories for {currentIngredient?.name} are elevated 3.0x between{' '}
                {new Date(activeEvent.starts_at).toLocaleDateString()} and{' '}
                {new Date(activeEvent.ends_at).toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Card */}
      <div className="rounded-3xl luxury-glass border border-amber-300/80 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-amber-200/80">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Demand Trajectory & Prophecy Aura</span>
            </h3>
            <p className="font-sans text-xs font-semibold text-slate-600 mt-1">
              Sky Blue: Historical customer demand &bull; Luminous Gradient: Multi-horizon ML forecast &bull; Rose-Purple Aura: 95% Confidence Band
            </p>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-[380px] w-full rounded-2xl border border-amber-200" />
        ) : (
          <div className="h-[380px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={combinedChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#F472B6" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#FB7185" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#CBD5E1"
                  strokeOpacity={0.6}
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  tick={{ fill: '#334155', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700 }}
                  tickLine={false}
                />

                <YAxis
                  stroke="#64748B"
                  tick={{ fill: '#334155', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700 }}
                  tickLine={false}
                  unit={` ${currentIngredient?.unit || ''}`}
                />

                <Tooltip content={<CustomSiglitosTooltip />} />

                <Legend
                  wrapperStyle={{
                    paddingTop: '16px',
                    fontSize: '11px',
                    fontFamily: 'Golos Text',
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="url(#confidenceBand)"
                  name="Confidence Band (Upper)"
                />

                <Line
                  type="monotone"
                  dataKey="actualDemand"
                  stroke="#0284C7"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#0284C7', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#0284C7' }}
                  name="Actual Consumption"
                />

                <Line
                  type="monotone"
                  dataKey="predictedDemand"
                  stroke="#9333EA"
                  strokeWidth={3.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#D97706', stroke: '#7C3AED', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#D97706' }}
                  name="Prophesied Demand"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Telemetry Summary Cards Below Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-amber-200/80">
          <div className="p-4 rounded-2xl bg-white/90 border border-purple-200/80 shadow-md">
            <span className="text-[11px] font-sans font-black text-purple-900 uppercase tracking-wider block">
              14-Day Forecasted Volume
            </span>
            <span className="font-mono text-2xl font-black text-slate-900 mt-1 block">
              {forecastData
                ? forecastData.forecast
                    .reduce((acc, f) => acc + f.predicted_demand, 0)
                    .toFixed(1)
                : '...'}{' '}
              {currentIngredient?.unit}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-emerald-200/80 shadow-md">
            <span className="text-[11px] font-sans font-black text-emerald-900 uppercase tracking-wider block">
              Average Burn Rate
            </span>
            <span className="font-mono text-2xl font-black text-emerald-800 mt-1 block">
              {forecastData && forecastData.forecast.length > 0
                ? (
                    forecastData.forecast.reduce((acc, f) => acc + f.predicted_demand, 0) /
                    forecastData.forecast.length
                  ).toFixed(2)
                : '...'}{' '}
              {currentIngredient?.unit}/day
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/80 shadow-md">
            <span className="text-[11px] font-sans font-black text-amber-900 uppercase tracking-wider block">
              Celestial Weather
            </span>
            <span className="font-sans text-sm font-black text-amber-950 mt-1 block flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-orange-500 fill-orange-500" />
              {activeEvent ? `${activeEvent.name} (${activeEvent.multiplier}x)` : 'Standard Lunar Orbit'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
