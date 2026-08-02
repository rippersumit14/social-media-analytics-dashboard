const DEFAULT_API_BASE_URL = "http://localhost:5000/api";
const DEFAULT_CONTACT_EMAIL = "sumit.pandey.lko14@gmail.com";
const DEFAULT_CONTACT_PHONE = "+917007628757";

// Centralizes environment access so service modules do not depend on Vite directly.
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || DEFAULT_CONTACT_EMAIL,
  contactPhone: import.meta.env.VITE_CONTACT_PHONE || DEFAULT_CONTACT_PHONE,
};
