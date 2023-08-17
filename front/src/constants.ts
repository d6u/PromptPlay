export const API_SERVER_BASE_URL = process.env
  .REACT_APP_API_SERVER_BASE_URL as string;

export const IS_LOGIN_ENABLED =
  process.env.REACT_APP_IS_LOGIN_ENABLED === "true";

export const PROVIDE_FEEDBACK_LINK =
  "https://github.com/d6u/PromptPlay/issues/new?title=[FEEDBACK]&template=general-feedback-template.md&labels=need+sorting";
