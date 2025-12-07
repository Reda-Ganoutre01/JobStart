// Close filter sidebar on single click outside (mobile) and remove blur/backdrop
document.addEventListener("DOMContentLoaded", function () {
  const filtersSidebar = document.querySelector(".offers-sidebar");
  function isMobile() { return window.innerWidth <= 992; }
  document.addEventListener("click", function (e) {
    if (
      isMobile() &&
      filtersSidebar &&
      filtersSidebar.classList.contains("mobile-visible") &&
      !filtersSidebar.contains(e.target) &&
      !e.target.classList.contains("mobile-filter-toggle")
    ) {
      // Hide sidebar
      filtersSidebar.classList.remove("mobile-visible");
      filtersSidebar.style.opacity = '';
      filtersSidebar.style.visibility = '';
      // Remove any modal-backdrop if present
      var backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.parentNode.removeChild(backdrop);
    }
  });
  // Remove any modal-backdrop on load (cleanup)
  var backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.parentNode.removeChild(backdrop);
});
// Show mobile filter submit button and handle filtering
document.addEventListener("DOMContentLoaded", function () {
  const filterForm = document.querySelector('.filter-form');
  const mobileSubmit = document.getElementById('mobile-filter-submit');
  function isMobile() { return window.innerWidth <= 992; }
  function showMobileSubmit() {
    if (mobileSubmit && isMobile()) mobileSubmit.style.display = 'block';
    else if (mobileSubmit) mobileSubmit.style.display = 'none';
  }
  showMobileSubmit();
  window.addEventListener('resize', showMobileSubmit);
  if (filterForm && mobileSubmit) {
    filterForm.addEventListener('submit', function(e) {
      if (isMobile()) {
        e.preventDefault();
        // Actually trigger the filtering logic for offers
        if (typeof window.applyOfferFilters === 'function') {
          window.applyOfferFilters();
        } else if (typeof window.filterOffers === 'function') {
          window.filterOffers();
        }
        // Close the sidebar after applying filters
        const filtersSidebar = document.querySelector('.offers-sidebar');
        if (filtersSidebar) {
          filtersSidebar.classList.remove('mobile-visible');
          filtersSidebar.style.opacity = '';
          filtersSidebar.style.visibility = '';
        }
      }
    });
  }
});
// Simple Offers Management System for Beginners
// This script handles displaying and filtering job offers

// Global variables to store our data and settings
let allOffers = []; // All job offers from JSON
let filteredOffers = []; // Offers after applying filters
let currentPage = 1;
let offersPerPage = 10;
let totalPages = 1;

// Current filter settings
let currentFilters = {
  search: '',
  location: '',
  category: '',
  type: 'Tous',
  dateRange: '',
  sort: 'recent'
};

// DOM elements - these will be found when page loads
let elements = {};

// Helper function to get DOM elements easily
function getElement(selector) {
  return document.querySelector(selector);
}

function getAllElements(selector) {
  return document.querySelectorAll(selector);
}

// Default logos to use when company logo is missing
const defaultLogos = [
  'assets/logo/logo_jobstart_single.png',
  'assets/logo/logo-lightmode.png', 
  'assets/logo/logo-darkmode.png'
];

// Get a default logo based on company name
function getDefaultLogo(companyName) {
  if (!companyName) return defaultLogos[0];
  
  // Simple way to pick a logo based on company name
  const nameLength = companyName.length;
  const logoIndex = nameLength % defaultLogos.length;
  return defaultLogos[logoIndex];
}

// Add categories to offers that don't have them
function addCategoriesToOffers() {
  allOffers = allOffers.map(offer => {
    // If offer already has categories, keep them
    if (offer.categories && offer.categories.length > 0) {
      return offer;
    }

    // Try to guess category from title and tags
    const text = (offer.title + ' ' + (offer.tags || []).join(' ')).toLowerCase();
    let categories = [];

    // Check for development keywords
    if (text.includes('développeur') || text.includes('dev') || text.includes('programmer') || 
        text.includes('react') || text.includes('javascript') || text.includes('python') || 
        text.includes('java') || text.includes('php') || text.includes('node')) {
      categories.push('Development');
    }
    
    // Check for design keywords  
    if (text.includes('designer') || text.includes('design') || text.includes('ux') || 
        text.includes('ui') || text.includes('figma') || text.includes('graphique')) {
      categories.push('Design');
    }
    
    // Check for marketing keywords
    if (text.includes('marketing') || text.includes('seo') || text.includes('communication') || 
        text.includes('social')) {
      categories.push('Marketing');
    }
    
    // Check for data keywords
    if (text.includes('data') || text.includes('analyst') || text.includes('analytics') || 
        text.includes('bi') || text.includes('sql')) {
      categories.push('Data');
    }

    // If no category found, assign based on job type
    if (categories.length === 0) {
      categories.push('Other');
    }

    return { ...offer, categories: categories };
  });
}

