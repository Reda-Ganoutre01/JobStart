// Simple Popup Function
function showSuccessPopup(title, message, redirectUrl) {
    // Remove any existing popups first
    var existingOverlay = document.getElementById('popup-overlay');
    var existingPopup = document.getElementById('success-popup');
    if (existingOverlay) document.body.removeChild(existingOverlay);
    if (existingPopup) document.body.removeChild(existingPopup);

    // Create overlay
    var overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.className = 'popup-overlay';
    overlay.style.zIndex = '20002'; // Higher than loader
    document.body.appendChild(overlay);

    // Create popup container
    var popup = document.createElement('div');
    popup.id = 'success-popup';
    popup.className = 'success-popup';
    popup.style.zIndex = '20003'; // Even higher
    popup.innerHTML = `
        <div class="popup-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <h2 class="popup-title">${title}</h2>
        <p class="popup-message">${message}</p>
        <button class="popup-button" id="popup-continue-btn">Continuer</button>
    `;
    document.body.appendChild(popup);

    // Show popup with animation
    setTimeout(function() {
        overlay.classList.add('show');
        popup.classList.add('show');
        console.log('Popup should now be visible');
    }, 100);

    // Handle continue button click
    var continueBtn = document.getElementById('popup-continue-btn');
    if (continueBtn) {
        continueBtn.onclick = function() {
            closeSuccessPopup(redirectUrl);
        };
    }

    // Close on overlay click
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            closeSuccessPopup(redirectUrl);
        }
    };
}

function closeSuccessPopup(redirectUrl) {
    var overlay = document.getElementById('popup-overlay');
    var popup = document.getElementById('success-popup');

    if (overlay && popup) {
        overlay.classList.remove('show');
        popup.classList.remove('show');

        // Remove elements after animation
        setTimeout(function() {
            if (popup.parentNode) popup.parentNode.removeChild(popup);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }, 300);
    } else if (redirectUrl) {
        window.location.href = redirectUrl;
    }
}

// Make functions available globally
window.showSuccessPopup = showSuccessPopup;
window.closeSuccessPopup = closeSuccessPopup;

