console.log("Script loaded successfully.");

// Theme functionality
function initTheme() {
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update checkbox states
    const desktopToggle = document.getElementById('toggle_checkbox');
    const mobileToggle = document.getElementById('mobile_toggle_checkbox');
    
    if (desktopToggle) desktopToggle.checked = savedTheme === 'dark';
    if (mobileToggle) mobileToggle.checked = savedTheme === 'dark';
    
    updateThemeText();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Sync both toggles
    const desktopToggle = document.getElementById('toggle_checkbox');
    const mobileToggle = document.getElementById('mobile_toggle_checkbox');
    
    if (desktopToggle) desktopToggle.checked = newTheme === 'dark';
    if (mobileToggle) mobileToggle.checked = newTheme === 'dark';
    
    updateThemeText();
}

function updateThemeText() {
    const theme = document.documentElement.getAttribute('data-theme');
    const themeTexts = document.querySelectorAll('.theme-text');
    
    themeTexts.forEach(text => {
        text.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Theme toggle event listeners
    const desktopToggle = document.getElementById('toggle_checkbox');
    const mobileToggle = document.getElementById('mobile_toggle_checkbox');
    
    if (desktopToggle) {
        desktopToggle.addEventListener('change', toggleTheme);
    }
    
    if (mobileToggle) {
        mobileToggle.addEventListener('change', toggleTheme);
    }
    const hamburger = document.querySelector('.hamburger');
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