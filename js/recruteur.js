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

function handleProfilePhotoSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const maxSize = 2 * 1024 * 1024; // 2MB
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        
        if (file.size > maxSize) {
            alert('Le fichier est trop volumineux. Taille maximale: 2MB');
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert('Format de fichier non supporté. Utilisez PNG, JPG, JPEG ou GIF');
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
            alert('Format de fichier non supporté. Utilisez PNG, GIF, JPG ou JPEG');
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
    
    var data = {
        type: 'recruteur',
        companyName: companyRows[0].querySelector('input[placeholder="Nom de l\'entreprise"]').value || '',
        address: companyRows[0].querySelectorAll('input[type="text"]')[1].value || '',
        sector: companyRows[0].querySelector('select').value || '',
        description: companySection.querySelector('textarea').value || '',
        postalCode: companyRows[2].querySelector('input[placeholder="Code postal"]').value || '',
        city: companyRows[2].querySelectorAll('input[type="text"]')[1].value || '',
        country: companyRows[2].querySelector('select').value || '',
        employees: companyRows[3].querySelector('select').value || '',
        website: companyRows[3].querySelector('input[type="url"]').value || '',
        logoFileName: companySection.querySelector('#logoFile').files[0] ? companySection.querySelector('#logoFile').files[0].name : '',
        civilite: contactSection.querySelector('.form-row select').value || '',
        prenom: contactSection.querySelectorAll('input[type="text"]')[0].value || '',
        nom: contactSection.querySelectorAll('input[type="text"]')[1].value || '',
        fonction: contactSection.querySelectorAll('.form-row')[1].querySelector('select').value || '',
        linkedin: contactSection.querySelectorAll('.form-row')[1].querySelector('input[type="url"]').value || '',
        countryCode: contactSection.querySelector('.country-code-select').value || '',
        telephone: contactSection.querySelector('.phone-input').value || '',
        email: credentialsSection.querySelectorAll('input[type="email"]')[0].value || '',
        emailConfirm: credentialsSection.querySelectorAll('input[type="email"]')[1].value || '',
        password: credentialsSection.querySelector('#password').value || '',
        passwordConfirm: credentialsSection.querySelector('#confirmPassword').value || '',
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

// Form submission
document.getElementById('form-recruteur').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var form = e.target;
    
    // Check if passwords match
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas!');
        return;
    }
    
    // Check if emails match
    var emailInputs = form.querySelectorAll('input[type="email"]');
    if (emailInputs.length >= 2) {
        var email = emailInputs[0].value;
        var emailConfirm = emailInputs[1].value;
        if (email !== emailConfirm) {
            alert('Les emails ne correspondent pas!');
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
    
    // Show success popup and redirect
    if (typeof showSuccessPopup === 'function') {
        showSuccessPopup(
            'Inscription réussie!',
            'Votre compte a été créé avec succès. Vous êtes maintenant connecté.',
            'index.html'
        );
    } else {
        alert('Inscription réussie! Vous êtes maintenant connecté.');
        window.location.href = 'index.html';
    }
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