// Calculate how long ago a date was (e.g., "Il y a 3 jours")
function calculateDaysAgo(dateString) {
  try {
    const offerDate = new Date(dateString);
    const today = new Date();
    const timeDiff = today.getTime() - offerDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 0) return "Aujourd'hui";
    if (daysDiff === 1) return 'Hier';
    return `Il y a ${daysDiff} jours`;
  } catch (error) {
    return '';
  }
}

// Show or hide the loading spinner
function showLoading(show) {
  const loadingElement = elements.loading;
  if (loadingElement) {
    if (show) {
      loadingElement.classList.add('active');
    } else {
      loadingElement.classList.remove('active');
    }
  }
}

// Sort offers by date (newest first or oldest first)
function sortOffers(offers) {
  const sortedOffers = [...offers]; // Make a copy
  
  if (currentFilters.sort === 'recent') {
    // Newest first
    sortedOffers.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
  } else if (currentFilters.sort === 'old') {
    // Oldest first  
    sortedOffers.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
  }
  
  return sortedOffers;
}

// Calculate pagination (how many pages we need)
function calculatePagination(totalOffers) {
  totalPages = Math.ceil(totalOffers / offersPerPage);
  if (totalPages < 1) totalPages = 1;
  if (currentPage > totalPages) currentPage = totalPages;
}

// Get offers for current page only
function getOffersForCurrentPage(offers) {
  const startIndex = (currentPage - 1) * offersPerPage;
  const endIndex = startIndex + offersPerPage;
  return offers.slice(startIndex, endIndex);
}

// Create pagination buttons (Previous, 1, 2, 3, Next)
function createPaginationButtons() {
  const paginationElement = elements.pagination;
  if (!paginationElement) return;
  
  // If only one page, don't show pagination
  if (totalPages <= 1) {
    paginationElement.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Previous button
  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  html += `<button type="button" ${prevDisabled} data-page="prev">Précédent</button>`;
  
  // Page number buttons
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const activeClass = pageNum === currentPage ? 'active' : '';
    html += `<button type="button" class="${activeClass}" data-page="${pageNum}">${pageNum}</button>`;
  }
  
  // Next button
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';
  html += `<button type="button" ${nextDisabled} data-page="next">Suivant</button>`;
  
  paginationElement.innerHTML = html;
}

// Colors for company logos (same as index.js)
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

// Create HTML for a single job offer (matching index page style)
function createOfferHTML(offer) {
  const offerId = offer.id;
  const category = offer.categories && offer.categories.length > 0 ? offer.categories[0] : (offer.type || '');
  const jobType = offer.jobType || offer.type || '';
  let jobTypeClass = '';
  let jobTypeText = '';
  
  // Handle different job type formats
  if (jobType === 'Full Time' || jobType === 'fulltime' || jobType === 'full-time') {
    jobTypeClass = 'fulltime';
    jobTypeText = 'Temps Plein';
  } else if (jobType === 'Part Time' || jobType === 'parttime' || jobType === 'part-time') {
    jobTypeClass = 'parttime';
    jobTypeText = 'Temps Partiel';
  } else if (jobType === 'Stage' || jobType === 'Internship' || jobType === 'internship') {
    jobTypeClass = 'stage';
    jobTypeText = 'Stage';
  } else if (jobType) {
    jobTypeClass = jobType.toLowerCase().replace(/\s+/g, '').replace('-', '');
    jobTypeText = jobType;
  }
  
  return `
    <div class="job-card">
      <div class="job-header">
        <div class="company-logo" style="background-color: ${getRandomColor(offer.company)}">
          ${getInitials(offer.company)}
        </div>
        <div class="job-info">
          <div class="job-title-row">
            <h3 class="job-title">${offer.title || ''}</h3>
            ${offer.featured ? '<span class="featured-badge">En Vedette</span>' : ''}
          </div>
          <div class="job-meta">
            ${category ? `
              <span class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                ${category}
              </span>
            ` : ''}
            ${offer.location ? `
              <span class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${offer.location}
              </span>
            ` : ''}
            ${offer.salary ? `
              <span class="meta-item">
                ${offer.salary}
              </span>
            ` : ''}
            ${offer.postedDate ? `
              <span class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${getTimeAgo(offer.postedDate)}
              </span>
            ` : ''}
          </div>
          <div class="job-badges">
            ${jobTypeClass ? `<span class="badge badge-${jobTypeClass}">${jobTypeText}</span>` : ''}
            ${(offer.urgent || offer.id === 1 || offer.id === 2) ? '<span class="badge badge-urgent">Urgent</span>' : ''}
          </div>
        </div>
      </div>
      <div class="offer-row-actions">
        <button class="detail-btn" onclick="location.href='OfferDetail.html?id=${offerId}'">Détails</button>
        ${getRecruiterActions(offer)}
      </div>
    </div>
  `;
}

