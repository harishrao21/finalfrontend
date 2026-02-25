import { createContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { loginRequest, logoutRequest, registerRequest } from "../services/authService";
import { getMyProfileRequest } from "../services/userService";

export const AuthContext = createContext(null);

const USER_STORAGE_KEY = "eventhive_user";

export function AuthProvider({ children }) {
  // Keep only non-sensitive profile data in localStorage.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      // No cached user means no profile fetch needed.
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Cookie-based session is validated by asking backend for current user.
        const response = await getMyProfileRequest();
        setUser(response.data.data);
      } catch (error) {
        // If cookie expired/invalid, clear stale local snapshot.
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const login = async (payload) => {
    const response = await loginRequest(payload);
    setUser(response.data.data.user);
    toast.success("Welcome back");
  };

  const register = async (payload) => {
    const response = await registerRequest(payload);
    setUser(response.data.data.user);
    toast.success("Account created");
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      // If network fails, still clear local state so UI doesn't stay logged-in.
    }
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
