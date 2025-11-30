// Simple Popup Function
function showSuccessPopup(title, message, redirectUrl) {
    // Create popup HTML
    var popupHTML = `
        <div class="popup-overlay show" id="successPopup">
            <div class="popup-container">
                <div class="popup-icon">✓</div>
                <h2 class="popup-title">${title}</h2>
                <p class="popup-message">${message}</p>
                <button class="popup-button" onclick="closeSuccessPopup('${redirectUrl}')">Continuer</button>
            </div>
        </div>
    `;
    
    // Remove existing popup if any
    var existingPopup = document.getElementById('successPopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Add popup to body
    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

function closeSuccessPopup(redirectUrl) {
    var popup = document.getElementById('successPopup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(function() {
            popup.remove();
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }, 300);
    }
}

// Close popup when clicking outside
document.addEventListener('click', function(e) {
    var popup = document.getElementById('successPopup');
    if (popup && e.target === popup) {
        closeSuccessPopup();
    }
});