// Get recruiter action buttons (modify/delete) - only for recruiters
function getRecruiterActions(offer) {
  var user = null;
  if (typeof getSession === 'function') {
    user = getSession();
  }
  
  if (!user || !(user.type === 'recruteur' || user.type === 'entreprise' || user.role === 'recruteur' || user.role === 'entreprise')) {
    return '';
  }
  
  // Check if this offer belongs to the recruiter
  var isOwner = offer.postedBy === user.email || offer.company === user.companyName || offer.company === user.name;
  
  if (!isOwner) {
    return '';
  }
  
  return `
    <button class="modify-btn" onclick="window.location.href='create-offer.html?edit=${offer.id}'" title="Modifier">
      <i class="fas fa-edit"></i>
    </button>
    <button class="delete-btn" onclick="deleteOfferFromList(${offer.id})" title="Supprimer">
      <i class="fas fa-trash"></i>
    </button>
  `;
}

// Delete offer from offers list
window.deleteOfferFromList = function(offerId) {
  if (typeof deleteOffer === 'function') {
    deleteOffer(offerId);
  } else {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre?')) {
      return;
    }
    
    var recruiterOffers = [];
    var stored = localStorage.getItem('recruiterOffers');
    if (stored) {
      recruiterOffers = JSON.parse(stored);
    }
    
    recruiterOffers = recruiterOffers.filter(function(o) {
      return o.id !== offerId;
    });
    
    localStorage.setItem('recruiterOffers', JSON.stringify(recruiterOffers));
    
    // Reload offers
    loadOffers();
  }
};

// Display offers on the page
function displayOffers() {
  const sortedOffers = sortOffers(filteredOffers);
  calculatePagination(sortedOffers.length);
  const offersToShow = getOffersForCurrentPage(sortedOffers);
  
  // Update count
  if (elements.count) {
    elements.count.textContent = sortedOffers.length;
  }
  
  // Update offers list
  if (elements.list) {
    // Change container to use grid layout like index page
    elements.list.className = 'jobs-grid';
    elements.list.innerHTML = '';
    
    if (offersToShow.length === 0) {
      // No offers found
      const noResultsDiv = document.createElement('div');
      noResultsDiv.className = 'no-results';
      noResultsDiv.textContent = 'Aucune offre trouvée.';
      elements.list.appendChild(noResultsDiv);
    } else {
      // Show offers - create job cards directly
      offersToShow.forEach(offer => {
        const cardElement = document.createElement('div');
        cardElement.setAttribute('data-offer-id', offer.id);
        cardElement.innerHTML = createOfferHTML(offer);
        elements.list.appendChild(cardElement);
      });
    }
  }
  
  // Update pagination
  createPaginationButtons();
}

