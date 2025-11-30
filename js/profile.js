// Profile Page Management

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for loader to start hiding
    setTimeout(function() {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        // Get current user data
        var user = null;
        if (typeof getSession === 'function') {
            user = getSession();
        }

        if (!user) {
            alert('Aucune session active. Veuillez vous connecter.');
            window.location.href = 'login.html';
            return;
        }

        // Load user data into form and display
        loadUserData(user);
        displayUserInfo(user);
        loadJobsSection(user);

        // Handle edit profile button
        var editProfileBtn = document.getElementById('editProfileBtn');
        var infoDisplayCard = document.getElementById('infoDisplayCard');
        var profileForm = document.getElementById('profileForm');
        var cancelEditBtn = document.getElementById('cancelEditBtn');
        var cancelFormBtn = document.getElementById('cancelFormBtn');

        if (editProfileBtn && infoDisplayCard && profileForm) {
            editProfileBtn.addEventListener('click', function() {
                infoDisplayCard.style.display = 'none';
                profileForm.style.display = 'block';
            });
        }

        if (cancelEditBtn && cancelFormBtn) {
            var cancelHandler = function() {
                if (infoDisplayCard) infoDisplayCard.style.display = 'block';
                if (profileForm) profileForm.style.display = 'none';
            };
            cancelEditBtn.addEventListener('click', cancelHandler);
            cancelFormBtn.addEventListener('click', cancelHandler);
        }

        // Handle profile photo upload - update both preview images
        var profilePhotoInputs = document.querySelectorAll('input[type="file"][id="profilePhoto"]');
        var profilePhotoPreview = document.getElementById('profilePhotoPreview');
        var profilePhotoPreviewForm = document.getElementById('profilePhotoPreviewForm');

        // Sync form preview with main avatar
        if (profilePhotoPreview && profilePhotoPreviewForm) {
            profilePhotoPreviewForm.src = profilePhotoPreview.src;
        }

        // Add event listeners to all photo inputs
        profilePhotoInputs.forEach(function(input) {
            input.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        // Update both preview images
                        if (profilePhotoPreview) {
                            profilePhotoPreview.src = e.target.result;
                        }
                        if (profilePhotoPreviewForm) {
                            profilePhotoPreviewForm.src = e.target.result;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        });

        // Handle form submission
        var profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProfileData(user);
            });
        }
    }, 100); // Small delay to ensure loader script has loaded
});

