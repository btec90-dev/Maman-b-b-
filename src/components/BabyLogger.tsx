import React, { useState, useEffect, useRef } from 'react';
import { FeedingLog, DiaperLog, SleepLog, PumpLog, PostpartumWellnessLog } from '../types';
import { Baby, Utensils, Moon, Droplets, Heart, Play, Pause, Plus, CheckCircle2, RotateCcw, Clock } from 'lucide-react';

interface Props {
  feedingLogs: FeedingLog[];
  diaperLogs: DiaperLog[];
  sleepLogs: SleepLog[];
  pumpLogs: PumpLog[];
  postpartumLogs: PostpartumWellnessLog[];
  onAddFeeding: (log: FeedingLog) => void;
  onAddDiaper: (log: DiaperLog) => void;
  onAddSleep: (log: SleepLog) => void;
  onAddPump: (log: PumpLog) => void;
  onAddPostpartumLog: (log: PostpartumWellnessLog) => void;
}

export const BabyLogger: React.FC<Props> = ({
  feedingLogs,
  diaperLogs,
  sleepLogs,
  pumpLogs,
  postpartumLogs,
  onAddFeeding,
  onAddDiaper,
  onAddSleep,
  onAddPump,
  onAddPostpartumLog,
}) => {
  const [activeTab, setActiveTab] = useState<'feeding' | 'diaper' | 'sleep' | 'pumping' | 'postpartum'>('feeding');

  // Breastfeeding Dual Side Timer
  const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(null);
  const [isNursingTimerRunning, setIsNursingTimerRunning] = useState(false);
  const [leftSeconds, setLeftSeconds] = useState(480); // 8 mins pre-loaded
  const [rightSeconds, setRightSeconds] = useState(420); // 7 mins pre-loaded
  const nursingTimerRef = useRef<number | null>(null);

  // Bottle logger state
  const [bottleAmount, setBottleAmount] = useState('3.5');
  const [bottleType, setBottleType] = useState<'breast_milk' | 'formula'>('breast_milk');

  // Diaper state
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both'>('wet');
  const [stoolColor, setStoolColor] = useState<'yellow' | 'brown' | 'green' | 'meconium'>('yellow');
  const [consistency, setConsistency] = useState<'seedy' | 'normal' | 'loose'>('seedy');

  // Sleep timer state
  const [isSleepTimerRunning, setIsSleepTimerRunning] = useState(false);
  const [sleepSeconds, setSleepSeconds] = useState(0);
  const [isNightSleep, setIsNightSleep] = useState(false);
  const sleepTimerRef = useRef<number | null>(null);

  // Pumping state
  const [leftPumpOz, setLeftPumpOz] = useState('2.5');
  const [rightPumpOz, setRightPumpOz] = useState('2.0');
  const [pumpDuration, setPumpDuration] = useState('15');

  // Postpartum wellness state
  const [bleedingLevel, setBleedingLevel] = useState<'none' | 'light' | 'moderate' | 'heavy'>('light');
  const [perinealPain, setPerinealPain] = useState<'none' | 'mild' | 'moderate' | 'severe'>('mild');
  const [moodRating, setMoodRating] = useState(4);
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [pelvicFloorDone, setPelvicFloorDone] = useState(true);

  // Breastfeeding timer loop
  useEffect(() => {
    if (isNursingTimerRunning && activeSide) {
      nursingTimerRef.current = window.setInterval(() => {
        if (activeSide === 'left') {
          setLeftSeconds((s) => s + 1);
        } else {
          setRightSeconds((s) => s + 1);
        }
      }, 1000);
    } else if (nursingTimerRef.current) {
      clearInterval(nursingTimerRef.current);
      nursingTimerRef.current = null;
    }
    return () => {
      if (nursingTimerRef.current) clearInterval(nursingTimerRef.current);
    };
  }, [isNursingTimerRunning, activeSide]);

  // Sleep timer loop
  useEffect(() => {
    if (isSleepTimerRunning) {
      sleepTimerRef.current = window.setInterval(() => {
        setSleepSeconds((s) => s + 1);
      }, 1000);
    } else if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [isSleepTimerRunning]);

  const handleToggleSide = (side: 'left' | 'right') => {
    if (activeSide === side && isNursingTimerRunning) {
      // Pause
      setIsNursingTimerRunning(false);
    } else {
      setActiveSide(side);
      setIsNursingTimerRunning(true);
    }
  };

  const handleSaveBreastfeeding = () => {
    setIsNursingTimerRunning(false);
    const log: FeedingLog = {
      id: `feed-${Date.now()}`,
      timestamp: Date.now(),
      type: 'breast',
      leftDurationMinutes: Math.round(leftSeconds / 60),
      rightDurationMinutes: Math.round(rightSeconds / 60),
    };
    onAddFeeding(log);
    setLeftSeconds(0);
    setRightSeconds(0);
    setActiveSide(null);
  };

  const handleSaveBottle = () => {
    const oz = parseFloat(bottleAmount);
    if (isNaN(oz) || oz <= 0) return;

    const log: FeedingLog = {
      id: `feed-${Date.now()}`,
      timestamp: Date.now(),
      type: 'bottle',
      bottleAmountOz: oz,
      bottleType,
    };
    onAddFeeding(log);
  };

  const handleSaveDiaper = () => {
    const log: DiaperLog = {
      id: `diaper-${Date.now()}`,
      timestamp: Date.now(),
      type: diaperType,
      color: diaperType !== 'wet' ? stoolColor : undefined,
      consistency: diaperType !== 'wet' ? consistency : undefined,
    };
    onAddDiaper(log);
  };

  const handleSaveSleep = () => {
    setIsSleepTimerRunning(false);
    const now = Date.now();
    const durationMins = Math.max(1, Math.round(sleepSeconds / 60));

    const log: SleepLog = {
      id: `sleep-${now}`,
      startTime: now - sleepSeconds * 1000,
      endTime: now,
      durationMinutes: durationMins,
      isNightSleep,
    };
    onAddSleep(log);
    setSleepSeconds(0);
  };

  const handleSavePump = () => {
    const l = parseFloat(leftPumpOz) || 0;
    const r = parseFloat(rightPumpOz) || 0;
    const dur = parseInt(pumpDuration, 10) || 15;

    const log: PumpLog = {
      id: `pump-${Date.now()}`,
      timestamp: Date.now(),
      leftOz: l,
      rightOz: r,
      durationMinutes: dur,
    };
    onAddPump(log);
  };

  const handleSavePostpartum = () => {
    const log: PostpartumWellnessLog = {
      id: `pp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      bleedingLevel,
      perinealPain,
      moodRating,
      waterGlasses,
      pelvicFloorDone,
    };
    onAddPostpartumLog(log);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-4">
      {/* Category Pills Navigation */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'feeding' as const, label: 'Feedings' },
          { id: 'diaper' as const, label: 'Diapers' },
          { id: 'sleep' as const, label: 'Sleep' },
          { id: 'pumping' as const, label: 'Pumping' },
          { id: 'postpartum' as const, label: 'Mom Recovery' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[70px] py-2 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap text-center ${
              activeTab === tab.id
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: FEEDINGS (BREAST & BOTTLE) */}
      {activeTab === 'feeding' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
          {/* Dual Breast Nursing Timer */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Breastfeeding Live Timer
                </h3>
                <p className="text-xs text-stone-500">Tap side to start/switch duration</p>
              </div>
              <span className="font-mono text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
                Total: {Math.round((leftSeconds + rightSeconds) / 60)} min
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Left Breast */}
              <button
                type="button"
                onClick={() => handleToggleSide('left')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  activeSide === 'left' && isNursingTimerRunning
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm animate-pulse'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700'
                }`}
              >
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Left Breast
                </span>
                <span className="font-mono text-2xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums my-1">
                  {formatTimer(leftSeconds)}
                </span>
                <span className="text-[11px] text-stone-500">
                  {activeSide === 'left' && isNursingTimerRunning ? 'Nursing Now (Tap Pause)' : 'Tap to Start'}
                </span>
              </button>

              {/* Right Breast */}
              <button
                type="button"
                onClick={() => handleToggleSide('right')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  activeSide === 'right' && isNursingTimerRunning
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm animate-pulse'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700'
                }`}
              >
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Right Breast
                </span>
                <span className="font-mono text-2xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums my-1">
                  {formatTimer(rightSeconds)}
                </span>
                <span className="text-[11px] text-stone-500">
                  {activeSide === 'right' && isNursingTimerRunning ? 'Nursing Now (Tap Pause)' : 'Tap to Start'}
                </span>
              </button>
            </div>

            {(leftSeconds > 0 || rightSeconds > 0) && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveBreastfeeding}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Save Nursing Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLeftSeconds(0);
                    setRightSeconds(0);
                    setIsNursingTimerRunning(false);
                    setActiveSide(null);
                  }}
                  className="p-2.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100"
                  title="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Bottle Feeding Quick Logger */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs mb-2">
              Bottle Feeding Logger
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setBottleType('breast_milk')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer border ${
                  bottleType === 'breast_milk'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-200'
                    : 'border-stone-200 dark:border-stone-700 text-stone-500'
                }`}
              >
                Expressed Milk
              </button>
              <button
                type="button"
                onClick={() => setBottleType('formula')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer border ${
                  bottleType === 'formula'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-200'
                    : 'border-stone-200 dark:border-stone-700 text-stone-500'
                }`}
              >
                Formula Bottle
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.5"
                placeholder="Amount (oz)"
                value={bottleAmount}
                onChange={(e) => setBottleAmount(e.target.value)}
                className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveBottle}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Log Bottle
              </button>
            </div>
          </div>

          {/* Feeding History */}
          {feedingLogs.length > 0 && (
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-semibold text-stone-500 block mb-2">Recent Feeds</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {feedingLogs.slice(0, 4).map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5 text-rose-500" />
                      <span className="font-semibold capitalize text-stone-800 dark:text-stone-200">
                        {f.type === 'breast' ? `Nursing (L: ${f.leftDurationMinutes}m, R: ${f.rightDurationMinutes}m)` : `Bottle: ${f.bottleAmountOz} oz (${f.bottleType?.replace('_', ' ')})`}
                      </span>
                    </div>
                    <span className="text-stone-400 font-mono text-[11px]">
                      {new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIAPERS */}
      {activeTab === 'diaper' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Diaper Change Logger
            </h3>
            <p className="text-xs text-stone-500">Track wet and dirty diapers for pediatric checkups</p>
          </div>

          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'wet' as const, label: '💧 Wet Diaper' },
              { id: 'dirty' as const, label: '💩 Dirty Diaper' },
              { id: 'both' as const, label: '✨ Both' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setDiaperType(t.id)}
                className={`py-3 px-2 rounded-2xl text-xs font-semibold cursor-pointer border transition-all ${
                  diaperType === t.id
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-200 shadow-xs'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Stool details if dirty or both */}
          {diaperType !== 'wet' && (
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                  Stool Color
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'yellow' as const, label: 'Yellow' },
                    { id: 'brown' as const, label: 'Brown' },
                    { id: 'green' as const, label: 'Green' },
                    { id: 'meconium' as const, label: 'Meconium' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setStoolColor(c.id)}
                      className={`flex-1 py-1 px-1 rounded-lg text-[11px] font-semibold cursor-pointer border ${
                        stoolColor === c.id
                          ? 'bg-amber-100 border-amber-500 text-amber-900'
                          : 'border-stone-200 dark:border-stone-700 text-stone-500'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
                  Consistency
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'seedy' as const, label: 'Seedy (Normal)' },
                    { id: 'normal' as const, label: 'Pasty' },
                    { id: 'loose' as const, label: 'Loose' },
                  ].map((cons) => (
                    <button
                      key={cons.id}
                      type="button"
                      onClick={() => setConsistency(cons.id)}
                      className={`flex-1 py-1 px-1 rounded-lg text-[11px] font-semibold cursor-pointer border ${
                        consistency === cons.id
                          ? 'bg-amber-100 border-amber-500 text-amber-900'
                          : 'border-stone-200 dark:border-stone-700 text-stone-500'
                      }`}
                    >
                      {cons.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveDiaper}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            Record Diaper Change
          </button>

          {/* Diaper History */}
          {diaperLogs.length > 0 && (
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-semibold text-stone-500 block mb-2">Today&apos;s Diapers</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {diaperLogs.slice(0, 4).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs">
                    <span className="font-semibold uppercase text-stone-800 dark:text-stone-200">
                      {d.type} {d.color ? `· ${d.color} ${d.consistency}` : ''}
                    </span>
                    <span className="text-stone-400 font-mono text-[11px]">
                      {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SLEEP SESSIONS */}
      {activeTab === 'sleep' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4 text-center">
          <div className="text-left">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Baby Sleep Tracker
            </h3>
            <p className="text-xs text-stone-500">Track daytime naps and overnight sleep duration</p>
          </div>

          <div className="py-2">
            <span className="font-mono text-5xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {formatTimer(sleepSeconds)}
            </span>
            <span className="block text-xs text-stone-400 mt-1">Active Sleep Session</span>
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsNightSleep(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                !isNightSleep ? 'bg-rose-50 border-rose-500 text-rose-800' : 'border-stone-200 text-stone-500'
              }`}
            >
              ☀️ Nap
            </button>
            <button
              type="button"
              onClick={() => setIsNightSleep(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                isNightSleep ? 'bg-indigo-50 border-indigo-500 text-indigo-800' : 'border-stone-200 text-stone-500'
              }`}
            >
              🌙 Night Sleep
            </button>
          </div>

          <div className="flex gap-2">
            {!isSleepTimerRunning ? (
              <button
                type="button"
                onClick={() => setIsSleepTimerRunning(true)}
                className="flex-1 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Start Sleep Timer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveSleep}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer animate-pulse"
              >
                Wake Up &amp; Save Sleep ({Math.max(1, Math.round(sleepSeconds / 60))}m)
              </button>
            )}
          </div>

          {/* Sleep History */}
          {sleepLogs.length > 0 && (
            <div className="text-left pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-semibold text-stone-500 block mb-2">Recent Sleep Logs</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {sleepLogs.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {s.isNightSleep ? '🌙 Night' : '☀️ Nap'}: {s.durationMinutes} min
                    </span>
                    <span className="text-stone-400 font-mono text-[11px]">
                      {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PUMPING */}
      {activeTab === 'pumping' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Breast Pumping Stash Log
            </h3>
            <p className="text-xs text-stone-500">Record pumped volume per breast</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                Left Breast (oz)
              </label>
              <input
                type="number"
                step="0.5"
                value={leftPumpOz}
                onChange={(e) => setLeftPumpOz(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                Right Breast (oz)
              </label>
              <input
                type="number"
                step="0.5"
                value={rightPumpOz}
                onChange={(e) => setRightPumpOz(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSavePump}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            Log Pumping Session ({((parseFloat(leftPumpOz) || 0) + (parseFloat(rightPumpOz) || 0)).toFixed(1)} oz total)
          </button>

          {/* Pump History */}
          {pumpLogs.length > 0 && (
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
              <span className="text-xs font-semibold text-stone-500 block mb-1">Recent Pump Sessions</span>
              {pumpLogs.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Total {(p.leftOz + p.rightOz).toFixed(1)} oz (L: {p.leftOz} oz, R: {p.rightOz} oz)
                  </span>
                  <span className="text-stone-400 font-mono text-[11px]">{p.durationMinutes} min</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: POSTPARTUM WELLNESS FOR MOM */}
      {activeTab === 'postpartum' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Mom&apos;s Postpartum Recovery Check-In
            </h3>
            <p className="text-xs text-stone-500">
              Gentle daily recovery tracker for physical healing and emotional balance.
            </p>
          </div>

          {/* Bleeding / Lochia level */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Postpartum Bleeding (Lochia)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['none', 'light', 'moderate', 'heavy'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setBleedingLevel(level)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold capitalize cursor-pointer border ${
                    bleedingLevel === level
                      ? 'bg-rose-100 border-rose-500 text-rose-900'
                      : 'border-stone-200 dark:border-stone-700 text-stone-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Perineal / C-Section Pain */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Perineal / Incision Discomfort
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['none', 'mild', 'moderate', 'severe'] as const).map((pain) => (
                <button
                  key={pain}
                  type="button"
                  onClick={() => setPerinealPain(pain)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold capitalize cursor-pointer border ${
                    perinealPain === pain
                      ? 'bg-amber-100 border-amber-500 text-amber-900'
                      : 'border-stone-200 dark:border-stone-700 text-stone-500'
                  }`}
                >
                  {pain}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Hydration Counter */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Water Hydration (Crucial for milk supply)</span>
              </span>
              <span className="font-mono tabular-nums font-bold text-blue-600">
                {waterGlasses} / 8 Glasses
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setWaterGlasses(i + 1)}
                  className={`flex-1 h-8 rounded-lg cursor-pointer transition-colors ${
                    i < waterGlasses ? 'bg-blue-500 text-white' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                >
                  💧
                </button>
              ))}
            </div>
          </div>

          {/* Pelvic Floor Breathing */}
          <div
            onClick={() => setPelvicFloorDone(!pelvicFloorDone)}
            className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
              pelvicFloorDone
                ? 'bg-sage-50 border-sage-300 dark:bg-sage-950/40'
                : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                Gentle Diaphragmatic &amp; Pelvic Floor Breathing
              </span>
              <span className="text-[11px] text-stone-500">5 minutes daily restorative practice</span>
            </div>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                pelvicFloorDone ? 'bg-sage-600 text-white' : 'border-2 border-stone-300'
              }`}
            >
              {pelvicFloorDone && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSavePostpartum}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            Save Today&apos;s Recovery Check-in
          </button>
        </div>
      )}
    </div>
  );
};
