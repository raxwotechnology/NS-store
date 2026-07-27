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
      const logoPath = toAbsoluteUrl(data.logo || data.logoUrl);
      const heroPath = toAbsoluteUrl(data.heroImage || data.heroImageUrl);
      const cacheBuster = data.updatedAt ? `?t=${new Date(data.updatedAt).getTime()}` : '';
      set({
        settings: {
          ...data,
          logoUrl: logoPath ? logoPath + cacheBuster : null,
          heroImageUrl: heroPath ? heroPath + cacheBuster : null,
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
    if (!settings) {
      set({ settings: null, loaded: true });
      return;
    }
    const logoPath = toAbsoluteUrl(settings.logo || settings.logoUrl);
    const heroPath = toAbsoluteUrl(settings.heroImage || settings.heroImageUrl);
    const cacheBuster = settings.updatedAt ? `?t=${new Date(settings.updatedAt).getTime()}` : '';
    set({
      settings: {
        ...settings,
        logoUrl: logoPath ? logoPath + cacheBuster : null,
        heroImageUrl: heroPath ? heroPath + cacheBuster : null,
      },
      loaded: true,
    });
  },
}));

export default useSettingsStore;
