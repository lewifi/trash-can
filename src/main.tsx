import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Incinerator from './components/Incinerator.tsx';
import RoastPage from './components/RoastPage.tsx';
import './index.css';

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
