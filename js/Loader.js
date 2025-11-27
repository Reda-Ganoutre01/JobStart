// Loader utilities: explicit exports so other modules can control it
'use strict';

export function showLoader() {
  const loader = document.getElementById('site-loader');
  if (loader) {
    loader.classList.remove('hidden');
    loader.setAttribute('aria-hidden', 'false');
  }
  try { document.body.classList.add('loading'); } catch (e) { /* noop */ }
}

export function hideLoader() {
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

