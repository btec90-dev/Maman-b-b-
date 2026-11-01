import React, { useState } from 'react';
import { SymptomLog, WeightLog, MedicationReminder } from '../types';
import { Activity, Scale, Pill, Plus, Check, Trash2, TrendingUp, AlertCircle, Clock, Calendar } from 'lucide-react';

interface Props {
  symptomLogs: SymptomLog[];
  weightLogs: WeightLog[];
  medications: MedicationReminder[];
  onAddSymptomLog: (log: SymptomLog) => void;
  onAddWeightLog: (log: WeightLog) => void;
  onToggleMedication: (id: string) => void;
  onAddMedication: (med: MedicationReminder) => void;
}

const COMMON_SYMPTOMS = [
  'Nausea / Morning Sickness',
  'Round Ligament Pain',
  'Fatigue / Exhaustion',
  'Heartburn / Acid Reflux',
  'Braxton Hicks Contractions',
  'Lower Backache',
  'Swollen Feet / Ankles',
  'Frequent Urination',
  'Headache',
  'Food Aversions / Cravings',
];

export const PregnancyLogger: React.FC<Props> = ({
  symptomLogs,
  weightLogs,
  medications,
  onAddSymptomLog,
  onAddWeightLog,
  onToggleMedication,
  onAddMedication,
}) => {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'weight' | 'meds' | 'contractions'>('symptoms');

  // Symptom entry state
  const [selectedSymptoms, setSelectedSymptoms] = useState<
    Array<{ name: string; severity: 'mild' | 'moderate' | 'severe' }>
  >([]);
  const [symptomMood, setSymptomMood] = useState('Happy');
  const [symptomNotes, setSymptomNotes] = useState('');

  // Weight entry state
  const [newWeight, setNewWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');

  // New medication modal/inputs
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [showAddMedForm, setShowAddMedForm] = useState(false);

  // Contraction timer state
  const [contractionActive, setContractionActive] = useState(false);
  const [contractionSeconds, setContractionSeconds] = useState(0);
  const [contractionHistory, setContractionHistory] = useState<
    Array<{ start: string; durationSec: number; intervalMins?: number }>
  >([]);
  const contractionTimerRef = React.useRef<number | null>(null);

  // Toggle symptom severity
  const toggleSymptom = (name: string, severity: 'mild' | 'moderate' | 'severe') => {
    const existingIndex = selectedSymptoms.findIndex((s) => s.name === name);
    if (existingIndex >= 0) {
      if (selectedSymptoms[existingIndex].severity === severity) {
        // Remove if clicking same severity
        setSelectedSymptoms(selectedSymptoms.filter((s) => s.name !== name));
      } else {
        // Change severity
        const updated = [...selectedSymptoms];
        updated[existingIndex].severity = severity;
        setSelectedSymptoms(updated);
      }
    } else {
      setSelectedSymptoms([...selectedSymptoms, { name, severity }]);
    }
  };

  const handleSaveSymptoms = () => {
    if (selectedSymptoms.length === 0 && !symptomNotes.trim()) return;

    const newLog: SymptomLog = {
      id: `symp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      symptoms: selectedSymptoms,
      mood: symptomMood,
      notes: symptomNotes.trim() || undefined,
    };

    onAddSymptomLog(newLog);
    setSelectedSymptoms([]);
    setSymptomNotes('');
  };

  const handleSaveWeight = () => {
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 0) return;

    const newLog: WeightLog = {
      id: `wt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weight: val,
      unit: weightUnit,
    };

    onAddWeightLog(newLog);
    setNewWeight('');
  };

  const handleCreateMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const med: MedicationReminder = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 capsule',
      frequency: 'Daily',
      timeOfDay: newMedTime,
      takenToday: false,
      category: 'prenatal_vitamin',
    };

    onAddMedication(med);
    setNewMedName('');
    setNewMedDosage('');
    setShowAddMedForm(false);
  };

  // Contraction Stopwatch Logic
  const toggleContraction = () => {
    if (contractionActive) {
      // Stop contraction
      if (contractionTimerRef.current) clearInterval(contractionTimerRef.current);
      setContractionActive(false);

      const now = new Date();
      let intervalMins: number | undefined = undefined;
      if (contractionHistory.length > 0) {
        const last = new Date(contractionHistory[0].start);
        intervalMins = Math.round((now.getTime() - last.getTime()) / (1000 * 60));
      }

      setContractionHistory([
        {
          start: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          durationSec: contractionSeconds,
          intervalMins,
        },
        ...contractionHistory,
      ]);
      setContractionSeconds(0);
    } else {
      // Start contraction
      setContractionActive(true);
      setContractionSeconds(0);
      contractionTimerRef.current = window.setInterval(() => {
        setContractionSeconds((s) => s + 1);
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
        {[
          { id: 'symptoms' as const, label: 'Symptoms' },
          { id: 'weight' as const, label: 'Weight Chart' },
          { id: 'meds' as const, label: 'Medications' },
          { id: 'contractions' as const, label: 'Contractions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SYMPTOMS TRACKER WITH SEVERITY TAGS */}
      {activeTab === 'symptoms' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Today&apos;s Symptom Logger
            </h3>
            <p className="text-xs text-stone-500">
              Select any symptoms you feel today and tag their severity.
            </p>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              How are you feeling today?
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { label: 'Energized', icon: '✨' },
                { label: 'Happy', icon: '🌸' },
                { label: 'Tired', icon: '😴' },
                { label: 'Anxious', icon: '💭' },
                { label: 'Moody', icon: '🌊' },
                { label: 'Nauseous', icon: '🤢' },
              ].map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSymptomMood(m.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
                    symptomMood === m.label
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-200 font-semibold'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Common Symptoms List */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300">
              Tap severity tag to record:
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {COMMON_SYMPTOMS.map((name) => {
                const existing = selectedSymptoms.find((s) => s.name === name);
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800"
                  >
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate pr-2">
                      {name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {(['mild', 'moderate', 'severe'] as const).map((sev) => {
                        const isChosen = existing?.severity === sev;
                        return (
                          <button
                            key={sev}
                            type="button"
                            onClick={() => toggleSymptom(name, sev)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold capitalize cursor-pointer transition-colors ${
                              isChosen
                                ? sev === 'mild'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : sev === 'moderate'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-rose-500 text-white shadow-xs'
                                : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300'
                            }`}
                          >
                            {sev}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <textarea
            placeholder="Add personal notes (e.g. better after eating small crackers)..."
            value={symptomNotes}
            onChange={(e) => setSymptomNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          />

          <button
            onClick={handleSaveSymptoms}
            disabled={selectedSymptoms.length === 0 && !symptomNotes.trim()}
            className="w-full py-2.5 bg-rose-600 disabled:opacity-50 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Save Today&apos;s Symptoms ({selectedSymptoms.length} recorded)
          </button>

          {/* Recent History */}
          {symptomLogs.length > 0 && (
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-semibold text-stone-500 block mb-2">Past Logs</span>
              <div className="space-y-2">
                {symptomLogs.slice(0, 3).map((l) => (
                  <div key={l.id} className="p-2.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs">
                    <div className="flex items-center justify-between text-stone-400 text-[11px] mb-1">
                      <span>{l.date}</span>
                      <span>Mood: {l.mood}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {l.symptoms.map((s) => (
                        <span
                          key={s.name}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200"
                        >
                          {s.name} ({s.severity})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEIGHT LOG & VISUAL PROGRESSION */}
      {activeTab === 'weight' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Maternal Weight Tracker
              </h3>
              <p className="text-xs text-stone-500">
                Healthy gestational weight gain guide (IOM guidelines).
              </p>
            </div>
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setWeightUnit('lbs')}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                  weightUnit === 'lbs' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-400'
                }`}
              >
                lbs
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit('kg')}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                  weightUnit === 'kg' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-400'
                }`}
              >
                kg
              </button>
            </div>
          </div>

          {/* New Entry Box */}
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder={`Enter weight in ${weightUnit}`}
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />
            <button
              onClick={handleSaveWeight}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              Log Weight
            </button>
          </div>

          {/* Simple Weight SVG Chart Representation */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-sage-600" />
                <span>Weight Trend History</span>
              </span>
              <span className="font-mono tabular-nums">
                Current: {weightLogs.length > 0 ? `${weightLogs[weightLogs.length - 1].weight} ${weightLogs[weightLogs.length - 1].unit}` : '--'}
              </span>
            </div>

            {weightLogs.length > 1 ? (
              <svg viewBox="0 0 320 90" className="w-full h-24 stroke-current">
                <polyline
                  fill="none"
                  stroke="#D9777F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weightLogs
                    .map((item, idx) => {
                      const x = 20 + (idx / (weightLogs.length - 1)) * 280;
                      // Normalize y between 15 and 75
                      const minW = Math.min(...weightLogs.map((w) => w.weight));
                      const maxW = Math.max(...weightLogs.map((w) => w.weight));
                      const range = maxW - minW || 1;
                      const y = 75 - ((item.weight - minW) / range) * 55;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
                {weightLogs.map((item, idx) => {
                  const x = 20 + (idx / (weightLogs.length - 1)) * 280;
                  const minW = Math.min(...weightLogs.map((w) => w.weight));
                  const maxW = Math.max(...weightLogs.map((w) => w.weight));
                  const range = maxW - minW || 1;
                  const y = 75 - ((item.weight - minW) / range) * 55;
                  return (
                    <circle key={item.id} cx={x} cy={y} r="4" fill="#ffffff" stroke="#D9777F" strokeWidth="2.5" />
                  );
                })}
              </svg>
            ) : (
              <div className="py-6 text-center text-xs text-stone-400">
                Log at least two weigh-ins to render your gestational gain curve.
              </div>
            )}
          </div>

          {/* Past weight logs */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {weightLogs.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs"
              >
                <span className="text-stone-500 font-mono">{w.date}</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
                  {w.weight} {w.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEDICATION & VITAMIN REMINDERS */}
      {activeTab === 'meds' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Daily Prenatal Supplements &amp; Meds
              </h3>
              <p className="text-xs text-stone-500">Keep up your daily vitamin routine</p>
            </div>
            <button
              onClick={() => setShowAddMedForm(!showAddMedForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold cursor-pointer hover:bg-rose-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {showAddMedForm && (
            <form onSubmit={handleCreateMedication} className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <input
                type="text"
                placeholder="Medication name (e.g., Prenatal Multivitamin, Iron)"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Dosage (e.g., 400 mcg, 1 capsule)"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                />
                <input
                  type="time"
                  value={newMedTime}
                  onChange={(e) => setNewMedTime(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddMedForm(false)}
                  className="px-3 py-1.5 text-stone-500 hover:text-stone-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          )}

          {/* Medications list with check-off */}
          <div className="space-y-2.5">
            {medications.map((m) => (
              <div
                key={m.id}
                onClick={() => onToggleMedication(m.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  m.takenToday
                    ? 'bg-sage-50/80 dark:bg-sage-950/30 border-sage-200 dark:border-sage-900/50'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-100 dark:border-stone-800 hover:border-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      m.takenToday
                        ? 'bg-sage-600 text-white'
                        : 'border-2 border-stone-300 dark:border-stone-600 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-semibold ${
                        m.takenToday
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {m.name}
                    </h4>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{m.timeOfDay}</span>
                      <span>·</span>
                      <span>{m.dosage}</span>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    m.takenToday
                      ? 'bg-sage-100 dark:bg-sage-900/80 text-sage-800 dark:text-sage-300'
                      : 'text-stone-400'
                  }`}
                >
                  {m.takenToday ? 'Taken' : 'Due'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONTRACTION TIMER & 5-1-1 RULE */}
      {activeTab === 'contractions' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4 text-center">
          <div className="text-left">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Labor Contraction Stopwatch
            </h3>
            <p className="text-xs text-stone-500">
              Track duration and intervals to know when to head to the hospital.
            </p>
          </div>

          <div className="py-2">
            <span className="font-mono text-5xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {contractionSeconds}s
            </span>
            <span className="block text-xs text-stone-400 mt-1">Current Contraction Duration</span>
          </div>

          <button
            onClick={toggleContraction}
            className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-98 ${
              contractionActive
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800'
            }`}
          >
            {contractionActive ? 'Stop Contraction' : 'Start Contraction'}
          </button>

          {/* 5-1-1 Rule Helper Box */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 text-left text-xs text-amber-900 dark:text-amber-200">
            <span className="font-semibold block mb-0.5">The 5-1-1 Labor Rule:</span>
            When contractions come every <strong>5 minutes</strong>, last for <strong>1 minute</strong>, consistently for <strong>1 hour</strong>, call your doctor or midwife!
          </div>

          {/* History */}
          {contractionHistory.length > 0 && (
            <div className="text-left pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-semibold text-stone-500 block mb-2">Logged Contractions</span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {contractionHistory.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs"
                  >
                    <span className="font-mono text-stone-500">{c.start}</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      Duration: {c.durationSec}s
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {c.intervalMins ? `${c.intervalMins}m apart` : 'First'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