// Load user data into the form
function loadUserData(user) {
    if (!user) return;

    // Show appropriate sections based on user type
    if (user.type === 'candidat') {
        document.getElementById('candidatSection').style.display = 'block';
        document.getElementById('recruteurSection').style.display = 'none';
        document.getElementById('recruteurContactSection').style.display = 'none';
        
        // Load candidate data
        if (user.civilite) setValue('civilite', user.civilite);
        if (user.prenom) setValue('prenom', user.prenom);
        if (user.nom) setValue('nom', user.nom);
        if (user.countryCode) setValue('countryCode', user.countryCode);
        if (user.telephone) setValue('telephone', user.telephone);
    } else if (user.type === 'recruteur') {
        document.getElementById('candidatSection').style.display = 'none';
        document.getElementById('recruteurSection').style.display = 'block';
        document.getElementById('recruteurContactSection').style.display = 'block';
        
        // Load company data
        if (user.companyName) setValue('companyName', user.companyName);
        if (user.sector) setValue('sector', user.sector);
        if (user.employees) setValue('employees', user.employees);
        if (user.address) setValue('address', user.address);
        if (user.postalCode) setValue('postalCode', user.postalCode);
        if (user.city) setValue('city', user.city);
        if (user.country) setValue('country', user.country);
        if (user.website) setValue('website', user.website);
        if (user.description) setValue('description', user.description);
        
        // Load contact person data
        if (user.civilite) setValue('recruteurCivilite', user.civilite);
        if (user.prenom) setValue('recruteurPrenom', user.prenom);
        if (user.nom) setValue('recruteurNom', user.nom);
        if (user.fonction) setValue('fonction', user.fonction);
        if (user.countryCode) setValue('recruteurCountryCode', user.countryCode);
        if (user.telephone) setValue('recruteurTelephone', user.telephone);
        if (user.linkedin) setValue('linkedin', user.linkedin);
    }

    // Load email (common for both)
    if (user.email) setValue('email', user.email);

    // Load profile photo - use actual user photo, not logo
    var profilePhotoPreview = document.getElementById('profilePhotoPreview');
    if (profilePhotoPreview) {
        // Create avatar with user initials as default
        var initials = '';
        var avatarColor = '#1e90ff'; // Default blue
        
        if (user.type === 'candidat' && user.prenom && user.nom) {
            initials = ((user.prenom[0] || '') + (user.nom[0] || '')).toUpperCase();
        } else if (user.type === 'recruteur' && user.companyName) {
            initials = user.companyName.substring(0, 2).toUpperCase();
        } else if (user.email) {
            initials = user.email.substring(0, 2).toUpperCase();
        } else {
            initials = 'U';
        }
        
        // Generate a color based on user email for consistency
        if (user.email) {
            var hash = 0;
            for (var i = 0; i < user.email.length; i++) {
                hash = user.email.charCodeAt(i) + ((hash << 5) - hash);
            }
            var colors = ['#1e90ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda15e', '#bc6c25'];
            avatarColor = colors[Math.abs(hash) % colors.length];
        }
        
        // Create SVG avatar with initials
        var createAvatar = function(color, text) {
            return 'data:image/svg+xml;base64,' + btoa(
                '<svg width="160" height="160" xmlns="http://www.w3.org/2000/svg">' +
                '<rect width="160" height="160" fill="' + color + '" rx="80"/>' +
                '<text x="50%" y="50%" font-size="64" fill="white" text-anchor="middle" dy=".35em" font-family="Arial, sans-serif" font-weight="bold">' + text + '</text>' +
                '</svg>'
            );
        };
        
        // Check if user has a profile photo (base64 or URL, but not logo)
        var hasValidPhoto = user.profilePhoto && 
                           user.profilePhoto.trim() !== '' && 
                           user.profilePhoto !== 'undefined' && 
                           !user.profilePhoto.toLowerCase().includes('logo') &&
                           !user.profilePhoto.includes('logo_jobstart') &&
                           !user.profilePhoto.includes('logo-lightmode') &&
                           !user.profilePhoto.includes('logo-darkmode') &&
                           (user.profilePhoto.startsWith('data:image') || user.profilePhoto.startsWith('http'));
        
        if (hasValidPhoto) {
            profilePhotoPreview.src = user.profilePhoto;
            // Handle image load error - fallback to avatar with initials
            profilePhotoPreview.onerror = function() {
                console.log('Profile photo failed to load, using avatar with initials');
                this.src = createAvatar(avatarColor, initials);
                this.onerror = null; // Prevent infinite loop
            };
            // Handle successful load
            profilePhotoPreview.onload = function() {
                console.log('Profile photo loaded successfully');
            };
        } else {
            // Set avatar with initials if no profile photo
            console.log('No valid profile photo found, using avatar with initials:', initials);
            profilePhotoPreview.src = createAvatar(avatarColor, initials);
        }
    } else {
        console.error('Profile photo preview element not found');
    }

    // Update profile name and email in header
    var profileName = document.getElementById('profileName');
    var profileEmail = document.getElementById('profileEmail');
    
    if (profileName) {
        if (user.type === 'candidat') {
            profileName.textContent = (user.prenom || '') + ' ' + (user.nom || '');
        } else if (user.type === 'recruteur') {
            profileName.textContent = user.companyName || 'Entreprise';
        }
        if (!profileName.textContent.trim()) {
            profileName.textContent = 'Utilisateur';
        }
    }
    
    if (profileEmail) {
        profileEmail.textContent = user.email || '';
    }
}

