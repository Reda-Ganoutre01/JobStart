import { loadComponent } from './LoadComponent.js';
import { initNavigation } from './Navigation.js';

async function bootstrap() {
	// Load header first so navigation elements exist
	await loadComponent('header', 'components/header.html');
	// Initialize navigation now that header is in the DOM
	initNavigation();

	// Load footer (can be done after)
	await loadComponent('footer', 'components/footer.html');
}

bootstrap().catch(err => console.error('Bootstrap error:', err));