import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  BookOpen,
  Sparkles,
  CalendarDays,
  X,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CalendarScheduleEvent, CalendarCategory } from '../types';

interface Props {
  events: CalendarScheduleEvent[];
  onAddEvent: (event: Omit<CalendarScheduleEvent, 'id' | 'createdAt'>) => void;
  onUpdateEvent: (event: CalendarScheduleEvent) => void;
  onDeleteEvent: (id: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onRequestDaySummary?: () => void;
  initialExpanded?: boolean;
}

// Format date helper to YYYY-MM-DD
export const toISODate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AssistantBottomCalendar: React.FC<Props> = ({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  selectedDate,
  onSelectDate,
  onRequestDaySummary,
  initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date(selectedDate || Date.now());
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // State for inline event creator/editor
  const [isCreating, setIsCreating] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CalendarCategory>('appointment');
  const [formDate, setFormDate] = useState(selectedDate || toISODate(new Date()));
  const [formTime, setFormTime] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Day summary modal / panel toggle
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const todayStr = useMemo(() => toISODate(new Date()), []);

  // Events filtered for the currently selected date
  const selectedDateEvents = useMemo(() => {
    return events
      .filter((e) => e.date === selectedDate)
      .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
  }, [events, selectedDate]);

  // Today's events count
  const todayEvents = useMemo(() => {
    return events.filter((e) => e.date === todayStr);
  }, [events, todayStr]);

  // Calendar month grid calculation
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      events: CalendarScheduleEvent[];
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const str = toISODate(d);
      days.push({
        dateStr: str,
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === selectedDate,
        events: events.filter((e) => e.date === str),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const str = toISODate(d);
      days.push({
        dateStr: str,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: str === todayStr,
        isSelected: str === selectedDate,
        events: events.filter((e) => e.date === str),
      });
    }

    // Next month padding to reach multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const str = toISODate(d);
      days.push({
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === selectedDate,
        events: events.filter((e) => e.date === str),
      });
    }

    return days;
  }, [currentMonthDate, events, selectedDate, todayStr]);

  // Week view calculation based on selectedDate
  const currentWeekDays = useMemo(() => {
    const current = new Date(selectedDate || todayStr);
    const dayOfWeek = current.getDay(); // 0 is Sunday
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - dayOfWeek);

    const weekDays: Array<{
      dateStr: string;
      dayName: string;
      dayNumber: number;
      isToday: boolean;
      isSelected: boolean;
      events: CalendarScheduleEvent[];
    }> = [];

    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const str = toISODate(d);
      weekDays.push({
        dateStr: str,
        dayName: names[i],
        dayNumber: d.getDate(),
        isToday: str === todayStr,
        isSelected: str === selectedDate,
        events: events.filter((e) => e.date === str),
      });
    }

