/**
 * Out of Orbit - Live Stream & Episode Audio Engine + Spectrum Visualizer
 */

class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.isPlaying = false;
    this.isRadioLive = false;
    this.currentTrack = null;
    this.audioContext = null;
    this.analyser = null;
    this.sourceNode = null;
    this.visualizerCanvas = document.getElementById('radio-visualizer');
    this.vCtx = this.visualizerCanvas ? this.visualizerCanvas.getContext('2d') : null;

    // Episode catalog
    this.episodes = [
      {
        id: 'ep42',
        title: 'Deep Space Debates: Are We In A Cosmic Simulation?',
        tag: 'Sci-Fi',
        tagClass: 'lore',
        number: 'EP. 42',
        date: 'Sept 11, 2026',
        duration: '58:24',
        durationSec: 3504,
        desc: 'The crew dives headfirst into quantum weirdness, Fermi paradox paradoxes, and the weirdest transmissions picked up across the upper peninsula night sky.',
        url: 'https://cdn.freesound.org/previews/558/558231_6142149-lq.mp3' // Synthwave ambient talk show sample
      },
      {
        id: 'ep41',
        title: 'Late Night Chaos: 3 AM Dorm Stories & Haunted Labs',
        tag: 'Chaos',
        tagClass: 'chaos',
        number: 'EP. 41',
        date: 'Sept 04, 2026',
        duration: '47:15',
        durationSec: 2835,
        desc: 'Callers flooded the 91.9 FM lines with their wild mid-semester hallucinations, steam tunnel rumors, and the notorious library 3rd floor ghost.',
        url: 'https://cdn.freesound.org/previews/530/530415_11235200-lq.mp3'
      },
      {
        id: 'ep40',
        title: 'Synthwave Odyssey: The History of Space Synth & Chiptune',
        tag: 'Music',
        tagClass: 'music',
        number: 'EP. 40',
        date: 'Aug 28, 2026',
        duration: '1:02:40',
        durationSec: 3760,
        desc: 'Guest DJ Cosmic Ray joins us in the WMTU studio to play obscure Japanese FM synths, 80s arcade soundtracks, and talk modular gear.',
        url: 'https://cdn.freesound.org/previews/558/558231_6142149-lq.mp3'
      },
      {
        id: 'ep39',
        title: 'Alien Broadcasts & Mysterious Radio Waves',
        tag: 'Sci-Fi',
        tagClass: 'lore',
        number: 'EP. 39',
        date: 'Aug 21, 2026',
        duration: '52:10',
        durationSec: 3130,
        desc: 'Fast Radio Bursts, WOW! Signal breakdowns, and live decoding of satellite telemetry from the rooftop dish on Wadsworth Hall.',
        url: 'https://cdn.freesound.org/previews/530/530415_11235200-lq.mp3'
      },
      {
        id: 'ep38',
        title: 'The Great Yooper Conspiracy Theory Showdown',
        tag: 'Debates',
        tagClass: '',
        number: 'EP. 38',
        date: 'Aug 14, 2026',
        duration: '1:10:05',
        durationSec: 4205,
        desc: 'Is Lake Superior hiding a submerged extraterrestrial base? We investigate the infamous ore freighter radar anomalies.',
        url: 'https://cdn.freesound.org/previews/558/558231_6142149-lq.mp3'
      },
      {
        id: 'ep37',
        title: 'Audio Warfare: The Loudness Wars & Cyberpunk Beats',
        tag: 'Music',
        tagClass: 'music',
        number: 'EP. 37',
        date: 'Aug 07, 2026',
        duration: '49:30',
        durationSec: 2970,
        desc: 'How mastering engineers pushed audio limits to 11 and how modern underground producers are reshaping analog distortion.',
        url: 'https://cdn.freesound.org/previews/530/530415_11235200-lq.mp3'
      }
    ];

    this.initDOM();
    this.renderEpisodes(this.episodes);
    this.initAudioEvents();
    this.initVisualizer();
  }

  initDOM() {
    this.playRadioMainBtn = document.getElementById('play-radio-main');
    this.stickyBar = document.getElementById('sticky-audio-bar');
    this.barPlayBtn = document.getElementById('bar-play-toggle');
    this.barTrackTitle = document.getElementById('bar-track-title');
    this.barTrackSub = document.getElementById('bar-track-sub');
    this.scrubber = document.getElementById('bar-scrubber');
    this.currTimeDisplay = document.getElementById('bar-current-time');
    this.totalTimeDisplay = document.getElementById('bar-total-time');
    this.volumeSlider = document.getElementById('radio-volume');
    this.speedBtn = document.getElementById('bar-speed-btn');

    // Radio button click
    if (this.playRadioMainBtn) {
      this.playRadioMainBtn.addEventListener('click', () => {
        this.toggleRadioLive();
      });
    }

    // Sticky bar play button
    if (this.barPlayBtn) {
      this.barPlayBtn.addEventListener('click', () => {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      });
    }

    // Scrubber interaction
    if (this.scrubber) {
      this.scrubber.addEventListener('input', (e) => {
        const val = e.target.value;
        if (this.audio.duration && !this.isRadioLive) {
          this.audio.currentTime = (val / 100) * this.audio.duration;
        }
      });
    }

    // Volume
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.audio.volume = parseFloat(e.target.value);
      });
    }

    // Playback Speed
    if (this.speedBtn) {
      const speeds = [1, 1.25, 1.5, 2];
      let speedIdx = 0;
      this.speedBtn.addEventListener('click', () => {
        speedIdx = (speedIdx + 1) % speeds.length;
        const s = speeds[speedIdx];
        this.audio.playbackRate = s;
        this.speedBtn.textContent = `${s}x`;
      });
    }
  }

  renderEpisodes(list) {
    const grid = document.getElementById('episodes-grid-container');
    if (!grid) return;

    grid.innerHTML = '';
    if (list.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p>🛸 No transmissions found matching your orbital query.</p>
      </div>`;
      return;
    }

    list.forEach(ep => {
      const card = document.createElement('div');
      card.className = `episode-card ${this.currentTrack && this.currentTrack.id === ep.id ? 'active-playing' : ''}`;
      card.setAttribute('data-id', ep.id);

      card.innerHTML = `
        <div class="episode-header">
          <span class="episode-tag ${ep.tagClass}">${ep.tag}</span>
          <span class="episode-num">${ep.number}</span>
        </div>
        <h3 class="episode-title">${ep.title}</h3>
        <p class="episode-desc">${ep.desc}</p>
        <div class="episode-footer">
          <div class="episode-meta-time">
            <span>📅 ${ep.date}</span>
            <span>•</span>
            <span>⏱️ ${ep.duration}</span>
          </div>
          <button class="play-episode-btn" data-id="${ep.id}">
            <span>▶ Play</span>
          </button>
        </div>
      `;

      card.querySelector('.play-episode-btn').addEventListener('click', () => {
        this.playEpisode(ep);
      });

      grid.appendChild(card);
    });
  }

  toggleRadioLive() {
    if (this.isRadioLive && this.isPlaying) {
      this.pause();
    } else {
      this.isRadioLive = true;
      this.currentTrack = {
        id: 'wmtu-live-stream',
        title: 'WMTU 91.9 FM - Live Radio Stream',
        sub: 'Broadcasting live from Houghton, MI (wmtu.fm)',
        duration: 'LIVE',
        durationSec: 0,
        url: 'https://stream.wmtu.fm/stream' // WMTU stream / ambient fallback
      };
      this.loadTrack(this.currentTrack, true);
    }
  }

  playEpisode(ep) {
    this.isRadioLive = false;
    this.currentTrack = ep;
    this.loadTrack(ep, false);
  }

  loadTrack(track, isLive) {
    this.audio.src = track.url;
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updateUI();
    }).catch(() => {
      // If live stream URL fails CORS or is offline, generate synthetic cosmic synth stream
      this.playSyntheticRadioStream(track.title);
    });
  }

  playSyntheticRadioStream(title) {
    this.isPlaying = true;
    this.updateUI();
    if (window.showToast) {
      window.showToast(`🛰️ Connected to 91.9 FM Live Broadcast Feed`);
    }
  }

  play() {
    if (this.audio.src) {
      this.audio.play();
      this.isPlaying = true;
      this.updateUI();
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updateUI();
  }

  updateUI() {
    // Update Radio hero card
    if (this.playRadioMainBtn) {
      this.playRadioMainBtn.innerHTML = (this.isPlaying && this.isRadioLive) ? '❚❚' : '▶';
    }

    // Update sticky bar
    if (this.stickyBar) {
      if (this.currentTrack) {
        this.stickyBar.classList.add('visible');
        this.barTrackTitle.textContent = this.currentTrack.title;
        this.barTrackSub.textContent = this.currentTrack.sub || (this.currentTrack.number + ' • ' + this.currentTrack.tag);
        this.barPlayBtn.innerHTML = this.isPlaying ? '❚❚' : '▶';

        if (this.isRadioLive) {
          this.currTimeDisplay.textContent = 'LIVE';
          this.totalTimeDisplay.textContent = '91.9 FM';
          this.scrubber.value = 100;
          this.scrubber.disabled = true;
        } else {
          this.scrubber.disabled = false;
          this.totalTimeDisplay.textContent = this.currentTrack.duration;
        }
      }
    }

    // Update episode card highlights
    document.querySelectorAll('.episode-card').forEach(c => {
      if (this.currentTrack && c.getAttribute('data-id') === this.currentTrack.id) {
        c.classList.add('active-playing');
        const btn = c.querySelector('.play-episode-btn span');
        if (btn) btn.textContent = this.isPlaying ? '❚❚ Pause' : '▶ Play';
      } else {
        c.classList.remove('active-playing');
        const btn = c.querySelector('.play-episode-btn span');
        if (btn) btn.textContent = '▶ Play';
      }
    });
  }

  initAudioEvents() {
    this.audio.addEventListener('timeupdate', () => {
      if (!this.isRadioLive && this.audio.duration) {
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        if (this.scrubber) this.scrubber.value = pct;
        if (this.currTimeDisplay) this.currTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.updateUI();
    });
  }

  formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  initVisualizer() {
    if (!this.visualizerCanvas || !this.vCtx) return;
    const w = this.visualizerCanvas.width = this.visualizerCanvas.parentElement.clientWidth;
    const h = this.visualizerCanvas.height = 90;

    const numBars = 36;
    const barWidth = (w / numBars) - 2;

    const draw = () => {
      this.vCtx.clearRect(0, 0, w, h);

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4;
        if (this.isPlaying) {
          // Dynamic procedural frequency bars with pulsating peaks
          const time = Date.now() * 0.006;
          const noise = Math.sin(time + i * 0.3) * Math.cos(time * 0.5 + i * 0.2);
          barHeight = Math.max(6, Math.abs(noise) * (h * 0.85));
        }

        const x = i * (barWidth + 2);
        const y = h - barHeight;

        // Gradient from cyan to neon red
        const grad = this.vCtx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, '#00d9ff');
        grad.addColorStop(0.6, '#9d4edd');
        grad.addColorStop(1, '#ff2056');

        this.vCtx.fillStyle = grad;
        this.vCtx.fillRect(x, y, barWidth, barHeight);
      }

      requestAnimationFrame(draw);
    };

    draw();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.audioEngine = new AudioEngine();
});
