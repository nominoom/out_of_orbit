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
    toast.innerHTML = `<span>🛰️</span> <div>${msg}</div>`;
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

  // 5. 3D Tilt Effect on Hero Logo
  const heroLogo = document.querySelector('.hero-logo-img');
  if (heroLogo) {
    heroLogo.addEventListener('mousemove', (e) => {
      const rect = heroLogo.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = -(y / (rect.height / 2)) * 12;
      const rotY = (x / (rect.width / 2)) * 12;
      heroLogo.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    });

    heroLogo.addEventListener('mouseleave', () => {
      heroLogo.style.transform = `perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
  }
});