// Check if an offer matches our search filters
function offerMatchesFilters(offer) {
  // Check job type filter (Emploi, Stage, Freelance)
  if (currentFilters.type !== 'Tous' && offer.type !== currentFilters.type) {
    return false;
  }
  
  // Check location filter
  if (currentFilters.location) {
    const offerLocation = (offer.location || '').toLowerCase();
    const filterLocation = currentFilters.location.toLowerCase();
    if (!offerLocation.includes(filterLocation)) {
      return false;
    }
  }
  
  // Check category filter
  if (currentFilters.category) {
    const offerCategories = (offer.categories || []).map(cat => cat.toLowerCase());
    if (!offerCategories.includes(currentFilters.category.toLowerCase())) {
      return false;
    }
  }
  
  // Check date filter
  if (currentFilters.dateRange) {
    const today = new Date();
    const offerDate = new Date(offer.postedDate);
    const daysDiff = Math.floor((today - offerDate) / (1000 * 60 * 60 * 24));
    
    if (currentFilters.dateRange === '7' && daysDiff > 7) return false;
    if (currentFilters.dateRange === '30' && daysDiff > 30) return false;
    if (currentFilters.dateRange === '30+' && daysDiff < 30) return false;
  }
  
  // Check search text
  if (currentFilters.search) {
    const searchText = currentFilters.search.toLowerCase();
    const offerText = [
      offer.title,
      offer.company,
      offer.location,
      offer.description,
      ...(offer.tags || []),
      ...(offer.categories || [])
    ].join(' ').toLowerCase();
    
    if (!offerText.includes(searchText)) {
      return false;
    }
  }
  
  return true;
}

// Apply all filters and update the display
function applyFilters() {
  // Filter offers based on current filter settings
  filteredOffers = allOffers.filter(offerMatchesFilters);
  
  // Reset to first page when filters change
  currentPage = 1;
  
  // Update display
  displayOffers();
}

// Load job offers from embedded JS variable or JSON file
async function loadOffers() {
  try {
    showLoading(true);
    let offersData;
    if (window.offersData && Array.isArray(window.offersData)) {
      offersData = window.offersData;
    } else {
      // Fallback: fetch from JSON file if not embedded
      const response = await fetch('data/offers.json');
      if (!response.ok) {
        throw new Error('Failed to load offers');
      }
      offersData = await response.json();
    }
    
    // Load recruiter offers from localStorage
    var recruiterOffers = [];
    var stored = localStorage.getItem('recruiterOffers');
    if (stored) {
      recruiterOffers = JSON.parse(stored);
    }
    
    // Merge recruiter offers with main offers
    if (Array.isArray(offersData)) {
      allOffers = [...offersData, ...recruiterOffers];
    } else {
      allOffers = recruiterOffers;
    }
    
    // Check if user is recruiter and filter offers
    var user = null;
    if (typeof getSession === 'function') {
      user = getSession();
    }
    
    if (user && (user.type === 'recruteur' || user.type === 'entreprise' || user.role === 'recruteur' || user.role === 'entreprise')) {
      // Show only offers created by this recruiter/entreprise
      allOffers = allOffers.filter(function(offer) {
        return offer.postedBy === user.email || offer.company === user.companyName || offer.company === user.name;
      });
      
      // Show recruiter actions (create offer button)
      var recruiterActions = document.getElementById('recruiterActions');
      if (recruiterActions) {
        recruiterActions.style.display = 'block';
      }
    }
    
    // Add categories to offers that don't have them
    addCategoriesToOffers();
    // Apply any filters (including those loaded from the URL) and display
    applyFilters();
  } catch (error) {
    console.error('Error loading offers:', error);
    // Show error message to user
    if (elements.list) {
      elements.list.innerHTML = `
        <div class="error-message">
          <p>Erreur lors du chargement des offres.</p>
          <button onclick="loadOffers()" class="retry-btn">Réessayer</button>
        </div>
      `;
    }
  } finally {
    showLoading(false);
  }
}

// Find all DOM elements we need
function findElements() {
  elements.search = getElement('#offer-search');
  elements.location = getElement('#filter-location');
  elements.type = getElement('#offer-type');
  elements.category = getElement('#filter-category');
  elements.list = getElement('#offers-list');
  elements.count = getElement('#offers-count');
  elements.pagination = getElement('#offers-pagination');
  elements.sort = getElement('#sort-select');
  elements.pageSize = getElement('#page-size');
  elements.dateRadios = getAllElements('input[name="filter-date"]');
  elements.loading = getElement('#offers-loading');
  elements.resetBtn = getElement('#reset-filters');
}