// Display user information in the info card (Facebook style)
function displayUserInfo(user) {
    if (!user) return;
    
    var infoDisplayContent = document.getElementById('infoDisplayContent');
    if (!infoDisplayContent) return;
    
    var html = '';
    
    if (user.type === 'candidat') {
        html += '<div class="info-item">';
        html += '<i class="fas fa-user"></i>';
        html += '<div class="info-details">';
        html += '<strong>Nom complet</strong>';
        html += '<span>' + (user.civilite || '') + ' ' + (user.prenom || '') + ' ' + (user.nom || '') + '</span>';
        html += '</div></div>';
        
        if (user.telephone) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-phone"></i>';
            html += '<div class="info-details">';
            html += '<strong>Téléphone</strong>';
            html += '<span>+' + (user.countryCode || '') + ' ' + user.telephone + '</span>';
            html += '</div></div>';
        }
        
        if (user.email) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-envelope"></i>';
            html += '<div class="info-details">';
            html += '<strong>Email</strong>';
            html += '<span>' + user.email + '</span>';
            html += '</div></div>';
        }
    } else if (user.type === 'recruteur') {
        if (user.companyName) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-building"></i>';
            html += '<div class="info-details">';
            html += '<strong>Entreprise</strong>';
            html += '<span>' + user.companyName + '</span>';
            html += '</div></div>';
        }
        
        if (user.sector) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-industry"></i>';
            html += '<div class="info-details">';
            html += '<strong>Secteur</strong>';
            html += '<span>' + user.sector + '</span>';
            html += '</div></div>';
        }
        
        if (user.employees) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-users"></i>';
            html += '<div class="info-details">';
            html += '<strong>Nombre d\'employés</strong>';
            html += '<span>' + user.employees + '</span>';
            html += '</div></div>';
        }
        
        if (user.address || user.city) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-map-marker-alt"></i>';
            html += '<div class="info-details">';
            html += '<strong>Adresse</strong>';
            html += '<span>' + (user.address || '') + ', ' + (user.city || '') + ', ' + (user.country || '') + '</span>';
            html += '</div></div>';
        }
        
        if (user.website) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-globe"></i>';
            html += '<div class="info-details">';
            html += '<strong>Site web</strong>';
            html += '<span><a href="' + user.website + '" target="_blank">' + user.website + '</a></span>';
            html += '</div></div>';
        }
        
        if (user.description) {
            html += '<div class="info-item full-width">';
            html += '<i class="fas fa-info-circle"></i>';
            html += '<div class="info-details">';
            html += '<strong>Description</strong>';
            html += '<span>' + user.description + '</span>';
            html += '</div></div>';
        }
        
        if (user.prenom || user.nom) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-user-tie"></i>';
            html += '<div class="info-details">';
            html += '<strong>Contact</strong>';
            html += '<span>' + (user.civilite || '') + ' ' + (user.prenom || '') + ' ' + (user.nom || '') + '</span>';
            html += '</div></div>';
        }
        
        if (user.telephone) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-phone"></i>';
            html += '<div class="info-details">';
            html += '<strong>Téléphone</strong>';
            html += '<span>+' + (user.countryCode || '') + ' ' + user.telephone + '</span>';
            html += '</div></div>';
        }
        
        if (user.email) {
            html += '<div class="info-item">';
            html += '<i class="fas fa-envelope"></i>';
            html += '<div class="info-details">';
            html += '<strong>Email</strong>';
            html += '<span>' + user.email + '</span>';
            html += '</div></div>';
        }
    }
    
    infoDisplayContent.innerHTML = html || '<p class="empty-state">Aucune information disponible</p>';
}

