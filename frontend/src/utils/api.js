export async function fetchSiteSettings() {
  const BASE_URL = import.meta.env.VITE_API_URL || '';
  const res = await fetch(`${BASE_URL}/api/settings/`);
  if (!res.ok) throw new Error('Failed to fetch site settings');
  const data = await res.json();
  // Return the first (and only) settings object
  return data[0] || {};
}
