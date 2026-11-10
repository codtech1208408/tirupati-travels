import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Wallet,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const SalaryClosingModal = ({ trip, isOpen, onClose, onSuccess }) => {
  const [salary, setSalary] = useState(trip?.salary || 18000);
  const [amount, setAmount] = useState(trip?.amount || 25000);
  const [closeNotes, setCloseNotes] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip) {
      setSalary(trip.salary || 18000);
      setAmount(trip.amount || 25000);
      // Fetch expenses for this trip
      const token = localStorage.getItem('tb_token');
      fetch(`/api/expenses?tripId=${trip.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setExpenses(data.expenses || []))
        .catch(console.error);
    }
  }, [trip]);

  if (!isOpen || !trip) return null;

  const approvedExpenses = expenses.filter((e) => e.status === 'Approved');
  const pendingExpenses = expenses.filter((e) => e.status === 'Pending');
  const totalApproved = approvedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalPending = pendingExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const numSalary = Number(salary) || 0;
  const numAmount = Number(amount) || 0;
  const totalCreditToWallet = numSalary; // Trip salary to credit

  const handleCloseDeal = async (e) => {
    e.preventDefault();
    if (numSalary <= 0) {
      setError('Please specify a valid driver salary for this trip.');
      return;
    }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('tb_token');

    try {
      const res = await fetch(`/api/trips/${trip.id}/close-deal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          salary: numSalary,
          amount: numAmount,
          notes: closeNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to close project');

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e1035] to-[#2b144d] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 rounded-lg text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg">Close Project & Assign Driver Salary</h3>
              <p className="text-xs text-purple-200">
                Final project settlement for {trip.id} • Driver: {trip.driverName || 'Assigned Driver'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCloseDeal} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Workflow Notice */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-purple-900">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              Project Closing Workflow
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              1. Review logged driver expenses and verify route completion.
              <br />
              2. Assign the driver's trip remuneration salary and total project billing.
              <br />
              3. Closing the project locks it as <strong>Closed (read-only)</strong> and instantly credits the driver's wallet.
            </p>
          </div>

          {/* Expense Audit Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-orange-500" />
                Driver Expenses Logged ({expenses.length})
              </span>
              <span className="font-heading font-bold text-slate-900">
                Total: ₹
                {expenses
                  .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
                  .toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span className="block font-medium">Approved Reimbursements:</span>
                <span className="font-bold text-sm">₹{totalApproved.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                <span className="block font-medium">Pending Approvals:</span>
                <span className="font-bold text-sm">₹{totalPending.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Project Billing Amount & Driver Salary Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Project Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Total package booking revenue"
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-heading font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Client tour package revenue</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driver Trip Salary (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-heading font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Remuneration credited to driver</p>
            </div>
          </div>

          {/* Closing Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Closing Remarks & Feedback Notes
            </label>
            <textarea
              rows="2"
              placeholder="Pilgrim feedback satisfactory, vehicle inspected, trip closed successfully..."
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
            ></textarea>
          </div>

          {/* Net Credit Summary Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
                  Net Wallet Credit to Driver
                </p>
                <p className="text-xs text-white/90">Instant ledger balance update</p>
              </div>
            </div>
            <span className="font-heading font-extrabold text-2xl">
              ₹{totalCreditToWallet.toLocaleString()}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{loading ? 'Closing Project...' : 'Assign Salary & Close Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

