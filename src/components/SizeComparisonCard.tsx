import React from 'react';
import { SizeTheme, WeekDetail } from '../types';
import { Apple, Trophy, Cookie, Sparkles, Scale, Ruler } from 'lucide-react';

interface Props {
  weekData: WeekDetail;
  currentTheme: SizeTheme;
  onSelectTheme: (theme: SizeTheme) => void;
  isTwin: boolean;
  unitSystem?: 'imperial' | 'metric';
}

export const SizeComparisonCard: React.FC<Props> = ({
  weekData,
  currentTheme,
  onSelectTheme,
  isTwin,
  unitSystem = 'imperial',
}) => {
  const currentSize = weekData.sizes[currentTheme];

  const themes: Array<{ id: SizeTheme; label: string; icon: React.ReactNode }> = [
    { id: 'fruits', label: 'Fruits & Veggies', icon: <Apple className="w-3.5 h-3.5" /> },
    { id: 'sports', label: 'Sports', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'snacks', label: 'Snacks & Treats', icon: <Cookie className="w-3.5 h-3.5" /> },
    { id: 'animals', label: 'Cute Animals', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  // In twin mode, total combined weight
  const displayWeightG = isTwin ? Math.round(weekData.weightG * 1.95) : weekData.weightG;
  const displayWeightOz = isTwin ? (weekData.weightOz * 1.95).toFixed(1) : weekData.weightOz;

  const isMetric = unitSystem === 'metric';

  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
      {/* Category Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl mb-4 overflow-x-auto no-scrollbar">
        {themes.map((t) => {
          const isSelected = t.id === currentTheme;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTheme(t.id)}
              className={`flex-1 min-w-[76px] flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span className={isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-stone-400'}>
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Size Comparison Highlight Box */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50/70 to-amber-50/50 dark:from-stone-800/80 dark:to-stone-800/40 border border-rose-100 dark:border-stone-700/60">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-stone-900 flex items-center justify-center text-3xl shadow-sm border border-rose-100/60 dark:border-stone-700 shrink-0 select-none">
          {currentSize.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              {isTwin ? 'Each Twin is the size of a' : 'Your baby is the size of a'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
            {currentSize.name}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 line-clamp-2">
            {currentSize.description}
          </p>
        </div>
      </div>

      {/* Biometric Measurements Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Length Metric Card */}
        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
            <Ruler className="w-3.5 h-3.5 text-sage-600" />
            <span>Fetal Length</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
              {isMetric ? `${weekData.lengthCm} cm` : `${weekData.lengthIn}"`}
            </span>
            <span className="text-xs text-stone-500 font-mono tabular-nums">
              ({isMetric ? `${weekData.lengthIn}"` : `${weekData.lengthCm} cm`})
            </span>
          </div>
          <span className="text-[10px] text-stone-400 block mt-0.5">
            {weekData.week < 20 ? 'Crown to rump (CRL)' : 'Crown to heel length'}
          </span>
        </div>

        {/* Weight Metric Card */}
        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
            <Scale className="w-3.5 h-3.5 text-rose-500" />
            <span>{isTwin ? 'Combined Weight' : 'Estimated Weight'}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
              {isMetric
                ? displayWeightG >= 1000
                  ? `${(displayWeightG / 1000).toFixed(2)} kg`
                  : `${displayWeightG} g`
                : `${displayWeightOz} oz`}
            </span>
            <span className="text-xs text-stone-500 font-mono tabular-nums">
              ({isMetric
                ? `${displayWeightOz} oz`
                : displayWeightG >= 1000
                ? `${(displayWeightG / 1000).toFixed(2)} kg`
                : `${displayWeightG} g`})
            </span>
          </div>
          <span className="text-[10px] text-stone-400 block mt-0.5">
            {isTwin ? 'Dual twins approximate mass' : '50th percentile singleton'}
          </span>
        </div>
      </div>
    </div>
  );
};