// Handle pagination button clicks
function handlePaginationClick(event) {
  const button = event.target.closest('button[data-page]');
  if (!button) return;
  
  const pageAction = button.getAttribute('data-page');
  
  if (pageAction === 'prev' && currentPage > 1) {
    currentPage--;
    displayOffers();
  } else if (pageAction === 'next' && currentPage < totalPages) {
    currentPage++;
    displayOffers();
  } else {
    const pageNumber = parseInt(pageAction, 10);
    if (!isNaN(pageNumber)) {
      currentPage = pageNumber;
      displayOffers();
    }
  }
}

// Handle search input changes
function handleSearchInput(event) {
  currentFilters.search = event.target.value;
  applyFilters();
}

// Handle location input changes (with small delay)
let locationTimeout;
function handleLocationInput(event) {
  clearTimeout(locationTimeout);
  const value = event.target.value;
  
  locationTimeout = setTimeout(() => {
    currentFilters.location = value;
    applyFilters();
  }, 300); // Wait 300ms after user stops typing
}

// Handle job type dropdown changes
function handleTypeChange(event) {
  currentFilters.type = event.target.value;
  applyFilters();
}

// Handle category dropdown changes  
function handleCategoryChange(event) {
  currentFilters.category = event.target.value;
  applyFilters();
}

// Handle sort dropdown changes
function handleSortChange(event) {
  currentFilters.sort = event.target.value;
  displayOffers(); // Re-display with new sorting
}

// Handle page size dropdown changes
function handlePageSizeChange(event) {
  offersPerPage = parseInt(event.target.value, 10) || 10;
  currentPage = 1; // Reset to first page
  displayOffers();
}

// Handle date radio button changes
function handleDateChange(event) {
  if (event.target.checked) {
    currentFilters.dateRange = event.target.value;
    applyFilters();
  }
}

// Reset all filters to default values
function resetAllFilters() {
  // Reset filter values
  currentFilters.search = '';
  currentFilters.location = '';
  currentFilters.category = '';
  currentFilters.type = 'Tous';
  currentFilters.dateRange = '';
  currentFilters.sort = 'recent';
  offersPerPage = 10;
  currentPage = 1;
  
  // Reset form inputs
  if (elements.search) elements.search.value = '';
  if (elements.location) elements.location.value = '';
  if (elements.category) elements.category.value = '';
  if (elements.type) elements.type.value = 'Tous';
  if (elements.sort) elements.sort.value = 'recent';
  if (elements.pageSize) elements.pageSize.value = '10';
  
  // Reset date radio buttons
  elements.dateRadios.forEach(radio => {
    radio.checked = radio.value === '';
  });
  
  // Apply filters (which will show all offers)
  applyFilters();
}

// Set up all event listeners
function setupEventListeners() {
  // Pagination clicks
  if (elements.pagination) {
    elements.pagination.addEventListener('click', handlePaginationClick);
  }
  
  // Search input
  if (elements.search) {
    elements.search.addEventListener('input', handleSearchInput);
  }
  
  // Location input  
  if (elements.location) {
    elements.location.addEventListener('input', handleLocationInput);
  }
  
  // Job type dropdown
  if (elements.type) {
    elements.type.addEventListener('change', handleTypeChange);
  }
  
  // Category dropdown
  if (elements.category) {
    elements.category.addEventListener('change', handleCategoryChange);
  }
  
  // Sort dropdown
  if (elements.sort) {
    elements.sort.addEventListener('change', handleSortChange);
  }
  
  // Page size dropdown
  if (elements.pageSize) {
    elements.pageSize.addEventListener('change', handlePageSizeChange);
  }
  
  // Date radio buttons
  elements.dateRadios.forEach(radio => {
    radio.addEventListener('change', handleDateChange);
  });
  
  // Reset button
  if (elements.resetBtn) {
    elements.resetBtn.addEventListener('click', resetAllFilters);
  }
}

