import { useEffect, useState } from 'react';
import type { DailyRecord, WorkType } from '../types';
import { saveRecord } from '../utils/storage';
import { calcOvertimeMinutes, calcWorkMinutes, getHolidayName, minutesToHHMM, parseDate } from '../utils/dateUtils';

const WORK_TYPES: WorkType[] = ['出社', '直行', '直帰', '出張', '在宅'];

type Props = {
  dateStr: string;
  record: DailyRecord | null;
  onClose: () => void;
  onSave: () => void;
};

function emptyRecord(dateStr: string): DailyRecord {
  return {
    date: dateStr,
    isWorked: false,
    workType: null,
    startTime: '08:30',
    endTime: '17:30',
    breakMinutes: 60,
    memo: '',
    isHoliday: false,
  };
}

export default function DayModal({ dateStr, record, onClose, onSave }: Props) {
  const [form, setForm] = useState<DailyRecord>(() => record ?? emptyRecord(dateStr));

  const date = parseDate(dateStr);
  const dow = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  const holidayName = getHolidayName(date);

  const workMins = form.isWorked ? calcWorkMinutes(form.startTime, form.endTime, form.breakMinutes) : 0;
  const overtimeMins = form.isWorked ? calcOvertimeMinutes(form.endTime) : 0;

  useEffect(() => {
    setForm(record ?? emptyRecord(dateStr));
  }, [dateStr, record]);

  function set<K extends keyof DailyRecord>(key: K, value: DailyRecord[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      saveRecord(next);
      return next;
    });
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onSave();
      onClose();
    }
  }

  function handleClose() {
    onSave();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={handleBackdrop}
    >
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-lg font-bold">{dateStr}</span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">({dow})</span>
            {holidayName && (
              <span className="ml-2 text-sm text-red-500">{holidayName}</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-2xl"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-3 space-y-4">
          {/* 出勤チェック */}
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">出勤</label>
            <button
              onClick={() => set('isWorked', !form.isWorked)}
              className={`min-w-[56px] min-h-[44px] flex items-center justify-center rounded-xl text-xl font-bold transition-colors ${
                form.isWorked
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {form.isWorked ? '✓' : '—'}
            </button>
          </div>

          {/* 有給チェック */}
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">有給休暇</label>
            <button
              onClick={() => set('isHoliday', !form.isHoliday)}
              className={`min-w-[56px] min-h-[44px] flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                form.isHoliday
                  ? 'bg-yellow-400 text-yellow-900'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {form.isHoliday ? '有給' : '—'}
            </button>
          </div>

          {form.isWorked && (
            <>
              {/* 勤務区分 */}
              <div>
                <label className="block text-base font-medium mb-2">勤務区分</label>
                <div className="flex flex-wrap gap-2">
                  {WORK_TYPES.map(wt => (
                    <button
                      key={wt}
                      onClick={() => set('workType', wt)}
                      className={`min-h-[44px] px-4 rounded-xl text-base font-medium transition-colors ${
                        form.workType === wt
                          ? 'bg-blue-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {wt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 出退勤時刻 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-base font-medium mb-1">出勤時刻</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => set('startTime', e.target.value)}
                    className="w-full text-base border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-1">退勤時刻</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => set('endTime', e.target.value)}
                    className="w-full text-base border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 min-h-[44px]"
                  />
                </div>
              </div>

              {/* 実働・残業時間 */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">実働時間</span>
                  <div className="text-lg font-bold">{minutesToHHMM(workMins)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">残業時間</span>
                  <div className={`text-lg font-bold ${overtimeMins > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {minutesToHHMM(overtimeMins)}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 備考 */}
          <div>
            <label className="block text-base font-medium mb-1">備考</label>
            <textarea
              value={form.memo}
              onChange={e => set('memo', e.target.value)}
              placeholder="出張先・訪問先など"
              rows={2}
              className="w-full text-base border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 resize-none"
            />
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={handleClose}
            className="w-full min-h-[48px] bg-blue-700 hover:bg-blue-800 text-white text-base font-bold rounded-xl transition-colors mb-2"
          >
            保存して閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
