import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  deleteDoc
} from "firebase/firestore";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBEWkp2f2r_Bvv9cHgY_hoB7OvuzFya82c",
  authDomain: "wavex-new.firebaseapp.com",
  projectId: "wavex-new",
  storageBucket: "wavex-new.firebasestorage.app",
  messagingSenderId: "436498550744",
  appId: "1:436498550744:web:123177db56c9bd528eacad",
  measurementId: "G-9ZE4M5T2TX"
};

// INIT
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();


// ================= AUTH =================

// ✅ GOOGLE LOGIN (POPUP)
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// LOGOUT
export const logoutUser = () => signOut(auth);


// ================= PLAYLIST =================

export async function fetchUserPlaylists(uid) {
  if (!uid) return [];

  const q = query(collection(db, "playlists"), where("userId", "==", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createPlaylist(uid, name) {
  if (!uid) throw new Error("Login required");

  const docRef = await addDoc(collection(db, "playlists"), {
    userId: uid,
    name,
    icon: "🎵",
    trackIds: [],
    createdAt: new Date().toISOString()
  });

  return {
    id: docRef.id,
    name,
    icon: "🎵",
    trackIds: []
  };
}

export async function deletePlaylist(playlistId) {
  await deleteDoc(doc(db, "playlists", playlistId));
}

export async function addTrackToPlaylist(playlistId, trackId) {
  await updateDoc(doc(db, "playlists", playlistId), {
    trackIds: arrayUnion(trackId)
  });
}


// ================= LIKED SONGS =================

// ✅ FIXED (this was causing your error)
export async function fetchLikedSongs(uid) {
  if (!uid) return [];

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  return snap.exists() ? snap.data().likedSongs || [] : [];
}

export async function syncLikedSongs(uid, likedIds) {
  if (!uid) return;

  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    { likedSongs: likedIds },
    { merge: true }
  );
}