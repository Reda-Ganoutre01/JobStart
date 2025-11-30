 // Password Toggle
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });

        // User Type Tabs
        const userTypeTabs = document.querySelectorAll('.user-type-tab');
        
        userTypeTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                userTypeTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Form Submission
        const loginForm = document.getElementById('loginForm');
        const successAlert = document.getElementById('successAlert');
        const errorAlert = document.getElementById('errorAlert');
        const loginBtn = loginForm.querySelector('.login-btn');

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const userType = document.querySelector('.user-type-tab.active').dataset.type;

            // Hide alerts
            successAlert.style.display = 'none';
            errorAlert.style.display = 'none';

            // Validate
            if (!validateEmail(email)) {
                showError('Veuillez entrer une adresse email valide');
                return;
            }

            if (password.length < 6) {
                showError('Le mot de passe doit contenir au moins 6 caractères');
                return;
            }

            // Show loading
            const originalContent = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
            loginBtn.disabled = true;

            // Check if user exists in signups array
            var userFound = null;
            if (window.allSignups && window.allSignups.length > 0) {
                for (var i = 0; i < window.allSignups.length; i++) {
                    var user = window.allSignups[i];
                    if (user.email === email && user.password === password && user.type === userType) {
                        userFound = user;
                        break;
                    }
                }
            }
            
            if (userFound) {
                // Create session
                if (typeof createSession === 'function') {
                    createSession(userFound);
                }
                
                successAlert.style.display = 'flex';
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                // Show error
                showError('Email ou mot de passe incorrect');
                loginBtn.innerHTML = originalContent;
                loginBtn.disabled = false;
            }
        });

        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function showError(message) {
            errorAlert.querySelector('span').textContent = message;
            errorAlert.style.display = 'flex';
            setTimeout(() => errorAlert.style.display = 'none', 4000);
        }

        // Social Login
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const provider = this.classList.contains('google') ? 'Google' : 'LinkedIn';
                const msg = `Connexion avec ${provider} en développement...`;
                if (typeof showAlertPopup === 'function') {
                    showAlertPopup('Information', msg, 'info');
                } else {
                    alert(msg);
                }
            });
        });

        // Remember Me
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            document.getElementById('email').value = rememberedEmail;
            document.getElementById('remember').checked = true;
        }

        // Forgot Password
        document.querySelector('.forgot-password').addEventListener('click', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            
            if (!email || !validateEmail(email)) {
                showError('Veuillez entrer une adresse email valide');
                return;
            }
            
            successAlert.querySelector('span').textContent = `Email de réinitialisation envoyé à ${email}`;
            successAlert.style.display = 'flex';
            setTimeout(() => successAlert.style.display = 'none', 4000);
        });