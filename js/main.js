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


