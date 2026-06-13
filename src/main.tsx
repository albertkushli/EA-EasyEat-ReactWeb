import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n';
import '@/styles/tailwind.css';
import '@/styles/theme.css';
import '@/styles/premium.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center text-gray-500">
          Cargando...
        </div>
      }
    >
      <App />
    </Suspense>
  </StrictMode>,
);
