type LoginResult = {
  token: string;
  user: Record<string, unknown>;
};

const API_BASE = "http://localhost:1337";

export async function loginUser(
  email: string,
  password: string,
  role = "customer"
): Promise<LoginResult> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, role }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const json = await res.json();

  const token = json?.token || json?.accessToken;
  const user = json?.user || json?.customer || json?.employee || json?.admin;

  if (!token || !user) {
    throw new Error("Invalid login response");
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("auth_data", JSON.stringify({ accessToken: token, user }));

  return { token, user };
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("auth_data");
  localStorage.removeItem("restaurant_data");
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}
