import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  showSplash: boolean;
  isResourcesLoaded: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setAuthentication: (isAuthenticated: boolean) => void;
  setShowSplash: (show: boolean) => void;
  setResourcesLoaded: (loaded: boolean) => void;
}

const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  isAuthenticated: false,
  showSplash: true, // Default to showing splash
  isResourcesLoaded: false,
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  setAuthentication: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setShowSplash: (show: boolean) => set({ showSplash: show }),
  setResourcesLoaded: (loaded: boolean) => set({ isResourcesLoaded: loaded }),
}));

export default useAppStore;
