/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIXPANEL_TOKEN: string;
  readonly VITE_API_SERVER_BASE_URL: string;
  readonly VITE_IS_LOGIN_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
