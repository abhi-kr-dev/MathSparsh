import React, { useEffect, useState, useRef } from 'react';
import Confetti from '../components/Confetti';
import { fetchFilters } from '../utils/filters';
import { fetchAttempts, submitAttempt } from '../utils/progress';
import { fetchUser } from '../utils/auth';

function Practice() {
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [filters, setFilters] = useState({ chapters: [], topics: [], types: [], levels: [] });
  const [selected, setSelected] = useState({ chapter: '', topic: '', type: '', level: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSolution, setShowSolution] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [submitting, setSubmitting] = useState({});
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    fetchUser().then(u => { setUser(u); setUserLoading(false); }).catch(() => setUserLoading(false));
  }, []);

  useEffect(() => {
    fetchFilters().then(setFilters);
    fetch('http://localhost:8000/api/questions/')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setAllQuestions(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load questions');
        setLoading(false);
      });
    fetchAttempts().then(setAttempts);
  }, []);

  // Filter logic
  useEffect(() => {
    // Build query params for server-side filtering
    const params = [];
    if (selected.chapter) params.push(`chapter=${selected.chapter}`);
    if (selected.topic) params.push(`topic=${selected.topic}`);
    if (selected.type) params.push(`type=${selected.type}`);
    if (selected.level) params.push(`level=${selected.level}`);
    const url = `http://localhost:8000/api/questions/${params.length ? '?' + params.join('&') : ''}`;
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load questions');
        setLoading(false);
      });
  }, [selected]);

  const getAttempt = (qid) => attempts.find(a => a.question === qid);
  const handleAttempt = async (qid, oid, isCorrect) => {
    setSubmitting(s => ({ ...s, [qid]: true }));
    try {
      await submitAttempt({ question: qid, selected_option: oid });
      const updated = await fetchAttempts();
      setAttempts(updated);
    } catch {
      alert('Failed to submit attempt. Are you logged in?');
    } finally {
      setSubmitting(s => ({ ...s, [qid]: false }));
    }
  };

  const attemptedCount = attempts.length;
  const correctCount = attempts.filter(a => a.is_correct).length;

  if (userLoading || loading) return (
    <div className="flex items-center justify-center h-screen text-lg">
      Loading questions...
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-screen text-red-600" role="alert">
      {error}
    </div>
  );
  if (!user) return (
    <div className="flex items-center justify-center h-screen text-lg">
      Please <a href="/login" className="underline text-blue-700">login</a> to practice questions.
    </div>
  );
  if (!user.email_verified) return (
    <div className="flex items-center justify-center h-screen text-lg">
      Please verify your email to access practice questions.
    </div>
  );

  return (
    <div>
      <a href="#practice-main-content" id="skip-to-practice-content" className="skip-link absolute left-2 top-2 bg-yellow-300 text-black px-3 py-1 rounded z-50 focus:translate-y-0 -translate-y-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition">Skip to practice content</a>
      <div id="practice-main-content" tabIndex={-1} className="flex flex-col items-center mt-8">
        <h1 className="text-2xl font-bold mb-4">Practice Questions</h1>
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <select className="border p-2 rounded" value={selected.chapter} onChange={e => setSelected(s => ({ ...s, chapter: e.target.value, topic: '' }))}>
            <option value="">All Chapters</option>
            {filters.chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
          </select>
          <select className="border p-2 rounded" value={selected.topic} onChange={e => setSelected(s => ({ ...s, topic: e.target.value }))}>
            <option value="">All Topics</option>
            {filters.topics.filter(t => !selected.chapter || t.chapter.id === Number(selected.chapter)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="border p-2 rounded" value={selected.type} onChange={e => setSelected(s => ({ ...s, type: e.target.value }))}>
            <option value="">All Types</option>
            {filters.types.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
          </select>
          <select className="border p-2 rounded" value={selected.level} onChange={e => setSelected(s => ({ ...s, level: e.target.value }))}>
            <option value="">All Levels</option>
            {filters.levels.map(lv => <option key={lv.value} value={lv.value}>{lv.label}</option>)}
          </select>
        </div>
        <div className="mb-4 text-center text-sm text-gray-600" role="status">
          Progress: {attemptedCount} attempted, {correctCount} correct
        </div>
        {questions.length === 0 && <div className="text-center">No questions found.</div>}
        {questions.map(q => (
          <div key={q.id} className={`bg-white rounded shadow p-6 mb-8 transition-all duration-300 ${getAttempt(q.id) ? (getAttempt(q.id).is_correct ? 'border-green-400 animate-pulse' : 'border-red-400 animate-shake') : ''}`} role="region" aria-label={`Question ${q.id}`}>
            <h2 className="mb-2 text-lg font-semibold" id={`question-${q.id}`}>{q.text}</h2>
            {q.images && q.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {q.images.map(img => <img key={img.id} src={img.image} alt="Question" className="h-16" />)}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {q.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`border rounded p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${getAttempt(q.id) && getAttempt(q.id).selected_option === idx ? (getAttempt(q.id).is_correct ? 'bg-green-200 border-green-500' : 'bg-red-200 border-red-500') : 'bg-white hover:bg-blue-50'} ${getAttempt(q.id) && getAttempt(q.id).selected_option === idx && !getAttempt(q.id).is_correct ? 'animate-shake' : ''}`}
                  onClick={() => handleAttempt(q.id, idx, option.is_correct)}
                  disabled={!!getAttempt(q.id)}
                  tabIndex={0}
                  aria-pressed={getAttempt(q.id) && getAttempt(q.id).selected_option === idx}
                  aria-labelledby={`question-${q.id}`}
                >
                  {option.text}
                </button>
              ))}
            </div>
            {getAttempt(q.id) && (
              <div className={`text-lg font-bold mt-2 ${getAttempt(q.id).is_correct ? 'text-green-600' : 'text-red-600'}`}>{getAttempt(q.id).is_correct ? 'Correct!' : 'Incorrect'}</div>
            )}
            <button
              className={`border rounded p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${showSolution[q.id] ? 'bg-green-200 border-green-500' : 'bg-white hover:bg-blue-50'}`}
              onClick={() => setShowSolution(s => ({ ...s, [q.id]: !s[q.id] }))}
            >
              {showSolution[q.id] ? 'Hide Solution' : 'Show Solution'}
            </button>
            {showSolution[q.id] && q.solutions && q.solutions.length > 0 && (
              <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                <div className="font-semibold mb-1">Solution:</div>
                <div dangerouslySetInnerHTML={{ __html: q.solutions[0].text }} />
                {q.solutions[0].images && q.solutions[0].images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {q.solutions[0].images.map(img => <img key={img.id} src={img.image} alt="Solution" className="h-10" />)}
                  </div>
                )}
              </div>
            )}
            {/* Confetti animation for correct answer */}
            <Confetti trigger={showConfetti} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Practice;
