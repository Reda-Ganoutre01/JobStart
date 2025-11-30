window.popularSearches = [
    "Designer",
    "Developer",
    "Web",
    "iOS",
    "PHP",
    "Full Stack",
    "Senior",
    "Engineer"
];

function computePopularFromOffers() {
    try {
        if (!Array.isArray(window.offersData) || window.offersData.length === 0) return;

        // Take the last 9 offers
        const lastNine = window.offersData.slice(-9);

        // Extract the first category of each offer (if available), flatten, dedupe preserving order
        const seen = new Set();
        const categories = [];

        lastNine.forEach(offer => {
            if (!offer) return;
            const cats = Array.isArray(offer.categories) && offer.categories.length ? offer.categories : [];
            // if categories array exists, use each category; otherwise try to fallback to type or title
            if (cats.length) {
                cats.forEach(c => {
                    const key = String(c).trim();
                    if (key && !seen.has(key)) {
                        seen.add(key);
                        categories.push(key);
                    }
                });
            } else if (offer.type) {
                const key = String(offer.type).trim();
                if (key && !seen.has(key)) {
                    seen.add(key);
                    categories.push(key);
                }
            }
        });

        if (categories.length) {
            window.popularSearches = categories.slice(0, 9);
        }
    } catch (e) {
        // keep fallback list on error
        console.error('Error computing popularSearches from offersData', e);
    }
}

// Compute after all deferred scripts run; DOMContentLoaded fires after deferred scripts.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // safe to compute now (offers.js is loaded with defer and appears after this file in the document)
    computePopularFromOffers();
} else {
    document.addEventListener('DOMContentLoaded', computePopularFromOffers);
}

window.typingWords = [
    "emploi",
    "stage",
    "freelance",
    "opportunité",
    "mission",
    "poste junior"
];
window.statData=[
    {
        "id": 1,
        "label":"Offres actives",
        "value":"1250 ",

    },
     {
        "id": 2,
        "label":"Candidats inscrits",
        "value":"5000 ",

    },
     {
        "id": 3,
        "label":"Entreprises",
        "value":"300 ",

    },
]
