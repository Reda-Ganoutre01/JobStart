(function(){
    // Resilient login initialization: waits for required globals before wiring handlers.
    function startLogin() {
        // Helpers
        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
        function showError(message) {
            const errorAlert = document.getElementById('errorAlert');
            if (!errorAlert) return;
            const span = errorAlert.querySelector('span');
            if (span) span.textContent = message;
            errorAlert.style.display = 'flex';
            setTimeout(() => { try { errorAlert.style.display = 'none'; } catch(e){} }, 4000);
        }

        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', function(){
                const t = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', t);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        }

        // User type tabs
        const userTypeTabs = document.querySelectorAll('.user-type-tab');
        if (userTypeTabs && userTypeTabs.length) {
            userTypeTabs.forEach(tab => tab.addEventListener('click', function(){
                userTypeTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            }));
        }

        // Form handling
        const loginForm = document.getElementById('loginForm');
        const successAlert = document.getElementById('successAlert');
        const errorAlert = document.getElementById('errorAlert');
        const loginBtn = loginForm ? loginForm.querySelector('.login-btn') : null;

        if (loginForm && loginBtn && successAlert && errorAlert) {
            loginForm.addEventListener('submit', function(e){
                e.preventDefault();
                const email = (document.getElementById('email') || {}).value || '';
                const password = (document.getElementById('password') || {}).value || '';
                const activeTab = document.querySelector('.user-type-tab.active');
                const userType = activeTab ? activeTab.dataset.type : 'candidat';

                successAlert.style.display = 'none';
                errorAlert.style.display = 'none';

                if (!validateEmail(email.trim())) { showError('Veuillez entrer une adresse email valide'); return; }
                if (password.length < 6) { showError('Le mot de passe doit contenir au moins 6 caractères'); return; }

                const original = loginBtn.innerHTML;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
                loginBtn.disabled = true;

                // Look up user in signups; be defensive if window.allSignups isn't present
                let userFound = null;
                if (Array.isArray(window.allSignups)) {
                    for (let i=0;i<window.allSignups.length;i++){
                        const u = window.allSignups[i];
                        if (u && u.email === email.trim() && u.password === password && u.type === userType) { userFound = u; break; }
                    }
                }

                if (userFound) {
                    if (typeof createSession === 'function') {
                        try { createSession(userFound); } catch(e){ console.warn('createSession failed', e); }
                    }
                    try {
                        const remember = document.getElementById('remember');
                        if (remember && remember.checked) localStorage.setItem('rememberedEmail', email.trim()); else localStorage.removeItem('rememberedEmail');
                    } catch(e){ console.warn('remember handling', e); }

                    successAlert.style.display = 'flex';
                    setTimeout(()=> window.location.href = 'index.html', 800);
                    return;
                }

                // Not found
                showError('Email ou mot de passe incorrect');
                loginBtn.innerHTML = original;
                loginBtn.disabled = false;
            });
        }

        // Social buttons
        document.querySelectorAll('.social-btn').forEach(b => b.addEventListener('click', function(){
            const provider = this.classList.contains('google') ? 'Google' : 'LinkedIn';
            alert('Connexion avec ' + provider + ' en développement...');
        }));

        // Remember me restore
        try {
            const remembered = localStorage.getItem('rememberedEmail');
            if (remembered) {
                const emailEl = document.getElementById('email');
                const rememberEl = document.getElementById('remember');
                if (emailEl) emailEl.value = remembered;
                if (rememberEl) rememberEl.checked = true;
            }
        } catch(e) {}

        // Forgot password
        const forgot = document.querySelector('.forgot-password');
        if (forgot) {
            forgot.addEventListener('click', function(e){
                e.preventDefault();
                const email = (document.getElementById('email') || {}).value || '';
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('Veuillez entrer une adresse email valide'); return; }
                if (successAlert && successAlert.querySelector('span')) successAlert.querySelector('span').textContent = `Email de réinitialisation envoyé à ${email}`;
                if (successAlert) { successAlert.style.display = 'flex'; setTimeout(()=> successAlert.style.display='none', 3000); }
            });
        }
    }

    // Wait for important globals (forms data or session helper) before starting
    function waitForGlobals(timeoutMs = 3000) {
        const start = Date.now();
        return new Promise(resolve => {
            (function poll(){
                if (Array.isArray(window.allSignups) || typeof createSession === 'function') return resolve(true);
                if (Date.now() - start > timeoutMs) return resolve(false);
                setTimeout(poll, 100);
            })();
        });
    }

    function init() {
        waitForGlobals(3000).then(ok => {
            if (!ok) console.warn('login.js: globals not present within timeout — continuing defensively');
            startLogin();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

})();
