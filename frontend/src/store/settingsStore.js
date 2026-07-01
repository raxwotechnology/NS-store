import { create } from 'zustand';
import { getSettings } from '../services/api';
import { toAbsoluteUrl } from '../utils/imageUtils';

const useSettingsStore = create((set) => ({
  settings: null,
  loading: false,
  loaded: false,

  fetchSettings: async (force = false) => {
    if (!force && useSettingsStore.getState().loaded) return;
    set({ loading: true });
    try {
      const { data } = await getSettings();
      set({
        settings: {
          ...data,
          // Build accessible URLs
          logoUrl: toAbsoluteUrl(data.logo || data.logoUrl),
          heroImageUrl: toAbsoluteUrl(data.heroImage || data.heroImageUrl),
        },
        loaded: true,
      });
    } catch (err) {
      // keep defaults in UI
    } finally {
      set({ loading: false });
    }
  },

  setSettingsLocal: (settings) => {
    set({
      settings: settings
          ? {
              ...settings,
              logoUrl: toAbsoluteUrl(settings.logo || settings.logoUrl),
              heroImageUrl: toAbsoluteUrl(settings.heroImage || settings.heroImageUrl),
            }
          : null,
      loaded: true,
    });
  },
}));

export default useSettingsStore;
