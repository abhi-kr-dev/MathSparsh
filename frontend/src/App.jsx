import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import PasswordReset from './pages/PasswordReset';
import VerifyEmail from './pages/VerifyEmail';
import PaymentSuccess from './pages/PaymentSuccess';
import Toast from './components/Toast';
import AskQuestion from './pages/AskQuestion';
import QnAList from './pages/QnAList';
import QnADetail from './pages/QnADetail';
import AdminQnA from './pages/AdminQnA';
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));

export const ToastContext = React.createContext();

function App() {
  const [toast, setToast] = React.useState({ message: '', type: 'info' });
  const showToast = (message, type = 'info') => setToast({ message, type });
  const hideToast = () => setToast({ message: '', type: 'info' });

  return (
    <ToastContext.Provider value={showToast}>
      <Router>
        <nav className="bg-white shadow p-4 flex gap-4 justify-center">
          <Link to="/" className="font-bold text-blue-600">Home</Link>
          <Link to="/about" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400">About</Link>
          <Link to="/contact" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400">Contact</Link>
          <Link to="/practice">Practice</Link>
          <Link to="/ask" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400">Ask Question</Link>
          <Link to="/qna" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400">Q&A</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/reset">Reset Password</Link>
        </nav>
        <a href="#main-content" id="skip-to-content" className="skip-link absolute left-2 top-2 bg-yellow-300 text-black px-3 py-1 rounded z-50 focus:translate-y-0 -translate-y-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition">Skip to main content</a>
        <div id="confetti-root" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:9999}}></div>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          <Toast message={toast.message} type={toast.type} onClose={hideToast} />
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<React.Suspense fallback={<div>Loading...</div>}><About /></React.Suspense>} />
          <Route path="/contact" element={<React.Suspense fallback={<div>Loading...</div>}><Contact /></React.Suspense>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<PasswordReset />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify-email/:uidb64/:token" element={<VerifyEmail />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/ask" element={<AskQuestion />} />
          <Route path="/qna" element={<QnAList />} />
          <Route path="/qna/:id" element={<QnADetail />} />
          <Route path="/admin/qna" element={<AdminQnA />} />
        </Routes>
        <footer className="bg-gray-900 text-gray-100 py-4 px-2 w-full flex justify-center items-center gap-6 mt-auto sticky bottom-0 z-40">
          <a href="/about" className="hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-400 px-2 py-1 rounded">About</a>
          <a href="/contact" className="hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-400 px-2 py-1 rounded">Contact</a>
        </footer>
      </Router>
    </ToastContext.Provider>
  );
}

export default App;
