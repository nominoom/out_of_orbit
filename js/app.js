/**
 * Out of Orbit - Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast Notification System
  const toastContainer = document.getElementById('toast-container');
  window.showToast = function(msg) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span> <div>${msg}</div>`;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // 2. Header Scroll Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. Mobile Nav Toggle
  const mobileBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileBtn.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileBtn.textContent = '☰';
      });
    });
  }

  // 4. Twitch View Tab Switcher (Player vs Chat)
  const twitchTabs = document.querySelectorAll('.view-tab-btn');
  const twitchIframe = document.getElementById('twitch-player-frame');
  if (twitchTabs.length && twitchIframe) {
    twitchTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        twitchTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const mode = tab.getAttribute('data-mode');
        const hostname = window.location.hostname || 'localhost';

        if (mode === 'stream') {
          twitchIframe.src = `https://player.twitch.tv/?channel=wmtu_live&parent=${hostname}&muted=false`;
        } else if (mode === 'chat') {
          twitchIframe.src = `https://www.twitch.tv/embed/wmtu_live/chat?parent=${hostname}&darkpopout`;
        }
      });
    });
  }

  // 5. Episode Filter & Search
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('episode-search');

  function filterEpisodes() {
    const activeBtn = document.querySelector('.filter-btn.active');
    const category = activeBtn ? activeBtn.getAttribute('data-cat') : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (!window.audioEngine) return;

    const filtered = window.audioEngine.episodes.filter(ep => {
      const matchCat = category === 'all' || ep.tag.toLowerCase() === category.toLowerCase();
      const matchQuery = !query ||
        ep.title.toLowerCase().includes(query) ||
        ep.desc.toLowerCase().includes(query) ||
        ep.number.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    window.audioEngine.renderEpisodes(filtered);
  }

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterEpisodes();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterEpisodes();
    });
  }

  // 6. Ambient Space Synth Drone Audio Generator
  let ambientPlaying = false;
  let ambientOsc1, ambientOsc2, ambientFilter, ambientGain;
  const ambientBtn = document.getElementById('ambient-sound-toggle');

  if (ambientBtn) {
    ambientBtn.addEventListener('click', () => {
      if (!window.cosmicSoundboard) return;
      const ctx = window.cosmicSoundboard.getAudioContext();

      if (!ambientPlaying) {
        // Start dual sine drone with subtle LFO
        ambientGain = ctx.createGain();
        ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
        ambientGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 2);

        ambientFilter = ctx.createBiquadFilter();
        ambientFilter.type = 'lowpass';
        ambientFilter.frequency.setValueAtTime(320, ctx.currentTime);

        ambientOsc1 = ctx.createOscillator();
        ambientOsc1.type = 'sine';
        ambientOsc1.frequency.setValueAtTime(110, ctx.currentTime); // A2

        ambientOsc2 = ctx.createOscillator();
        ambientOsc2.type = 'sawtooth';
        ambientOsc2.frequency.setValueAtTime(110.5, ctx.currentTime); // Slight binaural beat

        ambientOsc1.connect(ambientFilter);
        ambientOsc2.connect(ambientFilter);
        ambientFilter.connect(ambientGain);
        ambientGain.connect(ctx.destination);

        ambientOsc1.start();
        ambientOsc2.start();

        ambientPlaying = true;
        ambientBtn.style.color = 'var(--neon-blue)';
        ambientBtn.style.borderColor = 'var(--neon-blue)';
        ambientBtn.style.boxShadow = '0 0 15px var(--neon-blue-glow)';
        window.showToast('🌌 Cosmic space ambiance active');
      } else {
        // Fade out
        if (ambientGain) {
          ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
          setTimeout(() => {
            if (ambientOsc1) ambientOsc1.stop();
            if (ambientOsc2) ambientOsc2.stop();
          }, 1000);
        }
        ambientPlaying = false;
        ambientBtn.style.color = '';
        ambientBtn.style.borderColor = '';
        ambientBtn.style.boxShadow = '';
        window.showToast('🔇 Cosmic ambiance muted');
      }
    });
  }

  // 7. 3D Tilt Effect on Hero Logo
  const heroLogo = document.querySelector('.hero-logo-img');
  if (heroLogo) {
    heroLogo.addEventListener('mousemove', (e) => {
      const rect = heroLogo.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = -(y / (rect.height / 2)) * 14;
      const rotY = (x / (rect.width / 2)) * 14;
      heroLogo.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.05)`;
    });

    heroLogo.addEventListener('mouseleave', () => {
      heroLogo.style.transform = `perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
  }
});
