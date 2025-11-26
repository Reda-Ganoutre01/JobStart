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

  // Real company domain mapping (subset) + logo builder (Clearbit)
  const realCompanyDomains = {
    'google': 'google.com',
    'microsoft': 'microsoft.com',
    'amazon': 'amazon.com',
    'ibm': 'ibm.com',
    'meta': 'meta.com',
    'facebook': 'facebook.com',
    'apple': 'apple.com',
    'netflix': 'netflix.com',
    'adobe': 'adobe.com',
    'oracle': 'oracle.com',
    'intel': 'intel.com',
    'nvidia': 'nvidia.com',
    'atlassian': 'atlassian.com',
    'salesforce': 'salesforce.com',
    'spotify': 'spotify.com',
    'paypal': 'paypal.com',
    'airbnb': 'airbnb.com',
    'uber': 'uber.com',
    'tesla': 'tesla.com'
  };
  const realDomainValues = Object.values(realCompanyDomains);

  function hashString(str){
    let h = 0; for (let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i)) >>> 0; return h;
  }
  function pickRealDomain(company){
    const name = (company||'').toLowerCase().replace(/[.,]/g,'');
    const tokens = name.split(/\s+/).filter(Boolean);
    for (const t of tokens){ if (realCompanyDomains[t]) return realCompanyDomains[t]; }
    const hash = hashString(name);
    return realDomainValues[hash % realDomainValues.length];
  }
  function logoForCompany(company){
    const domain = pickRealDomain(company);
    return `https://logo.clearbit.com/${domain}`;
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
      const res = await fetch('data/offers.json',{cache:'no-store'});
      const data = await res.json();
      const offer = data.find(o=>o.id===id);
      if(!offer){
        headerEl.innerHTML = '<p>Offre introuvable.</p>';
        return;
      }
      render(offer);
    } catch(e){
      headerEl.innerHTML = '<p>Erreur de chargement.</p>';
    }
  }

  function render(o){
    const badges = [];
    if (o.jobType) badges.push(`<span class="badge badge-type">${o.jobType}</span>`);
    if (o.type) badges.push(`<span class="badge badge-type">${o.type}</span>`);
    if (o.urgent) badges.push(`<span class="badge badge-urgent">Urgent</span>`);
    if (o.featured) badges.push(`<span class="badge badge-featured">Featured</span>`);
    const meta = [o.company, o.location, o.salary, o.postedDate ? new Date(o.postedDate).toLocaleDateString() : ''].filter(Boolean);
    const logoSrc = logoForCompany(o.company);
    headerEl.innerHTML = `
      <div class="detail-header-top">
        <div class="detail-logo"><img id="detail-logo-img" src="${logoSrc}" alt="${o.company||''}"></div>
        <div class="detail-main-head">
          <h1 class="detail-title">${o.title||''}</h1>
          <div class="detail-sub">${meta.map(m=>`<span>${m}</span>`).join(' • ')}</div>
          <div class="detail-badges">${badges.join(' ')}</div>
        </div>
        <button class="apply-btn" onclick="alert('Candidature non implémentée')">Postuler</button>
      </div>
    `;
    // Fallback on logo error to any provided static logo
    const img = $('#detail-logo-img');
    if (img){
      img.addEventListener('error', ()=>{ if (o.logo) img.src = o.logo; });
    }
    

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

  document.addEventListener('DOMContentLoaded', load);
})();