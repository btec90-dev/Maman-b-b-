import React, { useState } from 'react';
import { ARTICLES_DATA, VACCINE_SCHEDULE, DOCTOR_VISITS, Article } from '../data/knowledgeBaseData';
import { VaccineInfo, DoctorVisitChecklist } from '../types';
import { BookOpen, ShieldCheck, Stethoscope, ChevronRight, Check, Search, Calendar, User, Clock } from 'lucide-react';

interface Props {
  vaccines: VaccineInfo[];
  doctorVisits: DoctorVisitChecklist[];
  onToggleVaccine: (id: string) => void;
  onToggleCheckpoint: (visitId: string, checkpointId: string) => void;
}

export const KnowledgeBase: React.FC<Props> = ({
  vaccines,
  doctorVisits,
  onToggleVaccine,
  onToggleCheckpoint,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'vaccines' | 'visits'>('articles');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = ARTICLES_DATA.filter(
    (a) => selectedCategory === 'all' || a.category === selectedCategory
  );

  const completedVaccinesCount = vaccines.filter((v) => v.isCompleted).length;

  return (
    <div className="space-y-4">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
        {[
          { id: 'articles' as const, label: 'Expert Guides', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'vaccines' as const, label: 'Vaccine Schedule', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { id: 'visits' as const, label: 'Doctor Visits', icon: <Stethoscope className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedArticle(null);
            }}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: ARTICLES & GUIDES */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {selectedArticle ? (
            /* Article Reader View */
            <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Back to Guides Directory
              </button>

              <div>
                <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                  {selectedArticle.category.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-2">
                  {selectedArticle.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{selectedArticle.author}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{selectedArticle.readTime}</span>
                  </span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 italic">
                {selectedArticle.summary}
              </div>

              <div className="space-y-4 pt-2">
                {selectedArticle.sections.map((sec, i) => (
                  <div key={i} className="space-y-1.5">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {sec.heading}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {sec.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Guides Directory List */
            <>
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Trimesters' },
                  { id: '1st_trimester', label: '1st Trimester' },
                  { id: '2nd_trimester', label: '2nd Trimester' },
                  { id: '3rd_trimester', label: '3rd Trimester' },
                  { id: 'newborn', label: 'Newborn Care' },
                  { id: 'postpartum', label: 'Postpartum' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`py-1 px-2.5 rounded-xl font-semibold cursor-pointer whitespace-nowrap transition-all ${
                      selectedCategory === c.id
                        ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:border-rose-200 dark:hover:border-rose-900/60 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md">
                        {article.category.replace('_', ' ')}
                      </span>
                      <span>{article.readTime}</span>
                    </div>

                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {article.title}
                    </h4>

                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500">
                      <span>{article.author}</span>
                      <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                        Read Guide <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: VACCINE SCHEDULE (CDC / WHO STANDARD) */}
      {activeTab === 'vaccines' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                CDC &amp; WHO Infant Immunization Schedule
              </h3>
              <p className="text-xs text-stone-500">Track and check off routine childhood vaccines</p>
            </div>
            <span className="font-mono text-xs font-bold text-sage-700 bg-sage-50 dark:bg-sage-950/60 px-2.5 py-1 rounded-full tabular-nums">
              {completedVaccinesCount} / {vaccines.length} Done
            </span>
          </div>

          <div className="space-y-2">
            {vaccines.map((v) => (
              <div
                key={v.id}
                onClick={() => onToggleVaccine(v.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  v.isCompleted
                    ? 'bg-sage-50/70 dark:bg-sage-950/20 border-sage-200 dark:border-sage-900/50'
                    : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    v.isCompleted ? 'bg-sage-600 text-white' : 'border-2 border-stone-300'
                  }`}
                >
                  {v.isCompleted && <Check className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs font-bold ${
                        v.isCompleted
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {v.name}
                    </h4>
                    <span className="text-[11px] font-mono text-stone-500 shrink-0">
                      {v.recommendedAge}
                    </span>
                  </div>

                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Target: {v.diseaseTarget}
                  </span>
                  <p className="text-[10px] text-stone-400 mt-0.5">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR VISITS & APPOINTMENT CHECKLISTS */}
      {activeTab === 'visits' && (
        <div className="space-y-3">
          {doctorVisits.map((visit) => (
            <div
              key={visit.id}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {visit.timing}
                </span>
                <span className="text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                  {visit.trimesterOrAge}
                </span>
              </div>

              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {visit.title}
              </h4>

              {/* Checkpoints */}
              <div className="space-y-1.5 pt-1">
                {visit.checkpoints.map((cp) => (
                  <div
                    key={cp.id}
                    onClick={() => onToggleCheckpoint(visit.id, cp.id)}
                    className="flex items-start gap-2.5 cursor-pointer text-xs group"
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        cp.checked ? 'bg-sage-600 text-white' : 'border border-stone-300 dark:border-stone-600'
                      }`}
                    >
                      {cp.checked && <Check className="w-3 h-3" />}
                    </div>
                    <span
                      className={`text-xs ${
                        cp.checked ? 'line-through text-stone-400' : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {cp.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Suggested Questions to Ask */}
              {visit.suggestedQuestions.length > 0 && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800 text-xs space-y-1.5">
                  <span className="font-semibold text-stone-700 dark:text-stone-300 block">
                    Suggested Questions for your Care Provider:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-stone-500 pl-1 text-[11px]">
                    {visit.suggestedQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
