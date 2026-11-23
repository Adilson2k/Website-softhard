import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { log } from './lib/logger'; // Inicializar logger para desabilitar console em produção

// Inicializar logger (desabilita console em produção)
void log.info('CMS iniciado', { env: import.meta.env.MODE });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

