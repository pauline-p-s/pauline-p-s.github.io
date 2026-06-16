/* ============================================
   LANGUAGE SWITCHER
   ============================================ */

(function () {
  let currentLang = localStorage.getItem('lang') || 'ru';

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    document.documentElement.lang = lang;

    // Swap all [data-ru] / [data-en] elements
    document.querySelectorAll('[data-ru]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (!val) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    });

    // Toggle active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  // Attach listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  // Init on load
  applyLang(currentLang);
})();
