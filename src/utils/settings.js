import { fetchStoreSettings } from './api.js';

let storeSettings = {
  storeName: 'Tawakkul Boutique',
  storeEmail: 'contact@tawakkulboutique.com',
  storePhone: '+91 00000 00000',
  storeAddress: 'India',
  whatsappNumber: '910000000000',
  socialLinks: {
    instagram: '',
    facebook: '',
    whatsapp: ''
  }
};

export const initSettings = async () => {
  try {
    const res = await fetchStoreSettings();
    if (res.success && res.data) {
      storeSettings = { ...storeSettings, ...res.data };
      console.log('Settings loaded:', storeSettings);
    }
  } catch (error) {
    console.error('Failed to load store settings:', error);
  }
  return storeSettings;
};

export const getSettings = () => storeSettings;
