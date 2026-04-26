import { useEffect, useState } from 'react';
import Calendar from './components/Calendar';
import DayModal from './components/DayModal';
import MonthlySummary from './components/MonthlySummary';
import SettingsModal from './components/SettingsModal';
import type { KintaiRecords, Settings } from './types';
import { loadRecords, loadSettings, saveRecord } from './utils/storage';
import { exportMonthCSV } from './utils/csvExport';
import { formatDate } from './utils/dateUtils';
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

  // 今日の出勤/退勤ボタン
  const todayStr = formatDate(new Date());
  const todayRecord = records[todayStr];
  const isClockedIn = todayRecord?.isWorked === true;
  const isClockedOut = todayRecord?.clockedOut === true;

  function clockIn() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const rec = records[todayStr];
    saveRecord({
      date: todayStr,
      isWorked: true,
      workType: rec?.workType ?? '出社',
      startTime: `${hh}:${mm}`,
      endTime: rec?.endTime ?? '17:30',
      breakMinutes: 60,
      memo: rec?.memo ?? '',
      isHoliday: rec?.isHoliday ?? false,
      clockedOut: rec?.clockedOut ?? false,
    });
    refreshRecords();
  }

  function clockOut() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const rec = records[todayStr];
    saveRecord({
      date: todayStr,
      isWorked: rec?.isWorked ?? true,
      workType: rec?.workType ?? '出社',
      startTime: rec?.startTime ?? '08:30',
      endTime: `${hh}:${mm}`,
      breakMinutes: 60,
      memo: rec?.memo ?? '',
      isHoliday: rec?.isHoliday ?? false,
      clockedOut: true,
    });
    refreshRecords();
  }

  // Paid leave stats for header display
  const usedPaidLeave = Object.values(records).filter(r => r.isHoliday).length;
  const remainingPaidLeave = settings.holidayDays - usedPaidLeave;
  const lowPaidLeaveWarning = remainingPaidLeave <= 5 && settings.holidayDays > 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-28">
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

      {/* Fixed bottom: 出勤/退勤ボタン */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 safe-area-pb">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={clockIn}
            disabled={isClockedIn}
            className={`flex-1 min-h-[52px] rounded-2xl text-base font-bold transition-colors ${
              isClockedIn
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white active:bg-green-800'
            }`}
          >
            {isClockedIn ? `出勤済み ${todayRecord?.startTime}` : '出勤'}
          </button>
          <button
            onClick={clockOut}
            disabled={isClockedOut}
            className={`flex-1 min-h-[52px] rounded-2xl text-base font-bold transition-colors ${
              isClockedOut
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 text-white active:bg-blue-900'
            }`}
          >
            {isClockedOut ? `退勤済み ${todayRecord?.endTime}` : '退勤'}
          </button>
        </div>
      </div>
    </div>
  );
}
