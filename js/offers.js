(function(){
  const state = {
    offers: [],
    filtered: [],
    search: '',
    type: 'Tous'
  };

  const els = {};

  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  // Local fallback logo variants
  const fallbackLogos = [
    'assets/logo/logo_jobstart_single.png',
    'assets/logo/logo-lightmode.png',
    'assets/logo/logo-darkmode.png'
  ];

  // Mapping of real company names (lowercased) to their domains for logo fetching
  // Uses Clearbit's logo service: https://logo.clearbit.com/<domain>
  // NOTE: Real company logos are trademarks; ensure usage complies with brand guidelines.
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
    'nvidia': 'nvidia.com'
  };

  function deterministicFallback(company){
    const name = (company || '').toLowerCase();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash + name.charCodeAt(i) * (i + 7)) % 100003;
    }
    return fallbackLogos[hash % fallbackLogos.length];
  }

  function logoForCompany(company){
    const key = (company||'').toLowerCase();
    if (realCompanyDomains[key]) {
      return `https://logo.clearbit.com/${realCompanyDomains[key]}`;
    }
    return deterministicFallback(company);
  }

  function assignLogos(){
    state.offers = state.offers.map(o => ({
      ...o,
      logo: logoForCompany(o.company)
    }));
  }

  function formatDateRelative(iso){
    try {
      const d = new Date(iso);
      const days = Math.floor((Date.now() - d.getTime())/(1000*60*60*24));
      if (Number.isNaN(days)) return '';
      if (days <= 0) return "Aujourd'hui";
      if (days === 1) return 'Hier';
      return `Il y a ${days} jours`;
    } catch { return ''; }
  }

  function badgeColor(type){
    switch(type){
      case 'Stage': return 'badge badge-stage';
      case 'Emploi': return 'badge badge-emploi';
      case 'Freelance': return 'badge badge-freelance';
      default: return 'badge';
    }
  }

  function render(){
    if (!els.list) return;
    const data = state.filtered;
    els.count.textContent = `${data.length}`;

    if (data.length === 0) {
      els.list.innerHTML = `<div class="no-results">Aucune offre trouvée. Essayez d'élargir vos filtres.</div>`;
      return;
    }

    const cards = data.map(o => `
      <article class="offer-card">
        <div class="offer-header">
          <img class="offer-logo" src="${o.logo}" alt="${o.company}">
          <div class="offer-head-text">
            <h3 class="offer-title">${o.title}</h3>
            <div class="offer-meta">
              <span class="company">${o.company}</span>
              <span class="dot">•</span>
              <span class="location">${o.location}</span>
            </div>
          </div>
          <span class="${badgeColor(o.type)}">${o.type}</span>
        </div>
        <p class="offer-desc">${o.description}</p>
        <div class="offer-tags">
          ${(o.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="offer-footer">
          <span class="posted">${formatDateRelative(o.postedDate)}</span>
          <span class="salary">${o.salary || ''}</span>
        </div>
      </article>
    `).join('');

    els.list.innerHTML = cards;
  }

  function applyFilters(){
    const q = state.search.trim().toLowerCase();
    const type = state.type;
    state.filtered = state.offers.filter(o => {
      const matchesType = type === 'Tous' || o.type === type;
      if (!matchesType) return false;
      if (!q) return true;
      const hay = `${o.title} ${o.company} ${o.location} ${(o.tags||[]).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
    render();
  }

  async function loadOffers(){
    try{
      const res = await fetch('data/offers.json', {cache:'no-store'});
      if (!res.ok) throw new Error('HTTP '+res.status);
      const json = await res.json();
      state.offers = Array.isArray(json) ? json : [];
      // Override any existing logo values with deterministic random logos
      assignLogos();
      state.filtered = [...state.offers];
      render();
    }catch(err){
      console.error('Failed to load offers:', err);
      if (els.list){
        els.list.innerHTML = `<div class="no-results">Impossible de charger les offres. Réessayez plus tard.</div>`;
      }
    }
  }

  function bind(){
    els.search = $('#offer-search');
    els.type = $('#offer-type');
    els.list = $('#offers-list');
    els.count = $('#offers-count');

    if (els.search){
      els.search.addEventListener('input', (e)=>{ state.search = e.target.value; applyFilters(); });
    }
    if (els.type){
      els.type.addEventListener('change', (e)=>{ state.type = e.target.value; applyFilters(); });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    bind();
    loadOffers();
  });
})();
