import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  HeartHandshake,
  ShieldAlert,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  Info,
  X,
  Calendar,
} from 'lucide-react';
import { AssistantBottomCalendar, toISODate } from './AssistantBottomCalendar';
import { CalendarScheduleEvent } from '../types';
import { parseCalendarIntent, formatDaySummaryText } from '../utils/calendarIntentParser';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

interface Props {
  stage: 'pregnancy' | 'baby';
  currentWeek: number;
  babyAge?: string;
  isTwin: boolean;
  motherName: string;
  babyName: string;
  babyNameTwin?: string;
  language?: string;
  onClose?: () => void;
  isModal?: boolean;
  calendarEvents?: CalendarScheduleEvent[];
  onAddCalendarEvent?: (event: Omit<CalendarScheduleEvent, 'id' | 'createdAt'>) => void;
  onUpdateCalendarEvent?: (event: CalendarScheduleEvent) => void;
  onDeleteCalendarEvent?: (id: string) => void;
}

export const MamanAssistant: React.FC<Props> = ({
  stage,
  currentWeek,
  babyAge = '3 months',
  isTwin,
  motherName,
  babyName,
  babyNameTwin,
  language = 'en',
  onClose,
  isModal = false,
  calendarEvents: propsCalendarEvents,
  onAddCalendarEvent: propsOnAddCalendarEvent,
  onUpdateCalendarEvent: propsOnUpdateCalendarEvent,
  onDeleteCalendarEvent: propsOnDeleteCalendarEvent,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('maman_assistant_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'welcome-1',
        role: 'model',
        content:
          stage === 'pregnancy'
            ? `Bonjour ${motherName || 'Mama'}! 🌸 I'm **Maman Assistant**, your supportive companion for Week ${currentWeek}${
                isTwin ? ' (Twin Journey)' : ''
              }. Whether you need comforting routines, ideas for hospital prep, or gentle encouragement, I'm here for you.\n\n*Note: I provide supportive parenting guidance; please always consult your healthcare provider for medical questions.*`
            : `Hello ${motherName || 'Mama'}! 💛 I'm **Maman Assistant**, here to support your newborn journey with ${
                isTwin ? `${babyName} and ${babyNameTwin}` : babyName || 'your baby'
              } (${babyAge}). Ask me about calming bedtime routines, feeding tips, or gentle self-care for you.\n\n*Note: I provide supportive parenting guidance; please always consult your pediatrician for medical questions.*`,
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Calendar State & Persistence
  const [internalCalendarEvents, setInternalCalendarEvents] = useState<CalendarScheduleEvent[]>(() => {
    const saved = localStorage.getItem('maman_assistant_calendar_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const today = new Date();
    const dToday = toISODate(today);
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const dTomorrow = toISODate(tmrw);
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    const dIn3Days = toISODate(in3Days);

    return [
      {
        id: 'seed-1',
        title: 'Pediatrician 4-Month Checkup & Measurements',
        date: dToday,
        time: '10:30 AM',
        category: 'appointment',
        notes: 'Prepare questions about tummy time progress and solid food introduction window.',
        completed: false,
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'seed-2',
        title: 'Evening Gratitude & Baby Milestone Reflection',
        date: dToday,
        time: '08:30 PM',
        category: 'journal',
        notes: 'Baby smiled intentionally after bathtime! Mom feeling more energized today.',
        completed: true,
        createdAt: Date.now() - 43200000,
      },
      {
        id: 'seed-3',
        title: 'Baby Recommended Vaccines & Health Booster',
        date: dTomorrow,
        time: '11:00 AM',
        category: 'appointment',
        notes: 'Bring vaccination yellow card and favorite soothing swaddle.',
        completed: false,
        createdAt: Date.now(),
      },
      {
        id: 'seed-4',
        title: 'Weekly Bump Snapshot & Mom Recovery Check',
        date: dIn3Days,
        time: '09:00 AM',
        category: 'journal',
        notes: 'Capture weekly milestone photo and check in on hydration.',
        completed: false,
        createdAt: Date.now(),
      },
    ];
  });

  const calendarEvents = propsCalendarEvents ?? internalCalendarEvents;

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() =>
    toISODate(new Date())
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync chat messages to local storage
  useEffect(() => {
    localStorage.setItem('maman_assistant_chat', JSON.stringify(messages));
  }, [messages]);

  // Sync calendar events to local storage if internal
  useEffect(() => {
    if (!propsCalendarEvents) {
      localStorage.setItem(
        'maman_assistant_calendar_events',
        JSON.stringify(internalCalendarEvents)
      );
    }
  }, [internalCalendarEvents, propsCalendarEvents]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Calendar handlers
  const handleAddCalendarEvent = (
    eventData: Omit<CalendarScheduleEvent, 'id' | 'createdAt'>
  ) => {
    if (propsOnAddCalendarEvent) {
      propsOnAddCalendarEvent(eventData);
    } else {
      const newEvent: CalendarScheduleEvent = {
        ...eventData,
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setInternalCalendarEvents((prev) => [newEvent, ...prev]);
    }
  };

  const handleUpdateCalendarEvent = (updated: CalendarScheduleEvent) => {
    if (propsOnUpdateCalendarEvent) {
      propsOnUpdateCalendarEvent(updated);
    } else {
      setInternalCalendarEvents((prev) =>
        prev.map((ev) => (ev.id === updated.id ? updated : ev))
      );
    }
  };

  const handleDeleteCalendarEvent = (id: string) => {
    if (propsOnDeleteCalendarEvent) {
      propsOnDeleteCalendarEvent(id);
    } else {
      setInternalCalendarEvents((prev) => prev.filter((ev) => ev.id !== id));
    }
  };

  const handleRequestDaySummary = () => {
    const summaryMsg = formatDaySummaryText(
      selectedCalendarDate,
      calendarEvents,
      motherName || 'Mama'
    );
    const assistantMsg: ChatMessage = {
      id: `summary-${Date.now()}`,
      role: 'model',
      content: summaryMsg,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
  };

  // Context-specific suggested prompt chips
  const suggestedPrompts = [
    'What does my day look like?',
    'Schedule pediatrician visit tomorrow at 10 AM',
    'Add journal entry for baby milestone tonight',
    ...(stage === 'pregnancy'
      ? [
          `Relieving lower back pressure in Week ${currentWeek}`,
          'Hospital bag essentials checklist for mama & baby',
          'Gentle ways my partner can bond with baby before birth',
          isTwin
            ? 'Twin pregnancy nutrition & resting strategies'
            : 'Comfortable sleeping positions with a growing bump',
        ]
      : [
          'Gentle soothing techniques for an overtired newborn',
          'Establishing a calming bedtime wind-down routine',
          isTwin
            ? 'Coordinating feedings for twins: tips & schedules'
            : 'Signs baby is going through a growth spurt',
        ]),
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setApiError(null);

    // Natural Language Intent Parsing for Calendar
    const parsedIntent = parseCalendarIntent(textToSend);

    // Case 1: User asks "What does my day look like?"
    if (parsedIntent.type === 'schedule_summary') {
      const targetDate = parsedIntent.targetDate || selectedCalendarDate;
      setSelectedCalendarDate(targetDate);
      const summaryText = formatDaySummaryText(
        targetDate,
        calendarEvents,
        motherName || 'Mama'
      );

      const assistantMsg: ChatMessage = {
        id: `assistant-summary-${Date.now()}`,
        role: 'model',
        content: summaryText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    // Case 2: User mentions adding a task, appointment, or journal entry
    if (parsedIntent.type === 'add_event' && parsedIntent.event) {
      handleAddCalendarEvent(parsedIntent.event);
      setSelectedCalendarDate(parsedIntent.event.date);

      const categoryLabel =
        parsedIntent.event.category === 'appointment' ? '🩺 Appointment' : '📝 Journal Event';

      const confirmationText = `✅ **Added to your calendar!**\n\n• **Item:** ${parsedIntent.event.title}\n• **Category:** ${categoryLabel}\n• **Date:** ${parsedIntent.event.date}\n• **Time:** ${parsedIntent.event.time || 'All Day'}\n\nI have visually updated your interactive schedule block at the bottom of our screen. You can tap the date anytime to view, edit, or adjust this entry! 🌸`;

      const assistantMsg: ChatMessage = {
        id: `assistant-add-${Date.now()}`,
        role: 'model',
        content: confirmationText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    // Case 3: General parenting / pregnancy guidance via Gemini API
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: textToSend,
          history: historyPayload,
          context: {
            stage,
            currentWeek,
            babyAge,
            babyMode: isTwin ? 'twin' : 'single',
            motherName,
            babyName,
            babyNameTwin,
            language,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch assistant response');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'model',
        content: data.reply || data.fallback || "I'm right here with you, mama.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error('Maman Assistant Error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unable to connect to assistant';
      setApiError(errMsg);

      // Provide a helpful, supportive fallback response
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content:
          "I'm here for you, mama! It looks like our AI connection is having a quick pause. Remember to take a deep, slow breath, hydrate, and know that you are doing an incredible job. For any medical symptoms or questions about your baby's health, please always reach out directly to your doctor or pediatrician.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear current conversation history?')) {
      const freshWelcome: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Hi ${motherName || 'Mama'}! How can I support you and ${
          isTwin ? `${babyName} & ${babyNameTwin}` : babyName || 'baby'
        } right now?`,
        timestamp: Date.now(),
      };
      setMessages([freshWelcome]);
      localStorage.removeItem('maman_assistant_chat');
    }
  };

  // Helper to render markdown-like bold and bullet text
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Format bullet points
          if (line.startsWith('* ') || line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-rose-400 font-bold">•</span>
                <span>{formatBold(line.slice(2))}</span>
              </div>
            );
          }

          // Format numbered list
          if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+\.)\s(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-1">
                  <span className="text-rose-500 font-mono font-bold text-xs">{match[1]}</span>
                  <span>{formatBold(match[2])}</span>
                </div>
              );
            }
          }

          // Format subheadings (### or ##)
          if (line.startsWith('### ') || line.startsWith('## ')) {
            const clean = line.replace(/^#+\s*/, '');
            return (
              <div key={idx} className="font-bold text-stone-900 dark:text-stone-100 mt-2 text-xs uppercase tracking-wide">
                {clean}
              </div>
            );
          }

          return <p key={idx}>{formatBold(line)}</p>;
        })}
      </div>
    );
  };

  // Simple **bold** formatting helper
  const formatBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-stone-900 dark:text-stone-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-stone-700 dark:text-stone-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden ${
      isModal ? 'h-[740px] max-h-[92vh]' : 'min-h-[640px]'
    }`}>
      {/* Assistant Header */}
      <div className="p-4 bg-gradient-to-r from-rose-50/80 via-white to-purple-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800/80 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Maman Assistant
              </h3>
              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-semibold rounded-full border border-rose-200 dark:border-rose-900">
                AI Parenting Guide
              </span>
            </div>
            <p className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
              <span>
                {stage === 'pregnancy'
                  ? `Week ${currentWeek} Context · ${isTwin ? 'Twin Journey' : 'Single'}`
                  : `${babyName || 'Baby'} (${babyAge}) · Postpartum`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Safety & Non-Medical Notice Banner */}
      <div className="px-4 py-2 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-900/40 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 shrink-0">
        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="leading-tight">
          Supportive non-medical guidance. For any acute symptoms, bleeding, or emergencies, please contact your doctor or midwife immediately.
        </span>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                  isUser
                    ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 relative group transition-all ${
                  isUser
                    ? 'bg-rose-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border border-stone-200/60 dark:border-stone-700/60 rounded-tl-xs shadow-xs'
                }`}
              >
                {renderFormattedContent(m.content)}

                {/* Message Timestamp & Copy Action */}
                <div
                  className={`flex items-center justify-between gap-3 mt-1.5 pt-1 border-t text-[10px] ${
                    isUser
                      ? 'border-rose-500/50 text-rose-200'
                      : 'border-stone-200/50 dark:border-stone-700/50 text-stone-400'
                  }`}
                >
                  <span>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer flex items-center gap-1"
                      title="Copy text"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl rounded-tl-xs px-4 py-3 border border-stone-200/60 dark:border-stone-700 flex items-center gap-2 text-xs text-stone-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
              <span>Maman Assistant is thinking gently...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Carousel */}
      <div className="px-4 py-2 bg-stone-50/80 dark:bg-stone-850 border-t border-stone-200/60 dark:border-stone-800 shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-stone-500 font-semibold">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Suggested Questions for Week {currentWeek}:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-xs py-1 px-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50/40 dark:hover:bg-rose-950/40 text-stone-700 dark:text-stone-300 whitespace-nowrap cursor-pointer transition-all shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              stage === 'pregnancy'
                ? `Ask about Week ${currentWeek}, symptoms, soothing routines...`
                : `Ask about soothing, routines, feeding, postpartum recovery...`
            }
            disabled={loading}
            className="flex-1 bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-60 transition-all placeholder:text-stone-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
            title="Send Message"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* Interactive Bottom Editable Calendar Component */}
      <div className="shrink-0">
        <AssistantBottomCalendar
          events={calendarEvents}
          onAddEvent={handleAddCalendarEvent}
          onUpdateEvent={handleUpdateCalendarEvent}
          onDeleteEvent={handleDeleteCalendarEvent}
          selectedDate={selectedCalendarDate}
          onSelectDate={setSelectedCalendarDate}
          onRequestDaySummary={handleRequestDaySummary}
        />
      </div>
    </div>
  );
};
