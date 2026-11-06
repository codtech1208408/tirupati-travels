import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Users,
  MapPin,
  CheckCircle,
  Clock,
  Trash2,
  Sparkles,
  Search,
} from 'lucide-react';

export const InquiriesManagement = ({ inquiries = [], onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleUpdateStatus = async (inqId, newStatus) => {
    const token = localStorage.getItem('tb_token');
    try {
      await fetch(`/api/inquiries/${inqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (inqId) => {
    if (!window.confirm('Delete this inquiry?')) return;
    const token = localStorage.getItem('tb_token');
    try {
      await fetch(`/api/inquiries/${inqId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefresh();
    } catch (err) {
      alert('Failed to delete inquiry');
    }
  };

  const filtered = inquiries.filter((inq) => {
    const sMatch = statusFilter === 'all' || inq.status === statusFilter;
    const qMatch =
      inq.name.toLowerCase().includes(search.toLowerCase()) ||
      inq.phone.includes(search) ||
      (inq.packageName && inq.packageName.toLowerCase().includes(search.toLowerCase()));
    return sMatch && qMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Pilgrim Booking Inquiries & Leads
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time inquiries and quote requests submitted through the public Tirupati Balaji travel portal
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by pilgrim name, phone, or package..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
          >
            <option value="all">All Inquiries</option>
            <option value="New">New Only</option>
            <option value="Contacted">Contacted</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Pilgrim / Group</th>
                <th className="px-4 py-3">Package Requested</th>
                <th className="px-4 py-3">Travel Date & City</th>
                <th className="px-4 py-3">Special Instructions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inq) => (
                <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{inq.name}</p>
                      <p className="text-slate-700 text-xs flex items-center gap-1 mt-0.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-orange-500" />
                        {inq.phone}
                      </p>
                      {inq.email && (
                        <p className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {inq.email}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-semibold text-slate-900 block">{inq.packageName}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        {inq.travellersCount || 1} Travellers
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {inq.preferredDate || 'Flexible'}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        {inq.pickupCity || 'Tirupati'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="text-slate-600 max-w-xs text-[11px] italic">
                      {inq.message || 'Standard darshan inquiry'}
                    </p>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        inq.status === 'New'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : inq.status === 'Contacted'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                        className="px-2 py-1 text-[11px] border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Confirmed">Confirmed</option>
                      </select>
                      <button
                        onClick={() => handleDelete(inq.id)}
                        className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No booking inquiries found
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

