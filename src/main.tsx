import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Incinerator from './components/Incinerator.tsx';
import './index.css';

// Hidden admin route. Anything else renders the public app.
const path = window.location.pathname.replace(/\/+$/, '');
const isIncinerator = path === '/incinerator';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isIncinerator ? <Incinerator /> : <App />}
  </StrictMode>,
);
