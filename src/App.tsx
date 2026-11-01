/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  WeekDetail,
  SizeTheme,
  KickSession,
  SymptomLog,
  WeightLog,
  MedicationReminder,
  RegistryItem,
  FeedingLog,
  DiaperLog,
  SleepLog,
  PumpLog,
  PostpartumWellnessLog,
  Milestone,
  JournalEntry,
  VaccineInfo,
  DoctorVisitChecklist,
} from './types';
import { PREGNANCY_WEEKS, DEFAULT_WEEK_LIST } from './data/pregnancyWeeksData';
import { INITIAL_MILESTONES } from './data/milestonesData';
import { INITIAL_REGISTRY_ITEMS } from './data/registryData';
import { VACCINE_SCHEDULE, DOCTOR_VISITS } from './data/knowledgeBaseData';

import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { PhoneFrame } from './components/PhoneFrame';
import { VisualBabyModel } from './components/VisualBabyModel';
import { SizeComparisonCard } from './components/SizeComparisonCard';
import { DueDatePickerModal } from './components/DueDatePickerModal';
import { KickCounter } from './components/KickCounter';
import { PregnancyLogger } from './components/PregnancyLogger';
import { BabyLogger } from './components/BabyLogger';
import { MilestoneTracker } from './components/MilestoneTracker';
import { OvulationCalendar } from './components/OvulationCalendar';
import { RegistryChecklist } from './components/RegistryChecklist';
import { MyJournal } from './components/MyJournal';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AndroidCodeStudio } from './components/AndroidCodeStudio';

import {
  Heart,
  Baby,
  Calendar,
  Activity,
  CheckSquare,
  BookOpen,
  Settings,
  Sparkles,
  Smartphone,
  Code,
  Users,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Award,
  ChevronLeft,
} from 'lucide-react';

const INITIAL_PROFILE: UserProfile = {
  id: 'usr_default',
  motherName: 'Camille',
  babyName: 'Margot',
  babyNameTwin: 'Léa',
  babyMode: 'single',
  calculationMethod: 'lmp',
  dueDate: '2027-02-14',
  lmpDate: '2026-05-10',
  activeStage: 'pregnancy',
};

const INITIAL_MEDICATIONS: MedicationReminder[] = [
  {
    id: 'med-1',
    name: 'Prenatal Multivitamin + DHA',
    dosage: '1 softgel daily with meal',
    frequency: 'Daily',
    timeOfDay: '08:00',
    takenToday: true,
    category: 'prenatal_vitamin',
  },
  {
    id: 'med-2',
    name: 'Iron (Ferrous Bisglycinate)',
    dosage: '25 mg with orange juice (Vit C)',
    frequency: 'Daily',
    timeOfDay: '12:30',
    takenToday: false,
    category: 'iron',
  },
  {
    id: 'med-3',
    name: 'Calcium + Vitamin D3',
    dosage: '500 mg evening dose',
    frequency: 'Daily',
    timeOfDay: '20:00',
    takenToday: false,
    category: 'calcium',
  },
];

const INITIAL_WEIGHT_LOGS: WeightLog[] = [
  { id: 'wt-1', date: '2026-08-01', weight: 134, unit: 'lbs' },
  { id: 'wt-2', date: '2026-09-01', weight: 138, unit: 'lbs' },
  { id: 'wt-3', date: '2026-10-01', weight: 142.5, unit: 'lbs' },
  { id: 'wt-4', date: '2026-11-01', weight: 146, unit: 'lbs' },
];

const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'j-1',
    date: '2026-10-24',
    title: 'First Strong Belly Flutters in the Evening',
    content: 'Felt distinct gentle kicks while listening to soothing classical music on the sofa. Camille placed her hand on my belly and felt Margot move!',
    category: 'bump_photo',
    tags: ['Week 24', 'First Kicks', 'Margot'],
  },
  {
    id: 'j-2',
    date: '2026-09-20',
    title: 'Level II Anatomy Ultrasound: Everything Perfect!',
    content: 'Dr. Laurent checked all four heart chambers, the kidneys, brain ventricles, and ten perfect little fingers. Baby was sucking her thumb during the scan!',
    category: 'ultrasound',
    tags: ['Week 20', 'Anatomy Scan', 'Healthy'],
  },
];

