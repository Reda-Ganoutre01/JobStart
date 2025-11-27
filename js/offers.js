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

  // We now rely on the logo path provided in offers.json.
  // If a logo value is missing or fails to load, we fall back deterministically
  // to one of the local JobStar logo variants for visual consistency.

  // Ensure each offer has accurate categories: infer from title/tags, fallback to normalized provided ones
  function enrichCategories(){
    const allowed = new Set(['development','design','marketing','data','finance','rh']);
    const normalizeProvided = (cats)=>{
      return (cats||[])
        .map(c=>String(c).trim().toLowerCase())
        .map(c=>{
          if (/(dev|software|programmeur|ingénieur)/.test(c)) return 'development';
          if (/(ux|ui|design|graph|maquette|prototype)/.test(c)) return 'design';
          if (/(marketing|seo|content|communication)/.test(c)) return 'marketing';
          if (/(data|bi|etl|ml|ai|analytics)/.test(c)) return 'data';
          if (/(finance|compta|account)/.test(c)) return 'finance';
          if (/(rh|ressources humaines|talent|recrut)/.test(c)) return 'rh';
          return c;
        })
        .filter(c=>allowed.has(c))
        .map(c=> c.charAt(0).toUpperCase()+c.slice(1));
    };
    const infer = (o)=>{
      const inferred = new Set();
      const text = `${o.title||''} ${(o.tags||[]).join(' ')}`.toLowerCase();
      const addIf = (cond,cat)=>{ if(cond) inferred.add(cat); };
      // Development: include devops/cloud tools explicitly
      addIf(/(react|vue|angular|node|java|php|python|flutter|api|wordpress|full-?stack|backend|front-?end|mobile|ios|android|devops|docker|kubernetes|k8s|terraform|ansible|cicd|ci\/?cd|linux|aws|azure|gcp)/.test(text),'Development');
      // Design: avoid generic 'design' to reduce false positives; focus on UX/UI/graphic terms
      addIf(/(\bux\b|\bui\b|designer\b|figma\b|sketch\b|photoshop\b|illustrator\b|graphiste\b|branding\b|maquette\b|prototype\b|wireframe\b)/.test(text),'Design');
      addIf(/(seo|marketing|content|communication|réseau[x]? sociaux|social)/.test(text),'Marketing');
      // Data: avoid generic 'data' and generic 'sql/python'; require strong analytics/ML/BI signals
      addIf(/(\bdata\s*(analyst|scientist|engineer)\b|\betl\b|\bairflow\b|\bdbt\b|\bbi\b|power\s*bi\b|\btableau\b|\blook(er)?\b|\bpandas\b|\bnumpy\b|scikit|sklearn|machine\s*learning|\bml\b|\bspark\b|\bhadoop\b)/.test(text),'Data');
      addIf(/(compta|finance|financier|account)/.test(text),'Finance');
      addIf(/(rh|ressources humaines|recruit|recrut)/.test(text),'RH');
      return Array.from(inferred);
    };
    state.offers = state.offers.map(o => {
      const inferred = infer(o);
      const provided = normalizeProvided(o.categories);
      // If we inferred any, prefer inferred; else use normalized provided
      const finalCats = inferred.length ? inferred : provided;
      return { ...o, categories: finalCats };
    });
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

  // Static DOM offers removed: data now comes exclusively from JSON

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
    const sorted = sortData(state.filtered);
    const pageItems = paginate(sorted);
    if (els.count) els.count.textContent = `${sorted.length}`;
    if (els.list){
      els.list.innerHTML = '';
      if (!pageItems.length){
        const empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = 'Aucune offre trouvée.';
        els.list.appendChild(empty);
      } else {
        const frag = document.createDocumentFragment();
        pageItems.forEach(o => {
          const idStr = String(o.id);
          const article = document.createElement('article');
          article.className = 'offer-row';
          article.setAttribute('data-offer-id', idStr);
          const logoSrc = o.logo || deterministicFallback(o.company);
          const cats = (o.categories && o.categories.length ? o.categories[0] : (o.type||''));
          const salary = o.salary ? `<span class="salary">${o.salary}</span>` : '';
          article.innerHTML = `
            <a class="offer-row-link" href="OfferDetail.html?id=${idStr}" aria-label="Voir détails ${o.title||''}"></a>
            <div class="logo-wrap"><img src="${logoSrc}" alt="${o.company||'Entreprise'}" onerror="this.onerror=null;this.src='${deterministicFallback(o.company)}'" /></div>
            <div class="offer-row-main">
              <h3 class="offer-title">${o.title || ''}</h3>
              <div class="offer-row-meta">
                ${o.company ? `<span class="company">${o.company}</span>` : ''}
                ${o.location ? `<span class="location">${o.location}</span>` : ''}
                ${cats ? `<span class="cats">${cats}</span>` : ''}
                <span class="posted">${formatDateRelative(o.postedDate)}</span>
                ${salary}
              </div>
              <div class="offer-row-badges">
                ${o.type ? `<span class="badge badge-type">${o.type}</span>` : ''}
                ${o.featured ? `<span class="badge badge-featured">Featured</span>` : ''}
                ${o.urgent ? `<span class="badge badge-urgent">Urgent</span>` : ''}
              </div>
            </div>
            <div class="offer-row-actions">
              <button class="detail-btn" onclick="location.href='OfferDetail.html?id=${idStr}'">Détails</button>
            </div>`;
          frag.appendChild(article);
        });
        els.list.appendChild(frag);
      }
    }
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
      // Date filter: supports "7", "30" for <= N days and "7+", "30+" for >= N days
      if(dateRange){
        const posted = new Date(o.postedDate).getTime();
        const diffDays = Math.floor((now - posted)/(1000*60*60*24));
        const plusMode = /\+$/.test(dateRange);
        const daysLimit = parseInt(dateRange,10);
        if (!Number.isNaN(daysLimit)){
          if (plusMode){
            // show items older than or equal to N days
            if (diffDays < daysLimit) return false;
          } else {
            // show items newer than or equal to N days
            if (diffDays > daysLimit) return false;
          }
        }
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
      const res = await fetch('data/offers.json', {cache:'no-store'});
      if (!res.ok) throw new Error('HTTP '+res.status);
      const json = await res.json();
      state.offers = Array.isArray(json) ? json : [];
      enrichCategories();
      state.filtered = [...state.offers];
      render();
    }catch(err){
      console.error('Failed to load offers:', err);
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
