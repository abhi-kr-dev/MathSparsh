import { getAccessToken } from './auth';

export async function fetchAttempts() {
  const token = getAccessToken();
  if (!token) return [];
  const res = await fetch('http://localhost:8000/api/practiceattempts/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function submitAttempt({ question, selected_option }) {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch('http://localhost:8000/api/practiceattempts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question, selected_option })
  });
  if (!res.ok) throw new Error('Failed to submit attempt');
  return res.json();
}
