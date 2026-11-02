import { CalendarScheduleEvent, CalendarCategory } from '../types';
import { toISODate } from '../components/AssistantBottomCalendar';

export interface ParsedCalendarIntent {
  type: 'schedule_summary' | 'add_event' | 'none';
  event?: {
    title: string;
    category: CalendarCategory;
    date: string; // YYYY-MM-DD
    time?: string;
    notes?: string;
  };
  targetDate?: string;
}

/**
 * Check if the user is asking for a day summary
 */
export function isDaySummaryQuery(input: string): boolean {
  const lower = input.toLowerCase().trim();
  const summaryPatterns = [
    /what does my day look like/i,
    /what('s| is) my schedule/i,
    /what do i have (today|planned|scheduled)/i,
    /how does my day look/i,
    /show (me )?(my )?(schedule|agenda|day)/i,
    /what's on my (calendar|agenda|schedule)/i,
    /today's (schedule|agenda|events)/i,
    /my day overview/i,
  ];

  return summaryPatterns.some((pattern) => pattern.test(lower));
}

/**
 * Parses user natural language message to extract date, time, category, and title
 */
export function parseCalendarIntent(input: string): ParsedCalendarIntent {
  const cleanInput = input.trim();
  const lower = cleanInput.toLowerCase();

  // 1. Check for day summary query first
  if (isDaySummaryQuery(lower)) {
    return {
      type: 'schedule_summary',
      targetDate: toISODate(new Date()),
    };
  }

  // 2. Check if the user is asking to add/schedule an event or task
  const addKeywords = [
    'add appointment',
    'schedule',
    'book',
    'add journal',
    'journal entry',
    'remind me to',
    'add to calendar',
    'add to my calendar',
    'create appointment',
    'new appointment',
    'log milestone',
    'add event',
    'put on my calendar',
    'set an appointment',
  ];

  const hasAddKeyword = addKeywords.some((kw) => lower.includes(kw));

  // If input doesn't mention adding/scheduling, return none
  if (!hasAddKeyword) {
    return { type: 'none' };
  }

  // 3. Determine Category (journal vs appointment)
  const journalKeywords = [
    'journal',
    'reflection',
    'milestone',
    'mood',
    'feeling',
    'bump photo',
    'diary',
    'memory',
    'kick count',
    'thought',
    'gratitude',
  ];

  const isJournal = journalKeywords.some((kw) => lower.includes(kw));
  const category: CalendarCategory = isJournal ? 'journal' : 'appointment';

  // 4. Extract Date
  let dateStr = toISODate(new Date()); // default to today
  const today = new Date();

  if (/\btomorrow\b/i.test(lower)) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    dateStr = toISODate(tmrw);
  } else if (/\bday after tomorrow\b/i.test(lower)) {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dateStr = toISODate(dayAfter);
  } else if (/\byesterday\b/i.test(lower)) {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    dateStr = toISODate(yest);
  } else {
    // Check for days of week like "next monday", "this friday", "on wednesday"
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < daysOfWeek.length; i++) {
      const dayName = daysOfWeek[i];
      const dayRegex = new RegExp(`\\b(on |this |next )?${dayName}\\b`, 'i');
      if (dayRegex.test(lower)) {
        const targetDay = i;
        const currentDay = today.getDay();
        let diff = targetDay - currentDay;
        if (diff <= 0) diff += 7; // next occurrence
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + diff);
        dateStr = toISODate(targetDate);
        break;
      }
    }

    // Check for explicit date like "Nov 15", "December 2", "11/20"
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
      'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];
    const monthPattern = new RegExp(
      `\\b(${monthNames.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`,
      'i'
    );
    const monthMatch = lower.match(monthPattern);
    if (monthMatch) {
      const monthStr = monthMatch[1];
      const dayNum = parseInt(monthMatch[2], 10);
      const yearNum = monthMatch[3] ? parseInt(monthMatch[3], 10) : today.getFullYear();

      // Find month index
      const mIdx = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
      ].findIndex((m) => monthStr.startsWith(m));

      if (mIdx !== -1 && dayNum >= 1 && dayNum <= 31) {
        const parsedD = new Date(yearNum, mIdx, dayNum);
        dateStr = toISODate(parsedD);
      }
    }
  }

  // 5. Extract Time
  let timeStr: string | undefined;
  const timePattern = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
  const timeMatch = lower.match(timePattern);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const mins = timeMatch[2] ? timeMatch[2] : '00';
    const ampm = timeMatch[3].toUpperCase();
    timeStr = `${hours}:${mins} ${ampm}`;
  } else {
    // 24h pattern like "at 14:30"
    const militaryPattern = /\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/i;
    const milMatch = lower.match(militaryPattern);
    if (milMatch) {
      timeStr = `${milMatch[1]}:${milMatch[2]}`;
    }
  }

  // 6. Extract and Clean Title
  let title = cleanInput;

  // Remove common leading commands
  title = title.replace(
    /^(please\s+)?(add|schedule|book|create|remind me to|log|set up)(\s+(an?|my))?(\s+(appointment|journal entry|visit|task|event))?(\s+for|\s+to|\s+about)?/i,
    ''
  );

  // Remove time phrases like "at 10:00 AM", "at 10am"
  title = title.replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(am|pm)?\b/gi, '');

  // Remove date phrases like "tomorrow", "today", "on Monday", "on Nov 15th"
  title = title.replace(/\b(on|for)?\s+(today|tomorrow|yesterday|day after tomorrow)\b/gi, '');
  title = title.replace(/\b(on|this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '');
  title = title.replace(/\bon\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(st|nd|rd|th)?(,?\s+\d{4})?\b/gi, '');

  // Clean extra whitespace and punctuation
  title = title.trim().replace(/^[\s,:-]+|[\s,:-]+$/g, '');

  // If title was stripped completely, build an intelligent default
  if (!title || title.length < 3) {
    title = category === 'appointment' ? 'Pediatrician / Doctor Visit' : 'Daily Reflection & Milestone';
  } else {
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    type: 'add_event',
    event: {
      title,
      category,
      date: dateStr,
      time: timeStr,
      notes: `Created via Maman Assistant prompt: "${cleanInput}"`,
    },
    targetDate: dateStr,
  };
}

