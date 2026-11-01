import React, { useState } from 'react';
import { Milestone } from '../types';
import { Award, Check, Sparkles, Filter, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  milestones: Milestone[];
  onToggleMilestone: (id: string) => void;
}

const AGE_MONTHS = [2, 4, 6, 9, 12, 18, 24] as const;

export const MilestoneTracker: React.FC<Props> = ({ milestones, onToggleMilestone }) => {
  const [selectedAge, setSelectedAge] = useState<number>(2);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'physical' | 'cognitive' | 'social_language'>('all');

  const filtered = milestones.filter(
    (m) => m.ageMonth === selectedAge && (selectedCategory === 'all' || m.category === selectedCategory)
  );

  const completedCount = milestones.filter((m) => m.isAchieved).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const handleMilestoneClick = (id: string, currentlyAchieved: boolean) => {
    onToggleMilestone(id);
    if (!currentlyAchieved) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#D9777F', '#6B8E76', '#8C7AA9'],
        });
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Milestone Overview Card */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                0–24 Months Milestone Guide
              </h3>
              <p className="text-xs text-stone-500">CDC &amp; AAP Developmental Milestones</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full tabular-nums">
            {completedCount} / {milestones.length} Met ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-400 via-rose-500 to-sage-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Age month horizontal pill bar */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {AGE_MONTHS.map((age) => (
            <button
              key={age}
              onClick={() => setSelectedAge(age)}
              className={`flex-1 min-w-[55px] py-1.5 px-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                selectedAge === age
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {age}m
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-x-auto text-xs">
        {[
          { id: 'all' as const, label: 'All Domains' },
          { id: 'physical' as const, label: 'Motor & Movement' },
          { id: 'cognitive' as const, label: 'Cognitive' },
          { id: 'social_language' as const, label: 'Social & Communication' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-1 py-1.5 px-2 rounded-xl font-semibold cursor-pointer transition-all whitespace-nowrap text-center ${
              selectedCategory === cat.id
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Milestones List */}
      <div className="space-y-2.5">
        {filtered.map((m) => (
          <div
            key={m.id}
            onClick={() => handleMilestoneClick(m.id, m.isAchieved)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              m.isAchieved
                ? 'bg-sage-50/80 dark:bg-sage-950/30 border-sage-200 dark:border-sage-900/50'
                : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 hover:border-stone-300'
            }`}
          >
            {/* Checkbox circle */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                m.isAchieved
                  ? 'bg-sage-600 text-white shadow-xs'
                  : 'border-2 border-stone-300 dark:border-stone-600 text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    m.category === 'physical'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                      : m.category === 'cognitive'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {m.category.replace('_', ' ')}
                </span>
                {m.achievedDate && (
                  <span className="text-[10px] text-stone-400">
                    Achieved on {m.achievedDate}
                  </span>
                )}
              </div>

              <h4
                className={`text-xs font-bold leading-snug ${
                  m.isAchieved
                    ? 'line-through text-stone-400 dark:text-stone-500'
                    : 'text-stone-900 dark:text-stone-100'
                }`}
              >
                {m.title}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                {m.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
