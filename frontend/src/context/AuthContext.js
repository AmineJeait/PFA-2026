import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // rehydrate from sessionStorage on first render
    // so a page refresh doesn't log the user out
    const token = sessionStorage.getItem("rh_token");
    const role  = sessionStorage.getItem("rh_role");
    const email = sessionStorage.getItem("rh_email");
    if (token && role && email) return { token, role, email };
    return null;
  });

  const login = useCallback((data) => {
    // data = { token, email, role } from /api/auth/login response
    sessionStorage.setItem("rh_token", data.token);
    sessionStorage.setItem("rh_role",  data.role);
    sessionStorage.setItem("rh_email", data.email);
    setUser({ token: data.token, role: data.role, email: data.email });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("rh_token");
    sessionStorage.removeItem("rh_role");
    sessionStorage.removeItem("rh_email");
    setUser(null);
  }, []);

  // listen for 401 events dispatched by api/client.js
  useEffect(() => {
    const handle = () => logout();
    window.addEventListener("rh:unauthorized", handle);
    return () => window.removeEventListener("rh:unauthorized", handle);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}