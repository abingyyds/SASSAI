export const DEFAULT_SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@subrouter.com';

export function getSupportEmail(site) {
  const configured = site?.contact_email || site?.support_email || site?.email;
  return typeof configured === 'string' && configured.trim()
    ? configured.trim()
    : DEFAULT_SUPPORT_EMAIL;
}
