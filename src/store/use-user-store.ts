import { create } from 'zustand';

interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
  image?: string | null;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
})); 