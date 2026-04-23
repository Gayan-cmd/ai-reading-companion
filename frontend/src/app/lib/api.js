
const BASE_URL = "http://127.0.0.1:8000";

// ─── Token helpers ───────────────────────────────────────────────────────────

function getAccessToken()  { return localStorage.getItem("access_token"); }
function getRefreshToken() { return localStorage.getItem("refresh_token"); }

function storeTokens({ access_token, refresh_token }) {
  if (access_token)  localStorage.setItem("access_token",  access_token);
  if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ─── Silent token refresh ─────────────────────────────────────────────────────

async function refreshAccessToken() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) throw new Error("No refresh token stored.");

  const response = await fetch(`${BASE_URL}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  if (!response.ok) {
    // Refresh token is expired or invalid — force logout
    clearTokens();
    throw new Error("Session expired. Please log in again.");
  }

  const data = await response.json();
  localStorage.setItem("access_token", data.access_token); // store the new access token
  return data.access_token;
}

// ─── Authenticated fetch wrapper ──────────────────────────────────────────────
// Automatically retries once after refreshing the access token on a 401.

async function fetchWithAuth(url, options = {}) {
  const makeRequest = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
      },
    });

  let response = await makeRequest(getAccessToken());

  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      response = await makeRequest(newToken);
    } catch {
      // Refresh failed — redirect to login
      window.location.href = "/login";
      throw new Error("Session expired.");
    }
  }

  return response;
}

// ─── Public API functions ─────────────────────────────────────────────────────

export async function askAI(question, context) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, context }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log("API Error Response:", error.detail);
      throw new Error("Failed to talk to AI");
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error("API Error:", error);
    return "Error: Could not connect to the AI brain. Is the backend running?";
  }
}


export async function login_user(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log(errorData.detail);
    throw new Error("Login failed");
  }

  const data = await response.json();
  // Store both tokens on login
  storeTokens(data);
  return data;
}


export async function fetch_current_user() {
  if (!getAccessToken()) return null;

  const response = await fetchWithAuth(`${BASE_URL}/users/me`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}


export async function register_user(username, email, password) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed");
  }

  return response.json();
}
