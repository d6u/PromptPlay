import posthog from 'posthog-js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App.tsx';
import { POSTHOG_TOKEN } from './constants.ts';

// Disable anlytics in development
if (
  !window.location.host.includes('127.0.0.1') &&
  !window.location.host.includes('localhost')
) {
  posthog.init(POSTHOG_TOKEN, { api_host: 'https://app.posthog.com' });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
