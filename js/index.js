
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

        // Afficher les offres
        function renderJobs() {
            const jobsGrid = document.getElementById('jobsGrid');
            const offers = Array.isArray(window.offersData) ? window.offersData : [];
            const jobsToShow = offers.slice(0, displayedJobs);

            if (!jobsGrid) return;

            jobsGrid.innerHTML = jobsToShow.map(job => `
                <div class="job-card">
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
