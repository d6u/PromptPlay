export const AUTH_SCOPE = "openid profile email";

export function getRedirectUri() {
  return `http://localhost:8000/auth`;
}