    return weekDays;
  }, [selectedDate, todayStr, events]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(todayStr);
  };

  const startCreateEvent = (presetCategory?: CalendarCategory, date?: string) => {
    setEditingEventId(null);
    setFormTitle('');
    setFormCategory(presetCategory || 'appointment');
    setFormDate(date || selectedDate || todayStr);
    setFormTime('');
    setFormNotes('');
    setFormError(null);
    setIsCreating(true);
    setIsExpanded(true);
  };

  const startEditEvent = (event: CalendarScheduleEvent) => {
    setEditingEventId(event.id);
    setFormTitle(event.title);
    setFormCategory(event.category);
    setFormDate(event.date);
    setFormTime(event.time || '');
    setFormNotes(event.notes || '');
    setFormError(null);
    setIsCreating(true);
    setIsExpanded(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter a title for the event.');
      return;
    }
    if (!formDate) {
      setFormError('Please choose a valid date.');
      return;
    }

    if (editingEventId) {
      const existing = events.find((ev) => ev.id === editingEventId);
      if (existing) {
        onUpdateEvent({
          ...existing,
          title: formTitle.trim(),
          category: formCategory,
          date: formDate,
          time: formTime.trim() || undefined,
          notes: formNotes.trim() || undefined,
        });
      }
    } else {
      onAddEvent({
        title: formTitle.trim(),
        category: formCategory,
        date: formDate,
        time: formTime.trim() || undefined,
        notes: formNotes.trim() || undefined,
        completed: false,
      });
    }

    onSelectDate(formDate);
    setIsCreating(false);
    setEditingEventId(null);
  };

  const handleToggleComplete = (event: CalendarScheduleEvent) => {
    onUpdateEvent({
      ...event,
      completed: !event.completed,
    });
  };

  // Quick preset chips for rapid creation
  const handleQuickAddPreset = (title: string, category: CalendarCategory, defaultTime?: string) => {
    setFormTitle(title);
    setFormCategory(category);
    if (defaultTime) setFormTime(defaultTime);
  };

  const monthLabel = currentMonthDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  // Format selected date nicely
  const formattedSelectedDate = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div className="bg-stone-50 dark:bg-stone-900/95 border-t border-stone-200/80 dark:border-stone-800 transition-all select-none">
      {/* Dock Bar / Collapsed View Header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 font-semibold text-xs sm:text-sm cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-900/50 shadow-2xs group-hover:scale-105 transition-transform">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="text-left flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-bold flex items-center gap-1.5">
                Maman Calendar
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                )}
              </span>
              <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400 truncate">
                {selectedDate === todayStr ? 'Today' : formattedSelectedDate} (
                {selectedDateEvents.length} items)
              </span>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setShowSummaryModal(true);
              if (onRequestDaySummary) onRequestDaySummary();
            }}
            className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/60 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            title="What does my day look like?"
          >
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Day Look Like?</span>
            <span className="sm:hidden">Day</span>
          </button>

          <button
            onClick={() => startCreateEvent('appointment')}
            className="px-2.5 py-1 text-[11px] font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Add schedule item"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
            title={isExpanded ? 'Collapse Calendar' : 'Expand Calendar'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Interactive Calendar Block */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3.5 max-h-[380px] overflow-y-auto">
          {/* Header controls inside expanded view: Month/Week toggle & Navigator */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-stone-800 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Month View
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Weekly View
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 min-w-[110px] text-center">
                {monthLabel}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleJumpToToday}
                className="ml-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-0.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer border border-stone-200/70 dark:border-stone-700"
              >
                Today
              </button>
            </div>
          </div>

          {/* Inline Event Creation / Editing Form */}
          {isCreating && (
            <div className="p-3 bg-amber-50/60 dark:bg-stone-800/90 rounded-2xl border border-amber-200/70 dark:border-stone-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>{editingEventId ? 'Edit Event' : 'New Inline Schedule Event'}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingEventId(null);
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {formError && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200 dark:border-rose-900">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Category Selector Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormCategory('appointment')}
                  className={`p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer transition-all border ${
                    formCategory === 'appointment'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-rose-300'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Appointment / Visit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormCategory('journal')}
                  className={`p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer transition-all border ${
                    formCategory === 'journal'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Journal / Milestone</span>
                </button>
              </div>

              {/* Quick Presets for fast entry */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
                <span className="text-stone-400 shrink-0 text-[10px]">Quick:</span>
                {formCategory === 'appointment' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickAddPreset('Pediatrician Checkup', 'appointment', '10:00 AM')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      🩺 Pediatrician
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddPreset('Vaccination Appointment', 'appointment', '11:30 AM')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      💉 Vaccines
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddPreset('Glucose & Blood Screening', 'appointment', '09:00 AM')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      🧪 Lab screening
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickAddPreset('Daily Gratitude & Mood Reflection', 'journal')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-amber-50 cursor-pointer shrink-0"
                    >
                      ✨ Daily Reflection
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddPreset('Baby Milestone Moment', 'journal')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-amber-50 cursor-pointer shrink-0"
                    >
                      🌱 Baby Milestone
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddPreset('Weekly Bump Photo & Body Note', 'journal')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-amber-50 cursor-pointer shrink-0"
                    >
                      📸 Bump Snapshot
                    </button>
                  </>
                )}
              </div>

              {/* Form Input Fields */}
              <form onSubmit={handleSaveForm} className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={
                      formCategory === 'appointment'
                        ? 'e.g. 24-Week Ultrasound or Pediatrician visit...'
                        : 'e.g. Baby first roll milestone or evening reflection...'
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="text-xs bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <input
                      type="text"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      placeholder="Time (e.g. 10:30 AM)"
                      className="text-xs bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none w-full placeholder:text-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Notes, doctor questions, or feelings (optional)..."
                    className="w-full text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingEventId(null);
                    }}
                    className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingEventId ? 'Update Event' : 'Save Event'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW: MONTH VIEW GRID */}
          {viewMode === 'month' && (
            <div className="bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-2.5 shadow-2xs">
              {/* Day of Week Labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const appointmentCount = day.events.filter((e) => e.category === 'appointment').length;
                  const journalCount = day.events.filter((e) => e.category === 'journal').length;

                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => onSelectDate(day.dateStr)}
                      className={`h-11 sm:h-12 p-1 rounded-xl flex flex-col items-center justify-between transition-all cursor-pointer relative ${
                        day.isSelected
                          ? 'ring-2 ring-amber-500 bg-amber-50/80 dark:bg-amber-950/30'
                          : day.isToday
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 font-bold'
                          : day.isCurrentMonth
                          ? 'hover:bg-stone-100 dark:hover:bg-stone-800'
                          : 'opacity-35 hover:opacity-75'
                      }`}
                    >
                      <span
                        className={`text-[11px] leading-tight ${
                          day.isToday
                            ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                            : day.isSelected
                            ? 'text-amber-800 dark:text-amber-200 font-bold'
                            : 'text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      {/* Event category indicator badges */}
                      <div className="flex items-center gap-0.5 justify-center w-full">
                        {appointmentCount > 0 && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"
                            title={`${appointmentCount} appointment(s)`}
                          />
                        )}
                        {journalCount > 0 && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                            title={`${journalCount} journal event(s)`}
                          />
                        )}
                        {day.events.length > 2 && (
                          <span className="text-[8px] text-stone-400 font-mono">
                            +{day.events.length - 2}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-7 gap-1.5 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-2.5">
              {currentWeekDays.map((d) => (
                <button
                  key={d.dateStr}
                  onClick={() => onSelectDate(d.dateStr)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-between min-h-[90px] transition-all cursor-pointer border ${
                    d.isSelected
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 shadow-2xs ring-1 ring-amber-400'
                      : d.isToday
                      ? 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                      {d.dayName}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        d.isToday ? 'text-rose-600 dark:text-rose-400' : 'text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {d.dayNumber}
                    </span>
                  </div>

                  <div className="w-full flex flex-col gap-1 my-1">
                    {d.events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate text-left ${
                          ev.category === 'appointment'
                            ? 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {d.events.length > 2 && (
                      <span className="text-[9px] text-stone-400 font-mono text-center">
                        +{d.events.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Date Schedule & Action Bar */}
          <div className="bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Schedule for {formattedSelectedDate}
                </h4>
                <span className="text-[11px] px-2 py-0.2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full">
                  {selectedDateEvents.length} items
                </span>
              </div>

              <button
                onClick={() => startCreateEvent('appointment', selectedDate)}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Event List */}
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-4 px-3 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                <p className="text-xs text-stone-400">
                  No appointments or journal reflections scheduled for this day.
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    onClick={() => startCreateEvent('appointment', selectedDate)}
                    className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                  >
                    + Add Appointment
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={() => startCreateEvent('journal', selectedDate)}
                    className="text-xs text-amber-600 hover:underline font-medium cursor-pointer"
                  >
                    + Add Journal Reflection
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {selectedDateEvents.map((item) => {
                  const isAppt = item.category === 'appointment';
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 transition-all ${
                        item.completed
                          ? 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-60'
                          : isAppt
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40'
                          : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <button
                          onClick={() => handleToggleComplete(item)}
                          className="mt-0.5 text-stone-400 hover:text-emerald-500 cursor-pointer transition-colors shrink-0"
                          title={item.completed ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>

                        <div className="space-y-0.5 overflow-hidden">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                                isAppt
                                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {isAppt ? '🩺 Appointment' : '📝 Journal'}
                            </span>

                            {item.time && (
                              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3" />
                                {item.time}
                              </span>
                            )}
                          </div>

                          <h5
                            className={`text-xs font-semibold text-stone-900 dark:text-stone-100 truncate ${
                              item.completed ? 'line-through text-stone-400 dark:text-stone-500' : ''
                            }`}
                          >
                            {item.title}
                          </h5>

                          {item.notes && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          onClick={() => startEditEvent(item)}
                          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-white/60 dark:hover:bg-stone-800 cursor-pointer"
                          title="Edit event"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(item.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* "What does my day look like?" Day Summary Modal Drawer */}
      {showSummaryModal && (
        <div className="p-3.5 bg-gradient-to-r from-amber-50/95 via-rose-50/80 to-stone-50 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border-t border-amber-200/80 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Your Day Overview: {formattedSelectedDate}
              </h4>
            </div>
            <button
              onClick={() => setShowSummaryModal(false)}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
              {selectedDateEvents.length === 0 ? (
                <>
                  You have a peaceful, open day planned! No scheduled visits or journal items for this date. A wonderful moment to rest, stay hydrated, and take a gentle stroll.
                </>
              ) : (
                <>
                  Here is your schedule for <strong>{formattedSelectedDate}</strong> with{' '}
                  <strong>{selectedDateEvents.length} total item(s)</strong>:
                </>
              )}
            </p>

            {selectedDateEvents.length > 0 && (
              <div className="space-y-1.5 pl-1">
                {selectedDateEvents.map((ev, i) => (
                  <div key={ev.id} className="flex items-start gap-2 text-xs">
                    <span className="font-bold text-amber-600">{i + 1}.</span>
                    <div>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {ev.title}
                      </span>
                      {ev.time && <span className="text-stone-500 text-[11px]"> ({ev.time})</span>}
                      <span
                        className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          ev.category === 'appointment'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {ev.category === 'appointment' ? 'Appointment' : 'Journal'}
                      </span>
                      {ev.completed && (
                        <span className="ml-1 text-[10px] text-emerald-600 font-medium">✓ Done</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-200/60 dark:border-stone-800">
              <span>💡 Tip: Ask the assistant anytime: "What does my day look like?"</span>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-amber-700 dark:text-amber-300 font-semibold hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
