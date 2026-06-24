import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import AuthInitializer from './components/AuthInitializer';
import App from './App.jsx';
import './index.css';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary fallbackRender={({error}) => <div style={{padding: 20, color: 'red'}}>Something went wrong: {error.message}<br/><pre>{error.stack}</pre></div>}>
      <BrowserRouter>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
