import React, { useEffect, useState } from 'react';
import { fetchUser } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart, TopUsersTable } from './AdminCharts';

function Dashboard() {
  // State declarations
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch user on mount
  useEffect(() => {
    fetchUser()
      .then(setUser)
      .catch(() => setError('Could not fetch user'));
  }, []);
  // Accessibility: focus skip link
  useEffect(() => {
    const skip = document.getElementById('skip-to-content');
    if (skip) {
      skip.addEventListener('click', e => {
        const main = document.getElementById('main-content');
        if (main) main.focus();
      });
    }
    return () => {
      if (skip) skip.removeEventListener('click', () => {});
    };
  }, []);

  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch('/api/user/stats/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    if (user.role !== 'admin') return;
    setLoading(true);
    const params = `?start=${startDate}&end=${endDate}`;
    fetch(`/api/admin/analytics/${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    })
      .then(r => r.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setAnalytics({ error: 'Could not load analytics' }));
  }, [user.role, startDate, endDate]);

  const downloadCSV = e => {
    e.preventDefault();
    const params = `?start=${startDate}&end=${endDate}&export=csv`;
    fetch(`/api/admin/analytics/${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    })
      .then(r => r.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'analytics.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-lg">Loading dashboard...</div>;
  if (error || !user) return <div className="flex items-center justify-center h-screen text-red-600">{error || 'Not logged in.'}</div>;

  // Keyboard shortcut: Alt+A to focus analytics
  useEffect(() => {
    const handler = e => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        const analytics = document.getElementById('admin-analytics-section');
        if (analytics) analytics.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div id="main-content" tabIndex={-1} className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="mb-2 flex flex-col items-center">
        <span className="font-semibold">{user.username}</span>
        <span className={
          user.role === 'premium' ? 'bg-purple-600 text-white px-2 py-1 rounded text-xs ml-2' :
          user.role === 'admin' ? 'bg-blue-600 text-white px-2 py-1 rounded text-xs ml-2' :
          'bg-yellow-400 text-white px-2 py-1 rounded text-xs ml-2'
        }>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
        {user && user.email_verified ? (
          <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-1">Email Verified</span>
        ) : (
          <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs mt-1">Email Not Verified</span>
        )}
        {/* Phone number update */}
        <PhoneNumberSection user={user} />
      </div>
      {user && !user.email_verified && (
        <div className="my-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded text-center">
          Please verify your email to unlock all features. <br/>
          <a href="/dashboard" className="underline text-blue-700">Resend verification from registration page if needed.</a>
        </div>
      )}
      {stats && (
        <div className="my-6 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">Attempted</div>
            <div className="text-xl font-bold">{stats.total_attempts}</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">Correct</div>
            <div className="text-xl font-bold text-green-600">{stats.correct_attempts}</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">Accuracy</div>
            <div className="text-xl font-bold">{stats.accuracy}%</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">Streak</div>
            <div className="text-xl font-bold">{stats.streak}d</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">Last Activity</div>
            <div className="text-xl font-bold">{stats.last_activity ? new Date(stats.last_activity).toLocaleDateString() : '-'}</div>
          </div>
        </div>
      )}
      {user && user.role === 'admin' && analytics && (
        <div>
          <a href="#admin-analytics-section" id="skip-to-analytics" className="skip-link absolute left-2 top-16 bg-yellow-300 text-black px-3 py-1 rounded z-50 focus:translate-y-0 -translate-y-12 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition">Skip to analytics</a>
          <section id="admin-analytics-section" tabIndex={-1} className="w-full max-w-5xl mt-10 outline-none" aria-label="Admin Analytics" aria-live="polite">
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-4 w-full max-w-3xl text-center mx-auto">
              <div className="font-bold mb-2">Admin Analytics</div>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-4">
                <div>
                  <label className="mr-2 font-medium">Start</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="mr-2 font-medium">End</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
                </div>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                  onClick={downloadCSV}
                >
                  Export CSV
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
      <div className="text-sm text-gray-600 mb-2">Site usage summary and recent attempts</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded p-2" aria-label="Users" role="definition">Users: {analytics.total_users}</div>
        <div className="bg-white rounded p-2" aria-label="Questions" role="definition">Questions: {analytics.total_questions}</div>
        <div className="bg-white rounded p-2" aria-label="Attempts" role="definition">Attempts: {analytics.total_attempts}</div>
        <div className="bg-white rounded p-2" aria-label="Premium" role="definition">Premium: {analytics.top_users_by_attempts?.filter(u=>u.role==='premium').length ?? 0}</div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 justify-center mb-6">
        <BarChart title="Signups" data={analytics.signups_per_day} color="bg-blue-400" aria-label="Signups Chart" role="img" />
        <BarChart title="Attempts" data={analytics.attempts_per_day} color="bg-green-400" aria-label="Attempts Chart" role="img" />
        <BarChart title="Premium Upgrades" data={analytics.premium_per_day} color="bg-purple-400" aria-label="Premium Upgrades Chart" role="img" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopUsersTable title="Top Users by Attempts" users={analytics.top_users_by_attempts} field="attempts" aria-label="Top Users by Attempts Table" role="table" />
        <TopUsersTable title="Top Users by Correct" users={analytics.top_users_by_correct} field="correct" aria-label="Top Users by Correct Table" role="table" />
      </div>
      <div className="overflow-x-auto mt-6">
        <div className="font-semibold mb-1">Recent Attempts</div>
        <table className="w-full text-xs mt-2" aria-label="Recent Attempts Table" role="table">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-2 py-1" scope="col">User</th>
              <th className="px-2 py-1" scope="col">Question</th>
              <th className="px-2 py-1" scope="col">Correct</th>
              <th className="px-2 py-1" scope="col">Time</th>
            </tr>
          </thead>
          {/* Table body and other content here */}
        </table>
      </div>
              <div className="bg-white rounded p-2">Premium: {analytics.top_users_by_attempts?.filter(u=>u.role==='premium').length ?? 0}</div>
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-6">
            <BarChart title="Signups" data={analytics.signups_per_day} color="bg-blue-400" />
            <BarChart title="Attempts" data={analytics.attempts_per_day} color="bg-green-400" />
        </div>
      )}
      {user && user.role === 'premium' && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded p-4 w-full max-w-md text-center">
          <div className="font-bold mb-2">Premium Features</div>
          <ul className="list-disc list-inside text-left">
            <li>Unlimited practice & solutions</li>
            <li>Access to premium question sets</li>
            <li>Progress tracking (coming soon)</li>
          </ul>
        </div>
      )}
      {user && user.role === 'free' && (
  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-4 w-full max-w-md text-center">
    <div className="font-bold mb-2">Free User</div>
    <div>Upgrade to premium for unlimited access and advanced features!</div>
    <button
      className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      onClick={async () => {
        const res = await fetch('/api/create-stripe-checkout/', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
        });
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          alert('Could not start payment.');
        }
      }}
    >Go Premium</button>
  </div>
)
        </div>
      )}
      <div className="mt-8 text-gray-500">More dashboard features coming soon.</div>
    </div>
  );
}

