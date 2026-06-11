"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  login: (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => void;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [user, setUser] =
    useState<User | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [refreshToken, setRefreshToken] =
    useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {

    const storedUser =
      localStorage.getItem("user");

    const storedAccessToken =
      localStorage.getItem("accessToken");

    const storedRefreshToken =
      localStorage.getItem("refreshToken");

    if (
      storedUser &&
      storedAccessToken
    ) {

      setUser(
        JSON.parse(storedUser)
      );

      setAccessToken(
        storedAccessToken
      );

      setRefreshToken(
        storedRefreshToken
      );

      setIsAuthenticated(
        true
      );
    }

  }, []);

  const login = (
    userData: User,
    accessTokenData: string,
    refreshTokenData: string
  ) => {

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "accessToken",
      accessTokenData
    );

    localStorage.setItem(
      "refreshToken",
      refreshTokenData
    );

    setUser(userData);

    setAccessToken(
      accessTokenData
    );

    setRefreshToken(
      refreshTokenData
    );

    setIsAuthenticated(
      true
    );
  };

  const logout = () => {

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    setUser(null);

    setAccessToken(null);

    setRefreshToken(null);

    setIsAuthenticated(
      false
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth debe usarse dentro de AuthProvider"
    );
  }

  return context;
}