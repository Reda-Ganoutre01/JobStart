const cvUpload = document.getElementById('cvUpload');
const cvFile = document.getElementById('cvFile');
const cvFilename = document.getElementById('cvFilename');
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

cvUpload.addEventListener('click', () => {
    cvFile.click();
});

cvUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    cvUpload.classList.add('dragover');
});

cvUpload.addEventListener('dragleave', () => {
    cvUpload.classList.remove('dragover');
});

cvUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    cvUpload.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    handleFile(file);
}

function handleFile(file) {
    if (file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (file.size > maxSize) {
            alert('Le fichier est trop volumineux. Taille maximale: 5MB');
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert('Format de fichier non supporté. Utilisez PDF, DOC ou DOCX');
            return;
        }
        
        cvFilename.textContent = `✓ Fichier sélectionné: ${file.name}`;
        cvFilename.style.color = '#28a745';
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-lock');
        toggleIcon.classList.add('fa-unlock');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-unlock');
        toggleIcon.classList.add('fa-lock');
    }
}

function toggleConfirmPassword() {
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toggleIcon = document.getElementById('toggleConfirmPassword');
    
    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        toggleIcon.classList.remove('fa-lock');
        toggleIcon.classList.add('fa-unlock');
    } else {
        confirmPasswordInput.type = 'password';
        toggleIcon.classList.remove('fa-unlock');
        toggleIcon.classList.add('fa-lock');
    }
}

// Function to collect candidate form data
function collectCandidatData(form) {
    var rows = form.querySelectorAll('.form-row');
    var firstRow = rows[0];
    var secondRow = rows[1];
    var thirdRow = rows[2];
    
    // Get profile photo as base64
    var profilePhotoData = '';
    var profilePhotoFile = form.querySelector('#profilePhoto');
    if (profilePhotoFile && profilePhotoFile.files[0]) {
        // Convert to base64 for storage
        var reader = new FileReader();
        reader.readAsDataURL(profilePhotoFile.files[0]);
        reader.onload = function() {
            profilePhotoData = reader.result;
        };
    }
    
    var data = {
        type: 'candidat',
        civilite: firstRow.querySelector('select').value || '',
        prenom: firstRow.querySelectorAll('input[type="text"]')[0].value || '',
        nom: firstRow.querySelectorAll('input[type="text"]')[1].value || '',
        countryCode: firstRow.querySelector('.country-code-select').value || '',
        telephone: firstRow.querySelector('.phone-input').value || '',
        email: secondRow.querySelectorAll('input[type="email"]')[0].value || '',
        emailConfirm: secondRow.querySelectorAll('input[type="email"]')[1].value || '',
        password: thirdRow.querySelector('#password').value || '',
        passwordConfirm: thirdRow.querySelector('#confirmPassword').value || '',
        cvFileName: form.querySelector('#cvFile').files[0] ? form.querySelector('#cvFile').files[0].name : '',
        profilePhoto: profilePhotoImg ? profilePhotoImg.src : ''
    };
    
    return data;
}

// Function to add signup to array
function addSignup(signupData) {
    signupData.id = Date.now();
    signupData.timestamp = new Date().toISOString();
    window.allSignups.push(signupData);
    console.log('New signup added! Total signups:', window.allSignups.length);
}

document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var form = e.target;
    
    // Check if emails match
    var email = form.querySelectorAll('input[type="email"]')[0].value;
    var emailConfirm = form.querySelectorAll('input[type="email"]')[1].value;
    if (email !== emailConfirm) {
        alert('Les emails ne correspondent pas!');
        return;
    }
    
    // Check if passwords match
    var password = form.querySelector('#password').value;
    var passwordConfirm = form.querySelector('#confirmPassword').value;
    if (password !== passwordConfirm) {
        alert('Les mots de passe ne correspondent pas!');
        return;
    }
    
    // Collect form data
    var formData = collectCandidatData(form);
    
    // Get profile photo (already collected in collectCandidatData if preview exists)
    // Add to array
    addSignup(formData);
    
    // Create session
    if (typeof createSession === 'function') {
        createSession(formData);
    }
    
    // Show success message and redirect
    alert('Inscription réussie! Vous êtes maintenant connecté.');
    window.location.href = 'index.html';
});
