import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Incinerator from './components/Incinerator.tsx';
import RoastPage from './components/RoastPage.tsx';
import './index.css';

// Offline caching. Registered only in production: a service worker in front of
// the dev server is a good way to spend an afternoon debugging a stale bundle.
// See public/sw.js for how staleness is kept impossible.
if (
  "serviceWorker" in navigator &&
  location.hostname !== "localhost" &&
  location.hostname !== "127.0.0.1"
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* no offline support here; the site works the same, just online */
    });
  });
}

// Anyone who walked out of the buried world carrying the axe keeps it as their
// cursor. Set here rather than in App so the standalone roast and incinerator
// entry points get it too.
try {
  if (localStorage.getItem('hg_axe_carried') === '1') {
    document.documentElement.classList.add('carries-axe');
  }
} catch { /* private mode: no axe, no harm */ }

// Hidden admin route. Anything else renders the public app.
const path = window.location.pathname.replace(/\/+$/, '');
const isIncinerator = path === '/incinerator';
const isRoast = path.startsWith('/roast/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isIncinerator ? <Incinerator /> : isRoast ? <RoastPage /> : <App />}
  </StrictMode>,
);
