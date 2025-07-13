import React, { useEffect } from 'react';

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center text-sm
      ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
    >
      {message}
      <button onClick={onClose} className="ml-4 text-white font-bold">&times;</button>
    </div>
  );
}

export default Toast;
