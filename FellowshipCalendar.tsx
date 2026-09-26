import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  BookOpen, Flame, Sparkles, Clock, Users, ArrowRight,
  CheckCircle2, Plus, Info, Video
} from 'lucide-react';
import { DiscipleshipLesson } from '../data/lessonsData';
import { CurrentUser } from './SettingsHUDModal';

export interface CalendarEventItem {
  id: string;
  title: string;
  type: 'small_group' | 'lesson' | 'fellowship_idea' | 'special';
  time?: string;
  date: string; // YYYY-MM-DD
  lessonIndex?: number;
  lessonId?: string;
  description?: string;
  isZoom?: boolean;
}

export interface FellowshipCalendarProps {
  lessons: DiscipleshipLesson[];
  ideas?: Array<{
    id: string;
    title: string;
    description: string;
    votes: number;
    scheduledDate?: string;
    scheduledStatus?: boolean;
  }>;
  onSelectLesson: (lessonIndex: number) => void;
  currentUser?: CurrentUser | null;
}

// Check if a given date is "every other Monday" anchored on Sept 14, 2026
function isEveryOtherMonday(date: Date): boolean {
  if (date.getDay() !== 1) return false; // Must be Monday
  // Anchor Monday: Sept 14, 2026 (Month is 0-indexed: 8 is September)
  const anchor = new Date(2026, 8, 14);
  const diffTime = date.getTime() - anchor.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.round(diffDays / 7);
  return Math.abs(diffWeeks) % 2 === 0;
}

// Pad helper
function pad(num: number): string {
  return String(num).padStart(2, '0');
}

