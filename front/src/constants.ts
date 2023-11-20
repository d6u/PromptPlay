export const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

export const POSTHOG_TOKEN = import.meta.env.VITE_POSTHOG_TOKEN;

export const API_SERVER_BASE_URL = import.meta.env.VITE_API_SERVER_BASE_URL;

export const IS_LOGIN_ENABLED =
  import.meta.env.VITE_IS_LOGIN_ENABLED === "true";

export const PROVIDE_FEEDBACK_LINK =
  "https://github.com/d6u/PromptPlay/issues/new?title=[FEEDBACK]&template=general-feedback-template.md&labels=need+sorting";
