export const DEFAULT_SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'abingyyds@gmail.com';

export function getSupportEmail(site) {
  const configured = site?.contact_email || site?.support_email || site?.email;
  if (typeof configured !== 'string') return DEFAULT_SUPPORT_EMAIL;
  const email = configured.trim();
  if (!email || email.toLowerCase() === 'support@subrouter.com') return DEFAULT_SUPPORT_EMAIL;
  return email;
}
