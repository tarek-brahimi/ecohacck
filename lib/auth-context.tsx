'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from './types';
import { mockUsers, getMockCurrentUser } from './mock-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount (from localStorage)
  useEffect(() => {
    const storedUserId = localStorage.getItem('wakti_user_id');
    if (storedUserId) {
      const currentUser = getMockCurrentUser(storedUserId);
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    const foundUser = Object.values(mockUsers).find(u => u.email === email);
    if (foundUser) {
      localStorage.setItem('wakti_user_id', foundUser.id);
      setUser(foundUser);
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    // Check if user already exists
    if (Object.values(mockUsers).some(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email,
      fullName,
      ageGroup: 'teen',
      interests: [],
      points: 0,
      role: 'user',
      createdAt: new Date(),
    };

    mockUsers[newUserId] = newUser;
    localStorage.setItem('wakti_user_id', newUserId);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('wakti_user_id');
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
