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
  }

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