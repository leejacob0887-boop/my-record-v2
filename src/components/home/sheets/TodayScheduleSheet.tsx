'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { getEventsByDate, CalendarEvent } from '@/lib/events';
import { getTodayKST } from '@/lib/dateUtils';

interface Props {
  onClose: () => void;
}

export default function TodayScheduleSheet({ onClose }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventsByDate(getTodayKST())
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <span className="text-base font-bold text-gray-800 dark:text-gray-100">오늘 일정</span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
          aria-label="닫기"
        >
          <X size={14} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <CalendarDays size={32} color="#D1D5DB" />
            <p className="text-sm text-gray-400">오늘 일정이 없어요</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-start gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-700 last:border-none">
              <div className="text-xs text-gray-400 w-12 flex-shrink-0 pt-0.5">
                {event.start_time ?? '종일'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{event.title}</p>
                {event.end_time && (
                  <p className="text-xs text-gray-400 mt-0.5">~ {event.end_time}</p>
                )}
                {event.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{event.description}</p>
                )}
              </div>
              <div className="w-2 h-2 rounded-full bg-[#0F6E56] mt-1.5 flex-shrink-0" />
            </div>
          ))
        )}
      </div>
    </>
  );
}
