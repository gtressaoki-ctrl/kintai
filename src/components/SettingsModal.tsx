import { useState } from 'react';
import type { Settings } from '../types';
import { saveSettings } from '../utils/storage';

type Props = {
  settings: Settings;
  onClose: () => void;
  onSave: (s: Settings) => void;
};

export default function SettingsModal({ settings, onClose, onSave }: Props) {
  const [form, setForm] = useState<Settings>(settings);

  function handleSave() {
    saveSettings(form);
    onSave(form);
    onClose();
  }

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={handleBackdrop}
    >
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">設定</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div>
            <label className="block text-base font-medium mb-1">年間有給付与日数</label>
            <input
              type="number"
              min={0}
              max={40}
              value={form.holidayDays}
              onChange={e => setForm(f => ({ ...f, holidayDays: Number(e.target.value) }))}
              className="w-full text-base border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-1">退勤リマインダー時刻</label>
            <input
              type="time"
              value={form.reminderTime}
              onChange={e => setForm(f => ({ ...f, reminderTime: e.target.value }))}
              className="w-full text-base border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-1">有給カウント開始年</label>
            <input
              type="number"
              min={2020}
              max={2040}
              value={form.startYear}
              onChange={e => setForm(f => ({ ...f, startYear: Number(e.target.value) }))}
              className="w-full text-base border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 min-h-[44px]"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full min-h-[48px] bg-blue-700 hover:bg-blue-800 text-white text-base font-bold rounded-xl transition-colors mb-2"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
