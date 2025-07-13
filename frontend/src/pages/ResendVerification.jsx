import React, { useState } from 'react';

function ResendVerification({ email }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    setStatus('');
    const res = await fetch('http://localhost:8000/api/resend-verification/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.detail) setStatus('sent');
    else setStatus('error');
    setLoading(false);
  };

  return (
    <div>
      Verification email sent. Please check your inbox.<br />
      <span className="text-gray-700">Didn&apos;t get the email? Check spam or&nbsp;
        <button
          className="underline text-blue-700 disabled:text-gray-400"
          onClick={resend}
          disabled={loading || status === 'sent'}
        >
          {loading ? 'Sending...' : status === 'sent' ? 'Sent!' : 'Resend verification'}
        </button>.
      </span>
      {status === 'error' && <div className="text-red-600">Could not resend email. Try again later.</div>}
    </div>
  );
}

export default ResendVerification;
