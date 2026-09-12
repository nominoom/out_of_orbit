/**
 * Out of Orbit - Procedural Cosmic Soundboard & FX Synthesizer
 * Built entirely with Web Audio API for zero-latency instant cosmic sound FX
 */

class CosmicSoundboard {
  constructor() {
    this.audioCtx = null;
    this.initPads();
    this.initKeyboardHotkeys();
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playSound(soundType, padElement = null) {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    if (padElement) {
      padElement.classList.add('playing');
      setTimeout(() => padElement.classList.remove('playing'), 400);
    }

    switch (soundType) {
      case 'laser':
        this.playLaser(ctx, now);
        break;
      case 'airhorn':
        this.playAirhorn(ctx, now);
        break;
      case 'alien':
        this.playAlien(ctx, now);
        break;
      case 'warp':
        this.playWarp(ctx, now);
        break;
      case 'bell':
        this.playBell(ctx, now);
        break;
      case 'glitch':
        this.playGlitch(ctx, now);
        break;
      case 'stinger':
        this.playStinger(ctx, now);
        break;
      case 'micdrop':
        this.playMicDrop(ctx, now);
        break;
      default:
        this.playLaser(ctx, now);
    }
  }

  // 1. Sci-Fi Laser Zap
  playLaser(ctx, now) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // 2. Radio Airhorn (Classic Detuned Multi-Saw)
  playAirhorn(ctx, now) {
    const freqs = [370, 466, 554, 740]; // Detuned brass chord
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.22, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    masterGain.connect(ctx.destination);

    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.62);
    });
  }

  // 3. Alien FM Bleep / Transmission
  playAlien(ctx, now) {
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(440, now);
    carrier.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    carrier.frequency.exponentialRampToValueAtTime(220, now + 0.5);

    modulator.type = 'square';
    modulator.frequency.setValueAtTime(28, now);
    modulator.frequency.linearRampToValueAtTime(80, now + 0.5);

    modGain.gain.setValueAtTime(300, now);
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    mainGain.gain.setValueAtTime(0.2, now);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    carrier.connect(mainGain);
    mainGain.connect(ctx.destination);

    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + 0.55);
    carrier.stop(now + 0.55);
  }

  // 4. Space Warp / Hyperdrive Charge
  playWarp(ctx, now) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.8);
    filter.Q.value = 8;

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  // 5. Cosmic Crystal Chime / Broadcast Bell
  playBell(ctx, now) {
    [1046.5, 1318.5, 1567.98, 2093.0].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);

      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + 0.95);
    });
  }

  // 6. Cyber Glitch / Noise Static
  playGlitch(ctx, now) {
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2500, now);
    filter.frequency.linearRampToValueAtTime(400, now + 0.3);
    filter.Q.value = 5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  // 7. Talk Show Stinger (Dramatic 80s Synth Hit)
  playStinger(ctx, now) {
    const chords = [220, 277.18, 329.63, 440]; // A major
    chords.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.72);
    });
  }

  // 8. Bass Drop / Sub Impact
  playMicDrop(ctx, now) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.66);
  }

  initPads() {
    const pads = document.querySelectorAll('.sound-pad');
    pads.forEach(pad => {
      const soundType = pad.getAttribute('data-sound');
      pad.addEventListener('click', () => {
        this.playSound(soundType, pad);
      });
    });
  }

  initKeyboardHotkeys() {
    const keyMap = {
      '1': 'laser',
      '2': 'airhorn',
      '3': 'alien',
      '4': 'warp',
      '5': 'bell',
      '6': 'glitch',
      '7': 'stinger',
      '8': 'micdrop'
    };

    window.addEventListener('keydown', (e) => {
      // Don't trigger if typing in form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if (keyMap[e.key]) {
        const pad = document.querySelector(`.sound-pad[data-sound="${keyMap[e.key]}"]`);
        this.playSound(keyMap[e.key], pad);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cosmicSoundboard = new CosmicSoundboard();
});