// Check URL for initial filter values (like ?search=developer&type=Emploi)
function loadFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  
  const searchParam = urlParams.get('q') || urlParams.get('search');
  const typeParam = urlParams.get('type');
  const dateParam = urlParams.get('date');
  const locationParam = urlParams.get('location') || urlParams.get('loc');
  const categoryParam = urlParams.get('category');
  const sizeParam = urlParams.get('size');
  
  // Apply URL parameters to filters and form inputs
  if (searchParam) {
    currentFilters.search = searchParam;
    if (elements.search) elements.search.value = searchParam;
  }
  
  if (typeParam) {
    currentFilters.type = typeParam;
    if (elements.type) elements.type.value = typeParam;
  }
  
  if (dateParam) {
    currentFilters.dateRange = dateParam;
    elements.dateRadios.forEach(radio => {
      radio.checked = radio.value === dateParam;
    });
  }
  
  if (locationParam) {
    currentFilters.location = locationParam;
    if (elements.location) elements.location.value = locationParam;
  }
  
  if (categoryParam) {
    currentFilters.category = categoryParam;
    if (elements.category) elements.category.value = categoryParam;
  }
  
  if (sizeParam) {
    const pageSize = parseInt(sizeParam, 10);
    if (!isNaN(pageSize)) {
      offersPerPage = pageSize;
      if (elements.pageSize) elements.pageSize.value = sizeParam;
    }
  }
}

// Initialize everything when page loads

function initializeOffersPage() {
  // Find all DOM elements
  findElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Mobile filter toggle logic (moved from Offers.html)
  const filterToggle = document.querySelector('.mobile-filter-toggle');
  // Always get the current sidebar on each open/close
  // (in case DOM changes or there are multiple sidebars)
  let backdrop = document.querySelector('.modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }
  if (filterToggle) {
    function openModal() {
      const filtersSidebar = document.querySelector('.offers-sidebar');
      if (!filtersSidebar) { console.warn('No .offers-sidebar found!'); return; }
      filterToggle.setAttribute('aria-expanded', 'true');
      filtersSidebar.classList.add('mobile-visible');
      backdrop.classList.add('active');
      filterToggle.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Debug: highlight sidebar and log
      filtersSidebar.style.outline = '3px solid red';
      filtersSidebar.style.background = '#fff2';
      console.log('Sidebar found and .mobile-visible added:', filtersSidebar, getComputedStyle(filtersSidebar));
    }
    function closeModal() {
      const filtersSidebar = document.querySelector('.offers-sidebar');
      if (!filtersSidebar) { return; }
      filterToggle.setAttribute('aria-expanded', 'false');
      filtersSidebar.classList.remove('mobile-visible');
      backdrop.classList.remove('active');
      filterToggle.classList.remove('active');
      document.body.style.overflow = '';
      filtersSidebar.style.outline = '';
      filtersSidebar.style.background = '';
    }
    filterToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeModal();
      } else {
        openModal();
      }
    });
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (
        e.key === 'Escape'
      ) {
        closeModal();
      }
    });
    // Prevent modal from closing when clicking inside
    document.addEventListener('click', function (e) {
      const filtersSidebar = document.querySelector('.offers-sidebar');
      if (!filtersSidebar) return;
      if (filtersSidebar.classList.contains('mobile-visible') && filtersSidebar.contains(e.target)) {
        e.stopPropagation();
      }
    }, true);
  }
  // Load filters from URL if any
  loadFiltersFromURL();
  // Load and display offers
  loadOffers();
}

// Start everything when the page is ready
document.addEventListener('DOMContentLoaded', initializeOffersPage);

// Fullscreen detection: add/remove a class on the root element so CSS can hide controls
// This covers both element fullscreen (Fullscreen API) and browser fullscreen (F11)
function updateFullscreenClass() {
  const elementFs = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );

  // Some browsers don't expose element fullscreen for F11; detect browser fullscreen
  const browserFs = (window.outerHeight === screen.height && window.outerWidth === screen.width);

  if (elementFs || browserFs) {
    document.documentElement.classList.add('full-screen-mode');
  } else {
    document.documentElement.classList.remove('full-screen-mode');
  }
}

// Listen for fullscreen and viewport changes


function forceHideMobileToggleInFullscreen() {
  const elementFs = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
  const browserFs = (window.outerHeight === screen.height && window.outerWidth === screen.width);
  const shouldHide = elementFs || browserFs;
  document.querySelectorAll('.mobile-filter-toggle').forEach(el => {
    if (shouldHide) {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
    } else {
      // Only restore display if mobile (<=992px)
      if (window.innerWidth <= 992) {
        el.style.setProperty('display', 'flex', 'important');
        el.style.removeProperty('visibility');
        el.style.removeProperty('pointer-events');
      } else {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      }
    }
  });
}

['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange','resize','load'].forEach(evt => {
  window.addEventListener(evt, () => {
    updateFullscreenClass();
    forceHideMobileToggleInFullscreen();
  });
});
