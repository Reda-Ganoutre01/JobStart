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

// Flag to prevent multiple simultaneous updates
var isUpdatingHeader = false;

// Function to update header based on login status
function updateHeader() {
    if (isUpdatingHeader) {
        return; // Already updating
    }
    isUpdatingHeader = true;
    
    var headerBtns = document.querySelector('.header-btns');
    var mobileActions = document.querySelectorAll('.mobile-action');
    var navLinks = document.querySelector('#nav-links');
    
    if (!navLinks) {
        isUpdatingHeader = false;
        return; // Header not found
    }
    
    var user = getSession();
    
    // Remove any existing profile elements first to prevent duplicates
    var existingProfile = document.querySelector('.user-profile');
    if (existingProfile) {
        existingProfile.remove();
    }
    
    var existingProfilePic = document.querySelector('.user-profile-picture');
    if (existingProfilePic) {
        existingProfilePic.remove();
    }
    
    var existingMobileProfile = document.querySelector('.mobile-profile');
    if (existingMobileProfile) {
        existingMobileProfile.remove();
    }
    
    // Remove any existing dropdowns (but keep the one we're about to create/update)
    var existingDropdowns = document.querySelectorAll('.profile-dropdown');
    for (var d = 0; d < existingDropdowns.length; d++) {
        var existingDropdown = existingDropdowns[d];
        // Only remove if it's not the current one we're managing
        if (existingDropdown.id !== 'user-profile-dropdown') {
            existingDropdown.remove();
        }
    }
    
    // Remove any standalone logout buttons (not in dropdowns or mobile profiles)
    // But be careful not to remove buttons that are part of the dropdown we're about to create
    var allButtons = document.querySelectorAll('header button');
    for (var b = 0; b < allButtons.length; b++) {
        var btn = allButtons[b];
        var btnText = btn.textContent ? btn.textContent.trim() : '';
        // Skip theme switch and dropdown menu buttons
        if (btn.id === 'theme-switch' || btn.classList.contains('dropdown-menu')) {
            continue;
        }
        if (btnText === 'Se déconnecter') {
            // Check if it's not inside a dropdown or mobile profile
            var inDropdown = btn.closest('.profile-dropdown');
            var inMobileProfile = btn.closest('.mobile-profile');
            if (!inDropdown && !inMobileProfile) {
                // Also check if it's a direct child of header-btns (shouldn't be there when logged in)
                var inHeaderBtns = btn.closest('.header-btns');
                if (inHeaderBtns) {
                    inHeaderBtns.style.display = 'none';
                }
                btn.remove();
            }
        }
    }
    
    // Reset logo click handler - try multiple selectors to find the logo
    var logoLink = document.querySelector('header a[href="index.html"]') || 
                    document.querySelector('header a[href="./index.html"]') ||
                    document.querySelector('header .container > a') ||
                    document.querySelector('header a img')?.parentElement;
    
    if (logoLink) {
        logoLink.onclick = null;
        logoLink.removeAttribute('onclick');
    }
    
    if (user && isLoggedIn()) {
        // Hide login/signup buttons if they exist
        if (headerBtns) {
            headerBtns.style.display = 'none';
            headerBtns.style.visibility = 'hidden';
        }
        
        // Hide mobile login/signup links if they exist
        for (var i = 0; i < mobileActions.length; i++) {
            mobileActions[i].style.display = 'none';
            mobileActions[i].style.visibility = 'hidden';
        }
        
        // Create profile picture element with dropdown
        var nav = document.querySelector('header nav');
        if (nav) {
            // Remove existing profile picture if it exists
            var existingProfilePic = document.querySelector('.user-profile-picture');
            if (existingProfilePic) {
                existingProfilePic.remove();
            }
            
            // Create profile picture container
            var profileContainer = document.createElement('div');
            profileContainer.className = 'user-profile-picture';
            profileContainer.style.cssText = 'position: relative; display: flex; align-items: center; cursor: pointer; margin-left: 15px;';
            
            // Create profile picture image
            var profileImg = document.createElement('img');
            var profilePhotoSrc = user.profilePhoto || 'assets/logo/logo_jobstart_single.png';
            profileImg.src = profilePhotoSrc;
            profileImg.alt = (user.prenom || user.companyName || 'User') + ' Profile';
            profileImg.style.cssText = 'width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color, #3b82f6); transition: opacity 0.2s, transform 0.2s;';
            
            profileContainer.appendChild(profileImg);
            
            // Create dropdown menu
            var dropdown = document.createElement('div');
            dropdown.className = 'profile-dropdown';
            dropdown.id = 'user-profile-dropdown';
            dropdown.style.cssText = 'display: none; position: absolute; top: calc(100% + 10px); right: 0; background: var(--card-bg, #ffffff); border: 1px solid var(--border-color, #e0e0e0); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 12px; margin-top: 5px; min-width: 200px; z-index: 10000;';
            
            // Add user info to dropdown
            var userInfo = document.createElement('div');
            userInfo.style.cssText = 'padding: 8px 0; border-bottom: 1px solid var(--border-color, #e0e0e0); margin-bottom: 10px;';
            var userName = document.createElement('div');
            userName.textContent = user.prenom || user.companyName || 'User';
            userName.style.cssText = 'color: var(--text-color, #333); font-weight: 600; font-size: 15px; margin-bottom: 4px;';
            var userEmail = document.createElement('div');
            userEmail.textContent = user.email || '';
            userEmail.style.cssText = 'color: var(--text-color, #666); font-size: 13px; opacity: 0.8;';
            userInfo.appendChild(userName);
            userInfo.appendChild(userEmail);
            dropdown.appendChild(userInfo);
            
            // Add profile link
            var profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.textContent = 'Mon Profil';
            profileLink.style.cssText = 'display: block; padding: 10px; color: var(--text-color, #333); text-decoration: none; border-radius: 6px; margin-bottom: 8px; transition: background 0.2s; text-align: center; font-weight: 500; cursor: pointer;';
            profileLink.onmouseover = function() {
                this.style.background = 'var(--base-variant, #f0f0f0)';
            };
            profileLink.onmouseout = function() {
                this.style.background = 'transparent';
            };
            profileLink.onclick = function(e) {
                e.stopPropagation();
                // Close dropdown before navigation
                dropdown.style.display = 'none';
                isDropdownOpen = false;
                profileImg.style.opacity = '1';
                profileImg.style.transform = 'scale(1)';
                // Allow default navigation
            };
            dropdown.appendChild(profileLink);
            
            var logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Se déconnecter';
            logoutBtn.style.cssText = 'width: 100%; padding: 10px; background: var(--primary-color, #3b82f6); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; transition: background 0.2s;';
            logoutBtn.onmouseover = function() {
                this.style.background = 'var(--primary-color-dark, #2563eb)';
            };
            logoutBtn.onmouseout = function() {
                this.style.background = 'var(--primary-color, #3b82f6)';
            };
            logoutBtn.onclick = function(e) {
                e.stopPropagation();
                logout();
            };
            
            dropdown.appendChild(logoutBtn);
            profileContainer.appendChild(dropdown);
            
            // Insert profile picture after theme switch or at the end of nav
            var themeSwitch = document.querySelector('#theme-switch');
            if (themeSwitch && themeSwitch.parentNode && themeSwitch.nextSibling) {
                themeSwitch.parentNode.insertBefore(profileContainer, themeSwitch.nextSibling);
            } else if (themeSwitch && themeSwitch.parentNode) {
                themeSwitch.parentNode.appendChild(profileContainer);
            } else {
                nav.appendChild(profileContainer);
            }
            
            // Show dropdown on profile picture click
            var isDropdownOpen = false;
            
            var toggleDropdown = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!isDropdownOpen) {
                    dropdown.style.display = 'block';
                    isDropdownOpen = true;
                    profileImg.style.opacity = '0.8';
                    profileImg.style.transform = 'scale(0.95)';
                } else {
                    dropdown.style.display = 'none';
                    isDropdownOpen = false;
                    profileImg.style.opacity = '1';
                    profileImg.style.transform = 'scale(1)';
                }
            };
            
            // Only toggle dropdown when clicking the profile image, not the dropdown content
            profileImg.onclick = toggleDropdown;
            profileContainer.onclick = function(e) {
                // Only toggle if clicking the container itself, not children
                if (e.target === profileContainer || e.target === profileImg) {
                    toggleDropdown(e);
                }
            };
            
            // Prevent dropdown from closing when clicking inside it
            dropdown.onclick = function(e) {
                e.stopPropagation();
            };
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (isDropdownOpen && !profileContainer.contains(e.target)) {
                    dropdown.style.display = 'none';
                    isDropdownOpen = false;
                    profileImg.style.opacity = '1';
                    profileImg.style.transform = 'scale(1)';
                }
            });
            
            // Hover effect
            profileContainer.onmouseenter = function() {
                if (!isDropdownOpen) {
                    profileImg.style.opacity = '0.9';
                }
            };
            profileContainer.onmouseleave = function() {
                if (!isDropdownOpen) {
                    profileImg.style.opacity = '1';
                    profileImg.style.transform = 'scale(1)';
                }
            };
            
            // Close dropdown when clicking outside
            var closeDropdownHandler = function(e) {
                if (isDropdownOpen && !profileContainer.contains(e.target)) {
                    dropdown.style.display = 'none';
                    isDropdownOpen = false;
                    profileImg.style.opacity = '1';
                    profileImg.style.transform = 'scale(1)';
                }
            };
            
            // Use capture phase to ensure we catch the click
            document.addEventListener('click', closeDropdownHandler, true);
        }
        
        // Add mobile logout in nav links (only visible on mobile, hidden on desktop)
        var mobileLogoutItem = document.createElement('li');
        mobileLogoutItem.className = 'mobile-profile';
        // Hide on desktop, show only on mobile screens
        if (window.innerWidth > 768) {
            mobileLogoutItem.style.cssText = 'padding: 10px; display: none !important;';
        } else {
            mobileLogoutItem.style.cssText = 'padding: 10px; display: block;';
        }
        
        var mobileLogout = document.createElement('button');
        mobileLogout.textContent = 'Se déconnecter';
        mobileLogout.style.cssText = 'width: 100%; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;';
        mobileLogout.onclick = logout;
        
        mobileLogoutItem.appendChild(mobileLogout);
        navLinks.appendChild(mobileLogoutItem);
        
        // Update on resize to show/hide mobile logout
        var resizeHandler = function() {
            if (window.innerWidth <= 768) {
                mobileLogoutItem.style.display = 'block';
            } else {
                mobileLogoutItem.style.display = 'none';
            }
        };
        window.addEventListener('resize', resizeHandler);
        
    } else {
        // Show login/signup buttons if they exist
        if (headerBtns) {
            headerBtns.style.display = 'flex';
            headerBtns.style.visibility = 'visible';
        }
        
        // Show mobile login/signup links if they exist
        for (var i = 0; i < mobileActions.length; i++) {
            mobileActions[i].style.display = 'block';
            mobileActions[i].style.visibility = 'visible';
        }
        
        // Remove any dropdowns
        var existingDropdown = document.querySelector('.profile-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        
        // Remove profile picture
        var existingProfilePic = document.querySelector('.user-profile-picture');
        if (existingProfilePic) {
            existingProfilePic.remove();
        }
        
        // Reset logo click handler
        if (logoLink) {
            logoLink.onclick = null;
            logoLink.removeAttribute('onclick');
        }
    }
    
    isUpdatingHeader = false;
}

// Run header update when page loads
function initHeader() {
    // Wait a bit to ensure DOM is fully ready
    setTimeout(function() {
        updateHeader();
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
} else {
    initHeader();
}

// Also update header when page becomes visible (in case of navigation)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(updateHeader, 100);
    }
});

