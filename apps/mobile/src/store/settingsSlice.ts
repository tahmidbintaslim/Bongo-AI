import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  language: 'bn-BD' | 'en-US';
  theme: 'light' | 'dark';
  offlineMode: boolean;
}

const initialState: SettingsState = {
  language: 'bn-BD',
  theme: 'light',
  offlineMode: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'bn-BD' | 'en-US'>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleOfflineMode: state => {
      state.offlineMode = !state.offlineMode;
    },
  },
});

export const { setLanguage, setTheme, toggleOfflineMode } = settingsSlice.actions;
export default settingsSlice.reducer;
