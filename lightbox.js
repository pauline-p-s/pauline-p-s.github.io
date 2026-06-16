/* ============================================
   LIGHTBOX — works with .g-item elements
   ============================================ */
(function () {
  // Build overlay
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close">ESC / закрыть</button>
    <button class="lightbox-nav lightbox-prev">
      <svg viewBox="0 0 16 16"><line x1="13" y1="8" x2="3" y2="8"/><polyline points="7,4 3,8 7,12"/></svg>
    </button>
    <img class="lightbox-img" src="" alt="">
    <button class="lightbox-nav lightbox-next">
      <svg viewBox="0 0 16 16"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/></svg>
    </button>
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(overlay);

  const lbImg    = overlay.querySelector('.lightbox-img');
  const counter  = overlay.querySelector('.lightbox-counter');
  const btnClose = overlay.querySelector('.lightbox-close');
  const btnPrev  = overlay.querySelector('.lightbox-prev');
  const btnNext  = overlay.querySelector('.lightbox-next');

  let srcs = [];
  let cur  = 0;

  function open(index) {
    cur = ((index % srcs.length) + srcs.length) % srcs.length;
    lbImg.src = srcs[cur];
    counter.textContent = (cur + 1) + ' / ' + srcs.length;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => open(cur - 1));
  btnNext.addEventListener('click', () => open(cur + 1));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   open(cur - 1);
    if (e.key === 'ArrowRight')  open(cur + 1);
  });

  function init() {
    srcs = [];
    document.querySelectorAll('.g-item img').forEach(img => srcs.push(img.src));

    document.querySelectorAll('.g-item').forEach((item, i) => {
      // remove old listener if re-init
      item.onclick = () => open(i);
    });
  }

  // Init — wait a tick so gallery.js can run first
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
  } else {
    setTimeout(init, 100);
  }

  window._lb = { open, close };
})();
