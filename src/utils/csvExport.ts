import type { KintaiRecords } from '../types';
import { calcOvertimeMinutes, calcWorkMinutes, getHolidayName, minutesToHHMM } from './dateUtils';

const DOW_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

export function exportMonthCSV(year: number, month: number, records: KintaiRecords): void {
  const daysInMonth = new Date(year, month, 0).getDate();
  const rows: string[][] = [];

  rows.push(['日付', '曜日', '祝日名', '勤務区分', '出勤時刻', '退勤時刻', '実働時間', '残業時間', '有給', '備考']);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const date = new Date(year, month - 1, d);
    const dow = DOW_NAMES[date.getDay()];
    const holidayName = getHolidayName(date) ?? '';
    const rec = records[dateStr];

    if (!rec) {
      rows.push([dateStr, dow, holidayName, '', '', '', '', '', '', '']);
      continue;
    }

    const workMins = rec.isWorked ? calcWorkMinutes(rec.startTime, rec.endTime, rec.breakMinutes) : 0;
    const overtimeMins = rec.isWorked ? calcOvertimeMinutes(rec.endTime) : 0;

    rows.push([
      dateStr,
      dow,
      holidayName,
      rec.workType ?? '',
      rec.isWorked ? rec.startTime : '',
      rec.isWorked ? rec.endTime : '',
      rec.isWorked ? minutesToHHMM(workMins) : '',
      rec.isWorked && overtimeMins > 0 ? minutesToHHMM(overtimeMins) : '',
      rec.isHoliday ? '有給' : '',
      rec.memo,
    ]);
  }

  const csv = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n');
  // UTF-8 BOM for Excel compatibility
  const bom = '﻿';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `勤怠_${year}年${month}月.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
