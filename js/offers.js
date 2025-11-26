(function(){
  let scoreMap = new WeakMap();
  const state = {
    offers: [],
    filtered: [],
    search: '',
    location: '',
    category: '',
    type: 'Tous',
    dateRange: '', // '', '7', '30'
    sort: 'recent',
    pageSize: 10,
    page: 1,
    totalPages: 1
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

  // Mapping of real company name tokens (lowercased) to their domains for logo fetching
  // Clearbit logo service: https://logo.clearbit.com/<domain>
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
    let h = 0;
    for (let i=0;i<str.length;i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function deterministicFallback(company){
    const name = (company || '').toLowerCase();
    const hash = hashString(name);
    return fallbackLogos[hash % fallbackLogos.length];
  }

  function pickRealDomain(company){
    const name = (company||'').toLowerCase().replace(/[.,]/g,'');
    const tokens = name.split(/\s+/).filter(Boolean);
    for (const t of tokens){
      if (realCompanyDomains[t]) return realCompanyDomains[t];
    }
    // Hash-pick a domain to provide a variety even for fictional names
    const hash = hashString(name);
    return realDomainValues[hash % realDomainValues.length];
  }

  function logoForCompany(company){
    const domain = pickRealDomain(company);
    return `https://logo.clearbit.com/${domain}`;
  }

  function assignLogos(){
    state.offers = state.offers.map(o => ({
      ...o,
      logo: logoForCompany(o.company)
    }));
  }

  // Ensure each offer has categories, inferred from title/tags when missing
  function enrichCategories(){
    const infer = (o)=>{
      const cats = new Set((o.categories||[]).map(c=>String(c)));
      const text = `${o.title||''} ${(o.tags||[]).join(' ')}`.toLowerCase();
      const addIf = (cond,cat)=>{ if(cond) cats.add(cat); };
      addIf(/(react|vue|angular|node|java|php|python|flutter|api|wordpress|full-?stack|backend|front-?end|mobile|ios|android)/.test(text),'Development');
      addIf(/(ux|ui|design|figma|sketch|photoshop|illustrator|graphiste|branding|maquette|prototype)/.test(text),'Design');
      addIf(/(seo|marketing|content|communication|réseau[x]? sociaux|social)/.test(text),'Marketing');
      addIf(/(data|sql|python|pandas|machine learning|ml|etl|airflow|bi|powerbi|tableau)/.test(text),'Data');
      addIf(/(compta|finance|financier|account)/.test(text),'Finance');
      addIf(/(rh|ressources humaines|recruit|recrut)/.test(text),'RH');
      return Array.from(cats);
    };
    state.offers = state.offers.map(o => ({...o, categories: infer(o)}));
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

  function setLoading(on){
    if(!els.loading) return;
    els.loading.classList.toggle('active', !!on);
  }

  function badgeColor(type){
    switch(type){
      case 'Stage': return 'badge badge-stage';
      case 'Emploi': return 'badge badge-emploi';
      case 'Freelance': return 'badge badge-freelance';
      default: return 'badge';
    }
  }

  function sortData(arr){
    // If a query exists and scores are computed, sort by score first, then date
    const byDateRecent = (a,b)=> new Date(b.postedDate) - new Date(a.postedDate);
    const byDateOld = (a,b)=> new Date(a.postedDate) - new Date(b.postedDate);
    let out = [...arr];
    if (state.search && scoreMap.size){
      out.sort((a,b)=>{
        const sa = scoreMap.get(a)||0; const sb = scoreMap.get(b)||0;
        if (sb !== sa) return sb - sa;
        return state.sort==='old' ? byDateOld(a,b) : byDateRecent(a,b);
      });
      return out;
    }
    if(state.sort === 'recent') return out.sort(byDateRecent);
    if(state.sort === 'old') return out.sort(byDateOld);
    return out;
  }

  function paginate(arr){
    state.totalPages = Math.max(1, Math.ceil(arr.length / state.pageSize));
    if(state.page > state.totalPages) state.page = state.totalPages;
    const start = (state.page - 1) * state.pageSize;
    return arr.slice(start, start + state.pageSize);
  }

  function renderPagination(){
    if(!els.pagination) return;
    if(state.totalPages <= 1){ els.pagination.innerHTML = ''; return; }
    let html = `<button type="button" ${state.page===1?'disabled':''} data-page="prev">Précédent</button>`;
    for(let p=1;p<=state.totalPages;p++){
      html += `<button type="button" class="${p===state.page?'active':''}" data-page="${p}">${p}</button>`;
    }
    html += `<button type="button" ${state.page===state.totalPages?'disabled':''} data-page="next">Suivant</button>`;
    els.pagination.innerHTML = html;
  }

  function render(){
    if (!els.list) return;
    let data = state.filtered;
    data = sortData(data);
    const pageData = paginate(data);
    els.count.textContent = `${data.length}`;

    if (pageData.length === 0) {
      els.list.innerHTML = `<div class="no-results">Aucune offre trouvée. Essayez d'élargir vos filtres.</div>`;
      renderPagination();
      return;
    }

    const listHtml = pageData.map(o => {
      const cats = (o.categories||[]).join(', ');
      const typeLabel = o.jobType || o.type || '';
      return `
      <article class="offer-row">
        <a class="offer-row-link" href="OfferDetail.html?id=${o.id}" aria-label="Voir détails ${o.title}"></a>
        <div class="logo-wrap"><img class="offer-logo" src="${o.logo}" alt="${o.company}"></div>
        <div class="offer-row-main">
          <h3 class="offer-title">${o.title}</h3>
          <div class="offer-row-meta">
            ${cats ? `<span class="cats">${cats}</span>` : ''}
            <span class="location">${o.location||''}</span>
            <span class="posted">${formatDateRelative(o.postedDate)}</span>
            ${o.salary ? `<span class="salary">${o.salary}</span>`:''}
          </div>
          <div class="offer-row-badges">
            ${typeLabel?`<span class="badge badge-type">${typeLabel}</span>`:''}
            ${o.urgent?`<span class="badge badge-urgent">Urgent</span>`:''}
            ${o.featured?`<span class="badge badge-featured">Featured</span>`:''}
          </div>
          <div class="offer-row-actions">
            <button type="button" class="detail-btn" onclick="location.href='OfferDetail.html?id=${o.id}'">Détails</button>
          </div>
        </div>
      </article>`;
    }).join('');

    els.list.innerHTML = listHtml;
    const imgs = els.list.querySelectorAll('.offer-logo');
    imgs.forEach(img => {
      img.addEventListener('error', () => {
        if (!img.dataset.fallback){
          img.dataset.fallback = '1';
          img.src = deterministicFallback(img.alt);
        }
      });
    });
    renderPagination();
  }

  function applyFilters(){
    const q = state.search.trim().toLowerCase();
    const type = state.type;
    const dateRange = state.dateRange;
    const loc = state.location.trim().toLowerCase();
    const cat = state.category.trim().toLowerCase();
    const now = Date.now();
    // Clear scores
    scoreMap = new WeakMap();
    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

    const tokenScore = (text, token, weight) => {
      if (!text) return 0;
      const t = String(text).toLowerCase();
      // word boundary match gets full weight; substring gets half
      const boundary = new RegExp(`(^|\b|_|-)${token}(\b|$)`);
      if (boundary.test(t)) return weight;
      if (t.includes(token)) return weight*0.5;
      return 0;
    };

    const computeScore = (o) => {
      if (!tokens.length) return 0;
      let s = 0;
      const cats = (o.categories||[]).join(' ');
      const tags = (o.tags||[]).join(' ');
      const fields = {
        title: 3,
        company: 3,
        categories: 2,
        tags: 2,
        location: 1.5,
        description: 1
      };
      for (const tk of tokens){
        s += tokenScore(o.title, tk, fields.title);
        s += tokenScore(o.company, tk, fields.company);
        s += tokenScore(cats, tk, fields.categories);
        s += tokenScore(tags, tk, fields.tags);
        s += tokenScore(o.location, tk, fields.location);
        s += tokenScore(o.description, tk, fields.description);
      }
      // phrase bonus
      if (q){
        const phraseBonus = (text,w)=> text && String(text).toLowerCase().includes(q) ? w : 0;
        s += phraseBonus(o.title, 1.5) + phraseBonus(o.company, 1) + phraseBonus(o.description, 0.5);
      }
      return s;
    };

    const matchesAllTokens = (o) => {
      if (!tokens.length) return true;
      const hay = `${o.title} ${o.company} ${o.location} ${(o.tags||[]).join(' ')} ${(o.categories||[]).join(' ')} ${o.description||''}`.toLowerCase();
      return tokens.every(tk => hay.includes(tk));
    };

    state.filtered = state.offers.filter(o => {
      const matchesType = type === 'Tous' || o.type === type;
      if (!matchesType) return false;
      if (loc && !(String(o.location||'').toLowerCase().includes(loc))) return false;
      if (cat){
        const catList = (o.categories||[]).map(c=>String(c).toLowerCase());
        if (!catList.includes(cat)) return false;
      }
      // Date filter
      if(dateRange){
        const daysLimit = parseInt(dateRange,10);
        const posted = new Date(o.postedDate).getTime();
        const diffDays = Math.floor((now - posted)/(1000*60*60*24));
        if(diffDays > daysLimit) return false;
      }
      if (!q) return true;
      const s = computeScore(o);
      scoreMap.set(o, s);
      return s > 0 && matchesAllTokens(o);
    });
    state.page = 1; // reset to first page after filtering
    render();
  }

  async function loadOffers(){
    try{
      setLoading(true);
      if(els.list) els.list.innerHTML = '';
      const res = await fetch('data/offers.json', {cache:'no-store'});
      if (!res.ok) throw new Error('HTTP '+res.status);
      const json = await res.json();
      state.offers = Array.isArray(json) ? json : [];
      enrichCategories();
      // Override any existing logo values with deterministic random logos
      assignLogos();
      state.filtered = [...state.offers];
      render();
    }catch(err){
      console.error('Failed to load offers:', err);
      if (els.list){
        els.list.innerHTML = `<div class="no-results">Impossible de charger les offres. Réessayez plus tard.</div>`;
      }
    } finally { setLoading(false); }
  }

  function bind(){
    els.search = $('#offer-search');
    els.location = $('#filter-location');
    els.type = $('#offer-type');
    els.category = $('#filter-category');
    els.list = $('#offers-list');
    els.count = $('#offers-count');
    els.pagination = $('#offers-pagination');
    els.sort = $('#sort-select');
    els.pageSize = $('#page-size');
    els.dateRadios = $all('input[name="filter-date"]');
    els.loading = $('#offers-loading');
    els.resetBtn = $('#reset-filters');

    if(els.pagination){
      els.pagination.addEventListener('click', e => {
        const btn = e.target.closest('button[data-page]');
        if(!btn) return;
        const val = btn.getAttribute('data-page');
        if(val === 'prev' && state.page > 1){ state.page--; render(); }
        else if(val === 'next' && state.page < state.totalPages){ state.page++; render(); }
        else {
          const num = parseInt(val,10); if(!isNaN(num)){ state.page = num; render(); }
        }
      });
    }

    if (els.search){
      els.search.addEventListener('input', (e)=>{ state.search = e.target.value; applyFilters(); });
    }
    if (els.location){
      let t; els.location.addEventListener('input', (e)=>{ clearTimeout(t); const val = e.target.value; t = setTimeout(()=>{ state.location = val; applyFilters(); }, 250); });
    }
    if (els.type){
      els.type.addEventListener('change', (e)=>{ state.type = e.target.value; applyFilters(); });
    }
    if (els.category){
      els.category.addEventListener('change', (e)=>{ state.category = e.target.value; applyFilters(); });
    }
    if (els.sort){
      els.sort.addEventListener('change', e=>{ state.sort = e.target.value; render(); });
    }
    if (els.pageSize){
      els.pageSize.addEventListener('change', e=>{ state.pageSize = parseInt(e.target.value,10)||10; state.page=1; render(); });
    }
    if (els.dateRadios.length){
      els.dateRadios.forEach(r => r.addEventListener('change', e=>{ if(e.target.checked){ state.dateRange = e.target.value; applyFilters(); } }));
    }
    if (els.resetBtn){
      els.resetBtn.addEventListener('click', ()=>{
        // Reset state
        state.search = '';
        state.location = '';
        state.category = '';
        state.type = 'Tous';
        state.dateRange = '';
        state.sort = 'recent';
        state.pageSize = 10;
        state.page = 1;
        // Reset UI controls
        if(els.search) els.search.value='';
        if(els.location) els.location.value='';
        if(els.category) els.category.value='';
        if(els.type) els.type.value='Tous';
        if(els.sort) els.sort.value='recent';
        if(els.pageSize) els.pageSize.value='10';
        if(els.dateRadios.length){ els.dateRadios.forEach(r=>{ r.checked = r.value === ''; }); }
        // Apply
        applyFilters();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    bind();
    // Prefill from URL params (q, type, date, pageSize)
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const t = params.get('type');
    const d = params.get('date');
    const ps = parseInt(params.get('size')||'',10);
    const loc = params.get('loc') || params.get('location');
    const cat = params.get('category');
    if(q){ state.search = q; if(els.search) els.search.value = q; }
    if(t){ state.type = t; if(els.type) els.type.value = t; }
    if(d){ state.dateRange = d; if(els.dateRadios){ els.dateRadios.forEach(r=>{ r.checked = r.value===d; }); } }
    if(ps && !Number.isNaN(ps)){ state.pageSize = ps; if(els.pageSize) els.pageSize.value = String(ps); }
    if(loc){ state.location = loc; if(els.location) els.location.value = loc; }
    if(cat){ state.category = cat; if(els.category) els.category.value = cat; }
    loadOffers();
  });
})();
