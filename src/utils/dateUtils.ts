import japaneseHolidays from 'japanese-holidays';

export function getHolidayName(date: Date): string | null {
  const name = japaneseHolidays.isHoliday(date);
  return name || null;
}

export function isHolidayDate(date: Date): boolean {
  return getHolidayName(date) !== null;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function calcWorkMinutes(startTime: string, endTime: string, breakMinutes: number): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const total = (eh * 60 + em) - (sh * 60 + sm) - breakMinutes;
  return Math.max(0, total);
}

export function calcOvertimeMinutes(endTime: string): number {
  const [eh, em] = endTime.split(':').map(Number);
  const overtime = (eh * 60 + em) - (17 * 60 + 30);
  return Math.max(0, overtime);
}

export function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}
