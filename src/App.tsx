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
import { MamanAssistant } from './components/MamanAssistant';

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

import {
  SupportedLanguage,
  UnitSystem,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
} from './i18n/translations';

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
  language: 'en',
  unitSystem: 'imperial',
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
  const [showAssistantModal, setShowAssistantModal] = useState(false);

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

  // Dynamic localization dictionary & RTL
  const currentLang = profile.language || 'en';
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isRtl = currentLang === 'ar';

  const formattedDueDate = (() => {
    try {
      return new Date(profile.dueDate).toLocaleDateString(currentLang, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return profile.dueDate;
    }
  })();

  // Toggle Twin Mode directly from quick header
  const handleToggleTwin = () => {
    setProfile((prev) => ({
      ...prev,
      babyMode: prev.babyMode === 'twin' ? 'single' : 'twin',
    }));
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`w-full min-h-screen bg-[#FAF5EE] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors ${
        isRtl ? 'font-[sans-serif]' : ''
      }`}
    >
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
                {t.appName}
              </span>
              <span className="text-[10px] text-stone-500 tracking-wide block">
                {profile.activeStage === 'pregnancy'
                  ? `${t.header.week} ${progress.currentWeek}, ${t.header.day} ${progress.currentDay} · ${isTwin ? t.header.twinJourney : t.header.pregnancy}`
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
              <span>{isTwin ? `${t.header.twinMode} (2x)` : t.header.singleBaby}</span>
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
                {profile.activeStage === 'pregnancy' ? t.header.switchToBaby : t.header.switchToPregnancy}
              </span>
            </button>
          </div>

          {/* Zone 3: Studio Inspector & Quick Language Switcher & Settings */}
          <div className="flex items-center gap-2">
            {/* Quick Language Dropdown */}
            <div className="relative">
              <select
                value={currentLang}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    language: e.target.value as SupportedLanguage,
                  }))
                }
                className="appearance-none bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold py-1.5 pl-2.5 pr-7 rounded-xl border border-stone-200/60 dark:border-stone-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-400"
                title="Change Language (8 Supported: EN, FR, ES, DE, PT, AR, IT, JA)"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] text-stone-400">
                ▼
              </div>
            </div>

            {/* Maman Assistant Launcher */}
            <button
              onClick={() => setShowAssistantModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
              title="Chat with Maman Assistant (Gemini AI)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Maman Assistant</span>
              <span className="sm:hidden">Assistant</span>
            </button>

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
                {showAndroidStudio ? 'Hide Studio' : t.header.androidStudio}
              </span>
              <span className="sm:hidden">{t.header.code}</span>
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
              title={t.header.settings}
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
            brandTitle={t.appName}
            isRtl={isRtl}
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
                          <span>{t.pregnancyHome.due} {formattedDueDate}</span>
                          <span>·</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {progress.daysRemaining} {t.pregnancyHome.daysRemaining}
                          </span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                          {t.header.week} {progress.currentWeek}, {t.header.day} {progress.currentDay}
                        </h1>
                      </div>

                      {/* Due date edit button */}
                      <button
                        onClick={() => setShowSettingsModal(true)}
                        className="p-2 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 text-stone-600 hover:text-stone-900 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-semibold">{t.pregnancyHome.editDueDate}</span>
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
                      <span>{t.pregnancyHome.conception}</span>
                      <span>{t.pregnancyHome.trimester} 2 ({t.header.week} 24)</span>
                      <span>{t.pregnancyHome.birth} ({t.header.week} 40)</span>
                    </div>
                  </div>

                  {/* Maman Assistant Quick Feature Card */}
                  <div className="w-full bg-gradient-to-br from-rose-50/90 via-white to-purple-50/60 dark:from-stone-900 dark:via-stone-900 dark:to-stone-850 rounded-3xl p-4 sm:p-5 border border-rose-200/70 dark:border-rose-900/40 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-xs shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                            Maman Assistant
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800">
                            Gemini AI
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                          Supportive non-medical guidance for Week {selectedWeek} ({currentWeekDetail.babyMilestones})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAssistantModal(true)}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs shrink-0 whitespace-nowrap"
                    >
                      Ask Mama
                    </button>
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
                    unitSystem={profile.unitSystem || 'imperial'}
                  />

                  {/* Week-by-Week Interactive Scrubber Carousel */}
                  <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                        {t.pregnancyHome.journeyTimeline}
                      </span>
                      <span className="text-xs text-rose-600 font-semibold font-mono">
                        {t.pregnancyHome.viewingWeek} {selectedWeek}
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
                        {t.pregnancyHome.highlights} · {t.header.week} {selectedWeek}
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
                        {t.pregnancyHome.momBody}:
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
                          <span>{t.pregnancyHome.twinNote}:</span>
                        </span>
                        <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
                          {currentWeekDetail.twinNotes}
                        </p>
                      </div>
                    )}

                    {/* Daily Curated Tips */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block mb-2">
                        {t.pregnancyHome.dailyTips}
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
                  {/* Maman Assistant Postpartum & Newborn Guide Card */}
                  <div className="w-full bg-gradient-to-br from-rose-50/90 via-white to-amber-50/60 dark:from-stone-900 dark:via-stone-900 dark:to-stone-850 rounded-3xl p-4 sm:p-5 border border-rose-200/70 dark:border-rose-900/40 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-xs shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                            Maman Assistant
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800">
                            Gemini AI
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                          Parenting guidance for {isTwin ? `${profile.babyName} & ${profile.babyNameTwin}` : profile.babyName} · Sleep, feeds, & mom recovery
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAssistantModal(true)}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs shrink-0 whitespace-nowrap"
                    >
                      Ask Mama
                    </button>
                  </div>

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
                    motherName={profile.motherName}
                    babyName={isTwin ? `${profile.babyName} & ${profile.babyNameTwin}` : profile.babyName}
                    dueDate={profile.dueDate}
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
                    label: t.tabs.pregnancy,
                    icon: <Heart className="w-5 h-5" />,
                  },
                  {
                    id: 'logger' as const,
                    label: t.tabs.logger,
                    icon: <Activity className="w-5 h-5" />,
                  },
                  {
                    id: 'baby' as const,
                    label: t.tabs.babyLog,
                    icon: <Baby className="w-5 h-5" />,
                  },
                  {
                    id: 'tools' as const,
                    label: t.tabs.planning,
                    icon: <Calendar className="w-5 h-5" />,
                  },
                  {
                    id: 'guides' as const,
                    label: t.tabs.guides,
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

      {/* Maman Assistant Gemini Chat Modal */}
      {showAssistantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl shadow-2xl relative animate-in zoom-in-95">
            <MamanAssistant
              stage={profile.activeStage}
              currentWeek={progress.currentWeek}
              babyAge="3 months"
              isTwin={isTwin}
              motherName={profile.motherName}
              babyName={profile.babyName}
              babyNameTwin={profile.babyNameTwin}
              language={profile.language || 'en'}
              onClose={() => setShowAssistantModal(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
