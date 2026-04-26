export type WorkType = '出社' | '直行' | '直帰' | '出張' | '在宅';

export type DailyRecord = {
  date: string;          // "2026-04-26"
  isWorked: boolean;
  workType: WorkType | null;
  startTime: string;     // "08:30"
  endTime: string;       // "17:30"
  breakMinutes: number;  // 固定: 60
  memo: string;
  isHoliday: boolean;    // 有給フラグ
};

export type Settings = {
  holidayDays: number;   // 年間有給付与日数（デフォルト20）
  reminderTime: string;  // 通知時刻 "17:00"
  startYear: number;     // 有給カウント開始年
};

export type KintaiRecords = Record<string, DailyRecord>;
