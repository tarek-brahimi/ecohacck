"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { ActivityCategory, AgeGroup, User } from "./types";
import { apiRequest, parseUser } from "./api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    ageGroup?: AgeGroup,
    interests?: ActivityCategory[],
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadSession = async () => {
      try {
        const currentUser = await apiRequest<User>("/api/auth/me");
        if (isActive) {
          setUser(parseUser(currentUser));
        }
      } catch {
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      isActive = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const currentUser = await apiRequest<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(parseUser(currentUser));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    ageGroup: AgeGroup = "teen",
    interests: ActivityCategory[] = [],
  ) => {
    setIsLoading(true);
    try {
      const currentUser = await apiRequest<User>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          fullName,
          ageGroup,
          interests,
        }),
      });
      setUser(parseUser(currentUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiRequest("/api/auth/logout", { method: "POST" }).catch(
      () => undefined,
    );
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
