import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, loginWithGoogle } from "../services/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const res = await fetch('http://localhost:5000/api/users', {
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
            // Optionally persist to localStorage for immediate UI reads
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