// Load jobs section (applied jobs for candidates, posted jobs for recruiters)
function loadJobsSection(user) {
    if (!user) return;
    
    // Get jobs data
    var allJobs = [];
    if (window.offersData && Array.isArray(window.offersData)) {
        allJobs = window.offersData;
    }
    
    if (user.type === 'candidat') {
        // Show applied jobs section
        var appliedJobsCard = document.getElementById('appliedJobsCard');
        var appliedJobsList = document.getElementById('appliedJobsList');
        var appliedJobsCount = document.getElementById('appliedJobsCount');
        
        if (appliedJobsCard) {
            appliedJobsCard.style.display = 'block';
        }
        
        // Get applied jobs using applications system
        var userAppliedJobs = [];
        if (typeof getUserApplications === 'function') {
            userAppliedJobs = getUserApplications(user.email);
        } else {
            // Fallback to localStorage
            var appliedJobs = JSON.parse(localStorage.getItem('applications') || '[]');
            userAppliedJobs = appliedJobs.filter(function(job) {
                return job.userEmail === user.email;
            });
        }
        
        if (appliedJobsCount) {
            appliedJobsCount.textContent = userAppliedJobs.length;
        }
        
        if (appliedJobsList && userAppliedJobs.length > 0) {
            appliedJobsList.innerHTML = userAppliedJobs.map(function(jobApp) {
                var job = allJobs.find(function(j) { return j.id === jobApp.jobId; });
                if (!job) {
                    // Use data from application if job not found
                    job = {
                        id: jobApp.jobId,
                        title: jobApp.jobTitle,
                        company: jobApp.jobCompany,
                        location: jobApp.jobLocation
                    };
                }
                
                var appliedDate = new Date(jobApp.appliedDate || jobApp.timestamp);
                var dateStr = appliedDate.toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                return '<div class="job-item">' +
                    '<div class="job-item-header">' +
                    '<h3><a href="OfferDetail.html?id=' + job.id + '">' + job.title + '</a></h3>' +
                    '<span class="job-status ' + (jobApp.status || 'pending') + '">' + 
                    (jobApp.status === 'accepted' ? 'Accepté' : 
                     jobApp.status === 'rejected' ? 'Refusé' : 'En attente') + 
                    '</span>' +
                    '</div>' +
                    '<div class="job-item-meta">' +
                    '<span><i class="fas fa-building"></i> ' + job.company + '</span>' +
                    '<span><i class="fas fa-map-marker-alt"></i> ' + job.location + '</span>' +
                    '<span><i class="fas fa-calendar"></i> Postulé le ' + dateStr + '</span>' +
                    '</div>' +
                    '</div>';
            }).join('');
        } else if (appliedJobsList) {
            appliedJobsList.innerHTML = '<p class="empty-state">Aucune candidature pour le moment</p>';
        }
    } else if (user.type === 'recruteur') {
        // Show posted jobs section
        var postedJobsCard = document.getElementById('postedJobsCard');
        var postedJobsList = document.getElementById('postedJobsList');
        var postedJobsCount = document.getElementById('postedJobsCount');
        
        if (postedJobsCard) {
            postedJobsCard.style.display = 'block';
        }
        
        // Get posted jobs (jobs posted by this recruiter)
        var postedJobs = allJobs.filter(function(job) {
            return job.postedBy === user.email || job.company === user.companyName;
        });
        
        if (postedJobsCount) {
            postedJobsCount.textContent = postedJobs.length;
        }
        
        if (postedJobsList && postedJobs.length > 0) {
            postedJobsList.innerHTML = postedJobs.map(function(job) {
                // Get number of applicants for this job
                var applicantsCount = 0;
                if (typeof getJobApplicants === 'function') {
                    applicantsCount = getJobApplicants(job.id).length;
                } else {
                    var applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
                    applicantsCount = applicants.filter(function(app) {
                        return app.jobId === job.id;
                    }).length;
                }
                
                return '<div class="job-item">' +
                    '<div class="job-item-header">' +
                    '<h3><a href="OfferDetail.html?id=' + job.id + '">' + job.title + '</a></h3>' +
                    '<span class="job-badge">' + (job.jobType || 'Full Time') + '</span>' +
                    '</div>' +
                    '<div class="job-item-meta">' +
                    '<span><i class="fas fa-map-marker-alt"></i> ' + job.location + '</span>' +
                    '<span><i class="fas fa-dollar-sign"></i> ' + job.salary + '</span>' +
                    '<span><i class="fas fa-users"></i> ' + applicantsCount + ' candidat' + (applicantsCount !== 1 ? 's' : '') + '</span>' +
                    '<span><i class="fas fa-calendar"></i> Publié le ' + 
                    (job.postedDate ? new Date(job.postedDate).toLocaleDateString('fr-FR') : 'N/A') + '</span>' +
                    '</div>' +
                    '<div class="job-item-actions">' +
                    '<a href="OfferDetail.html?id=' + job.id + '" class="btn-view">Voir les détails</a>' +
                    '</div>' +
                    '</div>';
            }).join('');
        } else if (postedJobsList) {
            postedJobsList.innerHTML = '<p class="empty-state">Aucune offre publiée pour le moment</p>';
        }
        
        // Show applicants section for recruiters
        loadRecruiterApplicants(user);
    }
}

