import React from 'react';

function About() {
  return (
    <>
      <a href="#about-main-content" id="skip-to-about-content" className="skip-link absolute left-2 top-2 bg-yellow-300 text-black px-3 py-1 rounded z-50 focus:translate-y-0 -translate-y-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition">Skip to main content</a>
      <main id="about-main-content" tabIndex={-1} className="min-h-screen bg-gray-50 flex flex-col items-center p-4" aria-label="About MathSparsh">
        <h1 className="text-3xl font-bold mb-4 mt-8">About MathSparsh</h1>
        <section className="max-w-2xl text-lg text-center mb-6">
          <p className="mb-4">MathSparsh is dedicated to making mathematics accessible, engaging, and fun for all learners. Our platform offers interactive practice, insightful analytics, and a supportive learning community.</p>
          <p className="mb-4">Our mission is to empower students and educators by providing high-quality content, adaptive practice, and advanced analytics, all with a focus on accessibility and user experience.</p>
        </section>
        <section className="max-w-2xl text-lg text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Our Team</h2>
          <p>We are a passionate group of educators, developers, and designers committed to transforming math education for the digital age.</p>
        </section>
        <section className="max-w-2xl text-lg text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Contact & Feedback</h2>
          <p>Have questions or suggestions? Visit our <a href="/contact" className="text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-400">Contact</a> page.</p>
        </section>
      </main>
    </>
  );
}

export default About;