export default function App() {
  // Device frame vs full width mode
  const [isDeviceFrame, setIsDeviceFrame] = useState(true);
  const [showAndroidStudio, setShowAndroidStudio] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // App Profile & State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('maman_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  // Selected week for pregnancy guide viewing
  const [selectedWeek, setSelectedWeek] = useState<number>(24);
  const [sizeTheme, setSizeTheme] = useState<SizeTheme>('fruits');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'logger' | 'baby' | 'tools' | 'guides'>('home');

  // Data collections with local storage persistence
  const [kickSessions, setKickSessions] = useState<KickSession[]>(() => {
    const saved = localStorage.getItem('maman_kicks');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'kick-init',
            timestamp: Date.now() - 86400000,
            durationSeconds: 1240,
            kickCount: 10,
            kickIntervals: [45, 80, 120, 60, 95, 140, 110, 85, 90, 75],
            fetalStatus: 'active',
            notes: 'Active evening kicks after dinner',
          },
        ];
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(() => {
    const saved = localStorage.getItem('maman_symptoms');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'symp-init',
            date: '2026-10-31',
            symptoms: [
              { name: 'Heartburn / Acid Reflux', severity: 'mild' },
              { name: 'Lower Backache', severity: 'moderate' },
            ],
            mood: 'Happy',
            notes: 'Resting on left side helped with backache.',
          },
        ];
  });

  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
    const saved = localStorage.getItem('maman_weights');
    return saved ? JSON.parse(saved) : INITIAL_WEIGHT_LOGS;
  });

  const [medications, setMedications] = useState<MedicationReminder[]>(() => {
    const saved = localStorage.getItem('maman_meds');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [registryItems, setRegistryItems] = useState<RegistryItem[]>(() => {
    const saved = localStorage.getItem('maman_registry');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRY_ITEMS;
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('maman_milestones');
    return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('maman_journal');
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
  });

  const [vaccines, setVaccines] = useState<VaccineInfo[]>(() => {
    const saved = localStorage.getItem('maman_vaccines');
    return saved ? JSON.parse(saved) : VACCINE_SCHEDULE;
  });

  const [doctorVisits, setDoctorVisits] = useState<DoctorVisitChecklist[]>(() => {
    const saved = localStorage.getItem('maman_visits');
    return saved ? JSON.parse(saved) : DOCTOR_VISITS;
  });

  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>(() => {
    const saved = localStorage.getItem('maman_feeds');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'feed-init',
            timestamp: Date.now() - 7200000,
            type: 'breast',
            leftDurationMinutes: 10,
            rightDurationMinutes: 8,
          },
        ];
  });

  const [diaperLogs, setDiaperLogs] = useState<DiaperLog[]>(() => {
    const saved = localStorage.getItem('maman_diapers');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'diaper-init',
            timestamp: Date.now() - 3600000,
            type: 'both',
            color: 'yellow',
            consistency: 'seedy',
          },
        ];
  });

  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem('maman_sleep');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'sleep-init',
            startTime: Date.now() - 14400000,
            endTime: Date.now() - 7200000,
            durationMinutes: 120,
            isNightSleep: false,
          },
        ];
  });

  const [pumpLogs, setPumpLogs] = useState<PumpLog[]>(() => {
    const saved = localStorage.getItem('maman_pumps');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'pump-init',
            timestamp: Date.now() - 18000000,
            leftOz: 2.5,
            rightOz: 2.5,
            durationMinutes: 15,
          },
        ];
  });

  const [postpartumLogs, setPostpartumLogs] = useState<PostpartumWellnessLog[]>(() => {
    const saved = localStorage.getItem('maman_postpartum');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('maman_profile', JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    localStorage.setItem('maman_kicks', JSON.stringify(kickSessions));
  }, [kickSessions]);
  useEffect(() => {
    localStorage.setItem('maman_symptoms', JSON.stringify(symptomLogs));
  }, [symptomLogs]);
  useEffect(() => {
    localStorage.setItem('maman_weights', JSON.stringify(weightLogs));
  }, [weightLogs]);
  useEffect(() => {
    localStorage.setItem('maman_meds', JSON.stringify(medications));
  }, [medications]);
  useEffect(() => {
    localStorage.setItem('maman_registry', JSON.stringify(registryItems));
  }, [registryItems]);
  useEffect(() => {
    localStorage.setItem('maman_milestones', JSON.stringify(milestones));
  }, [milestones]);
  useEffect(() => {
    localStorage.setItem('maman_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);
  useEffect(() => {
    localStorage.setItem('maman_vaccines', JSON.stringify(vaccines));
  }, [vaccines]);
  useEffect(() => {
    localStorage.setItem('maman_visits', JSON.stringify(doctorVisits));
  }, [doctorVisits]);
  useEffect(() => {
    localStorage.setItem('maman_feeds', JSON.stringify(feedingLogs));
  }, [feedingLogs]);
  useEffect(() => {
    localStorage.setItem('maman_diapers', JSON.stringify(diaperLogs));
  }, [diaperLogs]);
  useEffect(() => {
    localStorage.setItem('maman_sleep', JSON.stringify(sleepLogs));
  }, [sleepLogs]);
  useEffect(() => {
    localStorage.setItem('maman_pumps', JSON.stringify(pumpLogs));
  }, [pumpLogs]);
  useEffect(() => {
    localStorage.setItem('maman_postpartum', JSON.stringify(postpartumLogs));
  }, [postpartumLogs]);

  // Gestational age calculation
  const calculatePregnancyProgress = () => {
    try {
      const due = new Date(profile.dueDate);
      const today = new Date();
      const totalDays = 280; // 40 weeks
      const diffTime = due.getTime() - today.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const daysPassed = Math.max(0, totalDays - daysRemaining);
      const currentWeek = Math.min(42, Math.max(1, Math.floor(daysPassed / 7) + 1));
      const currentDay = daysPassed % 7;
      const progressPercent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

      return {
        daysRemaining,
        daysPassed,
        currentWeek,
        currentDay,
        progressPercent,
      };
    } catch {
      return {
        daysRemaining: 112,
        daysPassed: 168,
        currentWeek: 24,
        currentDay: 3,
        progressPercent: 60,
      };
    }
  };

  const progress = calculatePregnancyProgress();
  const currentWeekDetail = PREGNANCY_WEEKS[selectedWeek] || PREGNANCY_WEEKS[24];
  const isTwin = profile.babyMode === 'twin';

  // Toggle Twin Mode directly from quick header
  const handleToggleTwin = () => {
    setProfile((prev) => ({
      ...prev,
      babyMode: prev.babyMode === 'twin' ? 'single' : 'twin',
    }));
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors">
      {/* Universal Desktop Top Control Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-xs">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap block">
                Maman &amp; bébé
              </span>
              <span className="text-[10px] text-stone-500 tracking-wide block">
                {profile.activeStage === 'pregnancy'
                  ? `Week ${progress.currentWeek}, Day ${progress.currentDay} · ${isTwin ? 'Twin Journey' : 'Pregnancy'}`
                  : `Baby & Postpartum · ${profile.babyName}`}
              </span>
            </div>
          </div>

          {/* Zone 2: Fast Stage Quick Toggles */}
          <div className="hidden md:flex items-center gap-2">
            {/* Twin Mode Quick Switcher */}
            <button
              onClick={handleToggleTwin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isTwin
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isTwin ? 'Twin Mode (2x Active)' : 'Single Baby Mode'}</span>
            </button>

            {/* Stage Mode Switcher */}
            <button
              onClick={() =>
                setProfile((prev) => ({
                  ...prev,
                  activeStage: prev.activeStage === 'pregnancy' ? 'baby' : 'pregnancy',
                }))
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>
                Switch to {profile.activeStage === 'pregnancy' ? 'Baby Log' : 'Pregnancy Tracker'}
              </span>
            </button>
          </div>

          {/* Zone 3: Studio Inspector & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAndroidStudio(!showAndroidStudio)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                showAndroidStudio
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/80 hover:bg-emerald-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {showAndroidStudio ? 'Hide Studio' : 'Android Studio Code'}
              </span>
              <span className="sm:hidden">Code</span>
            </button>

            <button
              onClick={() => setIsDeviceFrame(!isDeviceFrame)}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
              title="Toggle Google Pixel Frame"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
              title="Settings & Due Date Calculator"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Wrapped in PhoneFrame or Fluid Viewport */}
      <main className="flex-1 flex flex-col">
        {showAndroidStudio ? (
          /* ANDROID STUDIO CODE INSPECTOR VIEW */
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Google Play Store Android Architecture &amp; Codebase
                </h2>
                <p className="text-xs text-stone-500">
                  Inspect, copy, or export the full Kotlin Jetpack Compose, Room Database, and MVVM code.
                </p>
              </div>
              <button
                onClick={() => setShowAndroidStudio(false)}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Return to Live App
              </button>
            </div>
            <AndroidCodeStudio />
          </div>
        ) : (
          /* LIVE INTERACTIVE APP EXPERIENCE */
          <PhoneFrame
            isDeviceFrame={isDeviceFrame}
            onToggleFrame={() => setIsDeviceFrame(!isDeviceFrame)}
            brandTitle="Maman & bébé"
          >
            {/* Scrollable Mobile Screen Body */}
            <div className="flex-1 pb-24 px-4 sm:px-6 pt-3 space-y-4 max-w-4xl mx-auto w-full">
              {/* Medical Disclaimer Banner */}
              <MedicalDisclaimer compact={isDeviceFrame} />

              {/* TAB 1: PREGNANCY HOME & TIMELINE */}
              {activeTab === 'home' && (
                <div className="space-y-4">
                  {/* Due Date & Countdown Status Card */}
                  <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-0.5">
                          <span>Due {profile.dueDate}</span>
                          <span>·</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {progress.daysRemaining} days to go
                          </span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                          Week {progress.currentWeek}, Day {progress.currentDay}
                        </h1>
                      </div>

                      {/* Twin indicator badge */}
                      <button
                        onClick={() => setShowSettingsModal(true)}
                        className="p-2 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 text-stone-600 hover:text-stone-900 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-semibold">Edit Due Date</span>
                      </button>
                    </div>

                    {/* Gestational Progress bar */}
                    <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-gradient-to-r from-rose-400 via-rose-500 to-sage-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span>Conception</span>
                      <span>Trimester 2 (Week 24)</span>
                      <span>Birth (Week 40)</span>
                    </div>
                  </div>

                  {/* 3D & Visual Baby Development Canvas */}
                  <VisualBabyModel
                    weekData={currentWeekDetail}
                    isTwin={isTwin}
                    babyName={profile.babyName}
                    babyNameTwin={profile.babyNameTwin}
                  />

                  {/* Fun Size Comparisons Card (Fruits, Sports, Snacks, Animals) */}
                  <SizeComparisonCard
                    weekData={currentWeekDetail}
                    currentTheme={sizeTheme}
                    onSelectTheme={setSizeTheme}
                    isTwin={isTwin}
                  />

                  {/* Week-by-Week Interactive Scrubber Carousel */}
                  <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                        Week-by-Week Journey Timeline
                      </span>
                      <span className="text-xs text-rose-600 font-semibold font-mono">
                        Viewing Week {selectedWeek}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {DEFAULT_WEEK_LIST.map((wk) => {
                        const isCurrent = wk === progress.currentWeek;
                        const isSelected = wk === selectedWeek;
                        return (
                          <button
                            key={wk}
                            onClick={() => setSelectedWeek(wk)}
                            className={`min-w-[62px] h-[72px] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 ${
                              isSelected
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20 scale-102'
                                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 border border-stone-200/70 dark:border-stone-700/60'
                            }`}
                          >
                            <span
                              className={`text-[10px] font-semibold uppercase ${
                                isSelected ? 'text-rose-100' : 'text-stone-400'
                              }`}
                            >
                              {isCurrent ? 'Now' : 'Wk'}
                            </span>
                            <span className="text-lg font-bold font-mono leading-tight">{wk}</span>
                            <span className="text-[9px] opacity-75">
                              {wk <= 12 ? 'Tri 1' : wk <= 27 ? 'Tri 2' : 'Tri 3'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Week-by-Week Guide Details (Highlights, Symptoms, Daily Tips) */}
                  <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
                    <div>
                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                        Fetal Highlights · Week {selectedWeek}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                        {currentWeekDetail.babyMilestones}
                      </h3>
                    </div>

                    {/* Developmental Highlights List */}
                    <div className="space-y-1.5">
                      {currentWeekDetail.highlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Mom's Body Changes */}
                    <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block mb-1">
                        Mom&apos;s Body this Week:
                      </span>
                      <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                        {currentWeekDetail.momChanges}
                      </p>
                    </div>

                    {/* Twin Guidance if Twin mode active */}
                    {isTwin && currentWeekDetail.twinNotes && (
                      <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/50">
                        <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block mb-1 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          <span>Twin Pregnancy Special Note:</span>
                        </span>
                        <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
                          {currentWeekDetail.twinNotes}
                        </p>
                      </div>
                    )}

                    {/* Daily Curated Tips */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block mb-2">
                        Daily Curated Care Tips
                      </span>
                      <div className="space-y-1.5">
                        {currentWeekDetail.dailyTips.map((tip, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2"
                          >
                            <span className="font-bold text-rose-500 font-mono">0{idx + 1}.</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPREHENSIVE PREGNANCY LOGGER */}
              {activeTab === 'logger' && (
                <div className="space-y-4">
                  {/* Kick Counter tool */}
                  <KickCounter
                    sessions={kickSessions}
                    onSaveSession={(s) => setKickSessions([s, ...kickSessions])}
                  />

                  {/* Weight, Symptoms, Medications, Contractions */}
                  <PregnancyLogger
                    symptomLogs={symptomLogs}
                    weightLogs={weightLogs}
                    medications={medications}
                    onAddSymptomLog={(log) => setSymptomLogs([log, ...symptomLogs])}
                    onAddWeightLog={(log) => setWeightLogs([...weightLogs, log])}
                    onToggleMedication={(id) =>
                      setMedications(
                        medications.map((m) =>
                          m.id === id ? { ...m, takenToday: !m.takenToday } : m
                        )
                      )
                    }
                    onAddMedication={(med) => setMedications([...medications, med])}
                  />
                </div>
              )}

              {/* TAB 3: BABY & POSTPARTUM LOG */}
              {activeTab === 'baby' && (
                <div className="space-y-4">
                  <BabyLogger
                    feedingLogs={feedingLogs}
                    diaperLogs={diaperLogs}
                    sleepLogs={sleepLogs}
                    pumpLogs={pumpLogs}
                    postpartumLogs={postpartumLogs}
                    onAddFeeding={(f) => setFeedingLogs([f, ...feedingLogs])}
                    onAddDiaper={(d) => setDiaperLogs([d, ...diaperLogs])}
                    onAddSleep={(s) => setSleepLogs([s, ...sleepLogs])}
                    onAddPump={(p) => setPumpLogs([p, ...pumpLogs])}
                    onAddPostpartumLog={(pp) => setPostpartumLogs([pp, ...postpartumLogs])}
                  />

                  {/* 0-24 Months Milestone Guide */}
                  <MilestoneTracker
                    milestones={milestones}
                    onToggleMilestone={(id) =>
                      setMilestones(
                        milestones.map((m) =>
                          m.id === id
                            ? {
                                ...m,
                                isAchieved: !m.isAchieved,
                                achievedDate: !m.isAchieved
                                  ? new Date().toISOString().split('T')[0]
                                  : undefined,
                              }
                            : m
                        )
                      )
                    }
                  />
                </div>
              )}

              {/* TAB 4: FAMILY PLANNING & TOOLS */}
              {activeTab === 'tools' && (
                <div className="space-y-4">
                  <OvulationCalendar />
                  <RegistryChecklist
                    items={registryItems}
                    onToggleItem={(id) =>
                      setRegistryItems(
                        registryItems.map((item) =>
                          item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
                        )
                      )
                    }
                    onAddItem={(item) => setRegistryItems([item, ...registryItems])}
                  />
                  <MyJournal
                    entries={journalEntries}
                    onAddEntry={(entry) => setJournalEntries([entry, ...journalEntries])}
                  />
                </div>
              )}

              {/* TAB 5: KNOWLEDGE BASE & DOCTOR VISITS */}
              {activeTab === 'guides' && (
                <div className="space-y-4">
                  <KnowledgeBase
                    vaccines={vaccines}
                    doctorVisits={doctorVisits}
                    onToggleVaccine={(id) =>
                      setVaccines(
                        vaccines.map((v) =>
                          v.id === id
                            ? {
                                ...v,
                                isCompleted: !v.isCompleted,
                                administeredDate: !v.isCompleted
                                  ? new Date().toISOString().split('T')[0]
                                  : undefined,
                              }
                            : v
                        )
                      )
                    }
                    onToggleCheckpoint={(visitId, cpId) =>
                      setDoctorVisits(
                        doctorVisits.map((v) =>
                          v.id === visitId
                            ? {
                                ...v,
                                checkpoints: v.checkpoints.map((cp) =>
                                  cp.id === cpId ? { ...cp, checked: !cp.checked } : cp
                                ),
                              }
                            : v
                        )
                      )
                    }
                  />
                </div>
              )}
            </div>

            {/* Android Material 3 Fixed Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800">
              <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
                {[
                  {
                    id: 'home' as const,
                    label: 'Pregnancy',
                    icon: <Heart className="w-5 h-5" />,
                  },
                  {
                    id: 'logger' as const,
                    label: 'Logger',
                    icon: <Activity className="w-5 h-5" />,
                  },
                  {
                    id: 'baby' as const,
                    label: 'Baby Log',
                    icon: <Baby className="w-5 h-5" />,
                  },
                  {
                    id: 'tools' as const,
                    label: 'Planning',
                    icon: <Calendar className="w-5 h-5" />,
                  },
                  {
                    id: 'guides' as const,
                    label: 'Guides',
                    icon: <BookOpen className="w-5 h-5" />,
                  },
                ].map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
                        isActive
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                      }`}
                    >
                      <div
                        className={`p-1 rounded-xl transition-all ${
                          isActive ? 'bg-rose-50 dark:bg-rose-950/80' : ''
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </PhoneFrame>
        )}
      </main>

      {/* Settings & Due Date Calculation Modal */}
      <DueDatePickerModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        profile={profile}
        onSaveProfile={(p) => {
          setProfile(p);
          // Auto select calculated week
          const due = new Date(p.dueDate);
          const today = new Date();
          const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const wk = Math.min(40, Math.max(4, Math.floor((280 - diffDays) / 7)));
          setSelectedWeek(wk);
        }}
      />
    </div>
  );
}