/**
 * Generate a friendly day summary text for the assistant chat
 */
export function formatDaySummaryText(
  dateStr: string,
  events: CalendarScheduleEvent[],
  userName: string = 'Mama'
): string {
  const parts = dateStr.split('-');
  const d = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) : new Date();
  const dateFormatted = d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));

  if (dayEvents.length === 0) {
    return `🌸 **Your Day Overview (${dateFormatted})**\n\nHi ${userName}! Your schedule for this day is currently completely open and peaceful! No appointments or journal reflections are set.\n\n*Suggestion:* Take this time to rest, hydrate, and perhaps jot down a gentle reflection or log a baby milestone using the "+ Add" button in your calendar below. 💛`;
  }

  const appts = dayEvents.filter((e) => e.category === 'appointment');
  const journals = dayEvents.filter((e) => e.category === 'journal');

  let text = `🌸 **Here's what your day looks like (${dateFormatted})!**\n\nYou have **${dayEvents.length} scheduled item${dayEvents.length > 1 ? 's' : ''}** (${appts.length} appointment${appts.length === 1 ? '' : 's'} and ${journals.length} journal reflection${journals.length === 1 ? '' : 's'}):\n\n`;

  dayEvents.forEach((ev, idx) => {
    const icon = ev.category === 'appointment' ? '🩺' : '📝';
    const timeInfo = ev.time ? ` at **${ev.time}**` : ' (All Day)';
    const status = ev.completed ? ' *(Completed ✓)*' : '';
    text += `${idx + 1}. ${icon} **${ev.title}**${timeInfo}${status}\n`;
    if (ev.notes) {
      text += `   *Note: ${ev.notes}*\n`;
    }
  });

  text += `\n✨ *Maman Tip:* Remember to take things one step at a time, pack baby essentials or snacks early, and celebrate your wonderful progress!`;

  return text;
}
