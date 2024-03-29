import { enablePatches } from 'immer';

enablePatches();

import posthog from 'posthog-js';
import ReactDOM from 'react-dom/client';

import { POSTHOG_TOKEN } from 'global-config/global-config';

import App from './App.tsx';
import UITheme from './UITheme.tsx';

// Disable anlytics in development
if (
  !window.location.host.includes('127.0.0.1') &&
  !window.location.host.includes('localhost')
) {
  posthog.init(POSTHOG_TOKEN, { api_host: 'https://app.posthog.com' });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <UITheme>
    <App />
  </UITheme>,
  // </React.StrictMode>,
);
