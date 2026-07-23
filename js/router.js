const routes = new Map();
let currentCleanup = null;

export function registerRoute(name, handler) {
  routes.set(name, handler);
}

export function navigate(route, params = {}) {
  const query = new URLSearchParams(params).toString();
  window.location.hash = query ? `#/${route}?${query}` : `#/${route}`;
}

export function getRouteParams() {
  const hash = window.location.hash.slice(1);
  const [pathPart, queryPart] = hash.split('?');
  const route = pathPart.replace(/^\//, '') || 'home';
  const params = Object.fromEntries(new URLSearchParams(queryPart || ''));
  return { route, params };
}

export async function renderRoute(container) {
  const { route, params } = getRouteParams();

  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const handler = routes.get(route) || routes.get('home');
  if (!handler) {
    container.innerHTML = '<p>Page not found.</p>';
    return;
  }

  try {
    const cleanup = await handler(container, params);
    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="error-state">
        <h2 class="error-state__title">Something went wrong</h2>
        <p class="error-state__message">${err.message || 'An unexpected error occurred.'}</p>
        <a href="#/home" class="btn btn--primary">Go Home</a>
      </div>
    `;
  }
}

export function initRouter(container) {
  window.addEventListener('hashchange', () => renderRoute(container));
  if (!window.location.hash) {
    window.location.hash = '#/home';
  } else {
    renderRoute(container);
  }
}
