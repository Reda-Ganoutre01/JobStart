window.allSignups = [
	{
		id: 1001,
		type: 'candidat',
		civilite: 'M.',
		prenom: 'Reda',
		nom: 'Ganoutre',
		countryCode: '+212',
		telephone: '0762666115',
		email: 'reda@jobstart.ma',
		password: '123456',
		cvFileName: '',
		profilePhoto: 'https://i.pravatar.cc/150?img=12',
		timestamp: new Date().toISOString()
	},
	{
		id: 2001,
		type: 'entreprise',
		companyName: 'AcmeCorp',
		prenom: 'HR',
		nom: 'Acme',
		countryCode: '+212',
		telephone: '611111111',
		email: 'entreprise@jobstart.ma',
		password: '123456',
		profilePhoto: 'assets/logo/logo-lightmode.png',
		timestamp: new Date().toISOString()
	}
];

// Ensure signups persist to localStorage and prefer stored data when available.
// This makes seeded users available on static hosts (Netlify) where script
// load order can cause race conditions.
try {
	var __stored = localStorage.getItem('allSignups');
	if (__stored) {
		try {
			window.allSignups = JSON.parse(__stored);
		} catch (e) {
			// If parse fails, re-seed storage with current default
			localStorage.setItem('allSignups', JSON.stringify(window.allSignups));
		}
	} else {
		localStorage.setItem('allSignups', JSON.stringify(window.allSignups));
	}
} catch (e) {
	console.warn('Could not access localStorage for allSignups:', e);
}
