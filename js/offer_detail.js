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

  function relativeDate(d){
    try {
      const date = new Date(d);
      const days = Math.floor((Date.now()-date.getTime())/(1000*60*60*24));
      if (days <= 0) return "Aujourd'hui";
      if (days === 1) return 'Hier';
      return `Il y a ${days} jours`;
    } catch { return ''; }
  }

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
      const offer = data.find(o=>o.id===id);
      if(!offer){
        headerEl.innerHTML = '<p>Offre introuvable.</p>';
        if (loadingEl){ loadingEl.classList.add('hidden'); loadingEl.setAttribute('aria-hidden','true'); }
        return;
      }
      render(offer);
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
    
    // Check if user already applied
    var applyButtonHTML = '<button class="apply-btn" id="applyBtn" onclick="handleJobApplication(' + o.id + ')">Postuler</button>';
    var user = null;
    if (typeof getSession === 'function') {
      user = getSession();
    }
    
    if (user && user.type === 'candidat') {
      var hasApplied = false;
      if (typeof getUserApplications === 'function') {
        var userApplications = getUserApplications(user.email);
        hasApplied = userApplications.some(function(app) {
          return app.jobId === o.id;
        });
      } else {
        var applications = JSON.parse(localStorage.getItem('applications') || '[]');
        hasApplied = applications.some(function(app) {
          return app.jobId === o.id && app.userEmail === user.email;
        });
      }
      
      if (hasApplied) {
        applyButtonHTML = '<button class="apply-btn" id="applyBtn" disabled style="background: #10b981; cursor: not-allowed;">Candidature envoyée</button>';
      }
    } else if (!user) {
      applyButtonHTML = '<button class="apply-btn" id="applyBtn" onclick="if(confirm(\'Vous devez être connecté pour postuler. Voulez-vous vous connecter?\')){window.location.href=\'login.html\'}">Postuler</button>';
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

    // Simple map placeholder (New York coords fallback)
    const coords = /new york/i.test(o.location||'') ? '40.7128,-74.0060' : '31.7923,-7.0800';
    mapBox.innerHTML = `<iframe title="Carte" width="100%" height="300" src="https://maps.google.com/maps?q=${coords}&output=embed" loading="lazy"></iframe>`;
    
    // Show applicants table if user is recruiter and owns this offer
    setTimeout(function() {
      checkAndShowApplicants(o.id, o);
    }, 500);
  }
  
  // Check if user is recruiter and show applicants
  function checkAndShowApplicants(jobId, jobData) {
    var user = null;
    if (typeof getSession === 'function') {
      user = getSession();
    }
    
    if (!user || user.type !== 'recruteur') return;
    
    // Check if this offer belongs to the recruiter
    var isOwner = jobData.postedBy === user.email || jobData.company === user.companyName;
    if (!isOwner) return;
    
    // Get applicants for this job
    var applicants = [];
    if (typeof getJobApplicants === 'function') {
      applicants = getJobApplicants(jobId);
    } else {
      var allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      applicants = allApplicants.filter(function(app) {
        return app.jobId === jobId;
      });
    }
    
    // Add applicants section after the map
    var mapBox = $('#map-box');
    if (mapBox && applicants.length > 0) {
      var applicantsHTML = `
        <div class="detail-section applicants-section" id="applicants-section">
          <h2>Candidats (${applicants.length})</h2>
          <div class="applicants-table-container">
            <table class="applicants-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>CV</th>
                  <th>Date de candidature</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${applicants.map(function(applicant) {
                  var appliedDate = new Date(applicant.appliedDate || applicant.timestamp);
                  var dateStr = appliedDate.toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                  
                  return `
                    <tr>
                      <td>
                        <div class="applicant-name-cell">
                          ${applicant.candidateProfile && !applicant.candidateProfile.includes('logo') ? 
                            '<img src="' + applicant.candidateProfile + '" alt="' + applicant.candidateName + '" class="applicant-table-avatar">' :
                            '<div class="applicant-table-initials">' + (applicant.candidateName.substring(0, 2).toUpperCase() || 'U') + '</div>'}
                          <span>${applicant.candidateName || 'N/A'}</span>
                        </div>
                      </td>
                      <td>${applicant.candidateEmail || 'N/A'}</td>
                      <td>${applicant.candidatePhone || 'N/A'}</td>
                      <td>
                        ${applicant.candidateCV ? 
                          '<a href="#" class="cv-link" onclick="viewCV(\'' + applicant.candidateCV + '\'); return false;"><i class="fas fa-file-pdf"></i> Voir CV</a>' :
                          '<span class="no-cv">Aucun CV</span>'}
                      </td>
                      <td>${dateStr}</td>
                      <td>
                        <span class="job-status ${applicant.status || 'pending'}">
                          ${applicant.status === 'accepted' ? 'Accepté' : 
                            applicant.status === 'rejected' ? 'Refusé' : 'En attente'}
                        </span>
                      </td>
                      <td>
                        <div class="applicant-actions">
                          <button class="btn-accept" onclick="updateApplicantStatus(${applicant.id}, 'accepted')" title="Accepter">
                            <i class="fas fa-check"></i>
                          </button>
                          <button class="btn-reject" onclick="updateApplicantStatus(${applicant.id}, 'rejected')" title="Refuser">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      
      mapBox.insertAdjacentHTML('afterend', applicantsHTML);
    } else if (mapBox) {
      // Show empty state
      var emptyHTML = `
        <div class="detail-section applicants-section" id="applicants-section">
          <h2>Candidats</h2>
          <p class="empty-state">Aucun candidat pour le moment</p>
        </div>
      `;
      mapBox.insertAdjacentHTML('afterend', emptyHTML);
    }
  }
  
  // Update applicant status
  window.updateApplicantStatus = function(applicantId, status) {
    if (typeof updateApplicationStatus === 'function') {
      updateApplicationStatus(applicantId, status);
    } else {
      var applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      var applicant = applicants.find(function(app) {
        return app.id === applicantId;
      });
      if (applicant) {
        applicant.status = status;
        localStorage.setItem('applicants', JSON.stringify(applicants));
      }
      
      var applications = JSON.parse(localStorage.getItem('applications') || '[]');
      var application = applications.find(function(app) {
        return app.id === applicantId;
      });
      if (application) {
        application.status = status;
        localStorage.setItem('applications', JSON.stringify(applications));
      }
    }
    
    // Reload page to show updated status
    window.location.reload();
  };
  
  // View CV (placeholder)
  window.viewCV = function(cvFileName) {
    alert('CV: ' + cvFileName + '\n\nFonctionnalité de visualisation CV à implémenter.');
  };

  // Handle job application
  window.handleJobApplication = function(jobId) {
    // Check if user is logged in
    var user = null;
    if (typeof getSession === 'function') {
      user = getSession();
    }
    
    if (!user) {
      if (confirm('Vous devez être connecté pour postuler. Voulez-vous vous connecter?')) {
        window.location.href = 'login.html';
      }
      return;
    }
    
    if (user.type !== 'candidat') {
      alert('Seuls les candidats peuvent postuler aux offres.');
      return;
    }
    
    // Get job data
    var jobData = null;
    if (window.offersData && Array.isArray(window.offersData)) {
      jobData = window.offersData.find(function(job) {
        return job.id === jobId;
      });
    }
    
    if (!jobData) {
      alert('Erreur: Impossible de trouver les détails de l\'offre.');
      return;
    }
    
    // Save application
    if (typeof saveApplication === 'function') {
      var result = saveApplication(jobId, jobData);
      
      if (result.success) {
        // Update button immediately
        var applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
          applyBtn.textContent = 'Candidature envoyée';
          applyBtn.disabled = true;
          applyBtn.style.background = '#10b981';
          applyBtn.style.cursor = 'not-allowed';
          applyBtn.onclick = null;
        }
        
        // Show success message
        if (typeof showSuccessPopup === 'function') {
          showSuccessPopup(
            'Candidature envoyée!',
            'Votre candidature a été envoyée avec succès. Le recruteur vous contactera bientôt.',
            ''
          );
        } else {
          alert(result.message);
        }
      } else {
        alert(result.message);
      }
    } else {
      alert('Erreur: Système de candidature non disponible.');
    }
  };

  document.addEventListener('DOMContentLoaded', load);
})();