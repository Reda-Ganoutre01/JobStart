// Session Management System

// Function to create a session when user signs up
function createSession(userData) {
    // Store user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    console.log('Session created for user:', userData.email);
}

// Function to get current session
function getSession() {
    var isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        var userData = localStorage.getItem('currentUser');
        if (userData) {
            return JSON.parse(userData);
        }
    }
    return null;
}

// Function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Function to logout
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    console.log('User logged out');
    // Redirect to home page
    window.location.href = 'index.html';
}

// Function to update header based on login status
function updateHeader() {
    var headerBtns = document.querySelector('.header-btns');
    var mobileActions = document.querySelectorAll('.mobile-action');
    var navLinks = document.querySelector('#nav-links');
    
    if (!headerBtns || !navLinks) {
        return; // Header not found
    }
    
    var user = getSession();
    
    if (user && isLoggedIn()) {
        // Hide login/signup buttons
        headerBtns.style.display = 'none';
        
        // Hide mobile login/signup links
        for (var i = 0; i < mobileActions.length; i++) {
            mobileActions[i].style.display = 'none';
        }
        
        // Create profile picture element
        var profileContainer = document.createElement('div');
        profileContainer.className = 'user-profile';
        profileContainer.style.cssText = 'display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative;';
        
        var profileImg = document.createElement('img');
        profileImg.src = user.profilePhoto || 'assets/logo/logo_jobstart_single.png';
        profileImg.alt = user.prenom + ' ' + user.nom;
        profileImg.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);';
        
        var userName = document.createElement('span');
        userName.textContent = user.prenom || user.companyName || 'User';
        userName.style.cssText = 'color: var(--text-color); font-weight: 500; white-space: nowrap;';
        
        profileContainer.appendChild(profileImg);
        profileContainer.appendChild(userName);
        
        // Create dropdown menu
        var dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.style.cssText = 'display: none; position: absolute; top: 100%; right: 0; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 10px; margin-top: 10px; min-width: 150px; z-index: 1000;';
        
        var logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Se déconnecter';
        logoutBtn.style.cssText = 'width: 100%; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 500;';
        logoutBtn.onclick = logout;
        
        dropdown.appendChild(logoutBtn);
        profileContainer.appendChild(dropdown);
        
        // Show dropdown on click
        profileContainer.onclick = function(e) {
            e.stopPropagation();
            if (dropdown.style.display === 'none') {
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        };
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileContainer.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
        
        // Insert profile container before theme switch
        var themeSwitch = document.querySelector('#theme-switch');
        if (themeSwitch && themeSwitch.parentNode) {
            themeSwitch.parentNode.insertBefore(profileContainer, themeSwitch);
        } else {
            navLinks.parentNode.appendChild(profileContainer);
        }
        
        // Add mobile profile in nav links
        var mobileProfile = document.createElement('li');
        mobileProfile.className = 'mobile-profile';
        mobileProfile.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px;';
        
        var mobileImg = document.createElement('img');
        mobileImg.src = user.profilePhoto || 'assets/logo/logo_jobstart_single.png';
        mobileImg.alt = user.prenom + ' ' + user.nom;
        mobileImg.style.cssText = 'width: 35px; height: 35px; border-radius: 50%; object-fit: cover;';
        
        var mobileName = document.createElement('span');
        mobileName.textContent = user.prenom || user.companyName || 'User';
        mobileName.style.cssText = 'color: var(--text-color);';
        
        var mobileLogout = document.createElement('button');
        mobileLogout.textContent = 'Se déconnecter';
        mobileLogout.style.cssText = 'margin-top: 10px; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;';
        mobileLogout.onclick = logout;
        
        mobileProfile.appendChild(mobileImg);
        mobileProfile.appendChild(mobileName);
        mobileProfile.appendChild(mobileLogout);
        
        navLinks.appendChild(mobileProfile);
        
    } else {
        // Show login/signup buttons
        headerBtns.style.display = 'flex';
        
        // Show mobile login/signup links
        for (var i = 0; i < mobileActions.length; i++) {
            mobileActions[i].style.display = 'block';
        }
        
        // Remove profile if exists
        var existingProfile = document.querySelector('.user-profile');
        if (existingProfile) {
            existingProfile.remove();
        }
        
        var existingMobileProfile = document.querySelector('.mobile-profile');
        if (existingMobileProfile) {
            existingMobileProfile.remove();
        }
    }
}

// Run header update when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateHeader);
} else {
    updateHeader();
}

