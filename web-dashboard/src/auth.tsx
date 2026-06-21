import { createContext, useContext, useState, type ReactNode } from "react";
import { api, clearAuth, getAuth, setAuth } from "./api";

interface AuthCtx {
  isAuthed: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  isAuthed: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(() => !!getAuth());

  const login = async (username: string, password: string) => {
    // Store credentials first so the request carries Basic auth, then validate.
    setAuth(username, password);
    try {
      await api.login(username, password);
      setIsAuthed(true);
    } catch (e) {
      clearAuth();
      setIsAuthed(false);
      throw e;
    }
  };

  const logout = () => {
    clearAuth();
    setIsAuthed(false);
  };

  return (
    <Ctx.Provider value={{ isAuthed, login, logout }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
