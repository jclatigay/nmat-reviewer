import { initRouter, registerRoute } from './router.js';
import { ROUTES } from './config.js';
import { renderHome } from './views/home.js';
import { renderSubjectSelect } from './views/subjectSelect.js';
import { renderModeSelect } from './views/modeSelect.js';
import { renderSession } from './views/session.js';
import { renderResults } from './views/results.js';
import { renderReview } from './views/review.js';

const app = document.getElementById('app');

registerRoute(ROUTES.HOME, renderHome);
registerRoute(ROUTES.SUBJECT, renderSubjectSelect);
registerRoute(ROUTES.MODE, renderModeSelect);
registerRoute(ROUTES.SESSION, renderSession);
registerRoute(ROUTES.RESULTS, renderResults);
registerRoute(ROUTES.REVIEW, renderReview);

initRouter(app);

window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