export const FellowshipCalendar: React.FC<FellowshipCalendarProps> = ({
  lessons,
  ideas = [],
  onSelectLesson,
  currentUser = null
}) => {
  // Calendar month state: defaults to current month (September 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = September (0-indexed)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-14');

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }, []);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
  };

  // Month metadata
  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentYear, currentMonth]);

  // Aggregate all events mapped by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();

    const addEvent = (dateStr: string, item: CalendarEventItem) => {
      const existing = map.get(dateStr) || [];
      existing.push(item);
      map.set(dateStr, existing);
    };

    // 1. Auto-populate "YoungFire Small Group" every other Monday at 7:00 PM CST
    // Calculate for currentMonth and adjacent months
    for (let day = 1; day <= 31; day++) {
      const d = new Date(currentYear, currentMonth, day);
      if (d.getMonth() === currentMonth) {
        if (isEveryOtherMonday(d)) {
          const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
          addEvent(dateStr, {
            id: `sg_${dateStr}`,
            title: 'YoungFire Small Group',
            type: 'small_group',
            time: '7:00 PM CST',
            date: dateStr,
            description: 'Bi-weekly living room discipleship huddle, scripture exposition & community dinner.',
            isZoom: true
          });
        }
      }
    }

    // 2. Two-Way Lesson Link: Place event badges for any lesson with teachingDate (YYYY-MM-DD)
    lessons.forEach((lesson, index) => {
      if (lesson.teachingDate && /^\d{4}-\d{2}-\d{2}$/.test(lesson.teachingDate)) {
        addEvent(lesson.teachingDate, {
          id: `lesson_${lesson.id || index}`,
          title: lesson.lessonTitle || lesson.title || 'Discipleship Lesson',
          type: 'lesson',
          time: '7:00 PM CST',
          date: lesson.teachingDate,
          lessonIndex: index,
          lessonId: lesson.id,
          description: `${lesson.primaryPassage || lesson.scripturePassage || ''} — ${lesson.summary || lesson.description || ''}`,
          isZoom: false
        });
      }
    });

    // 3. Fellowship Ideas scheduled onto the sanctuary calendar
    ideas.forEach((idea) => {
      if (idea.scheduledDate && /^\d{4}-\d{2}-\d{2}$/.test(idea.scheduledDate)) {
        addEvent(idea.scheduledDate, {
          id: `idea_evt_${idea.id}`,
          title: `Fellowship: ${idea.title}`,
          type: 'fellowship_idea',
          time: '6:30 PM CST',
          date: idea.scheduledDate,
          description: idea.description,
          isZoom: false
        });
      }
    });

    return map;
  }, [currentYear, currentMonth, lessons, ideas]);

  // Calendar days grid computation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      events: CalendarEventItem[];
    }> = [];

    // Leading padding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${pad(prevMonth + 1)}-${pad(dNum)}`;
      cells.push({
        dayNumber: dNum,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate.get(dateStr) || []
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(d)}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        events: eventsByDate.get(dateStr) || []
      });
    }

    // Trailing padding days to fill 35 or 42 grid cells
    const remaining = 35 - (cells.length % 35);
    if (remaining < 35 && remaining > 0) {
      for (let d = 1; d <= remaining; d++) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const dateStr = `${nextYear}-${pad(nextMonth + 1)}-${pad(d)}`;
        cells.push({
          dayNumber: d,
          dateStr,
          isCurrentMonth: false,
          events: eventsByDate.get(dateStr) || []
        });
      }
    }

    return cells;
  }, [currentYear, currentMonth, eventsByDate]);

  // Selected date events
  const selectedDayEvents = eventsByDate.get(selectedDateStr) || [];
  const selectedLesson = selectedDayEvents.find(e => e.type === 'lesson' && e.lessonIndex !== undefined);

  // Handle clicking a calendar date cell
  const handleDateClick = (dateStr: string, events: CalendarEventItem[]) => {
    setSelectedDateStr(dateStr);

    // If that date has a linked lesson, automatically route to it directly
    const lessonEvent = events.find(e => e.type === 'lesson' && e.lessonIndex !== undefined);
    if (lessonEvent && lessonEvent.lessonIndex !== undefined) {
      onSelectLesson(lessonEvent.lessonIndex);
    }
  };

  return (
    <div className="bg-[#0B1329] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-base sm:text-lg font-black font-['Outfit'] uppercase text-white tracking-wide">
              Fellowship Sanctuary Calendar
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/30">
              2-Way Lesson Sync
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Auto-populated bi-weekly Small Groups &bull; Click any lesson date to open study notes
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-white px-3 py-1.5 bg-slate-950/80 rounded-xl border border-white/10 min-w-[140px] text-center">
            {monthName}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGoToToday}
            className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
        <span className="text-slate-400 font-bold uppercase tracking-wider">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          <span>YoungFire Small Group (Every other Mon)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
          <span>Discipleship Lesson (2-Way Sync)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
          <span>Fellowship Gathering</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-bold uppercase text-slate-400 py-1 border-b border-white/5">
          <div>Sun</div>
          <div className="text-orange-400">Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div className="text-amber-400">Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
          {calendarDays.map((cell, idx) => {
            const isSelected = cell.dateStr === selectedDateStr;
            const isToday = cell.dateStr === todayStr;
            const hasLesson = cell.events.some(e => e.type === 'lesson');
            const hasSmallGroup = cell.events.some(e => e.type === 'small_group');
            const hasIdea = cell.events.some(e => e.type === 'fellowship_idea');

            return (
              <div
                key={`${cell.dateStr}_${idx}`}
                onClick={() => handleDateClick(cell.dateStr, cell.events)}
                className={`min-h-[78px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'opacity-35 bg-slate-950/30 border-white/5 text-slate-500'
                    : isSelected
                    ? 'bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/20'
                    : isToday
                    ? 'bg-amber-950/30 border-amber-500/80 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-white/5 hover:border-purple-500/40 hover:bg-slate-900/80'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${
                    isToday 
                      ? 'text-amber-400 underline font-black' 
                      : isSelected 
                      ? 'text-purple-300' 
                      : cell.isCurrentMonth 
                      ? 'text-slate-200' 
                      : 'text-slate-600'
                  }`}>
                    {cell.dayNumber}
                  </span>

                  {isToday && (
                    <span className="text-[8px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      TODAY
                    </span>
                  )}
                </div>

                {/* Event Badges */}
                <div className="space-y-1 my-1 overflow-hidden">
                  {cell.events.map((evt) => {
                    if (evt.type === 'small_group') {
                      return (
                        <div
                          key={evt.id}
                          className="px-1.5 py-0.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[9px] font-mono font-bold truncate flex items-center gap-1"
                          title="YoungFire Small Group huddle (Every other Monday @ 7:00 PM CST)"
                        >
                          <Flame className="w-2.5 h-2.5 flex-shrink-0 text-orange-400" />
                          <span className="truncate">Small Group 7PM</span>
                        </div>
                      );
                    }

                    if (evt.type === 'lesson') {
                      return (
                        <div
                          key={evt.id}
                          className="px-1.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-[9px] font-mono font-bold truncate flex items-center gap-1 hover:brightness-125"
                          title={`Click to open lesson: ${evt.title}`}
                        >
                          <BookOpen className="w-2.5 h-2.5 flex-shrink-0 text-cyan-400" />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    }

                    if (evt.type === 'fellowship_idea') {
                      return (
                        <div
                          key={evt.id}
                          className="px-1.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold truncate flex items-center gap-1"
                          title={`Fellowship: ${evt.title}`}
                        >
                          <Sparkles className="w-2.5 h-2.5 flex-shrink-0 text-emerald-400" />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Event count pip indicator */}
                <div className="flex items-center gap-1 self-end">
                  {hasSmallGroup && <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>}
                  {hasLesson && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  {hasIdea && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Inspector Panel */}
      <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-mono font-bold uppercase text-white">
              Schedule for {new Date(`${selectedDateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Event Scheduled' : 'Events Scheduled'}
          </span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <p className="text-xs text-slate-400 font-serif italic py-1">
            No formal gatherings scheduled on this date. You can add a discipleship lesson or schedule a fellowship idea above!
          </p>
        ) : (
          <div className="space-y-2">
            {selectedDayEvents.map((evt) => (
              <div 
                key={evt.id}
                className="p-3 bg-slate-900/90 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {evt.type === 'small_group' && <Flame className="w-4 h-4 text-orange-400" />}
                    {evt.type === 'lesson' && <BookOpen className="w-4 h-4 text-cyan-400" />}
                    {evt.type === 'fellowship_idea' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                    <h5 className="text-xs font-bold text-white">{evt.title}</h5>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                      {evt.time}
                    </span>
                  </div>
                  {evt.description && (
                    <p className="text-[11px] text-slate-300 font-serif leading-relaxed">
                      {evt.description}
                    </p>
                  )}
                </div>

                {/* Direct Action Routing */}
                {evt.type === 'lesson' && evt.lessonIndex !== undefined && (
                  <button
                    onClick={() => onSelectLesson(evt.lessonIndex!)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-md transition-all"
                  >
                    <span>Open Lesson Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {evt.type === 'small_group' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 font-bold">
                      Every Other Monday
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
