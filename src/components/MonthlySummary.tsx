import type { KintaiRecords } from '../types';
import { calcOvertimeMinutes, calcWorkMinutes, getHolidayName } from '../utils/dateUtils';

type Props = {
  year: number;
  month: number;
  records: KintaiRecords;
};

function minutesToHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

export default function MonthlySummary({ year, month, records }: Props) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workedDays = 0;
  let totalWorkMins = 0;
  let totalOvertimeMins = 0;
  let paidLeaveDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const rec = records[dateStr];
    if (!rec) continue;
    if (rec.isHoliday) paidLeaveDays++;
    if (rec.isWorked) {
      workedDays++;
      totalWorkMins += calcWorkMinutes(rec.startTime, rec.endTime, rec.breakMinutes);
      totalOvertimeMins += calcOvertimeMinutes(rec.endTime);
    }
  }

  // Count holidays in month (for reference)
  let holidayCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    if (getHolidayName(date) || date.getDay() === 0 || date.getDay() === 6) holidayCount++;
  }
  const overOvertimeWarning = totalOvertimeMins >= 45 * 60;

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow px-4 py-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">出勤日数</div>
          <div className="text-lg font-bold">{workedDays}<span className="text-xs ml-0.5">日</span></div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">実働時間</div>
          <div className="text-lg font-bold">{minutesToHM(totalWorkMins)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">残業時間</div>
          <div className={`text-lg font-bold ${overOvertimeWarning ? 'text-orange-500' : totalOvertimeMins > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
            {minutesToHM(totalOvertimeMins)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">有給取得</div>
          <div className="text-lg font-bold">{paidLeaveDays}<span className="text-xs ml-0.5">日</span></div>
        </div>
      </div>
      {overOvertimeWarning && (
        <div className="mt-2 text-xs text-orange-500 font-medium text-center">
          ⚠️ 残業時間が45時間を超えています
        </div>
      )}
    </div>
  );
}
