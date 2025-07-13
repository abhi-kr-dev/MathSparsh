import React, { useState, useContext } from 'react';
import ResendVerification from './ResendVerification';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../App';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', phone_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();
  const showToast = useContext(ToastContext);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.detail || 'Registration successful!');
        setError(null);
        showToast('Registration successful! Please check your email.', 'success');
      } else {
        setError(data.error || 'Registration failed');
        setSuccess(null);
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch {
      setError('Network error');
      setSuccess(null);
      showToast('Network error', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mt-16">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {success && <div className="mb-4 text-green-700">{success.includes('Verification email sent') ? (
        <ResendVerification email={form.email} />
      ) : success}</div>}
      {error && <div className="mb-4 text-red-700">{error}</div>}
      {!success && (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="username" className="block font-medium mb-1">Username</label>
            <input
              className={`w-full border rounded p-2 ${error && error.toLowerCase().includes('username') ? 'border-red-500' : ''}`}
              type="text"
              id="username"
              name="username"
              aria-label="Username"
              aria-invalid={!!(error && error.toLowerCase().includes('username'))}
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
            />
            {error && error.toLowerCase().includes('username') && <div className="text-red-600 text-xs mt-1">{error}</div>}
          </div>
          <div>
            <label htmlFor="email" className="block font-medium mb-1">Email</label>
            <input
              className={`w-full border rounded p-2 ${error && error.toLowerCase().includes('email') ? 'border-red-500' : ''}`}
              type="email"
              id="email"
              name="email"
              aria-label="Email"
              aria-invalid={!!(error && error.toLowerCase().includes('email'))}
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {error && error.toLowerCase().includes('email') && <div className="text-red-600 text-xs mt-1">{error}</div>}
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
              value={form.password}
              onChange={handleChange}
              required
            />
            {error && error.toLowerCase().includes('password') && <div className="text-red-600 text-xs mt-1">{error}</div>}
          </div>
          <div>
            <label htmlFor="phone_number" className="block font-medium mb-1">Phone Number (optional)</label>
            <input
              className="w-full border rounded p-2"
              type="tel"
              id="phone_number"
              name="phone_number"
              aria-label="Phone Number"
              placeholder="Enter your phone number"
              value={form.phone_number}
              onChange={handleChange}
              pattern="[0-9+\-() ]{7,20}"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Register;
