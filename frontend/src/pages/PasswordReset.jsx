import React, { useState } from 'react';

function PasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/password_reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setMessage('Password reset instructions sent to your email.');
      } else {
        setError('Could not send reset email.');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-16">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email" className="block font-medium mb-1">Email</label>
          <input
            className={`w-full border rounded p-2 ${error ? 'border-red-500' : ''}`}
            type="email"
            id="email"
            name="email"
            aria-label="Email"
            aria-invalid={!!error}
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
      </form>
    </div>
  );
}

export default PasswordReset;
