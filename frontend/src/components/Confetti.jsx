import React, { useEffect } from 'react';

const colors = ['#4F46E5', '#22D3EE', '#F59E42', '#F472B6', '#34D399', '#F87171'];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

export default function Confetti({ trigger = false, duration = 1200 }) {
  useEffect(() => {
    if (!trigger) return;
    const container = document.getElementById('confetti-root');
    if (!container) return;
    const confettiEls = [];
    for (let i = 0; i < 32; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.left = `${randomBetween(5, 95)}%`;
      el.style.animationDelay = `${randomBetween(0, 0.3)}s`;
      el.style.transform = `rotate(${randomBetween(-45, 45)}deg)`;
      container.appendChild(el);
      confettiEls.push(el);
    }
    setTimeout(() => {
      confettiEls.forEach(el => el.remove());
    }, duration);
    return () => {
      confettiEls.forEach(el => el.remove());
    };
  }, [trigger, duration]);
  return null;
}

// Add styles for confetti
// In your main CSS (e.g., index.css or App.css):
// .confetti-piece {
//   position: absolute;
//   top: 0;
//   width: 8px;
//   height: 16px;
//   opacity: 0.85;
//   border-radius: 2px;
//   animation: confetti-fall 1.2s cubic-bezier(.62,.01,.47,1.01) forwards;
//   z-index: 9999;
// }
// @keyframes confetti-fall {
//   0% { opacity: 1; transform: translateY(0) scale(1); }
//   80% { opacity: 1; }
//   100% { opacity: 0; transform: translateY(80vh) scale(0.9); }
// }
