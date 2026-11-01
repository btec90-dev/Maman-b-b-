import React, { useState } from 'react';
import { Calendar as CalendarIcon, Sparkles, Heart, ChevronLeft, ChevronRight, Droplets, Thermometer } from 'lucide-react';

export const OvulationCalendar: React.FC = () => {
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriodStart, setLastPeriodStart] = useState('2026-10-18');
  const [bbtTemp, setBbtTemp] = useState('97.8');
  const [mucusType, setMucusType] = useState('egg_white');
  const [selectedDayLog, setSelectedDayLog] = useState<string | null>(null);

  // Calculate ovulation day: typically 14 days before next period
  // e.g. for 28-day cycle, day 14.
  const lutealLength = 14;
  const ovulationDayOfCycle = cycleLength - lutealLength; // e.g. 14

  const startDate = new Date(lastPeriodStart);
  const ovulationDate = new Date(startDate.getTime() + ovulationDayOfCycle * 24 * 60 * 60 * 1000);
  const fertileStart = new Date(ovulationDate.getTime() - 4 * 24 * 60 * 60 * 1000);
  const fertileEnd = new Date(ovulationDate.getTime() + 1 * 24 * 60 * 60 * 1000);
  const nextPeriodDate = new Date(startDate.getTime() + cycleLength * 24 * 60 * 60 * 1000);

  // Generate 35 calendar cells for current month view
  const daysInMonth = 31;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    // Mock current date in October/November 2026
    const cellDate = new Date(2026, 10, dayNum); // Nov 2026
    const isOvulation = dayNum === 1;
    const isFertile = dayNum >= 28 || dayNum <= 2;
    const isPeriod = dayNum >= 15 && dayNum <= 19;

    return {
      dayNum,
      isOvulation,
      isFertile,
      isPeriod,
    };
  });

  return (
    <div className="space-y-4">
      {/* Settings & Cycle Adjuster */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Ovulation &amp; Fertility Calendar
              </h3>
              <p className="text-xs text-stone-500">Estimates your fertile window &amp; peak conception days</p>
            </div>
          </div>
        </div>

        {/* Cycle Length Slider */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
            <span>Average Menstrual Cycle Length</span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold text-sm tabular-nums">
              {cycleLength} Days
            </span>
          </div>
          <input
            type="range"
            min={21}
            max={38}
            value={cycleLength}
            onChange={(e) => setCycleLength(parseInt(e.target.value, 10))}
            className="w-full accent-rose-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
            <span>21d (Short)</span>
            <span>28d (Standard)</span>
            <span>38d (Long)</span>
          </div>
        </div>

        {/* Cycle Summary Highlights */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60">
            <span className="text-[10px] text-rose-600 uppercase font-bold block">Fertile Window</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs mt-0.5 block">
              5 Days
            </span>
            <span className="text-[10px] text-rose-700 dark:text-rose-300">High Chance</span>
          </div>
          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/60">
            <span className="text-[10px] text-purple-600 uppercase font-bold block">Peak Ovulation</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs mt-0.5 block">
              Day {ovulationDayOfCycle}
            </span>
            <span className="text-[10px] text-purple-700 dark:text-purple-300">Peak Egg Release</span>
          </div>
          <div className="p-3 bg-sage-50/70 dark:bg-sage-950/40 rounded-2xl border border-sage-200 dark:border-sage-900/60">
            <span className="text-[10px] text-sage-600 uppercase font-bold block">Next Period</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs mt-0.5 block">
              In {cycleLength - 14} days
            </span>
            <span className="text-[10px] text-sage-700 dark:text-sage-300">Luteal Phase</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Fertile Window</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Ovulation Day ★</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-200" />
            <span>Period</span>
          </div>
        </div>
      </div>

      {/* Daily Fertility Log (BBT & Cervical Mucus) */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div>
          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
            Daily Fertility Biomarkers
          </h4>
          <p className="text-xs text-stone-500">Track Basal Body Temperature (BBT) &amp; Cervical Mucus</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>Morning BBT (°F)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={bbtTemp}
              onChange={(e) => setBbtTemp(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Cervical Mucus</span>
            </label>
            <select
              value={mucusType}
              onChange={(e) => setMucusType(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
            >
              <option value="egg_white">Egg White (Most Fertile)</option>
              <option value="watery">Watery (Fertile)</option>
              <option value="creamy">Creamy</option>
              <option value="sticky">Sticky</option>
              <option value="dry">Dry</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/60 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
          <span>Today&apos;s Conception Likelihood:</span>
          <span className="font-bold text-sm bg-purple-600 text-white px-2.5 py-0.5 rounded-full">
            PEAK FERTILITY
          </span>
        </div>
      </div>
    </div>
  );
};
