export type BabyMode = 'single' | 'twin';

export type CalculationMethod = 'due_date' | 'lmp' | 'conception' | 'ultrasound';

export type SizeTheme = 'fruits' | 'sports' | 'snacks' | 'animals';

export interface UserProfile {
  id: string;
  motherName: string;
  babyName: string;
  babyNameTwin?: string;
  babyMode: BabyMode;
  calculationMethod: CalculationMethod;
  dueDate: string; // ISO date string YYYY-MM-DD
  lmpDate?: string;
  conceptionDate?: string;
  activeStage: 'pregnancy' | 'baby';
  babyBirthDate?: string;
  babyGender?: 'girl' | 'boy' | 'surprise';
  babyGenderTwin?: 'girl' | 'boy' | 'surprise';
}

export interface WeekDetail {
  week: number;
  trimester: 1 | 2 | 3;
  lengthCm: number;
  lengthIn: number;
  weightG: number;
  weightOz: number;
  sizes: {
    fruits: { name: string; icon: string; description: string };
    sports: { name: string; icon: string; description: string };
    snacks: { name: string; icon: string; description: string };
    animals: { name: string; icon: string; description: string };
  };
  highlights: string[];
  babyMilestones: string;
  momChanges: string;
  commonSymptoms: string[];
  dailyTips: string[];
  twinNotes?: string;
}

export interface KickSession {
  id: string;
  timestamp: number;
  durationSeconds: number;
  kickCount: number;
  kickIntervals: number[]; // seconds between each kick
  notes?: string;
  fetalStatus: 'active' | 'moderate' | 'slow';
}

export interface SymptomLog {
  id: string;
  date: string;
  symptoms: Array<{
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
  mood: string;
  notes?: string;
}

export interface WeightLog {
  id: string;
  date: string;
  weight: number; // lbs or kg
  unit: 'lbs' | 'kg';
  notes?: string;
}

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string;
  takenToday: boolean;
  category: 'prenatal_vitamin' | 'iron' | 'calcium' | 'prescription' | 'other';
}

export interface RegistryItem {
  id: string;
  category: 'Nursery' | 'Feeding' | 'Travel' | 'Clothing' | 'Diapering' | 'Health & Safety' | 'Mom Essentials';
  name: string;
  priority: 'must_have' | 'nice_to_have' | 'can_wait';
  quantity: number;
  isPurchased: boolean;
  estimatedPrice?: number;
  notes?: string;
}

export interface FeedingLog {
  id: string;
  timestamp: number;
  type: 'breast' | 'bottle';
  leftDurationMinutes?: number;
  rightDurationMinutes?: number;
  bottleAmountOz?: number;
  bottleType?: 'breast_milk' | 'formula';
  notes?: string;
}

export interface DiaperLog {
  id: string;
  timestamp: number;
  type: 'wet' | 'dirty' | 'both' | 'clean';
  consistency?: 'normal' | 'seedy' | 'loose' | 'hard';
  color?: 'yellow' | 'brown' | 'green' | 'meconium';
  notes?: string;
}

export interface SleepLog {
  id: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  isNightSleep: boolean;
  notes?: string;
}

export interface PumpLog {
  id: string;
  timestamp: number;
  leftOz: number;
  rightOz: number;
  durationMinutes: number;
  notes?: string;
}

export interface PostpartumWellnessLog {
  id: string;
  date: string;
  bleedingLevel: 'none' | 'light' | 'moderate' | 'heavy';
  perinealPain: 'none' | 'mild' | 'moderate' | 'severe';
  moodRating: number; // 1-5
  waterGlasses: number;
  pelvicFloorDone: boolean;
  notes?: string;
}

export interface Milestone {
  id: string;
  ageMonth: 1 | 2 | 4 | 6 | 9 | 12 | 18 | 24;
  category: 'physical' | 'cognitive' | 'social_language';
  title: string;
  description: string;
  isAchieved: boolean;
  achievedDate?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'bump_photo' | 'ultrasound' | 'doctor_visit' | 'milestone' | 'thought';
  photoUrl?: string;
  weekNumber?: number;
  tags: string[];
}

export interface VaccineInfo {
  id: string;
  name: string;
  diseaseTarget: string;
  recommendedAge: string;
  monthAge: number;
  description: string;
  isCompleted: boolean;
  administeredDate?: string;
}

export interface DoctorVisitChecklist {
  id: string;
  timing: string;
  title: string;
  trimesterOrAge: string;
  checkpoints: Array<{
    id: string;
    text: string;
    checked: boolean;
  }>;
  suggestedQuestions: string[];
}
