import React, { useState } from 'react';
import axios from '../utils/api';

const MAX_FREE_QUESTIONS = 3;

const AskQuestion = () => {
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [sessionId, setSessionId] = useState(() => {
    // Generate or retrieve a persistent session ID for anonymous users
    let sid = localStorage.getItem('question_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem('question_session_id', sid);
    }
    return sid;
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [freeCount, setFreeCount] = useState(() => {
    // Track free question count in localStorage
    const c = localStorage.getItem('free_question_count');
    return c ? parseInt(c) : 0;
  });

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    if (!isAuthenticated && freeCount >= MAX_FREE_QUESTIONS) {
      setError('Free users can only submit 3 questions. Please login or upgrade for unlimited questions.');
      setSubmitting(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('text', text);
      if (image) formData.append('image', image);
      if (!isAuthenticated) formData.append('session_id', sessionId);
      await axios.post('/public-questions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Your question was submitted! You will see a solution here once answered.');
      setText('');
      setImage(null);
      if (!isAuthenticated) {
        const newCount = freeCount + 1;
        setFreeCount(newCount);
        localStorage.setItem('free_question_count', newCount);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || err.response?.data?.error || 'Failed to submit question.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Ask a Math Question</h2>
      {isAuthenticated ? (
        <div className="mb-2 text-green-700">Premium users can ask unlimited questions.</div>
      ) : (
        <div className="mb-2 text-blue-700">
          Free users can ask up to 3 questions anonymously. Please login for unlimited questions.
          <br />
          <span className="text-sm">Questions left: {MAX_FREE_QUESTIONS - freeCount}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Ask Question Form">
        <div>
          <label htmlFor="question-text" className="block font-medium">
            Your Question
          </label>
          <textarea
            id="question-text"
            className="w-full border rounded p-2 mt-1"
            value={text}
            onChange={e => setText(e.target.value)}
            required
            rows={4}
            aria-required="true"
            aria-label="Question text"
          />
        </div>
        <div>
          <label htmlFor="question-image" className="block font-medium">
            Optional Image (PNG, JPG, PDF)
          </label>
          <input
            id="question-image"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            aria-label="Upload image or PDF"
          />
        </div>
        {error && <div className="text-red-600" role="alert">{error}</div>}
        {success && <div className="text-green-600" role="status">{success}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={submitting || (!isAuthenticated && freeCount >= MAX_FREE_QUESTIONS)}
          aria-disabled={submitting || (!isAuthenticated && freeCount >= MAX_FREE_QUESTIONS)}
        >
          {submitting ? 'Submitting...' : 'Submit Question'}
        </button>
      </form>
    </div>
  );
};

export default AskQuestion;
