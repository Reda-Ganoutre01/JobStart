// Loader: show only the loader for 4s, then reveal the page
(function () {
  'use strict';

  function showLoaderImmediate() {
    const loader = document.getElementById('site-loader');
    if (loader) {
      loader.classList.remove('hidden');
      loader.setAttribute('aria-hidden', 'false');
    }
    try { document.body.classList.add('loading'); } catch (e) { /* noop */ }
  }

  function hideLoader() {
    const loader = document.getElementById('site-loader');
    if (!loader) {
      try { document.body.classList.remove('loading'); } catch (e) { /* noop */ }
      return;
    }
    try {
      loader.classList.add('hidden');
      loader.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        try { document.body.classList.remove('loading'); } catch (e) { /* noop */ }
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 400);
    } catch (e) { /* noop */ }
  }

  // show loader immediately and always reveal after 4s
  showLoaderImmediate();
  setTimeout(hideLoader, 2000);

  // expose for manual control if needed
  window.showLoader = showLoaderImmediate;
  window.hideLoader = hideLoader;
})();
