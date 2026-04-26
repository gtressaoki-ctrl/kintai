export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleReminderCheck(reminderTime: string): () => void {
  const [rh, rm] = reminderTime.split(':').map(Number);

  function check() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    if (h === rh && m === rm) {
      if (Notification.permission === 'granted') {
        new Notification('勤怠管理', {
          body: '退勤打刻を忘れずに！',
          icon: '/kintai/icon.svg',
        });
      }
    }
  }

  const interval = window.setInterval(check, 60_000);
  return () => window.clearInterval(interval);
}