// Load applicants for recruiters
function loadRecruiterApplicants(user) {
    if (!user || user.type !== 'recruteur') return;
    
    var applicantsCard = document.getElementById('applicantsCard');
    var applicantsList = document.getElementById('applicantsList');
    var applicantsCount = document.getElementById('applicantsCount');
    
    if (!applicantsCard) return;
    
    applicantsCard.style.display = 'block';
    
    // Get applicants for this recruiter's company
    var applicants = [];
    if (typeof getRecruiterApplicants === 'function') {
        applicants = getRecruiterApplicants(user.email, user.companyName);
    } else {
        // Fallback to localStorage
        var allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
        applicants = allApplicants.filter(function(app) {
            return app.jobCompany === user.companyName;
        });
    }
    
    if (applicantsCount) {
        applicantsCount.textContent = applicants.length;
    }
    
    if (applicantsList && applicants.length > 0) {
        // Group by job
        var applicantsByJob = {};
        applicants.forEach(function(applicant) {
            if (!applicantsByJob[applicant.jobId]) {
                applicantsByJob[applicant.jobId] = [];
            }
            applicantsByJob[applicant.jobId].push(applicant);
        });
        
        applicantsList.innerHTML = Object.keys(applicantsByJob).map(function(jobId) {
            var jobApplicants = applicantsByJob[jobId];
            var firstApplicant = jobApplicants[0];
            
            return '<div class="applicant-group">' +
                '<div class="applicant-group-header">' +
                '<h3><a href="OfferDetail.html?id=' + jobId + '">' + firstApplicant.jobTitle + '</a></h3>' +
                '<span class="applicant-count-badge">' + jobApplicants.length + ' candidat' + (jobApplicants.length !== 1 ? 's' : '') + '</span>' +
                '</div>' +
                '<div class="applicants-items">' +
                jobApplicants.map(function(applicant) {
                    var appliedDate = new Date(applicant.appliedDate || applicant.timestamp);
                    var dateStr = appliedDate.toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    
                    return '<div class="applicant-item">' +
                        '<div class="applicant-avatar">' +
                        (applicant.candidateProfile && !applicant.candidateProfile.includes('logo') ? 
                            '<img src="' + applicant.candidateProfile + '" alt="' + applicant.candidateName + '">' :
                            '<div class="applicant-initials">' + (applicant.candidateName.substring(0, 2).toUpperCase() || 'U') + '</div>') +
                        '</div>' +
                        '<div class="applicant-info">' +
                        '<h4>' + applicant.candidateName + '</h4>' +
                        '<div class="applicant-details">' +
                        '<span><i class="fas fa-envelope"></i> ' + applicant.candidateEmail + '</span>' +
                        (applicant.candidatePhone ? '<span><i class="fas fa-phone"></i> ' + applicant.candidatePhone + '</span>' : '') +
                        '<span><i class="fas fa-calendar"></i> ' + dateStr + '</span>' +
                        '</div>' +
                        '</div>' +
                        '<div class="applicant-status">' +
                        '<span class="job-status ' + (applicant.status || 'pending') + '">' + 
                        (applicant.status === 'accepted' ? 'Accepté' : 
                         applicant.status === 'rejected' ? 'Refusé' : 'En attente') + 
                        '</span>' +
                        '</div>' +
                        '</div>';
                }).join('') +
                '</div>' +
                '</div>';
        }).join('');
    } else if (applicantsList) {
        applicantsList.innerHTML = '<p class="empty-state">Aucun candidat pour le moment</p>';
    }
}

