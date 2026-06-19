import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Incinerator from './components/Incinerator.tsx';
import RoastPage from './components/RoastPage.tsx';
import './index.css';

// Hidden admin route. Anything else renders the public app.
const path = window.location.pathname.replace(/\/+$/, '');
const isIncinerator = path === '/incinerator';
const isRoast = path.startsWith('/roast/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isIncinerator ? <Incinerator /> : isRoast ? <RoastPage /> : <App />}
  </StrictMode>,
);
