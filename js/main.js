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
    var typed = new Typed(".auto-type-highlight", {
        strings: datatype,
        typeSpeed: 150,
        backSpeed: 100,
        backDelay: 700,
        smartBackspace: true,
        loop: true
    });


// Popular searches: link to Offers page with smart params (category when possible)
const hero_searches = document.querySelector('.hero-searches');
const popularSearches = window.popularSearches || [""];

if (hero_searches) {
    let span = document.createElement('span');
    span.textContent = "Recherches populaires: ";
    hero_searches.appendChild(span);
    const categoryMap = {
        'designer':'Design',
        'developer':'Development',
        'design':'Design',
        'development':'Development',
        'marketing':'Marketing',
        'data':'Data'
    };
    popularSearches.forEach((term, idx) => {
        const a = document.createElement('a');
        const key = String(term||'').trim().toLowerCase();
        const cat = categoryMap[key];
        if (cat) {
            const p = new URLSearchParams({ category: cat });
            a.href = `Offers.html?${p.toString()}`;
        } else {
            a.href = `Offers.html?q=${encodeURIComponent(term)}`;
        }
        a.textContent = term;
        hero_searches.appendChild(a);
        if (idx < popularSearches.length - 1) {
            hero_searches.appendChild(document.createTextNode(", "));
        }
    });
} else {
    console.warn('No .hero-searches container found in the DOM.');
}

// Hero search box: redirect to Offers with parameters
(function(){
  const searchBox = document.querySelector('.search-box');
  if(!searchBox) return;
  const typeSel = searchBox.querySelector('#job-type');
  const inputs = searchBox.querySelectorAll('input');
  const btn = searchBox.querySelector('button');
  if(!btn) return;
  const typeMap = { 'stage': 'Stage', 'emploi': 'Emploi' };
    const categoryMap = {
        'designer':'Design',
        'design':'Design',
        'developer':'Development',
        'developpeur':'Development',
        'development':'Development',
        'marketing':'Marketing',
        'data':'Data'
    };
  btn.addEventListener('click', () => {
    const kw = (inputs[0]?.value || '').trim();
    const loc = (inputs[1]?.value || '').trim();
    const t = typeMap[(typeSel?.value || '').toLowerCase()] || '';
    const params = new URLSearchParams();
        if(kw){
            const key = kw.toLowerCase();
            const cat = categoryMap[key];
            if (cat) params.set('category', cat);
            else params.set('q', kw);
        }
        if(loc) params.set('loc', loc);
    if(t) params.set('type', t);
    // carry page size default
    params.set('size','10');
    window.location.href = `Offers.html?${params.toString()}`;
  });
})();

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


