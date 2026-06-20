import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Incinerator from './components/Incinerator.tsx';
import RoastPage from './components/RoastPage.tsx';
import './index.css';

console.warn(
  "%cWe see you, inspector.",
  "color:#e879f9;font-family:monospace;font-size:14px;font-weight:bold;"
);
console.log(
  "%c" +
  "    ░░░░░░░░░░░░░░░\n" +
  "    ░░  ░░░  ░░░  ░\n" +
  "    ░░░░░░░░░░░░░░░\n" +
  "    ░░ ░░░░░ ░░░░░░\n" +
  "    ░░░ ░░░ ░░░░░░░\n" +
  "    ░░░░░░░░░░░░░░░\n" +
  "\n" +
  "  curious, aren't you.\n" +
  "  the graveyard has eyes.\n",
  "color:#06b6d4;font-family:monospace;font-size:12px;"
);

// Hidden admin route. Anything else renders the public app.
const path = window.location.pathname.replace(/\/+$/, '');
const isIncinerator = path === '/incinerator';
const isRoast = path.startsWith('/roast/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isIncinerator ? <Incinerator /> : isRoast ? <RoastPage /> : <App />}
  </StrictMode>,
);
