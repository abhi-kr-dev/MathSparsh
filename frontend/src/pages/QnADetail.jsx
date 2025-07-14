import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const QnADetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQnA = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/public-questions/${id}/`);
        setQuestion(res.data);
      } catch (err) {
        setError('Failed to load question.');
      } finally {
        setLoading(false);
      }
    };
    fetchQnA();
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto p-4 mt-8">Loading...</div>;
  if (error) return <div className="max-w-2xl mx-auto p-4 mt-8 text-red-600">{error}</div>;
  if (!question) return null;

  return (
    <>
      <Helmet>
        <title>{question.text ? `${question.text.slice(0, 60)} | Math Q&A` : 'Math Q&A | MathSparsh'}</title>
        <meta name="description" content={
          question.solution?.answer_text
            ? `${question.text?.slice(0, 120) || ''} Solution: ${question.solution.answer_text.slice(0, 120)}`
            : question.text?.slice(0, 160) || 'MathSparsh Q&A archive.'
        } />
      </Helmet>
      <article className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-8" itemScope itemType="https://schema.org/QAPage">
        <Link to="/qna" className="text-blue-600 hover:underline">&larr; Back to Q&A</Link>
        <h1 className="text-2xl font-bold mt-2 mb-4" itemProp="name">{question.text || 'Untitled Question'}</h1>
        {question.image && (
          <img src={question.image} alt="Question illustration" className="my-2 max-h-64" />
        )}
        <div className="text-xs text-gray-500 mb-2">
          Asked: {new Date(question.created_at).toLocaleString()}
        </div>
        {question.solution ? (
          <section className="mt-6" itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
            <h2 className="text-xl font-semibold mb-2">Solution</h2>
            <div className="prose prose-slate" itemProp="text">
              {question.solution.answer_text}
            </div>
            {question.solution.answer_image && (
              <img src={question.solution.answer_image} alt="Solution illustration" className="my-2 max-h-64" />
            )}
            <div className="text-xs text-gray-400 mt-2">
              Answered by: {question.solution.answered_by || 'Staff'} | {new Date(question.solution.created_at).toLocaleString()}
            </div>
          </section>
        ) : (
          <div className="mt-6 text-yellow-700">No solution posted yet. Please check back soon!</div>
        )}
        <meta itemProp="mainEntity" content={`Q${question.id}`} />
      </article>
    </>
  );
};

export default QnADetail;
