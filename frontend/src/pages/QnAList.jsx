import React, { useEffect, useState } from 'react';
import axios from '../utils/api';
import { Link } from 'react-router-dom';

const QnAList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/public-questions/?status=answered');
        setQuestions(res.data);
        setFiltered(res.data);
      } catch (err) {
        setError('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(questions);
    } else {
      const s = search.toLowerCase();
      setFiltered(
        questions.filter(q =>
          (q.text || '').toLowerCase().includes(s) ||
          (q.solution?.answer_text || '').toLowerCase().includes(s)
        )
      );
    }
  }, [search, questions]);

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Math Q&A Archive</h2>
      <div className="mb-4">
        <input
          type="text"
          className="w-full border rounded p-2"
          placeholder="Search questions or solutions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search questions"
        />
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600" role="alert">{error}</div>}
      <ul className="divide-y divide-gray-200">
        {filtered.length === 0 && !loading && <li className="py-4">No questions found.</li>}
        {filtered.map(q => (
          <li key={q.id} className="py-4">
            <Link to={`/qna/${q.id}`} className="text-blue-700 hover:underline font-semibold">
              {q.text?.slice(0, 120) || 'Untitled Question'}
            </Link>
            <div className="text-gray-600 text-sm mt-1">
              {q.solution?.answer_text?.slice(0, 120)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Asked: {new Date(q.created_at).toLocaleString()} | Answered by: {q.solution?.answered_by || 'Staff'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QnAList;
