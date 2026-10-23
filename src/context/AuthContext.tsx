"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, loginWithGoogle } from "../services/firebase";
import { API_BASE_URL } from "../services/api";
import { UserPreferences } from "@/types/music";

interface AuthContextType {
  currentUser: User | null;
  userPreferences: UserPreferences | null;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userPreferences: null,
  loginWithGoogle: async () => { throw new Error("Auth not initialized"); },
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: user.uid,
              name: user.displayName,
              email: user.email,
              avatar: user.photoURL
            })
          });
          const data = await res.json();
          if (data && data.preferences) {
            setUserPreferences(data.preferences);
            localStorage.setItem("soundify_search_view", data.preferences.searchView || "list");
          }
        } catch (err) {
          console.error("Failed to sync user with MongoDB:", err);
        }
      } else {
        setUserPreferences(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  const value = {
    currentUser,
    userPreferences,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

