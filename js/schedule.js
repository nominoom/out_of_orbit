/**
 * Out of Orbit - Schedule Countdown Manager
 * Broadcast Time: Fridays 10:00 PM – 12:00 AM EST (22:00 - 24:00)
 */

class ScheduleManager {
  constructor() {
    this.initCountdown();
  }

  initCountdown() {
    this.daysEl = document.getElementById('count-days');
    this.hoursEl = document.getElementById('count-hours');
    this.minsEl = document.getElementById('count-mins');
    this.secsEl = document.getElementById('count-secs');

    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  getNextShowDate() {
    // Shows air every Friday at 10:00 PM (22:00) Eastern Time (EST/EDT)
    const now = new Date();
    const result = new Date();
    
    // Day of week: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const targetDay = 5; // Friday
    const targetHour = 22; // 10:00 PM EST
    
    let daysUntil = (targetDay - now.getDay() + 7) % 7;
    // If today is Friday and the show has already concluded (past 12:00 AM / 2 hours after 10 PM)
    if (daysUntil === 0 && (now.getHours() > targetHour || (now.getHours() === targetHour && now.getMinutes() >= 0))) {
      // Check if it's currently on air (between 10 PM and 12 AM)
      if (now.getHours() >= targetHour && now.getHours() < targetHour + 2) {
        return now; // currently on air
      }
      daysUntil = 7; // next Friday
    }

    result.setDate(now.getDate() + daysUntil);
    result.setHours(targetHour, 0, 0, 0);

    return result;
  }

  updateCountdown() {
    const nextShow = this.getNextShowDate();
    const now = new Date();
    const diff = nextShow - now;

    if (diff <= 0 && diff > -7200000) { // On air during Friday 10 PM - 12 AM
      if (this.daysEl) this.daysEl.textContent = '00';
      if (this.hoursEl) this.hoursEl.textContent = '00';
      if (this.minsEl) this.minsEl.textContent = '00';
      if (this.secsEl) this.secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (this.daysEl) this.daysEl.textContent = String(Math.max(0, days)).padStart(2, '0');
    if (this.hoursEl) this.hoursEl.textContent = String(Math.max(0, hours)).padStart(2, '0');
    if (this.minsEl) this.minsEl.textContent = String(Math.max(0, mins)).padStart(2, '0');
    if (this.secsEl) this.secsEl.textContent = String(Math.max(0, secs)).padStart(2, '0');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ScheduleManager();
});
