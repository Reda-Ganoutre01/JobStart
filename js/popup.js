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
    // Ensure overlay fills viewport and centers children even if CSS isn't loaded
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.background = 'rgba(0,0,0,0.5)';
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
    // Append popup inside the overlay so the overlay's flex centering positions it
    // Also set explicit inline styles on the popup to avoid layout overrides
    popup.style.maxWidth = '400px';
    popup.style.width = '90%';
    popup.style.boxSizing = 'border-box';
    popup.style.margin = '0 auto';
    popup.style.position = 'relative';
    overlay.appendChild(popup);

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

function showAlertPopup(title, message, type = 'info') {
    // Remove any existing popups first
    var existingOverlay = document.getElementById('popup-overlay');
    var existingPopup = document.getElementById('alert-popup');
    if (existingOverlay) document.body.removeChild(existingOverlay);
    if (existingPopup) document.body.removeChild(existingPopup);

    // Create overlay
    var overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.className = 'popup-overlay';
    overlay.style.zIndex = '20002'; // Higher than loader
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    document.body.appendChild(overlay);

    // Create popup container
    var popup = document.createElement('div');
    popup.id = 'alert-popup';
    popup.className = `alert-popup alert-${type}`;
    popup.style.zIndex = '20003';
    popup.innerHTML = `
        <div class="popup-icon">
            <i class="fas ${type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
        </div>
        <h2 class="popup-title">${title}</h2>
        <p class="popup-message">${message}</p>
        <button class="popup-button" id="popup-close-btn">OK</button>
    `;
    popup.style.maxWidth = '400px';
    popup.style.width = '90%';
    popup.style.boxSizing = 'border-box';
    popup.style.margin = '0 auto';
    popup.style.position = 'relative';
    overlay.appendChild(popup);

    // Show popup with animation
    setTimeout(function() {
        overlay.classList.add('show');
        popup.classList.add('show');
    }, 100);

    // Handle close button click
    var closeBtn = document.getElementById('popup-close-btn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeAlertPopup();
        };
    }

    // Close on overlay click
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            closeAlertPopup();
        }
    };
}

function closeAlertPopup() {
    var overlay = document.getElementById('popup-overlay');
    var popup = document.getElementById('alert-popup');

    if (overlay && popup) {
        overlay.classList.remove('show');
        popup.classList.remove('show');

        // Remove elements after animation
        setTimeout(function() {
            if (popup.parentNode) popup.parentNode.removeChild(popup);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
    }
}

// Make functions available globally
window.showSuccessPopup = showSuccessPopup;
window.closeSuccessPopup = closeSuccessPopup;
window.showAlertPopup = showAlertPopup;
window.closeAlertPopup = closeAlertPopup;

