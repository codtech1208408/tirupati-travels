import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle,
  XCircle,
  Flag,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Fuel,
  Car,
  Utensils,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

export const ExpenseReview = ({ expenses = [], trips = [], drivers = [], onRefresh, role = 'admin' }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeProof, setActiveProof] = useState(null); // lightbox image url
  const [reviewModalExpense, setReviewModalExpense] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  // Summaries
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalApproved = expenses
    .filter((e) => e.status === 'Approved')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalPending = expenses
    .filter((e) => e.status === 'Pending')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalRejected = expenses
    .filter((e) => e.status === 'Rejected')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleOpenReview = (exp, defaultStatus) => {
    setReviewModalExpense(exp);
    setReviewStatus(defaultStatus);
    setRemarks(exp.adminRemarks || '');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewModalExpense) return;
    setLoading(true);

    const token = localStorage.getItem('tb_token');
    try {
      const res = await fetch(`/api/expenses/${reviewModalExpense.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: reviewStatus,
          adminRemarks: remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update review');

      setReviewModalExpense(null);
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = expenses.filter((e) => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesSearch =
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      (e.driverName && e.driverName.toLowerCase().includes(search.toLowerCase())) ||
      e.tripId.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Fuel':
        return <Fuel className="w-4 h-4 text-orange-600" />;
      case 'Toll Gate':
        return <Car className="w-4 h-4 text-purple-600" />;
      case 'Food':
        return <Utensils className="w-4 h-4 text-emerald-600" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Driver Expense Review & Audit
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit fuel bills, FASTag tolls, food, and maintenance bills submitted from the Driver Mobile App
          </p>
        </div>
      </div>

      {/* 4 Expense Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Expenses Logged</p>
          <p className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            ₹{totalExpenses.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">{expenses.length} Total Receipts</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
          <p className="text-xs text-emerald-700 font-semibold">Approved Reimbursements</p>
          <p className="font-heading font-extrabold text-2xl text-emerald-900 mt-1">
            ₹{totalApproved.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600">Credited on Deal Close</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
          <p className="text-xs text-amber-700 font-semibold">Pending Review</p>
          <p className="font-heading font-extrabold text-2xl text-amber-900 mt-1">
            ₹{totalPending.toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-600">Requires Action</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 shadow-xs">
          <p className="text-xs text-red-700 font-semibold">Rejected Receipts</p>
          <p className="font-heading font-extrabold text-2xl text-red-900 mt-1">
            ₹{totalRejected.toLocaleString()}
          </p>
          <span className="text-[10px] text-red-600">Disallowed / Ineligible</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar">
          {['all', 'Pending', 'Approved', 'Rejected', 'Flagged'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === st
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="Fuel">Fuel (Diesel/Petrol)</option>
            <option value="Toll Gate">Toll Gate (FASTag)</option>
            <option value="Food">Food & Refreshments</option>
            <option value="Parking">Parking</option>
            <option value="Maintenance">Maintenance / Repair</option>
            <option value="Other">Other Expenses</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search driver, trip, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Expense & Category</th>
                <th className="px-4 py-3">Trip & Driver</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Proof / Receipt</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-5 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                        {getCategoryIcon(exp.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{exp.category}</span>
                          <span className="font-mono text-[10px] text-slate-400">({exp.id})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 max-w-xs truncate">
                          {exp.notes || 'No description'}
                        </p>
                        {exp.category === 'Fuel' && exp.fuelFilled && (
                          <span className="text-[10px] text-orange-600 font-semibold block">
                            {exp.fuelFilled}L • Odometer: {exp.odometerReading || 'N/A'} km
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block font-mono">
                        {exp.tripId}
                      </span>
                      <span className="text-slate-600 text-[11px] block">{exp.driverName}</span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(exp.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-heading font-extrabold text-sm text-slate-900 block">
                      ₹{exp.amount?.toLocaleString()}
                    </span>
                    {exp.paidBy === 'passenger' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold">
                        👤 Paid by Passenger
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        🚗 Paid by Driver
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    {exp.proof ? (
                      <button
                        onClick={() => setActiveProof(exp.proof)}
                        className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        <Eye className="w-3.5 h-3.5 text-orange-500" />
                        <span>View Proof</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No proof</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${exp.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : exp.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : exp.status === 'Flagged'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                    >
                      {exp.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="text-slate-600 text-[11px] max-w-xs truncate">
                      {exp.adminRemarks || '—'}
                    </p>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenReview(exp, 'Approved')}
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Approve Expense"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenReview(exp, 'Rejected')}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Reject Expense"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenReview(exp, 'Flagged')}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Flag for Clarification"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW ACTION MODAL */}
      {reviewModalExpense && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-[#1e1035] to-[#2b144d] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base">Review Driver Expense</h3>
                <p className="text-xs text-purple-200">
                  {reviewModalExpense.id} • {reviewModalExpense.category} (₹{reviewModalExpense.amount})
                </p>
              </div>
              <button
                onClick={() => setReviewModalExpense(null)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 space-y-4 text-xs">
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${reviewModalExpense.paidBy === 'passenger'
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
              >
                <div>
                  <span className="font-bold block text-xs">
                    {reviewModalExpense.paidBy === 'passenger' ? '👤 Paid by Passenger' : '🚗 Paid by Driver'}
                  </span>
                  <span className="text-[11px] opacity-80 block mt-0.5">
                    {reviewModalExpense.paidBy === 'passenger'
                      ? 'Deducted from client trip package bill balance.'
                      : 'Added to driver salary payout during settlement.'}
                  </span>
                </div>
                <span className="font-heading font-extrabold text-base">
                  ₹{Number(reviewModalExpense.amount || 0).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">Set Review Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Approved', 'Rejected', 'Flagged'].map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setReviewStatus(st)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-all ${reviewStatus === st
                          ? st === 'Approved'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'Rejected'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Admin Remarks / Feedback to Driver
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g., FASTag bill verified, Fuel odometer validated, Bill illegible please re-upload..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1">
                  The driver receives an instant notification with your status and remarks.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReviewModalExpense(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Confirm Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROOF LIGHTBOX MODAL */}
      {activeProof && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-4">
            <button
              onClick={() => setActiveProof(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <img
                src={activeProof}
                alt="Receipt Proof"
                className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
              />
              <p className="text-slate-400 text-xs mt-3">
                Official Bill / Screenshot submitted by driver from Android mobile terminal
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

