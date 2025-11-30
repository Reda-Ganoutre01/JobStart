// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const profile = document.querySelector('input[name="profile"]:checked');
            
            if (!profile) {
                if (typeof showAlertPopup === 'function') {
                    showAlertPopup('Erreur', 'Veuillez choisir votre profil', 'error');
                } else {
                    alert('Veuillez choisir votre profil');
                }
                return;
            }

            if (typeof showSuccessPopup === 'function') {
                showSuccessPopup('Succès', 'Message envoyé avec succès!');
            } else if (typeof showAlertPopup === 'function') {
                showAlertPopup('Succès', 'Message envoyé avec succès!', 'success');
            } else {
                alert('Message envoyé avec succès!');
            }
            // Reset form if needed
            // contactForm.reset();
        });
    }

    // Phone input formatting
    const phoneInput = document.querySelector('.phone-input');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3 && value.length <= 6) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            } else if (value.length > 6) {
                value = value.slice(0, 3) + '-' + value.slice(3, 9);
            }
            e.target.value = value;
        });
    }
});
