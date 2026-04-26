import type { DailyRecord, KintaiRecords, Settings } from '../types';

const RECORDS_KEY = 'kintai_records';
const SETTINGS_KEY = 'kintai_settings';

export const DEFAULT_SETTINGS: Settings = {
  holidayDays: 20,
  reminderTime: '17:00',
  startYear: new Date().getFullYear(),
};

export function loadRecords(): KintaiRecords {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? (JSON.parse(raw) as KintaiRecords) : {};
  } catch {
    return {};
  }
}

export function saveRecord(record: DailyRecord): void {
  const records = loadRecords();
  records[record.date] = record;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
