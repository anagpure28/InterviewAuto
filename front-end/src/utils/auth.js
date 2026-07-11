// Central place for reading/writing auth state.
// The backend is JWT-based: register/login return { token, user }. We store the
// token and send it as `Authorization: Bearer <token>` on every protected call.

const TOKEN_KEY = "auth-token";
const USER_KEY = "auth-user";

/** Persist the token + user returned by /auth/login or /auth/register. */
export const saveAuth = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/** The raw JWT string, or null. */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/** The stored user object ({ id, email, name }), or null. */
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

/** True when we have a token (used to guard protected routes). */
export const isAuthenticated = () => Boolean(getToken());

/**
 * Clear every trace of the logged-in user. Also drops interview artefacts
 * (course + final-data) so a new user never sees the previous one's results.
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("final-data");
  localStorage.removeItem("course");
};
