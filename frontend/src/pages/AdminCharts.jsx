import React from 'react';

export function BarChart({ title, data = [], color = 'bg-blue-400' }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex flex-col items-center w-full">
      <div className="font-semibold mb-2">{title}</div>
      <div className="flex items-end h-24 w-full gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            <div
              className={`${color} rounded-t w-3 md:w-5 transition-all`}
              style={{ height: `${(d.count / max) * 90 || 2}px` }}
              title={`${d.date}: ${d.count}`}
            />
            <div className="text-[10px] text-gray-500 mt-1">{d.date.slice(5)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopUsersTable({ title, users = [], field = 'attempts' }) {
  return (
    <div className="w-full">
      <div className="font-semibold mb-2">{title}</div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 text-left">User</th>
            <th className="px-2 py-1 text-right">{field.charAt(0).toUpperCase() + field.slice(1)}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="odd:bg-gray-50">
              <td className="px-2 py-1">{u.username}</td>
              <td className="px-2 py-1 text-right">{u[field]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
