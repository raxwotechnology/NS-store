import { create } from 'zustand';
import { getSettings } from '../services/api';

/**
 * Converts a logo path (relative or absolute) to a fully-accessible URL.
 * - If already a full URL → return as-is
 * - If relative like /uploads/logo.png → prefix with backend base URL
 *   Backend base = VITE_API_URL stripped of trailing /api or /api/
 *   e.g. "http://localhost:5000/api" → "http://localhost:5000"
 *        "https://beautycorner.zage.lk/api" → "https://beautycorner.zage.lk"
 */
const toAbsoluteUrl = (filePath) => {
  if (!filePath) return '';
  // Already a full URL
  if (/^https?:\/\//i.test(filePath)) return filePath;
  // Build backend base by stripping /api suffix from VITE_API_URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const backendBase = apiUrl.replace(/\/api\/?$/, '');
  return `${backendBase}${filePath}`;
};

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
