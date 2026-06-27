import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeKey = 'light' | 'dark' | 'dim' | 'contrast' | 'purple' | 'yellow';

export const THEME_KEYS: ThemeKey[] = ['light', 'dark', 'dim', 'contrast', 'purple', 'yellow'];

const STORAGE_KEY = 'theme_key';

const getInitialKey = (): ThemeKey => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && (THEME_KEYS as string[]).includes(saved)) return saved as ThemeKey;

  const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: { key: getInitialKey() },
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeKey>) => {
      state.key = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload);
    }
  }
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
