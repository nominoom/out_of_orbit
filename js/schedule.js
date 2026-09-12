/**
 * Out of Orbit - Schedule Countdown & Transmission Beam Submission
 */

class ScheduleManager {
  constructor() {
    this.initCountdown();
    this.initSubmissionForm();
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
    // Shows air every Friday at 8:00 PM (20:00) Eastern Time (EDT)
    const now = new Date();
    const result = new Date();
    
    // Day of week: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const targetDay = 5; // Friday
    const targetHour = 20; // 8 PM
    
    let daysUntil = (targetDay - now.getDay() + 7) % 7;
    if (daysUntil === 0 && now.getHours() >= targetHour + 2) {
      daysUntil = 7; // Show already passed today
    }

    result.setDate(now.getDate() + daysUntil);
    result.setHours(targetHour, 0, 0, 0);

    return result;
  }

  updateCountdown() {
    const nextShow = this.getNextShowDate();
    const now = new Date();
    const diff = nextShow - now;

    if (diff <= 0 && diff > -7200000) { // 2 hours window
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

    if (this.daysEl) this.daysEl.textContent = String(days).padStart(2, '0');
    if (this.hoursEl) this.hoursEl.textContent = String(hours).padStart(2, '0');
    if (this.minsEl) this.minsEl.textContent = String(mins).padStart(2, '0');
    if (this.secsEl) this.secsEl.textContent = String(secs).padStart(2, '0');
  }

  initSubmissionForm() {
    const form = document.getElementById('transmission-form');
    const feed = document.getElementById('live-feed-list');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const callsign = document.getElementById('caller-name').value.trim() || 'Anonymous Cosmonaut';
      const category = document.getElementById('transmission-type').value;
      const message = document.getElementById('transmission-msg').value.trim();

      if (!message) return;

      // Play sound FX if soundboard is available
      if (window.cosmicSoundboard) {
        window.cosmicSoundboard.playSound('warp');
      }

      // Prepend to feed
      if (feed) {
        const item = document.createElement('div');
        item.className = 'feed-item';
        item.innerHTML = `
          <div class="feed-meta">
            <span class="feed-author">📡 ${this.escapeHtml(callsign)} [${this.escapeHtml(category)}]</span>
            <span class="feed-time">Just now</span>
          </div>
          <p class="feed-text">"${this.escapeHtml(message)}"</p>
        `;
        feed.insertBefore(item, feed.firstChild);
      }

      // Reset form
      form.reset();

      if (window.showToast) {
        window.showToast('🚀 Transmission successfully beamed to the Out of Orbit booth!');
      }
    });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ScheduleManager();
});
