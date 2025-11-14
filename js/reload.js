// Simple loader removal script for #site-loader
(function () {
  'use strict';

  function hideLoader() {
    const el = document.getElementById('site-loader');
    if (!el) return;
    try {
      el.classList.add('hidden');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 400);
    } catch (e) { /* noop */ }
  }

  // Hide when page loads
  window.addEventListener('load', hideLoader);

  // Fallback: remove after 8s in case load never fires
  setTimeout(hideLoader, 8000);
})();
