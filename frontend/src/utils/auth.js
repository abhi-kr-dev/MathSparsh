export function getAccessToken() {
  return localStorage.getItem('access');
}

export async function fetchUser() {
  const token = getAccessToken();
  if (!token) return null;
  const res = await fetch('http://localhost:8000/api/user/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return res.json();
}