// Helper function to set form values
function setValue(id, value) {
    var element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}

// Save profile data
function saveProfileData(originalUser) {
    var form = document.getElementById('profileForm');
    if (!form) return;

    // Collect updated data
    var updatedData = Object.assign({}, originalUser);

    if (originalUser.type === 'candidat') {
        updatedData.civilite = document.getElementById('civilite').value;
        updatedData.prenom = document.getElementById('prenom').value;
        updatedData.nom = document.getElementById('nom').value;
        updatedData.countryCode = document.getElementById('countryCode').value;
        updatedData.telephone = document.getElementById('telephone').value;
    } else if (originalUser.type === 'recruteur') {
        updatedData.companyName = document.getElementById('companyName').value;
        updatedData.sector = document.getElementById('sector').value;
        updatedData.employees = document.getElementById('employees').value;
        updatedData.address = document.getElementById('address').value;
        updatedData.postalCode = document.getElementById('postalCode').value;
        updatedData.city = document.getElementById('city').value;
        updatedData.country = document.getElementById('country').value;
        updatedData.website = document.getElementById('website').value;
        updatedData.description = document.getElementById('description').value;
        updatedData.civilite = document.getElementById('recruteurCivilite').value;
        updatedData.prenom = document.getElementById('recruteurPrenom').value;
        updatedData.nom = document.getElementById('recruteurNom').value;
        updatedData.fonction = document.getElementById('fonction').value;
        updatedData.countryCode = document.getElementById('recruteurCountryCode').value;
        updatedData.telephone = document.getElementById('recruteurTelephone').value;
        updatedData.linkedin = document.getElementById('linkedin').value;
    }

    // Update profile photo if changed
    var profilePhotoInput = document.getElementById('profilePhoto');
    var profilePhotoPreview = document.getElementById('profilePhotoPreview');
    if (profilePhotoInput && profilePhotoInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            updatedData.profilePhoto = e.target.result;
            saveUserData(updatedData);
        };
        reader.readAsDataURL(profilePhotoInput.files[0]);
    } else {
        // Keep existing photo
        updatedData.profilePhoto = profilePhotoPreview ? profilePhotoPreview.src : originalUser.profilePhoto;
        saveUserData(updatedData);
    }
}

// Save user data to localStorage and update allSignups
function saveUserData(userData) {
    // Update current session
    if (typeof createSession === 'function') {
        createSession(userData);
    } else {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    // Update allSignups array if it exists
    if (window.allSignups && Array.isArray(window.allSignups)) {
        var userIndex = window.allSignups.findIndex(function(signup) {
            return signup.email === userData.email;
        });

        if (userIndex !== -1) {
            // Update existing signup
            window.allSignups[userIndex] = userData;
        } else {
            // Add new signup (shouldn't happen, but just in case)
            window.allSignups.push(userData);
        }

        // Save to localStorage
        if (typeof saveSignupsToStorage === 'function') {
            saveSignupsToStorage();
        } else {
            localStorage.setItem('allSignups', JSON.stringify(window.allSignups));
        }
    }

    // Show success message
    if (typeof showSuccessPopup === 'function') {
        showSuccessPopup(
            'Profil mis à jour!',
            'Vos informations ont été enregistrées avec succès.',
            'profile.html'
        );
    } else {
        alert('Profil mis à jour avec succès!');
        // Reload page to show updated header
        setTimeout(function() {
            window.location.reload();
        }, 500);
    }
}

