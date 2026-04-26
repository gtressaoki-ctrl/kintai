import { useEffect, useState } from 'react';
import Calendar from './components/Calendar';
import DayModal from './components/DayModal';
import MonthlySummary from './components/MonthlySummary';
import SettingsModal from './components/SettingsModal';
import type { KintaiRecords, Settings } from './types';
import { loadRecords, loadSettings } from './utils/storage';
import { exportMonthCSV } from './utils/csvExport';
import { requestNotificationPermission, scheduleReminderCheck } from './utils/notification';

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [records, setRecords] = useState<KintaiRecords>(loadRecords);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    requestNotificationPermission().then(granted => {
      if (granted) {
        cleanup = scheduleReminderCheck(settings.reminderTime);
      }
    });
    return () => cleanup?.();
  }, [settings.reminderTime]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  function refreshRecords() {
    setRecords(loadRecords());
  }

  // Paid leave stats for header display
  const usedPaidLeave = Object.values(records).filter(r => r.isHoliday).length;
  const remainingPaidLeave = settings.holidayDays - usedPaidLeave;
  const lowPaidLeaveWarning = remainingPaidLeave <= 5 && settings.holidayDays > 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-lg mx-auto px-2 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow text-lg font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="前月"
          >
            ＜
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold">{year}年{month}月</h1>
            <span className={`text-xs ${lowPaidLeaveWarning ? 'text-orange-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              有給残 {remainingPaidLeave}日{lowPaidLeaveWarning ? ' ⚠️' : ''}
            </span>
          </div>

          <button
            onClick={nextMonth}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow text-lg font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="翌月"
          >
            ＞
          </button>
        </header>

        {/* Monthly summary */}
        <MonthlySummary year={year} month={month} records={records} />

        {/* Calendar */}
        <Calendar
          year={year}
          month={month}
          records={records}
          onDayClick={setSelectedDate}
        />

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => exportMonthCSV(year, month, records)}
            className="flex-1 min-h-[44px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            CSV出力
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex-1 min-h-[44px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            設定
          </button>
        </div>
      </div>

      {/* Day modal */}
      {selectedDate && (
        <DayModal
          dateStr={selectedDate}
          record={records[selectedDate] ?? null}
          onClose={() => setSelectedDate(null)}
          onSave={refreshRecords}
        />
      )}

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={s => setSettings(s)}
        />
      )}
    </div>
  );
}
