import React, { useState } from 'react';
import { UserProfile, CalculationMethod, BabyMode } from '../types';
import { SupportedLanguage, UnitSystem, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { Calendar, X, Sparkles, Baby, Users, Heart, Globe, Scale } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const DueDatePickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [motherName, setMotherName] = useState(profile.motherName);
  const [babyName, setBabyName] = useState(profile.babyName);
  const [babyNameTwin, setBabyNameTwin] = useState(profile.babyNameTwin || 'Baby B');
  const [babyMode, setBabyMode] = useState<BabyMode>(profile.babyMode);
  const [calcMethod, setCalcMethod] = useState<CalculationMethod>(profile.calculationMethod);
  const [dueDate, setDueDate] = useState(profile.dueDate);
  const [inputDate, setInputDate] = useState(profile.lmpDate || profile.dueDate);
  const [activeStage, setActiveStage] = useState<'pregnancy' | 'baby'>(profile.activeStage);
  const [language, setLanguage] = useState<SupportedLanguage>(profile.language || 'en');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(profile.unitSystem || 'imperial');

  if (!isOpen) return null;

  const t = TRANSLATIONS[language]?.settingsModal || TRANSLATIONS.en.settingsModal;

  // Real-time calculation based on method
  const handleCalculateDate = (dateVal: string, method: CalculationMethod) => {
    setInputDate(dateVal);
    if (!dateVal) return;

    try {
      const base = new Date(dateVal);
      if (isNaN(base.getTime())) return;

      if (method === 'lmp') {
        // Naegele's rule: LMP + 280 days (40 weeks)
        const calculated = new Date(base.getTime() + 280 * 24 * 60 * 60 * 1000);
        setDueDate(calculated.toISOString().split('T')[0]);
      } else if (method === 'conception') {
        // Conception + 266 days (38 weeks)
        const calculated = new Date(base.getTime() + 266 * 24 * 60 * 60 * 1000);
        setDueDate(calculated.toISOString().split('T')[0]);
      } else {
        setDueDate(dateVal);
      }
    } catch {
      // Fallback
    }
  };

  const handleSave = () => {
    onSaveProfile({
      ...profile,
      motherName: motherName.trim() || 'Mama',
      babyName: babyName.trim() || 'Baby',
      babyNameTwin: babyMode === 'twin' ? (babyNameTwin.trim() || 'Baby B') : undefined,
      babyMode,
      calculationMethod: calcMethod,
      dueDate,
      lmpDate: calcMethod === 'lmp' ? inputDate : profile.lmpDate,
      conceptionDate: calcMethod === 'conception' ? inputDate : profile.conceptionDate,
      activeStage,
      language,
      unitSystem,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                {t.title}
              </h3>
              <p className="text-xs text-stone-500">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-xs">
          {/* Dynamic Language Selection Grid */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.language}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 justify-center border cursor-pointer transition-all ${
                    language === lang.code
                      ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-400 text-rose-800 dark:text-rose-200 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Unit System Selector (Imperial vs Metric) */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.units}</span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  unitSystem === 'metric'
                    ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <span>{t.metric}</span>
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem('imperial')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  unitSystem === 'imperial'
                    ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <span>{t.imperial}</span>
              </button>
            </div>
          </div>

          {/* Active Stage Toggle: Pregnancy vs Newborn / Baby */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              {t.activeStage}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveStage('pregnancy')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeStage === 'pregnancy'
                    ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{t.pregnancyJourney}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('baby')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeStage === 'baby'
                    ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                <span>{t.babyPostpartum}</span>
              </button>
            </div>
          </div>

          {/* Single Baby vs. Twin Mode Toggle */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              {t.mode}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <button
                type="button"
                onClick={() => setBabyMode('single')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  babyMode === 'single'
                    ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                <span>{t.single}</span>
              </button>
              <button
                type="button"
                onClick={() => setBabyMode('twin')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  babyMode === 'twin'
                    ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t.twin}</span>
              </button>
            </div>
          </div>

          {/* Names inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                {t.motherName}
              </label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="Mama"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                {babyMode === 'twin' ? 'Baby A' : t.babyName}
              </label>
              <input
                type="text"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                placeholder={babyMode === 'twin' ? 'Baby A' : 'Margot'}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
            </div>
          </div>

          {babyMode === 'twin' && (
            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                {t.babyNameTwin}
              </label>
              <input
                type="text"
                value={babyNameTwin}
                onChange={(e) => setBabyNameTwin(e.target.value)}
                placeholder="Baby B"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
            </div>
          )}

          {/* Calculation Method */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              {t.calculationMethod}
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-3">
              {[
                { id: 'lmp' as CalculationMethod, label: 'LMP (Last Period)' },
                { id: 'conception' as CalculationMethod, label: 'Conception Date' },
                { id: 'ultrasound' as CalculationMethod, label: 'Ultrasound Dating' },
                { id: 'due_date' as CalculationMethod, label: 'Known Due Date' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setCalcMethod(m.id);
                    handleCalculateDate(inputDate, m.id);
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium text-[11px] cursor-pointer transition-all ${
                    calcMethod === m.id
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Date Input */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700">
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                {calcMethod === 'lmp' && 'First Day of Last Menstrual Period (LMP)'}
                {calcMethod === 'conception' && 'Estimated Conception Date'}
                {calcMethod === 'ultrasound' && 'Ultrasound Assigned Due Date'}
                {calcMethod === 'due_date' && 'Estimated Due Date (EDD)'}
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="date"
                  value={calcMethod === 'due_date' ? dueDate : inputDate}
                  onChange={(e) => handleCalculateDate(e.target.value, calcMethod)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                />
              </div>

              {calcMethod !== 'due_date' && (
                <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Calculated Estimated Due Date:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
                    {dueDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
