import React from 'react';
import { Link } from 'react-router-dom';

function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded shadow p-8">
      <div className="mb-4">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="36" cy="36" r="36" fill="#34D399" />
          <path d="M22 38.5L32 48L50 28" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="text-green-700 text-3xl font-bold mb-2" style={{letterSpacing:'0.02em'}}>Payment Successful!</div>
      <div className="mb-6 text-gray-700 text-lg">Thank you for upgrading to Premium. Enjoy your new features!</div>
      <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">Go to Dashboard</Link>
    </div>
  );
}

export default PaymentSuccess;
