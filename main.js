// ===== INDEX: vídeo y controles (robusto) =====
(function () {
  function init() {
    const video = document.getElementById('hero-video');
    if (!video) return; // si no existe, no hacemos nada

    // Asegura flags correctos para autoplay
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true; // iOS
    video.setAttribute('playsinline', '');

    const btnPlay = document.getElementById('ctl-play');
    const btnMute = document.getElementById('ctl-mute');

    function syncUI() {
      if (btnPlay) {
        const isPaused = video.paused;
        btnPlay.classList.toggle('is-off', isPaused);
        btnPlay.setAttribute('aria-pressed', String(!isPaused));
      }
      if (btnMute) {
        const isMuted = video.muted;
        btnMute.classList.toggle('is-off', isMuted);
        btnMute.setAttribute('aria-pressed', String(!isMuted));
      }
    }

    btnPlay?.addEventListener('click', () => {
      if (video.paused) video.play().catch(()=>{}); else video.pause();
      syncUI();
    });

    btnMute?.addEventListener('click', () => {
      video.muted = !video.muted;
      syncUI();
    });

    // Sincroniza UI con eventos del <video>
    ['play','pause','volumechange','loadeddata','canplay'].forEach(ev =>
      video.addEventListener(ev, syncUI)
    );

    // Intentos de autoplay (silenciado)
    const tryPlay = () => video.play().catch(()=>{});
    tryPlay();
    video.addEventListener('loadedmetadata', tryPlay, { once: true });
    video.addEventListener('canplay', tryPlay, { once: true });

    // Primera interacción: habilita audio si quieres
    function enableSoundOnce() {
      try { video.muted = false; if (video.paused) video.play(); } catch(e) {}
      syncUI();
      window.removeEventListener('pointerdown', enableSoundOnce);
      window.removeEventListener('keydown', enableSoundOnce);
    }
    window.addEventListener('pointerdown', enableSoundOnce, { once: true });
    window.addEventListener('keydown',     enableSoundOnce, { once: true });

    // Estado inicial de los botones
    syncUI();

    // === NUEVO: Toggle play/pause al clicar el hero ===
    const hero = document.querySelector('.hero-header');
    hero?.addEventListener('click', (e) => {
      // Ignora clicks en controles/nav
      const ignore = e.target.closest(
        '.text-controls, .nav-container, .nav, .hamburger, .close-nav, a, button, input, label'
      );
      if (ignore) return;
      if (video.paused) video.play().catch(()=>{}); else video.pause();
      syncUI();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();


// ===== Cierre menú móvil (seguro si no existen nodos) =====
const toggle   = document.getElementById('menu-toggle');
const closeBtn = document.querySelector('.close-nav');
const backdrop = document.querySelector('.nav-backdrop');
const navLinks = document.querySelectorAll('#site-nav a');

const closeMenu = () => { if (toggle) toggle.checked = false; };
if (closeBtn)  closeBtn.addEventListener('click', closeMenu);
if (backdrop)  backdrop.addEventListener('click', closeMenu);
navLinks.forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });


// ===== WORK PAGE: grid -> modal =====
document.addEventListener('DOMContentLoaded', () => {
  const modal   = document.querySelector('.modal');
  if (!modal) return; // solo corre en work.html

  const cards   = document.querySelectorAll('.card');
  const mClose  = document.querySelector('.m-close');
  const mVideo  = document.getElementById('m-video');
  const mTitle  = document.getElementById('m-title');
  const mDesc   = document.getElementById('m-desc');
  const mProc   = document.querySelector('.process');

  function openModal(card) {
    const title   = card.dataset.title || '';
    const desc    = card.dataset.desc  || '';
    const video   = card.dataset.video || '';
    const process = (card.dataset.process || '').split('|').filter(Boolean);

    mTitle.textContent = title;
    mDesc.textContent  = desc;
    mVideo.src = video;
    mVideo.currentTime = 0;
    mVideo.play().catch(()=>{});

    mProc.innerHTML = '';
    process.forEach(src => {
      const img = new Image();
      img.src = src;
      img.alt = `${title} – process`;
      mProc.appendChild(img);
    });
    if (process.length === 1) mProc.classList.add('single');
    else mProc.classList.remove('single');
    
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.hidden = true;
    mVideo.pause();
    mVideo.src = '';
    document.body.style.overflow = '';
  }

  cards.forEach(c => c.addEventListener('click', () => openModal(c)));
  if (mClose) mClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});
