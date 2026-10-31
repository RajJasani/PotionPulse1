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
      <div className="rounded-2xl bg-white dark:bg-[#18171F] border-2 border-sig-black p-3.5 shadow-sig text-xs font-sans">
        <div className="font-mono text-[11px] font-black border-b-2 border-sig-black pb-1.5 mb-2 flex items-center justify-between gap-4">
          <span className="text-sig-black dark:text-sig-cream">Date: {data.fullDate}</span>
          <span className={`uppercase text-[9px] font-black px-2 py-0.5 rounded-full border border-sig-black ${
            isForecast ? 'bg-sig-limon text-sig-black' : 'bg-sig-tropical text-sig-black'
          }`}>
            {isForecast ? 'ML Forecast' : 'Historical Sales'}
          </span>
        </div>

        {data.actualDemand !== null && (
          <div className="flex items-center justify-between gap-4 py-0.5 font-bold">
            <span className="text-sig-black/70 dark:text-sig-cream/70">Actual Sold:</span>
            <span className="font-mono text-sm text-sig-tropical">
              {data.actualDemand.toFixed(1)} {currentIngredient?.unit}
            </span>
          </div>
        )}

        {data.predictedDemand !== null && (
          <div className="space-y-1 font-bold">
            <div className="flex items-center justify-between gap-4 py-0.5">
              <span className="text-sig-black dark:text-sig-cream">Prophesied Demand:</span>
              <span className="font-mono text-sm text-sig-black dark:text-sig-limon">
                {data.predictedDemand.toFixed(1)} {currentIngredient?.unit}
              </span>
            </div>
            {data.lowerBound !== null && (
              <div className="flex items-center justify-between gap-4 text-[10px] text-sig-black/60 dark:text-sig-cream/60">
                <span>95% Confidence Aura:</span>
                <span className="font-mono font-bold">
                  [{data.lowerBound.toFixed(1)} – {data.upperBound.toFixed(1)}]
                </span>
              </div>
            )}
          </div>
        )}

        {data.eventMultiplier > 1.0 && (
          <div className="mt-2 pt-1.5 border-t-2 border-sig-black flex items-center gap-1.5 text-sig-fresa font-black text-[10px]">
            <Moon className="w-3.5 h-3.5 fill-sig-fresa" />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 uppercase tracking-wider shadow-sm">
              ALCHEMICAL DIVINATION
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>The Crystal Ball</span>
          </h2>
          <p className="font-sans text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
            Divines future consumption curves using Histogram Gradient Boosting, lag features, and event multipliers.
          </p>
        </div>

        {/* Horizon selector buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#161422] p-1.5 rounded-full border border-slate-300 dark:border-white/15 shadow-sm backdrop-blur-md">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setHorizonDays(days)}
              className={`px-3.5 py-1.5 rounded-full font-sans text-xs font-black uppercase tracking-wider transition-all min-h-[36px] ${
                horizonDays === days
                  ? 'bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] text-black shadow-md border border-amber-500/40 scale-[1.02]'
                  : 'text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {days}d Horizon
            </button>
          ))}
        </div>
      </div>

      {/* Control Strip & Product Selector */}
      <div className="p-5 rounded-3xl bg-white/95 dark:bg-[#151221] backdrop-blur-xl border border-slate-200 dark:border-white/15 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Ingredient Picker */}
        <div className="flex items-center gap-3">
          <label className="font-sans text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider whitespace-nowrap">
            Scry Reagent:
          </label>
          <select
            value={selectedIngredientId}
            onChange={(e) => setSelectedIngredientId(e.target.value)}
            className="bg-[#FAF8F2] dark:bg-[#1E192D] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-sans text-xs font-bold rounded-full px-4 py-2.5 shadow-sm min-h-[44px]"
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
          <div className="flex items-center gap-4 bg-gradient-to-r from-[#FAF8F2] to-[#F1EDE1] dark:from-[#201D2E] dark:to-[#171524] px-4 py-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-pro-sm">
            <PotionBottleGauge
              currentStock={currentIngredient.current_stock}
              unit={currentIngredient.unit}
              size="sm"
              showLabels={false}
            />
            <div className="text-xs">
              <span className="text-sig-black/60 dark:text-sig-cream/60 font-bold">Current Stock: </span>
              <strong className="font-mono text-sig-black dark:text-sig-cream font-black text-sm">
                {currentIngredient.current_stock.toFixed(1)} {currentIngredient.unit}
              </strong>
              <div className="text-[10px] text-amber-600 dark:text-sig-limon font-mono font-bold">
                Reorder point: {currentIngredient.reorder_point} {currentIngredient.unit}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Surge Alert Callout */}
      {activeEvent && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FF7A00] via-[#FF5A51] to-[#FC4AAA] text-white border border-white/15 shadow-pro-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-sm">
              <Moon className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-sans font-black text-sm flex items-center gap-2">
                <span>{activeEvent.name}</span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-sig-limon text-sig-black font-black shadow-sm">
                  {activeEvent.multiplier}x Multiplier Active
                </span>
              </h4>
              <p className="font-sans text-xs font-bold text-white/90 mt-0.5">
                Demand trajectories for {currentIngredient?.name} are elevated 3.0x between{' '}
                {new Date(activeEvent.starts_at).toLocaleDateString()} and{' '}
                {new Date(activeEvent.ends_at).toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Card */}
      <div className="rounded-3xl bg-white/85 dark:bg-[#161422]/85 backdrop-blur-xl border border-black/10 dark:border-white/12 p-6 sm:p-7 shadow-pro">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10 dark:border-white/10">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-black text-sig-black dark:text-sig-cream flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Demand Trajectory & Prophecy Aura</span>
            </h3>
            <p className="font-sans text-xs font-bold text-sig-black/60 dark:text-sig-cream/60 mt-0.5">
              Sky Blue: Historical customer demand &bull; Luminous Gradient: Multi-horizon ML forecast &bull; Rose-Purple Aura: 95% Confidence Band
            </p>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-[380px] w-full rounded-2xl border border-black/10 dark:border-white/10" />
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
                  stroke="#888888"
                  strokeOpacity={0.2}
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  tick={{ fill: 'currentColor', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700 }}
                  tickLine={false}
                />

                <YAxis
                  stroke="#888888"
                  tick={{ fill: 'currentColor', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700 }}
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
                  activeDot={{ r: 6, fill: '#38BDF8' }}
                  name="Actual Consumption"
                />

                <Line
                  type="monotone"
                  dataKey="predictedDemand"
                  stroke="#8B5CF6"
                  strokeWidth={3.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#FEE214', stroke: '#7C3AED', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#FEE214' }}
                  name="Prophesied Demand"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Telemetry Summary Cards Below Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E192D] border border-slate-200 dark:border-white/10 shadow-sm">
            <span className="text-[11px] font-sans font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              14-Day Forecasted Volume
            </span>
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {forecastData
                ? forecastData.forecast
                    .reduce((acc, f) => acc + f.predicted_demand, 0)
                    .toFixed(1)
                : '...'}{' '}
              {currentIngredient?.unit}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E192D] border border-slate-200 dark:border-white/10 shadow-sm">
            <span className="text-[11px] font-sans font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Average Burn Rate
            </span>
            <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {forecastData && forecastData.forecast.length > 0
                ? (
                    forecastData.forecast.reduce((acc, f) => acc + f.predicted_demand, 0) /
                    forecastData.forecast.length
                  ).toFixed(2)
                : '...'}{' '}
              {currentIngredient?.unit}/day
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E192D] border border-slate-200 dark:border-white/10 shadow-sm">
            <span className="text-[11px] font-sans font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Celestial Weather
            </span>
            <span className="font-sans text-sm font-black text-slate-900 dark:text-amber-300 mt-1 block flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-pink-500 fill-pink-500" />
              {activeEvent ? `${activeEvent.name} (${activeEvent.multiplier}x)` : 'Standard Lunar Orbit'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
