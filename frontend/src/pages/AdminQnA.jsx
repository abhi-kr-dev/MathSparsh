import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminQnA = () => {
  // TODO: Add authentication logic or props for user/isAuthenticated
const user = null;
const isAuthenticated = false;
  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    const fetchPending = async () => {
      setLoading(true);
      try {
        const BASE_URL = import.meta.env.VITE_API_URL || '';
    const res = await axios.get(`${BASE_URL}/public-questions/?status=pending`);
        setPending(res.data);
      } catch (err) {
        setError('Failed to load pending questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [isAuthenticated, user]);

  const handleSelect = (q) => {
    setSelected(q);
    setAnswer('');
    setImage(null);
    setSuccess(null);
    setError(null);
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('answer_text', answer);
      if (image) formData.append('answer_image', image);
      const BASE_URL = import.meta.env.VITE_API_URL || '';
    await axios.post(`${BASE_URL}/public-questions/${selected.id}/answer/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Solution posted!');
      setPending(pending.filter(q => q.id !== selected.id));
      setSelected(null);
      setAnswer('');
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post solution.');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="max-w-2xl mx-auto p-4 mt-8 text-red-600">Admin access required.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Pending Questions (Admin)</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600" role="alert">{error}</div>}
      <ul className="divide-y divide-gray-200 mb-6">
        {pending.length === 0 && !loading && <li className="py-4">No pending questions.</li>}
        {pending.map(q => (
          <li key={q.id} className="py-4">
            <button onClick={() => handleSelect(q)} className="text-blue-700 hover:underline font-semibold">
              {q.text?.slice(0, 120) || 'Untitled Question'}
            </button>
            <div className="text-xs text-gray-400 mt-1">
              Asked: {new Date(q.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
      {selected && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded shadow">
          <h3 className="font-bold mb-2">Answer Question</h3>
          <div className="mb-2">{selected.text}</div>
          {selected.image && (
            <img src={selected.image} alt="Question illustration" className="my-2 max-h-64" />
          )}
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="w-full border rounded p-2"
            required
            rows={4}
            placeholder="Type your solution here..."
            aria-label="Solution text"
          />
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            aria-label="Upload solution image or PDF"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Submit Solution</button>
            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setSelected(null)}>Cancel</button>
          </div>
          {success && <div className="text-green-600">{success}</div>}
          {error && <div className="text-red-600">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default AdminQnA;
