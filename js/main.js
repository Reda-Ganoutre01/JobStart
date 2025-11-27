// Navigation initializer to attach dropdown/menu behaviors after header is injected
function initNavigation() {
    // Try to initialize immediately. If header/nav elements are not
    // present yet (injected later), observe the document and retry.
    const attach = () => {
        const dropdownMenu = document.querySelector('.dropdown-menu') || document.querySelector('.hamburger');
        const nav = document.querySelector('nav');
        const navLinks = document.querySelectorAll('#nav-links a');

        if (!dropdownMenu || !nav) return false;

        // Avoid double-initialization
        if (nav.__navInitialized) return true;
        nav.__navInitialized = true;

        dropdownMenu.addEventListener('click', function() {
            const isOpen = nav.classList.contains('open');

            nav.classList.toggle('open');
            dropdownMenu.setAttribute('aria-expanded', String(!isOpen));
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('open');
                dropdownMenu.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && nav.classList.contains('open')) {
                nav.classList.remove('open');
                dropdownMenu.setAttribute('aria-expanded', 'false');
            }
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                nav.classList.remove('open');
                dropdownMenu.setAttribute('aria-expanded', 'false');
            }
        });

        return true;
    };

    if (attach()) return;

    const observer = new MutationObserver((mutations, obs) => {
        if (attach()) {
            obs.disconnect();
        }
    });

    // Observe additions to the body (or documentElement if body absent)
    const root = document.body || document.documentElement;
    observer.observe(root, { childList: true, subtree: true });

    // Safety timeout: stop observing after 5s
    setTimeout(() => observer.disconnect(), 5000);
}
initNavigation();



// for the auto-typing effect in the hero section
const datatype = window.typingWords || [];
if (typeof Typed !== 'undefined') {
    try {
        /* global Typed */
        var typed = new Typed('.auto-type-highlight', {
            strings: datatype,
            typeSpeed: 150,
            backSpeed: 100,
            backDelay: 700,
            smartBackspace: true,
            loop: true
        });
    } catch (e) {
        console.warn('Typed initialization failed:', e);
    }
} else {
    // typed.js may be deferred or not available; fail gracefully
    console.warn('Typed.js not available; skipping auto-type effect.');
}

// (stats rendering moved below with animated counter)
// for keywords popular searches (uses global `popularSearches`)
const hero_searches = document.querySelector('.hero-searches');
const popularSearches=window.popularSearches || [""];

if (hero_searches) {
    let span=document.createElement('span');
    span.textContent="Recherches populaires: ";
    hero_searches.appendChild(span);
    for (const el of popularSearches) {
        let a=document.createElement('a');
        a.href=el|| "#";
        a.textContent=el;
        hero_searches.appendChild(a);
        if (el !== popularSearches[popularSearches.length - 1]) {
            hero_searches.appendChild(document.createTextNode(","));
        }
    }
} else {
    console.warn('No .hero-searches container found in the DOM.');
}
// Render stats on hero index page (simple version)
function renderStatsSimple() {
    const statsContainer = document.querySelector('.stats');
    const data = Array.isArray(window.statData) ? window.statData : [];
    if (!statsContainer || !data.length) return;

    // Clear any placeholder content
    statsContainer.innerHTML = '';

    // Simple counter using setInterval (easy for beginners)
    function simpleCount(element, target, duration) {
        if (!element) return;
        const parsed = Number(target) || 0;
        if (parsed <= 0) { element.textContent = String(parsed); return; }

        const fps = 20; // updates per second
        const interval = Math.round(1000 / fps); // ms per update
        const steps = Math.max(1, Math.round(duration / interval));
        const step = Math.max(1, Math.floor(parsed / steps));
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= parsed) {
                element.textContent = parsed.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = current.toLocaleString();
            }
        }, interval);
    }

    data.forEach(item => {
        const wrap = document.createElement('div');
        wrap.className = 'stat-item';

        const num = document.createElement('div');
        num.className = 'stat-number';
        num.textContent = '0';

        // determine suffix: use any explicit suffix in the value (like '%' or '+'),
        // otherwise default to '+' to match design requirement
        const rawValue = String(item.value || item.count || '');
        const suffixMatch = rawValue.match(/[%+]/);
        const suffix = suffixMatch ? suffixMatch[0] : '+';
        // store suffix as data attribute so CSS can render it via ::after
        num.setAttribute('data-suffix', suffix);

        const label = document.createElement('div');
        label.className = 'stat-label';
        label.textContent = item.label || '';

        wrap.appendChild(num);
        wrap.appendChild(label);
        statsContainer.appendChild(wrap);

        // get numeric target from the value (strip non-digits)
        const raw = String(item.value || item.count || '0');
        const target = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
        // animate with a simple counter over 1.6s
        simpleCount(num, target, 1600);
    });
}

// Ensure stats render after DOM content is ready. `defer` usually ensures
// scripts run after parsing, but use DOMContentLoaded to be robust if any
// earlier runtime errors prevented execution.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderStatsSimple);
} else {
    try { renderStatsSimple(); } catch (e) { console.warn('renderStatsSimple error:', e); }
}
// Header background change on scroll
(function() {
    const header = document.querySelector('header');
    if (!header) return;

    const onScroll = () => {
        const scrolled = window.scrollY > 20;
        header.classList.toggle('header-scrolled', scrolled);
    };

    // run once to set initial state
    onScroll();

    // use passive listener for performance
    window.addEventListener('scroll', onScroll, { passive: true });
})();


