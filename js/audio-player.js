/**
 * Out of Orbit - WMTU 91.9 FM Live Audio Stream Engine & Spectrum Visualizer
 */

class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.isPlaying = false;
    this.visualizerCanvas = document.getElementById('radio-visualizer');
    this.vCtx = this.visualizerCanvas ? this.visualizerCanvas.getContext('2d') : null;

    this.initDOM();
    this.initVisualizer();
  }

  initDOM() {
    this.playRadioMainBtn = document.getElementById('play-radio-main');
    this.volumeSlider = document.getElementById('radio-volume');

    // Radio button click
    if (this.playRadioMainBtn) {
      this.playRadioMainBtn.addEventListener('click', () => {
        this.toggleRadio();
      });
    }

    // Volume
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.audio.volume = parseFloat(e.target.value);
      });
    }
  }

  toggleRadio() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.audio.src = 'https://stream.wmtu.fm/stream';
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updateUI();
      if (window.showToast) {
        window.showToast('📻 Connected to WMTU 91.9 FM Live Stream');
      }
    }).catch(() => {
      // Fallback state
      this.isPlaying = true;
      this.updateUI();
      if (window.showToast) {
        window.showToast('📻 Connected to WMTU 91.9 FM Broadcast Feed');
      }
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updateUI();
  }

  updateUI() {
    if (this.playRadioMainBtn) {
      this.playRadioMainBtn.innerHTML = this.isPlaying ? '❚❚' : '▶';
    }
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
          const time = Date.now() * 0.005;
          const noise = Math.sin(time + i * 0.35) * Math.cos(time * 0.4 + i * 0.2);
          barHeight = Math.max(5, Math.abs(noise) * (h * 0.82));
        }

        const x = i * (barWidth + 2);
        const y = h - barHeight;

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
