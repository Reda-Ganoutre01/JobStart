
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
document.addEventListener('DOMContentLoaded', function () {
    const hero_searches = document.querySelector('.hero-searches');
    const popularSearches = Array.isArray(window.popularSearches) ? window.popularSearches : [];
    if (!hero_searches) {
        console.warn('No .hero-searches container found in the DOM.');
        return;
    }

    if (popularSearches.length === 0) return;

    let span = document.createElement('span');
    span.textContent = "Recherches populaires: ";
    hero_searches.appendChild(span);

    // Map common search labels to the category names used by the Offers page
    function mapSearchToCategory(term) {
        if (!term) return '';
        const t = String(term).toLowerCase();
        if (t.includes('design') || t.includes('designer') || t.includes('ux') || t.includes('ui') || t.includes('figma')) return 'Design';
        if (t.includes('dev') || t.includes('développeur') || t.includes('developer') || t.includes('javascript') || t.includes('python') || t.includes('java') || t.includes('php') || t.includes('node')) return 'Development';
        if (t.includes('marketing') || t.includes('seo') || t.includes('communication') || t.includes('social')) return 'Marketing';
        if (t.includes('data') || t.includes('analyst') || t.includes('analytics') || t.includes('sql') || t.includes('bi')) return 'Data';
        return '';
    }

    for (const el of popularSearches) {
        if (!el || String(el).trim() === '') continue;
        let a = document.createElement('a');
        const mapped = mapSearchToCategory(el);
        if (mapped) {
            a.href = `Offers.html?category=${encodeURIComponent(mapped)}`;
        } else {
            // fallback to search query if we don't have a category mapping
            a.href = `Offers.html?q=${encodeURIComponent(el)}`;
        }
        a.textContent = el;
        hero_searches.appendChild(a);
        if (el !== popularSearches[popularSearches.length - 1]) {
            hero_searches.appendChild(document.createTextNode(","));
        }
    }
});

