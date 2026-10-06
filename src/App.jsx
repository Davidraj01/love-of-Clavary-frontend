import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteContentProvider } from './context/SiteContentContext';
import { AppRoutes } from './routes/AppRoutes';
import './styles/index.css';
import './styles/components.css';
import './styles/admin.css';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteContentProvider>
          <AppRoutes />
        </SiteContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
