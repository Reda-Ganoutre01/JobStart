const cvUpload = document.getElementById('cvUpload');
const cvFile = document.getElementById('cvFile');
const cvFilename = document.getElementById('cvFilename');

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

document.getElementById('registrationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Formulaire soumis avec succès!');
});