// Hero search box: redirect to Offers page with query params
document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('hero-search-btn');
    const jobTypeSelect = document.getElementById('job-type');
    const keywordsInput = document.getElementById('hero-keywords');
    const locationInput = document.getElementById('hero-location');

    function buildAndGo() {
        const params = new URLSearchParams();
        const q = keywordsInput ? keywordsInput.value.trim() : '';
        const loc = locationInput ? locationInput.value.trim() : '';
        let typeVal = jobTypeSelect ? jobTypeSelect.value : '';

        // Map select values to the Offers page expected values
        if (typeVal) {
            const t = String(typeVal).toLowerCase();
            if (t === 'stage') typeVal = 'Stage';
            else if (t === 'emploi') typeVal = 'Emploi';
            else typeVal = '';
        }

        if (q) params.set('q', q);
        if (loc) params.set('location', loc);
        if (typeVal) params.set('type', typeVal);

        const query = params.toString();
        const url = 'Offers.html' + (query ? ('?' + query) : '');
        window.location.href = url;
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', buildAndGo);
    }

    // submit on Enter in inputs
    [keywordsInput, locationInput].forEach(input => {
        if (!input) return;
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                buildAndGo();
            }
        });
    });
});
        // Variables
        let savedJobs = [];
        let currentSlide = 0;
        let displayedJobs = 6;

        // Couleurs aléatoires pour les logos
        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'];

        function getRandomColor() {
            return colors[Math.floor(Math.random() * colors.length)];
        }

        function getInitials(company) {
            return company.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        }

        // Calculate and format time since posting
        function getTimeAgo(postedDate) {
            if (!postedDate) return '';
            
            const posted = new Date(postedDate);
            const now = new Date();
            const diffTime = Math.abs(now - posted);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                return 'Aujourd\'hui';
            } else if (diffDays === 1) {
                return 'Il y a 1 jour';
            } else if (diffDays < 7) {
                return `Il y a ${diffDays} jours`;
            } else if (diffDays < 14) {
                return 'Il y a 1 semaine';
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
            } else if (diffDays < 60) {
                return 'Il y a 1 mois';
            } else {
                const months = Math.floor(diffDays / 30);
                return `Il y a ${months} mois`;
            }
        }

        // Afficher les offres
        function renderJobs() {
            const jobsGrid = document.getElementById('jobsGrid');
            const offers = Array.isArray(window.offersData) ? window.offersData : [];
            const jobsToShow = offers.slice(0, displayedJobs);

            if (!jobsGrid) return;

            jobsGrid.innerHTML = jobsToShow.map(job => `
                <div class="job-card"
                data-aos="fade-up"
        data-aos-duration="800"
                >
                    <div class="job-header">
                        <div class="company-logo" style="background-color: ${getRandomColor()}">
                            ${getInitials(job.company)}
                        </div>
                        <div class="job-info">
                            <div class="job-title-row">
                                <h3 class="job-title">${job.title}</h3>
                                ${job.id <= 6 ? '<span class="featured-badge">En Vedette</span>' : ''}
                            </div>
                            <div class="job-meta">
                                <span class="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                    </svg>
                                    ${job.categories.join(', ')}
                                </span>
                                <span class="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    ${job.location}
                                </span>
                                <span class="meta-item">
                                    ${job.salary}
                                </span>
                                ${job.postedDate ? `
                                    <span class="meta-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        ${getTimeAgo(job.postedDate)}
                                    </span>
                                ` : ''}
                            </div>
                            <div class="job-badges">
                                <span class="badge badge-${job.jobType.toLowerCase().replace(' ', '')}">${job.jobType === 'Full Time' ? 'Temps Plein' : job.jobType === 'Part Time' ? 'Temps Partiel' : 'Stage'}</span>
                                ${job.id === 1 || job.id === 2 ? '<span class="badge badge-urgent">Urgent</span>' : ''}
                            </div>
                        </div>
                                        </div>
                                        <div class="offer-row-actions">
                                            <button class="detail-btn" onclick="location.href='OfferDetail.html?id=${job.id}'">Détails</button>
                                        </div>
                                </div>
            `).join('');

            // Cacher le bouton si toutes les offres sont affichées
        }

        // Toggle sauvegarde
        function toggleSave(jobId) {
            if (savedJobs.includes(jobId)) {
                savedJobs = savedJobs.filter(id => id !== jobId);
            } else {
                savedJobs.push(jobId);
            }
            renderJobs();
        }



        // Afficher les témoignages
        let testimonialsInterval = null;

        function getVisibleCount() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function renderTestimonials() {
            const track = document.getElementById('testimonialsTrack');
            if (!track || !window.customers) return;

            track.innerHTML = window.customers.map(testimonial => `
                <div class="testimonial-card">
                    <div class="quote-mark">"</div>
                    <h3 class="testimonial-title">${testimonial.title}</h3>
                    <p class="testimonial-content">${testimonial.content}</p>
                    <div class="testimonial-author">
                        <img src="${testimonial.avatar}" alt="${testimonial.name}" class="author-avatar">
                        <div class="author-info">
                            <h4>${testimonial.name}</h4>
                            <p>${testimonial.role}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            // Créer les points de navigation
            const dotsContainer = document.getElementById('sliderDots');
            const visibleCount = getVisibleCount();
            const maxSlides = Math.max(1, window.customers.length - visibleCount + 1);

            if (!dotsContainer) return;

            // If there's only one possible position, hide dots
            if (maxSlides <= 1) {
                dotsContainer.innerHTML = '';
                // reset transform
                track.style.transform = 'translateX(0)';
                currentSlide = 0;
                return;
            }

            dotsContainer.innerHTML = Array.from({length: maxSlides}, (_, i) =>
                `<div class="dot ${i === currentSlide ? 'active' : ''}" data-index="${i}"></div>`
            ).join('');

            // attach click handlers for dots
            dotsContainer.querySelectorAll('.dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const idx = Number(dot.getAttribute('data-index'));
                    goToSlide(idx);
                });
            });

            // ensure auto-slide interval
            startAutoSlide();
        }

        // Navigation du slider
        function goToSlide(index) {
            if (!window.customers) return;
            const visibleCount = getVisibleCount();
            const maxSlides = Math.max(1, window.customers.length - visibleCount + 1);
            currentSlide = Math.max(0, Math.min(index, maxSlides - 1));

            const track = document.getElementById('testimonialsTrack');
            if (!track) return;

            const offsetPercent = (100 / getVisibleCount()) * currentSlide;
            track.style.transform = `translateX(-${offsetPercent}%)`;

            // Mettre à jour les points
            document.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        function startAutoSlide() {
            stopAutoSlide();
            const visibleCount = getVisibleCount();
            const maxSlides = Math.max(1, window.customers.length - visibleCount + 1);
            if (maxSlides <= 1) return;

            testimonialsInterval = setInterval(() => {
                goToSlide((currentSlide + 1) % maxSlides);
            }, 5000);
        }

        function stopAutoSlide() {
            if (testimonialsInterval) {
                clearInterval(testimonialsInterval);
                testimonialsInterval = null;
            }
        }

        // Re-render testimonials on resize to adjust visible count
        window.addEventListener('resize', () => {
            // reset to first slide on breakpoint change
            const prevVisible = window.__prevVisibleCount || getVisibleCount();
            const currVisible = getVisibleCount();
            if (prevVisible !== currVisible) {
                currentSlide = 0;
            }
            window.__prevVisibleCount = currVisible;
            renderTestimonials();
        });

        // Initialisation
        renderJobs();
        renderTestimonials();
