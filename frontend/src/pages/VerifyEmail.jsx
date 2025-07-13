import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function VerifyEmail() {
  const { uidb64, token } = useParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    fetch(`http://localhost:8000/api/verify-email/${uidb64}/${token}/`)
      .then(res => res.json())
      .then(data => {
        if (data.detail) setStatus('success');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, [uidb64, token]);

  return (
    <div className="flex flex-col items-center mt-16">
      <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
      {status === 'verifying' && <div>Verifying your email...</div>}
      {status === 'success' && <div className="text-green-700">Your email has been verified! You can now <a href="/login" className="underline">login</a>.</div>}
      {status === 'error' && <div className="text-red-700">Invalid or expired verification link.</div>}
    </div>
  );
}

export default VerifyEmail;
