import React, { useState, useEffect, useRef } from 'react';
import { KickSession } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, History, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  sessions: KickSession[];
  onSaveSession: (session: KickSession) => void;
}

export const KickCounter: React.FC<Props> = ({ sessions, onSaveSession }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [kickCount, setKickCount] = useState(0);
  const [kickTimestamps, setKickTimestamps] = useState<number[]>([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const timerRef = useRef<number | null>(null);

  // Stopwatch
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleStartSession = () => {
    setIsActive(true);
    setSeconds(0);
    setKickCount(0);
    setKickTimestamps([]);
    setSessionCompleted(false);
  };

  const handlePauseResume = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    setKickCount(0);
    setKickTimestamps([]);
    setSessionCompleted(false);
  };

  const handleRegisterKick = () => {
    if (!isActive) {
      setIsActive(true);
    }

    // Trigger device vibration if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }

    const newKickCount = kickCount + 1;
    setKickCount(newKickCount);
    const updatedTimestamps = [...kickTimestamps, seconds];
    setKickTimestamps(updatedTimestamps);

    // Goal reached: 10 kicks
    if (newKickCount >= 10 && !sessionCompleted) {
      setSessionCompleted(true);
      setIsActive(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D9777F', '#6B8E76', '#8C7AA9', '#F4A261'],
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handleSaveCompletedSession = () => {
    // Calculate intervals between kicks
    const intervals: number[] = [];
    for (let i = 1; i < kickTimestamps.length; i++) {
      intervals.push(kickTimestamps[i] - kickTimestamps[i - 1]);
    }

    const durationMins = seconds / 60;
    let status: 'active' | 'moderate' | 'slow' = 'active';
    if (durationMins > 60) status = 'slow';
    else if (durationMins > 30) status = 'moderate';

    const newSession: KickSession = {
      id: `kick-${Date.now()}`,
      timestamp: Date.now(),
      durationSeconds: seconds,
      kickCount,
      kickIntervals: intervals,
      notes: notes.trim() || undefined,
      fetalStatus: status,
    };

    onSaveSession(newSession);
    handleReset();
    setNotes('');
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* Active Session Tracker Card */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs text-center transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Standard Fetal Kick Counter
            </h3>
          </div>
          <span className="text-[11px] font-medium text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full">
            Goal: 10 Movements
          </span>
        </div>

        {/* Stopwatch Display */}
        <div className="my-2">
          <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
            {formatTimer(seconds)}
          </span>
          <span className="block text-xs text-stone-400 mt-1">Elapsed Session Time</span>
        </div>

        {/* Big Tactile Kick Circle Button */}
        <div className="py-6 flex flex-col items-center justify-center">
          <button
            onClick={handleRegisterKick}
            disabled={sessionCompleted}
            className={`group relative w-44 h-44 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none shadow-lg active:scale-95 ${
              sessionCompleted
                ? 'bg-sage-100 dark:bg-sage-950/60 border-4 border-sage-500 text-sage-700 dark:text-sage-300'
                : 'bg-gradient-to-tr from-rose-500 via-rose-400 to-rose-300 text-white hover:shadow-rose-500/25 border-4 border-rose-200 dark:border-rose-900/60'
            }`}
          >
            {sessionCompleted ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-sage-600 dark:text-sage-400 mb-1" />
                <span className="text-sm font-bold">10 Kicks Met!</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-extrabold font-mono tabular-nums leading-none">
                  {kickCount}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                  Tap to Kick
                </span>
                <span className="text-[10px] opacity-75 mt-0.5">
                  {10 - kickCount > 0 ? `${10 - kickCount} to target` : 'Goal reached'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3 mt-2">
          {!sessionCompleted ? (
            <>
              {!isActive && seconds === 0 ? (
                <button
                  onClick={handleStartSession}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold cursor-pointer hover:bg-stone-800 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Session</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseResume}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer hover:bg-stone-200 transition-colors"
                >
                  {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isActive ? 'Pause' : 'Resume'}</span>
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </>
          ) : (
            <div className="w-full max-w-sm space-y-3">
              <input
                type="text"
                placeholder="Optional notes (e.g. active after orange juice)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
              <button
                onClick={handleSaveCompletedSession}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Save Kick Session to Record
              </button>
            </div>
          )}
        </div>

        {/* Clinical Movement Safety Tip */}
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 text-left text-xs text-stone-500 dark:text-stone-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
          <p>
            <strong>ACOG Recommendation:</strong> Most healthy babies complete 10 kicks in less than 2 hours. If your baby moves less than usual, rest quietly on your left side with a cold beverage and count again. Contact your doctor if kicks remain subdued.
          </p>
        </div>
      </div>

      {/* Past Sessions History Table */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-stone-500" />
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Recent Kick Sessions
            </h4>
          </div>
          <span className="text-xs text-stone-400">
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} logged
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-400">
            No kick sessions recorded yet. Start your first session above!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {sessions.map((s) => {
              const dateStr = new Date(s.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const mins = Math.round(s.durationSeconds / 60);

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
                        {s.kickCount} Kicks in {mins} min
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          s.fetalStatus === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : s.fetalStatus === 'moderate'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {s.fetalStatus.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 block mt-0.5">{dateStr}</span>
                    {s.notes && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 italic mt-1">
                        &quot;{s.notes}&quot;
                      </p>
                    )}
                  </div>

                  <CheckCircle2 className="w-4 h-4 text-sage-600 dark:text-sage-400 shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
