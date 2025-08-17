import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './components/AuthContext';  // <-- import your AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>  {/* <-- Wrap here */}
      <App />
    </AuthProvider>
  </StrictMode>
);
