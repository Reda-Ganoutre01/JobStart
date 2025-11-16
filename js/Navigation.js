// Navigation initializer to attach dropdown/menu behaviors after header is injected
export function initNavigation() {
    const dropdownMenu = document.querySelector('.dropdown-menu') || document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('#nav-links a');

    if (!dropdownMenu || !nav) return;

    dropdownMenu.addEventListener('click', function() {
        const isOpen = nav.classList.contains('open');

        nav.classList.toggle('open');
        dropdownMenu.setAttribute('aria-expanded', !isOpen);
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
}