// PhoneNumberSection must be defined outside Dashboard and not inside any other function/component
function PhoneNumberSection({ user }) {
  const [editing, setEditing] = React.useState(false);
  const [phone, setPhone] = React.useState(user.phone_number || '');
  const [status, setStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/user/update/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
        body: JSON.stringify({ phone_number: phone })
      });
      if (res.ok) {
        setStatus('Phone number updated!');
        setEditing(false);
      } else {
        setStatus('Failed to update phone number.');
      }
    } catch {
      setStatus('Network error.');
    }
    setLoading(false);
  };

  if (!editing)
    return (
      <div className="mt-2 text-sm">
        <span className="font-medium">Phone:</span> {user.phone_number || <span className="text-gray-400">Not set</span>}
        <button className="ml-2 text-blue-600 underline" onClick={() => setEditing(true)}>Edit</button>
        {status && <div className="text-xs text-green-600">{status}</div>}
      </div>
    );
  return (
    <form className="flex flex-col gap-2 mt-2" onSubmit={handleSave}>
      <label htmlFor="phone_number" className="font-medium text-sm">Phone Number (for SMS notifications)</label>
      <input
        type="tel"
        id="phone_number"
        name="phone_number"
        className="border rounded p-1"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        pattern="[0-9+\-() ]{7,20}"
        placeholder="Enter your phone number"
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditing(false)}>Cancel</button>
      </div>
      {status && <div className="text-xs text-green-600">{status}</div>}
    </form>
  );
}

export default Dashboard;
