import React, { useState } from 'react';
import { ShieldCheck, Search, Clock, User, Filter } from 'lucide-react';

export const ActivityLogs = ({ logs = [] }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = logs.filter((log) => {
    const rMatch = roleFilter === 'all' || log.userRole === roleFilter;
    const sMatch =
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    return rMatch && sMatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
          System Activity & Audit Trail
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit record of all manager, driver, and administrator operations across the platform
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by action, user, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin Actions</option>
            <option value="manager">Manager Actions</option>
            <option value="driver">Driver Actions</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor / User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-5 py-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    {log.userName}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                        log.userRole === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : log.userRole === 'manager'
                          ? 'bg-blue-100 text-blue-800'
                          : log.userRole === 'driver'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.userRole}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-slate-800">
                    {log.action}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No activity logs recorded matching criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

