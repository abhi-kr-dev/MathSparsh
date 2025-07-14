import React, { useEffect, useState } from 'react';
import { fetchSiteSettings } from '../utils/api';

function Home() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSiteSettings()
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not load site settings');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen text-lg" role="status">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-600" role="alert">{error}</div>;

  return (
    <>
      <a href="#main-home-content" id="skip-to-home-content" className="skip-link absolute left-2 top-2 bg-yellow-300 text-black px-3 py-1 rounded z-50 focus:translate-y-0 -translate-y-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition">Skip to main content</a>
      <div className="mt-6 text-xl font-semibold text-blue-700">Welcome to the new MathSparsh homepage!</div>
      <main id="main-home-content" tabIndex={-1} className="min-h-screen bg-gray-50 flex flex-col items-center" aria-label="Homepage main content">
        {settings.logo && (
          <img src={settings.logo} alt={settings.site_name ? settings.site_name + ' logo' : 'Site logo'} className="h-24 mt-8 mb-4" />
        )}
        <h1 className="text-3xl font-bold mb-2">{settings.site_name || 'MathSparsh'}</h1>
        {settings.banner && (
          <img src={settings.banner} alt={settings.site_name ? settings.site_name + ' banner' : 'Site banner'} className="w-full max-w-3xl rounded mb-4" />
        )}
        <div className="prose prose-lg max-w-2xl text-center" dangerouslySetInnerHTML={{ __html: settings.homepage_content || '' }} />
      </main>
    </>
  );
}

export default Home;
