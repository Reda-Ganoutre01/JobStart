const logoUpload = document.getElementById('logoUpload');
const logoFile = document.getElementById('logoFile');

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

// Form submission
document.getElementById('companyRegistrationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas!');
        return;
    }
    
    alert('Formulaire soumis avec succès!');
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
