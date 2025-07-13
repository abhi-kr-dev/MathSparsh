export async function fetchSiteSettings() {
  const res = await fetch('http://localhost:8000/api/settings/');
  if (!res.ok) throw new Error('Failed to fetch site settings');
  const data = await res.json();
  // Return the first (and only) settings object
  return data[0] || {};
}
