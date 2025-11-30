// Create/Edit Offer Management



    // Check if editing an existing offer
    var urlParams = new URLSearchParams(window.location.search);
    var editId = urlParams.get('edit');
    
    if (editId) {
        loadOfferForEdit(parseInt(editId));
    }

    // Handle form submission
    var offerForm = document.getElementById('offerForm');
    if (offerForm) {
        offerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveOffer(user, editId ? parseInt(editId) : null);
        });
    }


// Load offer data for editing
function loadOfferForEdit(offerId) {
    var offers = [];
    if (window.offersData && Array.isArray(window.offersData)) {
        offers = window.offersData;
    } else {
        var stored = localStorage.getItem('recruiterOffers');
        offers = stored ? JSON.parse(stored) : [];
    }

    var offer = offers.find(function(o) {
        return o.id === offerId;
    });

    if (!offer) {
        alert('Offre introuvable.');
        window.location.href = 'Offers.html';
        return;
    }

    // Update form title
    var formTitle = document.getElementById('formTitle');
    var formSubtitle = document.getElementById('formSubtitle');
    var submitBtn = document.getElementById('submitBtn');
    
    if (formTitle) formTitle.textContent = 'Modifier l\'offre';
    if (formSubtitle) formSubtitle.textContent = 'Modifiez les informations de votre offre';
    if (submitBtn) submitBtn.textContent = 'Enregistrer les modifications';

    // Fill form with offer data
    if (offer.title) document.getElementById('jobTitle').value = offer.title;
    if (offer.jobType) document.getElementById('jobType').value = offer.jobType;
    if (offer.categories && offer.categories.length > 0) {
        document.getElementById('category').value = offer.categories[0];
    }
    if (offer.urgent) document.getElementById('urgent').checked = true;
    if (offer.location) document.getElementById('location').value = offer.location;
    if (offer.salary) document.getElementById('salary').value = offer.salary;
    if (offer.description) document.getElementById('description').value = offer.description;
    if (offer.experienceYears) document.getElementById('experienceYears').value = offer.experienceYears;
    if (offer.careerLevel) document.getElementById('careerLevel').value = offer.careerLevel;
    if (offer.qualification) document.getElementById('qualification').value = offer.qualification;
    if (offer.gender) document.getElementById('gender').value = offer.gender;
    if (offer.responsibilities && Array.isArray(offer.responsibilities)) {
        document.getElementById('responsibilities').value = offer.responsibilities.join('\n');
    }
    if (offer.tags && Array.isArray(offer.tags)) {
        document.getElementById('skills').value = offer.tags.join(', ');
    }
}

// Save offer (create or update)
function saveOffer(user, offerId) {
    var form = document.getElementById('offerForm');
    if (!form) return;

    // Get form values
    var offerData = {
        title: document.getElementById('jobTitle').value,
        jobType: document.getElementById('jobType').value,
        categories: [document.getElementById('category').value],
        urgent: document.getElementById('urgent').checked,
        location: document.getElementById('location').value,
        salary: document.getElementById('salary').value,
        description: document.getElementById('description').value,
        experienceYears: parseInt(document.getElementById('experienceYears').value) || 0,
        careerLevel: document.getElementById('careerLevel').value || '',
        qualification: document.getElementById('qualification').value || '',
        gender: document.getElementById('gender').value || 'Indifférent',
        company: user.companyName || '',
        postedBy: user.email,
        postedDate: new Date().toISOString().split('T')[0],
        type: 'Emploi'
    };

    // Parse responsibilities
    var responsibilitiesText = document.getElementById('responsibilities').value;
    if (responsibilitiesText) {
        offerData.responsibilities = responsibilitiesText.split('\n').filter(function(r) {
            return r.trim() !== '';
        });
    } else {
        offerData.responsibilities = [];
    }

    // Parse skills/tags
    var skillsText = document.getElementById('skills').value;
    if (skillsText) {
        offerData.tags = skillsText.split(',').map(function(s) {
            return s.trim();
        }).filter(function(s) {
            return s !== '';
        });
    } else {
        offerData.tags = [];
    }

    // Get or create recruiter offers array
    var recruiterOffers = [];
    var stored = localStorage.getItem('recruiterOffers');
    if (stored) {
        recruiterOffers = JSON.parse(stored);
    }

    if (offerId) {
        // Update existing offer
        var index = recruiterOffers.findIndex(function(o) {
            return o.id === offerId;
        });
        if (index !== -1) {
            offerData.id = offerId;
            recruiterOffers[index] = offerData;
        } else {
            alert('Erreur: Offre introuvable.');
            return;
        }
    } else {
        // Create new offer
        offerData.id = Date.now();
        recruiterOffers.push(offerData);
        
        // Also add to main offersData if it exists
        if (window.offersData && Array.isArray(window.offersData)) {
            window.offersData.push(offerData);
        }
    }

    // Save to localStorage
    localStorage.setItem('recruiterOffers', JSON.stringify(recruiterOffers));

    // Show success message
    if (typeof showSuccessPopup === 'function') {
        showSuccessPopup(
            offerId ? 'Offre modifiée!' : 'Offre créée!',
            offerId ? 'Votre offre a été modifiée avec succès.' : 'Votre offre a été publiée avec succès.',
            'Offers.html'
        );
    } else {
        alert(offerId ? 'Offre modifiée avec succès!' : 'Offre créée avec succès!');
        window.location.href = 'Offers.html';
    }
}

// Delete offer
function deleteOffer(offerId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre? Cette action est irréversible.')) {
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

    // Also remove from main offersData if it exists
    if (window.offersData && Array.isArray(window.offersData)) {
        window.offersData = window.offersData.filter(function(o) {
            return o.id !== offerId;
        });
    }

    // Show success message
    if (typeof showSuccessPopup === 'function') {
        showSuccessPopup(
            'Offre supprimée!',
            'L\'offre a été supprimée avec succès.',
            'Offers.html'
        );
    } else {
        alert('Offre supprimée avec succès!');
        window.location.href = 'Offers.html';
    }
}

// Make deleteOffer available globally
window.deleteOffer = deleteOffer;

