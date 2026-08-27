/**
 * Minimal client-side JWT helpers.
 *
 * The app used to trust the mere *presence* of `accessToken` in localStorage,
 * so an expired token booted into an "authenticated" shell where every API
 * call 401'd and /sign-in bounced the user back to /admin. Decoding the
 * payload's `exp` lets hydration and route guards treat a dead token as what
 * it is — expired — before any request is made.
 */

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

/** Base64url-decode a JWT payload segment (UTF-8 safe). */
const decodePayload = (token: string): JwtPayload | null => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * True when the token is absent, malformed, or its `exp` has passed
 * (with a small leeway so in-flight requests signed moments before expiry
 * are not cut off mid-flight).
 */
export const isTokenExpired = (
  token: string | null | undefined,
  leewaySeconds = 30
): boolean => {
  if (!token) return true;
  const payload = decodePayload(token);
  if (!payload?.exp) return false; // No exp claim — let the server decide.
  return payload.exp * 1000 <= Date.now() + leewaySeconds * 1000;
};
