import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ResendVerification from './ResendVerification';
import { ToastContext } from '../App';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const showToast = useContext(ToastContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        showToast('Login successful!', 'success');
        navigate('/dashboard');
      } else {
        // Custom error for unverified email
        if (data.detail && data.detail.toLowerCase().includes('inactive')) {
          setError('Email not verified. Please check your inbox or resend verification.');
          showToast('Email not verified. Please check your inbox or resend verification.', 'error');
        } else {
          setError(data.detail || 'Login failed');
          showToast(data.detail || 'Login failed', 'error');
        }
      }
    } catch {
      setError('Network error');
      showToast('Network error', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mt-16">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && !error.includes('username') && !error.includes('password') && (
        <div className="mb-4 text-red-700">
          {error.includes('not verified') ? (
            <div>
              {error}<br/>
              <ResendVerification email={username.includes('@') ? username : undefined} />
            </div>
          ) : error}
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="username" className="block font-medium mb-1">Username or Email</label>
          <input
            className={`w-full border rounded p-2 ${error && error.toLowerCase().includes('username') ? 'border-red-500' : ''}`}
            type="text"
            id="username"
            name="username"
            aria-label="Username or Email"
            aria-invalid={!!(error && error.toLowerCase().includes('username'))}
            placeholder="Enter your username or email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          {error && error.toLowerCase().includes('username') && <div className="text-red-600 text-xs mt-1">{error}</div>}
        </div>
        <div>
          <label htmlFor="password" className="block font-medium mb-1">Password</label>
          <input
            className={`w-full border rounded p-2 ${error && error.toLowerCase().includes('password') ? 'border-red-500' : ''}`}
            type="password"
            id="password"
            name="password"
            aria-label="Password"
            aria-invalid={!!(error && error.toLowerCase().includes('password'))}
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && error.toLowerCase().includes('password') && <div className="text-red-600 text-xs mt-1">{error}</div>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
