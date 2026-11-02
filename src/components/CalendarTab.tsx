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
  Stethoscope,
  BookOpen,
  Sparkles,
  CalendarDays,
  X,
  Check,
  Search,
  Filter,
  AlertCircle,
  CalendarCheck,
  Tag,
  MapPin,
  Heart,
  ChevronDown,
  Info,
} from 'lucide-react';
import { CalendarScheduleEvent, CalendarCategory, JournalEntry } from '../types';
import { toISODate } from './AssistantBottomCalendar';
import { formatDaySummaryText } from '../utils/calendarIntentParser';

interface Props {
  events: CalendarScheduleEvent[];
  onAddEvent: (event: Omit<CalendarScheduleEvent, 'id' | 'createdAt'>) => void;
  onUpdateEvent: (event: CalendarScheduleEvent) => void;
  onDeleteEvent: (id: string) => void;
  journalEntries?: JournalEntry[];
  onAddJournalEntry?: (entry: JournalEntry) => void;
  motherName?: string;
  babyName?: string;
  dueDate?: string;
  isTwin?: boolean;
}

export const CalendarTab: React.FC<Props> = ({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  journalEntries = [],
  onAddJournalEntry,
  motherName = 'Mama',
  babyName = 'Margot',
  dueDate,
  isTwin = false,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const todayStr = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Filter & Search states
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'appointment' | 'journal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Creator states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CalendarCategory>('appointment');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formTime, setFormTime] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Merge calendar events with journal entries for a comprehensive calendar view
  const unifiedEvents = useMemo(() => {
    const list: Array<CalendarScheduleEvent & { isFromJournalTable?: boolean }> = [...events];

    // Check if any journal entries aren't already represented in events by date + title
    journalEntries.forEach((je) => {
      const exists = list.some(
        (ev) => ev.date === je.date && ev.title.toLowerCase() === je.title.toLowerCase()
      );
      if (!exists) {
        list.push({
          id: `je-${je.id}`,
          title: je.title,
          date: je.date,
          category: 'journal',
          notes: je.content,
          completed: true,
          createdAt: new Date(je.date).getTime() || Date.now(),
          isFromJournalTable: true,
        });
      }
    });

    return list;
  }, [events, journalEntries]);

  // Filtered by category and search
  const filteredEvents = useMemo(() => {
    return unifiedEvents.filter((ev) => {
      if (categoryFilter !== 'all' && ev.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchNotes = ev.notes?.toLowerCase().includes(q);
        return matchTitle || matchNotes;
      }
      return true;
    });
  }, [unifiedEvents, categoryFilter, searchQuery]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return filteredEvents
      .filter((ev) => ev.date === selectedDate)
      .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
  }, [filteredEvents, selectedDate]);

  // Month grid calculation
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
      isDueDate: boolean;
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
        isDueDate: str === dueDate,
        events: filteredEvents.filter((e) => e.date === str),
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
        isDueDate: str === dueDate,
        events: filteredEvents.filter((e) => e.date === str),
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
        isDueDate: str === dueDate,
        events: filteredEvents.filter((e) => e.date === str),
      });
    }

    return days;
  }, [currentMonthDate, filteredEvents, selectedDate, todayStr, dueDate]);

  // Week view calculation
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
      isDueDate: boolean;
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
        isDueDate: str === dueDate,
        events: filteredEvents.filter((e) => e.date === str),
      });
    }

    return weekDays;
  }, [selectedDate, todayStr, filteredEvents, dueDate]);

  const handlePrevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentMonthDate(
        new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
      );
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 7);
      setSelectedDate(toISODate(d));
      setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentMonthDate(
        new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
      );
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 7);
      setSelectedDate(toISODate(d));
      setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayStr);
  };

  const openCreateModal = (presetCat: CalendarCategory = 'appointment', targetDate?: string) => {
    setEditingEventId(null);
    setFormTitle('');
    setFormCategory(presetCat);
    setFormDate(targetDate || selectedDate || todayStr);
    setFormTime('');
    setFormNotes('');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (ev: CalendarScheduleEvent) => {
    setEditingEventId(ev.id);
    setFormTitle(ev.title);
    setFormCategory(ev.category);
    setFormDate(ev.date);
    setFormTime(ev.time || '');
    setFormNotes(ev.notes || '');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter a title for the event.');
      return;
    }
    if (!formDate) {
      setFormError('Please select a valid date.');
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

      // If user is adding a journal entry, optionally sync to MyJournal table as well
      if (formCategory === 'journal' && onAddJournalEntry) {
        onAddJournalEntry({
          id: `j-cal-${Date.now()}`,
          date: formDate,
          title: formTitle.trim(),
          content: formNotes.trim() || 'Logged from Calendar Schedule',
          category: 'milestone',
          tags: ['Calendar Log', formTitle.trim()],
        });
      }
    }

    setSelectedDate(formDate);
    setIsCreateModalOpen(false);
    setEditingEventId(null);
  };

  const handleToggleComplete = (ev: CalendarScheduleEvent) => {
    onUpdateEvent({
      ...ev,
      completed: !ev.completed,
    });
  };

  const monthLabel = currentMonthDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const formattedSelectedDate = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  // Stats for the month
  const monthStats = useMemo(() => {
    const currentYear = currentMonthDate.getFullYear();
    const currentMonth = currentMonthDate.getMonth();

    const inMonth = unifiedEvents.filter((ev) => {
      const parts = ev.date.split('-');
      if (parts.length !== 3) return false;
      return Number(parts[0]) === currentYear && Number(parts[1]) - 1 === currentMonth;
    });

    const appts = inMonth.filter((e) => e.category === 'appointment');
    const journals = inMonth.filter((e) => e.category === 'journal');
    const completed = inMonth.filter((e) => e.completed).length;

    return {
      total: inMonth.length,
      appointments: appts.length,
      journals: journals.length,
      completed,
    };
  }, [unifiedEvents, currentMonthDate]);

  return (
    <div className="space-y-4">
      {/* Top Banner Card: Month Header & Quick Stats */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-900/40">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Maman Calendar &amp; Schedule
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Organize doctor checkups, pediatric visits, daily reflections, and milestone memories.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSummaryModal(true)}
              className="px-3 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200/70 dark:border-amber-900/60 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Day Overview</span>
            </button>

            <button
              onClick={() => openCreateModal('appointment')}
              className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Quick Month Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/50 dark:border-stone-800">
            <span className="text-[10px] text-stone-400 font-semibold block uppercase">Month Items</span>
            <span className="text-base font-extrabold text-stone-800 dark:text-stone-200">
              {monthStats.total}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30">
            <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold block uppercase">
              Appointments
            </span>
            <span className="text-base font-extrabold text-rose-700 dark:text-rose-300">
              {monthStats.appointments}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block uppercase">
              Journal &amp; Milestones
            </span>
            <span className="text-base font-extrabold text-amber-700 dark:text-amber-300">
              {monthStats.journals}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block uppercase">
              Completed
            </span>
            <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
              {monthStats.completed} / {monthStats.total}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation & View Switching Controls */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Monthly vs Weekly View Toggle */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
              }`}
            >
              Full Monthly View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
              }`}
            >
              Weekly View
            </button>
          </div>

          {/* Month / Week Navigation */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button
              onClick={handlePrevPeriod}
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 min-w-[130px] text-center">
              {viewMode === 'month' ? monthLabel : `Week of ${formattedSelectedDate.split(',')[0]}`}
            </span>

            <button
              onClick={handleNextPeriod}
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleJumpToToday}
              className="px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl cursor-pointer border border-rose-200 dark:border-rose-900"
            >
              Today
            </button>
          </div>
        </div>

        {/* Filter Chips & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xl cursor-pointer transition-all shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              All Events ({unifiedEvents.length})
            </button>
            <button
              onClick={() => setCategoryFilter('appointment')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                categoryFilter === 'appointment'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              <Stethoscope className="w-3 h-3" />
              <span>Appointments</span>
            </button>
            <button
              onClick={() => setCategoryFilter('journal')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                categoryFilter === 'journal'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Journal &amp; Milestones</span>
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schedule..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-rose-500 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* 1. VIEW: FULL MONTHLY VIEW */}
        {viewMode === 'month' && (
          <div className="pt-1">
            {/* Weekdays row */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Monthly Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day) => {
                const apptCount = day.events.filter((e) => e.category === 'appointment').length;
                const journalCount = day.events.filter((e) => e.category === 'journal').length;

                return (
                  <button
                    key={day.dateStr}
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={`min-h-[64px] sm:min-h-[82px] p-1.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer relative border text-left ${
                      day.isSelected
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-400/80 shadow-xs'
                        : day.isToday
                        ? 'border-rose-400/80 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
                        : day.isCurrentMonth
                        ? 'border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 hover:bg-stone-100/80 dark:hover:bg-stone-800'
                        : 'border-transparent opacity-35 hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs ${
                          day.isToday
                            ? 'font-black text-rose-600 dark:text-rose-400'
                            : day.isSelected
                            ? 'font-black text-amber-800 dark:text-amber-200'
                            : 'font-semibold text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      {day.isDueDate && (
                        <span
                          className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                          title="Estimated Due Date"
                        />
                      )}
                    </div>

                    {/* Event badges inside cell */}
                    <div className="w-full space-y-1 mt-1">
                      {day.events.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                            ev.category === 'appointment'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          } ${ev.completed ? 'line-through opacity-70' : ''}`}
                        >
                          {ev.time ? `${ev.time} ` : ''}
                          {ev.title}
                        </div>
                      ))}

                      {day.events.length > 2 && (
                        <span className="text-[9px] text-stone-400 font-mono block text-center">
                          +{day.events.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Indicator dots for compact mobile */}
                    <div className="flex items-center gap-1 justify-center sm:hidden mt-0.5">
                      {apptCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      {journalCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. VIEW: WEEKLY VIEW */}
        {viewMode === 'week' && (
          <div className="pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
              {currentWeekDays.map((d) => (
                <div
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`p-3 rounded-2xl flex flex-col justify-between min-h-[140px] transition-all cursor-pointer border ${
                    d.isSelected
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-400/80 shadow-xs'
                      : d.isToday
                      ? 'border-rose-400 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                      : 'border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/40 dark:border-stone-800">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">
                        {d.dayName}
                      </span>
                      <span
                        className={`text-sm font-extrabold ${
                          d.isToday ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        {d.dayNumber}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateModal('appointment', d.dateStr);
                      }}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded-lg cursor-pointer hover:bg-white/60 dark:hover:bg-stone-800"
                      title="Add to this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 my-2 flex-1">
                    {d.events.length === 0 ? (
                      <span className="text-[11px] text-stone-300 dark:text-stone-600 italic block pt-2">
                        No events
                      </span>
                    ) : (
                      d.events.map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[10px] p-1.5 rounded-xl border ${
                            ev.category === 'appointment'
                              ? 'bg-rose-100/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                              : 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
                          } ${ev.completed ? 'line-through opacity-70' : ''}`}
                        >
                          <div className="font-semibold truncate">{ev.title}</div>
                          {ev.time && <div className="text-[9px] font-mono opacity-80">{ev.time}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Date Agenda Details & Inspector */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                Agenda for {formattedSelectedDate}
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {selectedDateEvents.length} scheduled item{selectedDateEvents.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openCreateModal('appointment', selectedDate)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>+ Appointment</span>
            </button>
            <button
              onClick={() => openCreateModal('journal', selectedDate)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>+ Journal Note</span>
            </button>
          </div>
        </div>

        {/* Selected Date Event List */}
        {selectedDateEvents.length === 0 ? (
          <div className="py-8 text-center bg-stone-50 dark:bg-stone-850 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 space-y-2">
            <p className="text-xs text-stone-400">
              No appointments or journal reflections scheduled for this day.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => openCreateModal('appointment', selectedDate)}
                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Schedule an Appointment
              </button>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <button
                onClick={() => openCreateModal('journal', selectedDate)}
                className="text-xs font-semibold text-amber-600 hover:underline cursor-pointer"
              >
                Add a Journal Reflection
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDateEvents.map((item) => {
              const isAppt = item.category === 'appointment';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                    item.completed
                      ? 'bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 opacity-65'
                      : isAppt
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(item)}
                      className="mt-0.5 text-stone-400 hover:text-emerald-500 cursor-pointer transition-colors"
                      title={item.completed ? 'Mark pending' : 'Mark completed'}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            isAppt
                              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {isAppt ? '🩺 Appointment' : '📝 Journal Reflection'}
                        </span>

                        {item.time && (
                          <span className="text-xs font-mono text-stone-500 dark:text-stone-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.time}
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-bold text-stone-900 dark:text-stone-100 ${
                          item.completed ? 'line-through text-stone-400 dark:text-stone-500' : ''
                        }`}
                      >
                        {item.title}
                      </h4>

                      {item.notes && (
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                      title="Edit entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INLINE / MODAL: ADD / EDIT SCHEDULE EVENT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xl relative space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {editingEventId ? 'Edit Calendar Entry' : 'New Calendar Entry'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Schedule checkup visits, vaccinations, or record baby reflections.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Category Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormCategory('appointment')}
                className={`p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all border ${
                  formCategory === 'appointment'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Appointment / Visit</span>
              </button>
              <button
                type="button"
                onClick={() => setFormCategory('journal')}
                className={`p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all border ${
                  formCategory === 'journal'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Journal / Milestone</span>
              </button>
            </div>

            {/* Quick Templates */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
              <span className="text-stone-400 shrink-0 text-[10px]">Quick:</span>
              {formCategory === 'appointment' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle('Pediatrician 4-Month Checkup');
                      setFormTime('10:00 AM');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-50 cursor-pointer shrink-0"
                  >
                    🩺 Pediatrician
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle('Recommended Vaccine Booster');
                      setFormTime('11:30 AM');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-50 cursor-pointer shrink-0"
                  >
                    💉 Vaccines
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle('Glucose & Blood Screening');
                      setFormTime('09:00 AM');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-50 cursor-pointer shrink-0"
                  >
                    🧪 Lab Screening
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle('Daily Gratitude & Mood Reflection');
                      setFormTime('08:30 PM');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-50 cursor-pointer shrink-0"
                  >
                    ✨ Daily Reflection
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle('Baby Milestone Moment');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-50 cursor-pointer shrink-0"
                  >
                    🌱 Baby Milestone
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle('Weekly Bump Snapshot & Note');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-50 cursor-pointer shrink-0"
                  >
                    📸 Bump Snapshot
                  </button>
                </>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={
                    formCategory === 'appointment'
                      ? 'e.g. Pediatrician visit or ultrasound scan...'
                      : 'e.g. Baby first roll milestone or evening reflection...'
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Notes &amp; Details
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="Doctor questions, baby feelings, checklist items, or personal memories..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEventId ? 'Update Event' : 'Save to Calendar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: "WHAT DOES MY DAY LOOK LIKE?" SUMMARY */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xl relative space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Day Overview: {formattedSelectedDate}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Summary for {motherName} and {babyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                {selectedDateEvents.length === 0 ? (
                  <>
                    Your schedule for <strong>{formattedSelectedDate}</strong> is completely open and restful! No doctor appointments or journal reflections are logged. A perfect moment to take a gentle breather and stay hydrated.
                  </>
                ) : (
                  <>
                    You have <strong>{selectedDateEvents.length} scheduled item(s)</strong> planned for{' '}
                    <strong>{formattedSelectedDate}</strong>:
                  </>
                )}
              </p>

              {selectedDateEvents.length > 0 && (
                <div className="space-y-2 pl-1 max-h-56 overflow-y-auto">
                  {selectedDateEvents.map((ev, i) => (
                    <div key={ev.id} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 flex items-start gap-2">
                      <span className="font-extrabold text-amber-600 text-xs">{i + 1}.</span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {ev.title}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              ev.category === 'appointment'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {ev.category === 'appointment' ? 'Appointment' : 'Journal'}
                          </span>
                        </div>
                        {ev.time && (
                          <span className="text-[11px] font-mono text-stone-500 block">
                            ⏰ {ev.time}
                          </span>
                        )}
                        {ev.notes && (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                            {ev.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                <span className="font-bold block">💡 Daily Parenting Tip:</span>
                <p>
                  Pack a water bottle, gentle snack, and baby essentials in advance so appointments feel calm and unhurried. You are doing a wonderful job!
                </p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl cursor-pointer"
                >
                  Close Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
