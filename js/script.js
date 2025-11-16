console.log("Script loaded successfully.");

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.dropdown-menu');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('#nav-links a');

    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', function() {
        const isOpen = nav.classList.contains('open');

        nav.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', !isOpen);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && nav.classList.contains('open')) {
            nav.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
});