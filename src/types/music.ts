export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration: number;
  cover: string;
  src?: string;
  trackId?: string;
  addedAt?: string | Date;
  dateAdded?: string;
  playedAt?: string | Date;
}

export interface Playlist {
  _id?: string;
  id: string;
  userId?: string;
  name: string;
  description?: string;
  tracks?: Track[];
  songs?: Track[];
  trackIds?: string[];
  icon?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserPreferences {
  audioQuality: number;
  explicitContent: boolean;
  searchView: "list" | "grid";
}

export interface UserProfile {
  _id?: string;
  googleId: string;
  name: string;
  email: string;
  avatar: string;
  preferences: UserPreferences;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface NotificationState {
  isOpen: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onConfirm?: (() => void) | null;
}

