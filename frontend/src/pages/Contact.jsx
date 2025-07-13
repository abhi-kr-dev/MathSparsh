import React, { useState } from 'react';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', phone: '', category: 'General', message: '', file: null });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    if (e.target.type === 'file') {
      setForm({ ...form, file: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };


  const handleSubmit = e => {
    e.preventDefault();
    setError(null);
    // Placeholder: Simulate success
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Name, Email, Subject, and Message are required.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <a href="#contact-main-content" id="skip-to-contact-content" className="skip-link absolute left-2 top-2 bg-yellow-300 text-black px-3 py-1 rounded z-50 focus:translate-y-0 -translate-y-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition">Skip to main content</a>
      <main id="contact-main-content" tabIndex={-1} className="min-h-screen bg-gray-50 flex flex-col items-center p-4" aria-label="Contact MathSparsh">
        <h1 className="text-3xl font-bold mb-4 mt-8">Contact Us</h1>
        <form className="w-full max-w-md bg-white rounded shadow p-6" onSubmit={handleSubmit} aria-label="Contact form">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.name}
              onChange={handleChange}
              required
              aria-required="true"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.email}
              onChange={handleChange}
              required
              aria-required="true"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.subject}
              onChange={handleChange}
              required
              aria-required="true"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">Phone (optional)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.phone}
              onChange={handleChange}
              aria-required="false"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Category</label>
            <select
              id="category"
              name="category"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.category}
              onChange={handleChange}
              required
              aria-required="true"
            >
              <option value="General">General</option>
              <option value="Feedback">Feedback</option>
              <option value="Support">Support</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.message}
              onChange={handleChange}
              required
              aria-required="true"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="file" className="block text-gray-700 font-semibold mb-2">File Upload (optional, images/pdf)</label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*,application/pdf"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
              aria-required="false"
            />
            {form.file && <div className="mt-1 text-sm text-gray-600">Selected: {form.file.name}</div>}
          </div>
          {error && <div className="mb-4 text-red-600" role="alert">{error}</div>}
          {submitted ? (
            <div className="mb-4 text-green-700 font-semibold" role="status">Thank you for reaching out! We will get back to you soon.</div>
          ) : (
            <button
              type="submit"
              className="w-full bg-blue-700 text-white font-semibold py-2 px-4 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              Send Message
            </button>
          )}
        </form>
      </main>
    </>
  );
}

export default Contact;

