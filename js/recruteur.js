const logoUpload = document.getElementById('logoUpload');
const logoFile = document.getElementById('logoFile');
const profilePhotoUpload = document.getElementById('profilePhotoUpload');
const profilePhoto = document.getElementById('profilePhoto');
const profilePhotoPreview = document.getElementById('profilePhotoPreview');
const profilePhotoImg = document.getElementById('profilePhotoImg');

// Profile photo upload
if (profilePhotoUpload) {
    profilePhotoUpload.addEventListener('click', function() {
        profilePhoto.click();
    });
}

// Popup wrapper: prefer the site's custom popup when available
function showPopupMessage(title, message, redirectUrl) {
    if (typeof window.showSuccessPopup === 'function') {
        window.showSuccessPopup(title, message, redirectUrl);
    } else {
        // Fallback to native alert if the popup script isn't available yet
        alert((title ? title + "\n\n" : "") + message);
        if (redirectUrl) window.location.href = redirectUrl;
    }
}

function handleProfilePhotoSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const maxSize = 2 * 1024 * 1024; // 2MB
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        
        if (file.size > maxSize) {
            showPopupMessage('Erreur', 'Le fichier est trop volumineux. Taille maximale: 2MB');
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            showPopupMessage('Erreur', 'Format de fichier non supporté. Utilisez PNG, JPG, JPEG ou GIF');
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            profilePhotoImg.src = e.target.result;
            profilePhotoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

logoUpload.addEventListener('click', () => {
    logoFile.click();
});

logoFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const allowedTypes = ['image/png', 'image/gif', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            showPopupMessage('Erreur', 'Format de fichier non supporté. Utilisez PNG, GIF, JPG ou JPEG');
            return;
        }
        logoUpload.innerHTML = `
            <div class="logo-upload-icon">
                <i class="fas fa-check-circle" style="color: #28a745;"></i>
            </div>
            <div>
                <strong>✓ Logo sélectionné: ${file.name}</strong>
            </div>
        `;
    }
});

// Password toggle
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
    confirmPasswordInput.type = type;
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Function to collect recruiter form data
function collectRecruteurData(form) {
    var sections = form.querySelectorAll('.form-section');
    var companySection = sections[0];
    var contactSection = sections[1];
    var credentialsSection = sections[2];
    var companyRows = companySection.querySelectorAll('.form-row');
    
    // Helper function to safely get value
    function getValue(element, defaultValue) {
        return element && element.value ? element.value : (defaultValue || '');
    }
    
    var data = {
        type: 'recruteur',
        companyName: getValue(companyRows[0]?.querySelector('input[placeholder="Nom de l\'entreprise"]')),
        address: getValue(companyRows[0]?.querySelectorAll('input[type="text"]')[1]),
        sector: getValue(companyRows[0]?.querySelector('select')),
        description: getValue(companySection?.querySelector('textarea')),
        postalCode: getValue(companyRows[1]?.querySelector('input[placeholder="Code postal"]')),
        city: getValue(companyRows[1]?.querySelectorAll('input[type="text"]')[1]),
        country: getValue(companyRows[1]?.querySelector('select')),
        employees: getValue(companyRows[2]?.querySelector('select')),
        website: getValue(companyRows[2]?.querySelector('input[type="url"]')),
        logoFileName: companySection?.querySelector('#logoFile')?.files[0] ? companySection.querySelector('#logoFile').files[0].name : '',
        civilite: getValue(contactSection?.querySelector('.form-row select')),
        prenom: getValue(contactSection?.querySelectorAll('input[type="text"]')[0]),
        nom: getValue(contactSection?.querySelectorAll('input[type="text"]')[1]),
        fonction: getValue(contactSection?.querySelectorAll('.form-row')[1]?.querySelector('select')),
        linkedin: getValue(contactSection?.querySelectorAll('.form-row')[1]?.querySelector('input[type="url"]')),
        countryCode: getValue(contactSection?.querySelector('.country-code-select')),
        telephone: getValue(contactSection?.querySelector('.phone-input')),
        email: getValue(credentialsSection?.querySelectorAll('input[type="email"]')[0]),
        emailConfirm: getValue(credentialsSection?.querySelectorAll('input[type="email"]')[1]),
        password: getValue(credentialsSection?.querySelector('#password')),
        passwordConfirm: getValue(credentialsSection?.querySelector('#confirmPassword')),
        profilePhoto: profilePhotoImg ? profilePhotoImg.src : ''
    };
    
    return data;
}

// Function to add signup to array
function addSignup(signupData) {
    // Initialize array if it doesn't exist
    if (!window.allSignups) {
        window.allSignups = [];
    }
    
    signupData.id = Date.now();
    signupData.timestamp = new Date().toISOString();
    window.allSignups.push(signupData);
    
    // Save to localStorage
    if (typeof saveSignupsToStorage === 'function') {
        saveSignupsToStorage();
    } else {
        localStorage.setItem('allSignups', JSON.stringify(window.allSignups));
    }
    
    console.log('New signup added! Total signups:', window.allSignups.length);
    console.log('All signups:', window.allSignups);
}

// Form submission - wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('form-recruteur');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if passwords match
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            showPopupMessage('Erreur', 'Les mots de passe ne correspondent pas!');
            return;
        }
        
        // Check if emails match
        var emailInputs = form.querySelectorAll('input[type="email"]');
        if (emailInputs.length >= 2) {
            var email = emailInputs[0].value;
            var emailConfirm = emailInputs[1].value;
            if (email !== emailConfirm) {
                showPopupMessage('Erreur', 'Les emails ne correspondent pas!');
                return;
            }
        }
        
        // Collect form data
        var formData = collectRecruteurData(form);
        
        // Add to array
        addSignup(formData);
        
        // Create session
        if (typeof createSession === 'function') {
            createSession(formData);
        }
        
        // Show success popup and redirect (uses wrapper to prefer custom popup)
        showPopupMessage(
            'Inscription réussie!',
            'Votre compte a été créé avec succès. Vous êtes maintenant connecté.',
            'index.html'
        );
    });
});

// Character counter for company name
const companyNameInput = document.querySelector('input[placeholder="Nom de l\'entreprise"]');
const charCount = document.getElementById('charCount');

if (companyNameInput) {
    companyNameInput.addEventListener('input', (e) => {
        const remaining = 50 - e.target.value.length;
        charCount.textContent = Math.max(0, remaining);
        if (remaining < 0) {
            charCount.style.color = 'var(--primary-color)';
        } else {
            charCount.style.color = 'var(--secondary-text)';
        }
    });
}
