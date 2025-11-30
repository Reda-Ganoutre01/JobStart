window.users = [
    {
        id: 1,
        email: "candidat@jobstart.ma",
        password: "123456",
        role: "candidat",
        name: "Reda Ganoutre",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        email: "entreprise@jobstart.ma",
        password: "123456",
        role: "entreprise",
        name: "Tech Company SA",
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        email: "test@example.com",
        password: "password123",
        role: "candidat",
        name: "Test User",
        createdAt: new Date().toISOString()
    }
];

// Seed these users into the signups storage used by the app (localStorage 'allSignups')
(function seedAuthUsers() {
    try {
        var raw = localStorage.getItem('allSignups');
        var existing = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(existing)) existing = [];

        // Normalize window.users to the shape used by the signup/login code
        var prepared = window.users.map(function(u) {
            return Object.assign({}, u, {
                type: u.type || u.role || 'candidat',
                prenom: u.prenom || u.name || '',
                nom: u.nom || '',
                timestamp: u.createdAt || new Date().toISOString()
            });
        });

        var emailSet = new Set(existing.map(function(e) { return (e && e.email) ? String(e.email).toLowerCase() : ''; }));
        var toAdd = prepared.filter(function(u) { return u && u.email && !emailSet.has(String(u.email).toLowerCase()); });

        if (toAdd.length > 0) {
            var merged = existing.concat(toAdd);
            localStorage.setItem('allSignups', JSON.stringify(merged));
            window.allSignups = merged;
            console.info('Seeded default users:', toAdd.map(function(u){ return u.email; }));
        } else {
            window.allSignups = existing;
        }
    } catch (e) {
        console.warn('Failed to seed auth users', e);
        if (!Array.isArray(window.allSignups)) window.allSignups = window.users.slice();
    }
})();
