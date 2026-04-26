import type { KintaiRecords } from '../types';
import { formatDate, getHolidayName } from '../utils/dateUtils';

const DOW = ['日', '月', '火', '水', '木', '金', '土'];

type Props = {
  year: number;
  month: number; // 1-12
  records: KintaiRecords;
  onDayClick: (dateStr: string) => void;
};

export default function Calendar({ year, month, records, onDayClick }: Props) {
  const today = formatDate(new Date());
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  // Build grid cells: empty padding + days
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad end to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={`text-center text-sm font-semibold py-1 ${
              i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="bg-gray-50 dark:bg-gray-900 min-h-[60px]" />;
          }

          const date = new Date(year, month - 1, day);
          const dateStr = formatDate(date);
          const dow = date.getDay();
          const isSat = dow === 6;
          const isSun = dow === 0;
          const holidayName = getHolidayName(date);
          const isHoliday = holidayName !== null;
          const isToday = dateStr === today;
          const record = records[dateStr];
          const isWorked = record?.isWorked ?? false;
          const isPaidLeave = record?.isHoliday ?? false;

          const dateNumColor =
            isSun || isHoliday
              ? 'text-red-600 dark:text-red-400'
              : isSat
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-900 dark:text-gray-100';

          const cellBg = isWorked
            ? 'bg-green-50 dark:bg-green-950'
            : isPaidLeave
            ? 'bg-yellow-50 dark:bg-yellow-950'
            : 'bg-white dark:bg-gray-800';

          const todayBorder = isToday ? 'ring-2 ring-blue-700 ring-inset z-10' : '';

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={`relative ${cellBg} ${todayBorder} min-h-[60px] p-1 text-left hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <span className={`text-base font-medium leading-none ${dateNumColor}`}>{day}</span>

              {holidayName && (
                <span className="block text-red-500 dark:text-red-400 text-[10px] leading-tight mt-0.5 truncate">
                  {holidayName}
                </span>
              )}

              {isWorked && (
                <span className="block text-green-700 dark:text-green-400 text-[10px] leading-tight mt-0.5">
                  {record?.workType ?? '出勤'}
                </span>
              )}

              {isPaidLeave && !isWorked && (
                <span className="block text-yellow-600 dark:text-yellow-400 text-[10px] leading-tight mt-0.5">
                  有給
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
