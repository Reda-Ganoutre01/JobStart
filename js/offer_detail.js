(function(){
  function $(s,r=document){return r.querySelector(s);}  
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'),10);
  const headerEl = $('#detail-header');
  const descEl = $('#desc-text');
  const respEl = $('#resp-list');
  const skillsEl = $('#skills-list');
  const overviewGrid = $('#overview-grid');
  const mapBox = $('#map-box');
  const loadingEl = $('#detail-loading');

  // Colors for company logos (same as index.js and offers.js)
  const logoColors = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'];
  
  function getRandomColor(company) {
    if (!company) return logoColors[0];
    let hash = 0;
    for (let i = 0; i < company.length; i++) {
      hash = company.charCodeAt(i) + ((hash << 5) - hash);
    }
    return logoColors[Math.abs(hash) % logoColors.length];
  }
  
  function getInitials(company) {
    if (!company) return '??';
    return company.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  }

  function formatDate(d){
    try { return new Date(d).toLocaleDateString('fr-FR',{year:'numeric',month:'long',day:'numeric'}); } catch { return d; }
  }

  function renderApplicantsTable(jobId, jobData) {
    const user = typeof getSession === 'function' ? getSession() : null;

    // Ensure the user is a recruiter and owns the job
    if (!user || user.type !== 'recruteur' || (jobData.postedBy !== user.email && jobData.company !== user.companyName)) {
      return;
    }

    const applicantsSection = document.createElement('div');
    applicantsSection.className = 'detail-section applicants-section';
    applicantsSection.id = 'applicants-section';

    const applicants = getApplicantsForJob(jobId);

    if (applicants.length === 0) {
      applicantsSection.innerHTML = '<h2>Candidats</h2><p>Aucun candidat pour cette offre.</p>';
    } else {
      const tableHTML = `
        <h2>Candidats</h2>
        <table class="applicants-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>CV</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${applicants.map(applicant => `
              <tr>
                <td>${applicant.name}</td>
                <td>
                  <a href="${applicant.cvLink}" target="_blank">Voir CV</a>
                </td>
                <td>
                  <button class="approve-btn" onclick="approveApplicant(${applicant.id})">Approuver</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      applicantsSection.innerHTML = tableHTML;
    }

    const mapBox = document.getElementById('map-box');
    if (mapBox) {
      mapBox.insertAdjacentElement('afterend', applicantsSection);
    }
  }

  function getApplicantsForJob(jobId) {
    const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
    return allApplicants.filter(applicant => applicant.jobId === jobId);
  }

  window.approveApplicant = function(applicantId) {
    const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
    const applicant = allApplicants.find(app => app.id === applicantId);

    if (applicant) {
        applicant.status = 'approved';
        localStorage.setItem('applicants', JSON.stringify(allApplicants));
        showAlertPopup('Succès', `Candidat ${applicant.name} approuvé avec succès !`, 'info');
        location.reload();
    }
  };

  window.handleJobApplication = function(jobId) {
    const user = typeof getSession === 'function' ? getSession() : null;

    if (!user) {
        showAlertPopup('Connexion requise', 'Vous devez être connecté pour postuler.', 'error');
        return;
    }

    if (user.type !== 'candidat') {
        showAlertPopup('Erreur', 'Seuls les candidats peuvent postuler aux offres.', 'error');
        return;
    }

    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const hasApplied = applications.some(app => app.jobId === jobId && app.userEmail === user.email);

    if (hasApplied) {
        showAlertPopup('Information', 'Vous avez déjà postulé à cette offre.', 'info');
        return;
    }

    applications.push({
        jobId: jobId,
        userEmail: user.email,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('applications', JSON.stringify(applications));

    const applyBtn = document.getElementById('applyBtn');
    if (applyBtn) {
        applyBtn.textContent = 'Candidature envoyée';
        applyBtn.disabled = true;
        applyBtn.style.background = '#10b981';
        applyBtn.style.cursor = 'not-allowed';
    }

    showAlertPopup('Succès', 'Votre candidature a été envoyée avec succès !', 'info');
  };

  async function load(){
    try {
      if (loadingEl){ loadingEl.classList.remove('hidden'); loadingEl.setAttribute('aria-hidden','false'); }
      let data;
      if (window.offersData && Array.isArray(window.offersData)) {
        data = window.offersData;
      } else {
        const res = await fetch('data/offers.json',{cache:'no-store'});
        data = await res.json();
      }

      // Load recruiter offers from localStorage
      let recruiterOffers = [];
      const stored = localStorage.getItem('recruiterOffers');
      if (stored) {
        recruiterOffers = JSON.parse(stored);
      }

      // Merge recruiter offers with main offers
      const allOffers = [...data, ...recruiterOffers];

      const offer = allOffers.find(o => o.id === id);
      if(!offer){
        headerEl.innerHTML = '<p>Offre introuvable.</p>';
        if (loadingEl){ loadingEl.classList.add('hidden'); loadingEl.setAttribute('aria-hidden','true'); }
        return;
      }
      render(offer);
      renderApplicantsTable(offer.id, offer);
      // Check application status after a short delay to ensure scripts are loaded
      setTimeout(function() {
        checkApplicationStatus(offer.id);
      }, 500);
    } catch(e){
      headerEl.innerHTML = '<p>Erreur de chargement.</p>';
    }
    if (loadingEl){ loadingEl.classList.add('hidden'); loadingEl.setAttribute('aria-hidden','true'); }
  }

  // Check if user has already applied and update button
  function checkApplicationStatus(jobId) {
    var user = null;
    if (typeof getSession === 'function') {
      user = getSession();
    }
    
    if (!user || user.type !== 'candidat') return;
    
    var hasApplied = false;
    if (typeof getUserApplications === 'function') {
      var userApplications = getUserApplications(user.email);
      hasApplied = userApplications.some(function(app) {
        return app.jobId === jobId;
      });
    } else {
      var applications = JSON.parse(localStorage.getItem('applications') || '[]');
      hasApplied = applications.some(function(app) {
        return app.jobId === jobId && app.userEmail === user.email;
      });
    }
    
    if (hasApplied) {
      var applyBtn = document.getElementById('applyBtn');
      if (applyBtn) {
        applyBtn.textContent = 'Candidature envoyée';
        applyBtn.disabled = true;
        applyBtn.style.background = '#10b981';
        applyBtn.style.cursor = 'not-allowed';
        applyBtn.onclick = null;
      }
    }
  }

  function render(o){
    const badges = [];
    if (o.jobType) badges.push(`<span class="badge badge-type">${o.jobType}</span>`);
    if (o.type) badges.push(`<span class="badge badge-type">${o.type}</span>`);
    if (o.urgent) badges.push(`<span class="badge badge-urgent">Urgent</span>`);
    if (o.featured) badges.push(`<span class="badge badge-featured">Featured</span>`);
    const meta = [o.company, o.location, o.salary, o.postedDate ? new Date(o.postedDate).toLocaleDateString() : ''].filter(Boolean);
    const logoColor = getRandomColor(o.company);
    const initials = getInitials(o.company);

    // Check if user is logged in and eligible to apply
    let applyButtonHTML = '';
    const user = typeof getSession === 'function' ? getSession() : null;
    if (user && user.type === 'candidat') {
      const hasApplied = checkIfUserApplied(o.id, user.email);
      if (hasApplied) {
        applyButtonHTML = '<button class="apply-btn" id="applyBtn" disabled style="background: #10b981; cursor: not-allowed;">Candidature envoyée</button>';
      } else {
        applyButtonHTML = `<button class="apply-btn" id="applyBtn" onclick="handleJobApplication(${o.id})">Postuler</button>`;
      }
    } else if (!user) {
      applyButtonHTML = `<button class="apply-btn" id="applyBtn" onclick="if(confirm('Vous devez être connecté pour postuler. Voulez-vous vous connecter?')){window.location.href='login.html'}">Postuler</button>`;
    }

    headerEl.innerHTML = `
      <div class="detail-header-top">
        <div class="detail-logo" style="background-color: ${logoColor}; width: 80px; height: 80px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 2rem; flex-shrink: 0;">
          ${initials}
        </div>
        <div class="detail-main-head">
          <h1 class="detail-title">${o.title||''}</h1>
          <div class="detail-sub">${meta.map(m=>`<span>${m}</span>`).join(' • ')}</div>
          <div class="detail-badges">${badges.join(' ')}</div>
        </div>
        ${applyButtonHTML}
      </div>
    `;

    descEl.textContent = o.description || '';
    respEl.innerHTML = (o.responsibilities||[]).map(r=>`<li>${r}</li>`).join('');
    skillsEl.innerHTML = (o.skills||[]).map(s=>`<li>${s}</li>`).join('');

    const overview = [
      ['Date',''+formatDate(o.postedDate)],
      ['Salaire', o.salary||'—'],
      ['Localisation', o.location||'—'],
      ['Expérience', (o.experienceYears? o.experienceYears+' an(s)':'—')],
      ['Qualification', o.qualification||'—'],
      ['Niveau carrière', o.careerLevel||'—'],
      ['Genre', o.gender||'—']
    ];
    overviewGrid.innerHTML = overview.map(item=>`<div class="overview-item"><strong>${item[0]}</strong><span>${item[1]}</span></div>`).join('');

    const coords = /new york/i.test(o.location||'') ? '40.7128,-74.0060' : '31.7923,-7.0800';
    mapBox.innerHTML = `<iframe title="Carte" width="100%" height="300" src="https://maps.google.com/maps?q=${coords}&output=embed" loading="lazy"></iframe>`;
  }

  function checkIfUserApplied(jobId, userEmail) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    return applications.some(app => app.jobId === jobId && app.userEmail === userEmail);
  }

  document.addEventListener('DOMContentLoaded', load);
})();