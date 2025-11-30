// Application Management System

// Initialize applications storage
function initApplicationsStorage() {
    if (!localStorage.getItem('applications')) {
        localStorage.setItem('applications', JSON.stringify([]));
    }
    if (!localStorage.getItem('applicants')) {
        localStorage.setItem('applicants', JSON.stringify([]));
    }
}

// Get all applications
function getApplications() {
    var applications = localStorage.getItem('applications');
    return applications ? JSON.parse(applications) : [];
}

// Get all applicants
function getApplicants() {
    var applicants = localStorage.getItem('applicants');
    return applicants ? JSON.parse(applicants) : [];
}

// Save application (for candidates)
function saveApplication(jobId, jobData) {
    var user = null;
    if (typeof getSession === 'function') {
        user = getSession();
    }
    
    if (!user || user.type !== 'candidat') {
        return { success: false, message: 'Vous devez être connecté en tant que candidat pour postuler.' };
    }
    
    var applications = getApplications();
    
    // Check if already applied
    var existingApplication = applications.find(function(app) {
        return app.jobId === jobId && app.userEmail === user.email;
    });
    
    if (existingApplication) {
        return { success: false, message: 'Vous avez déjà postulé à cette offre.' };
    }
    
    // Create application
    var application = {
        id: Date.now(),
        jobId: jobId,
        userEmail: user.email,
        userName: (user.prenom || '') + ' ' + (user.nom || ''),
        userPhone: user.telephone || '',
        userCV: user.cvFileName || '',
        jobTitle: jobData.title || '',
        jobCompany: jobData.company || '',
        jobLocation: jobData.location || '',
        status: 'pending', // pending, accepted, rejected
        appliedDate: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    applications.push(application);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    // Also save as applicant for recruiter
    saveApplicant(jobId, user, jobData);
    
    return { success: true, message: 'Votre candidature a été envoyée avec succès!', application: application };
}

// Save applicant (for recruiters)
function saveApplicant(jobId, candidate, jobData) {
    var applicants = getApplicants();
    
    // Check if applicant already exists for this job
    var existingApplicant = applicants.find(function(app) {
        return app.jobId === jobId && app.candidateEmail === candidate.email;
    });
    
    if (existingApplicant) {
        return; // Already exists
    }
    
    // Create applicant record
    var applicant = {
        id: Date.now(),
        jobId: jobId,
        jobTitle: jobData.title || '',
        jobCompany: jobData.company || '',
        candidateEmail: candidate.email,
        candidateName: (candidate.prenom || '') + ' ' + (candidate.nom || ''),
        candidatePhone: candidate.telephone || '',
        candidateCV: candidate.cvFileName || '',
        candidateProfile: candidate.profilePhoto || '',
        status: 'pending',
        appliedDate: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    applicants.push(applicant);
    localStorage.setItem('applicants', JSON.stringify(applicants));
}

// Get applications for a specific user
function getUserApplications(userEmail) {
    var applications = getApplications();
    return applications.filter(function(app) {
        return app.userEmail === userEmail;
    });
}

// Get applicants for a specific job
function getJobApplicants(jobId) {
    var applicants = getApplicants();
    return applicants.filter(function(app) {
        return app.jobId === jobId;
    });
}

// Get applicants for a recruiter (all jobs posted by them)
function getRecruiterApplicants(recruiterEmail, companyName) {
    var applicants = getApplicants();
    return applicants.filter(function(app) {
        return app.jobCompany === companyName;
    });
}

// Update application status
function updateApplicationStatus(applicationId, status) {
    var applications = getApplications();
    var application = applications.find(function(app) {
        return app.id === applicationId;
    });
    
    if (application) {
        application.status = status;
        localStorage.setItem('applications', JSON.stringify(applications));
    }
    
    // Also update in applicants
    var applicants = getApplicants();
    var applicant = applicants.find(function(app) {
        return app.id === applicationId;
    });
    
    if (applicant) {
        applicant.status = status;
        localStorage.setItem('applicants', JSON.stringify(applicants));
    }
}

// Initialize on load
initApplicationsStorage();

