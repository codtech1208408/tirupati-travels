import React, { useState } from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  User,
  Phone,
  Car,
  Calendar,
  CreditCard,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Receipt,
  Check,
} from 'lucide-react';

export const SalariesAndSettlements = ({ trips = [], drivers = [], onRefresh, role = 'admin' }) => {
  const [selectedDriverId, setSelectedDriverId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'due' | 'paid'
  const [search, setSearch] = useState('');
  const [settlingTrip, setSettlingTrip] = useState(null); // Trip currently being settled
  const [bulkSettlingDriver, setBulkSettlingDriver] = useState(null); // Driver for bulk settling
  const [paymentMode, setPaymentMode] = useState('UPI / Google Pay');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Consider trips that are completed, closed, or ongoing (where work was allocated/performed)
  const relevantTrips = trips.filter(
    (t) => t.status === 'Completed' || t.status === 'Closed' || t.status === 'Ongoing'
  );

  // Overall Financial Calculations
  const totalSalariesEarned = relevantTrips.reduce((sum, t) => sum + (Number(t.salary) || 0), 0);
  const totalSalariesPaid = relevantTrips
    .filter((t) => t.salaryStatus === 'Paid')
    .reduce((sum, t) => sum + (Number(t.salary) || 0), 0);
  const totalOutstandingDues = relevantTrips
    .filter((t) => t.salaryStatus !== 'Paid' && (Number(t.salary) > 0))
    .reduce((sum, t) => sum + (Number(t.salary) || 0), 0);

  // Calculate Driver-wise Stats
  const driverStats = drivers.map((driver) => {
    const driverTrips = relevantTrips.filter((t) => t.driverId === driver.id);
    const tripsDone = driverTrips.length;
    const salaryEarned = driverTrips.reduce((sum, t) => sum + (Number(t.salary) || 0), 0);
    const salaryPaid = driverTrips
      .filter((t) => t.salaryStatus === 'Paid')
      .reduce((sum, t) => sum + (Number(t.salary) || 0), 0);
    const duesPending = driverTrips
      .filter((t) => t.salaryStatus !== 'Paid' && (Number(t.salary) > 0))
      .reduce((sum, t) => sum + (Number(t.salary) || 0), 0);

    return {
      ...driver,
      tripsDone,
      salaryEarned,
      salaryPaid,
      duesPending,
      driverTrips,
    };
  });

  const driversWithDuesCount = driverStats.filter((d) => d.duesPending > 0).length;

  // Filtered drivers list
  const filteredDriverStats = driverStats.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.mobile && d.mobile.includes(search));
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'due'
        ? d.duesPending > 0
        : d.duesPending === 0 && d.salaryEarned > 0;
    return matchesSearch && matchesStatus;
  });

  // Current active driver for focused inspection
  const activeDriver =
    selectedDriverId !== 'all' ? driverStats.find((d) => d.id === selectedDriverId) : null;

  // Trips to display in the main table
  let displayTrips = relevantTrips;
  if (selectedDriverId !== 'all') {
    displayTrips = displayTrips.filter((t) => t.driverId === selectedDriverId);
  }
  if (statusFilter === 'due') {
    displayTrips = displayTrips.filter((t) => t.salaryStatus !== 'Paid' && Number(t.salary) > 0);
  } else if (statusFilter === 'paid') {
    displayTrips = displayTrips.filter((t) => t.salaryStatus === 'Paid');
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    displayTrips = displayTrips.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.driverName && t.driverName.toLowerCase().includes(q)) ||
        (t.route && t.route.toLowerCase().includes(q))
    );
  }

  // Handle single trip salary settlement
  const handleSettleTripSalary = async (e) => {
    e.preventDefault();
    if (!settlingTrip) return;

    setLoading(true);
    const token = localStorage.getItem('tb_token');
    try {
      const res = await fetch(`/api/trips/${settlingTrip.id}/settle-salary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMode,
          notes: paymentNotes || `Settled ₹${settlingTrip.salary} via ${paymentMode}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to settle salary');

      setActionSuccess(`✓ Trip ${settlingTrip.id} salary settled successfully!`);
      setSettlingTrip(null);
      setPaymentNotes('');
      if (onRefresh) await onRefresh();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle settling all dues for a driver in one click
  const handleSettleAllDues = async (e) => {
    e.preventDefault();
    if (!bulkSettlingDriver) return;

    setLoading(true);
    const token = localStorage.getItem('tb_token');
    try {
      const res = await fetch(`/api/drivers/${bulkSettlingDriver.id}/settle-all-dues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to settle dues');

      setActionSuccess(`✓ Settled all pending dues (₹${bulkSettlingDriver.duesPending.toLocaleString()}) for ${bulkSettlingDriver.name}!`);
      setBulkSettlingDriver(null);
      if (onRefresh) await onRefresh();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] mb-2 uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Pilot Settlements & Payouts</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Driver Salaries & Outstanding Dues
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Review completed trips for each driver, examine earned trip salaries, and settle pending dues with instant ledger receipts.
            </p>
          </div>

          {selectedDriverId !== 'all' && (
            <button
              onClick={() => setSelectedDriverId('all')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
            >
              ← View All Drivers
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Salary Earned */}
        <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
              Total Earned
            </span>
            <div className="p-2 bg-white/10 rounded-xl">
              <DollarSign className="w-4 h-4 text-purple-200" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              ₹{totalSalariesEarned.toLocaleString()}
            </p>
            <p className="text-[11px] text-purple-200 mt-1">
              Across all completed & ongoing trips
            </p>
          </div>
        </div>

        {/* Total Paid / Settled */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Total Paid
            </span>
            <div className="p-2 bg-white/10 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              ₹{totalSalariesPaid.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-200 mt-1">
              Disbursed to driver wallets / accounts
            </p>
          </div>
        </div>

        {/* Total Outstanding Dues */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 animate-pulse">
              ● Outstanding Dues
            </span>
            <div className="p-2 bg-white/10 rounded-xl">
              <Clock className="w-4 h-4 text-amber-100" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              ₹{totalOutstandingDues.toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-100 mt-1">
              Pending salary payouts due to pilots
            </p>
          </div>
        </div>

        {/* Drivers with Dues */}
        <div className="bg-gradient-to-br from-[#1e1035] via-[#2f1352] to-[#40186e] text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
              Pilots With Dues
            </span>
            <div className="p-2 bg-white/10 rounded-xl">
              <User className="w-4 h-4 text-purple-200" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              {driversWithDuesCount} / {drivers.length}
            </p>
            <p className="text-[11px] text-purple-200 mt-1">
              Drivers awaiting salary disbursement
            </p>
          </div>
        </div>
      </div>

      {/* Driver Selection & Overview Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Driver Financial Summary Cards
            </h3>
            <p className="text-xs text-slate-500">
              Select any driver to filter their trip history, earned salary, and pending dues
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedDriverId('all');
                setStatusFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedDriverId === 'all' && statusFilter === 'all'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Drivers ({driverStats.length})
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'due' ? 'all' : 'due')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'due'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>Has Dues</span>
              <span className="px-1.5 py-0.2 bg-white/30 rounded-full text-[10px]">
                {driversWithDuesCount}
              </span>
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Driver Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {filteredDriverStats.slice(0, 6).map((drv) => {
            const isSelected = selectedDriverId === drv.id;
            return (
              <div
                key={drv.id}
                onClick={() => setSelectedDriverId(isSelected ? 'all' : drv.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-400/50 shadow-md'
                    : 'border-slate-200 hover:border-orange-300 bg-white hover:bg-slate-50/70 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        drv.photo ||
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
                      }
                      alt={drv.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-600/30 shrink-0"
                    />
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900 leading-tight">
                        {drv.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {drv.mobile || 'Pilot'}
                      </p>
                    </div>
                  </div>

                  {drv.duesPending > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold shrink-0">
                      ₹{drv.duesPending.toLocaleString()} Due
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold shrink-0">
                      ✓ Settled
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Trips Done
                    </span>
                    <span className="font-heading font-bold text-xs text-slate-800">
                      {drv.tripsDone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Salary Earned
                    </span>
                    <span className="font-heading font-bold text-xs text-slate-800">
                      ₹{drv.salaryEarned.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Due Amount
                    </span>
                    <span
                      className={`font-heading font-bold text-xs ${
                        drv.duesPending > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      ₹{drv.duesPending.toLocaleString()}
                    </span>
                  </div>
                </div>

                {drv.duesPending > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBulkSettlingDriver(drv);
                    }}
                    className="mt-3 w-full py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Settle All Dues (₹{drv.duesPending.toLocaleString()})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Driver Inspection Banner (if a single driver is selected) */}
      {activeDriver && (
        <div className="bg-gradient-to-r from-[#1e1035] to-[#3a1768] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                activeDriver.photo ||
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120'
              }
              alt={activeDriver.name}
              className="w-14 h-14 rounded-full object-cover ring-4 ring-orange-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-white">
                  {activeDriver.name}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-purple-800 text-purple-200 text-[10px] font-semibold">
                  Pilot ID: {activeDriver.id}
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Mobile: {activeDriver.mobile || 'N/A'} • Email: {activeDriver.email}
              </p>
              <p className="text-[11px] text-orange-300 font-semibold mt-1">
                Completed Trips: {activeDriver.tripsDone} • Total Earned: ₹
                {activeDriver.salaryEarned.toLocaleString()} • Outstanding Dues: ₹
                {activeDriver.duesPending.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeDriver.duesPending > 0 && (
              <button
                type="button"
                onClick={() => setBulkSettlingDriver(activeDriver)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Settle ₹{activeDriver.duesPending.toLocaleString()} Dues</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedDriverId('all')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Filter ✕
            </button>
          </div>
        </div>
      )}

      {/* Trips Done by Driver Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3">
        {/* Table Header & Search */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              {selectedDriverId === 'all'
                ? 'All Completed Trips & Salary Records'
                : `Trips Done by ${activeDriver?.name || 'Selected Driver'}`}
            </h3>
            <p className="text-xs text-slate-500">
              Trip route, completion date, driver salary amount, and payment dues
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search trip ID, route, pilot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Trips Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Trip ID & Route</th>
                <th className="px-4 py-3">Assigned Pilot (Driver)</th>
                <th className="px-4 py-3">Schedule / Ended At</th>
                <th className="px-4 py-3">Vehicle Details</th>
                <th className="px-4 py-3">Trip Salary</th>
                <th className="px-4 py-3">Due / Payment Status</th>
                <th className="px-5 py-3 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayTrips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    No trips found matching the selected filters.
                  </td>
                </tr>
              ) : (
                displayTrips.map((trip) => {
                  const isPaid = trip.salaryStatus === 'Paid';
                  const salary = Number(trip.salary) || 0;

                  return (
                    <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Trip & Route */}
                      <td className="px-5 py-3.5">
                        <div className="font-heading font-bold text-slate-900 text-xs">
                          {trip.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-slate-700">{trip.id}</span>
                          <span>•</span>
                          <span className="truncate max-w-xs">{trip.route}</span>
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {trip.driverName ? trip.driverName.charAt(0) : 'P'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 text-xs block">
                              {trip.driverName || 'Pilot'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {trip.driverId || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Schedule / Ended At */}
                      <td className="px-4 py-3.5">
                        {trip.endedAt ? (
                          <div>
                            <span className="font-semibold text-slate-800 text-xs block">
                              Ended:{' '}
                              {new Date(trip.endedAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(trip.endedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-slate-800 text-xs block">
                              {new Date(trip.startDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Status: {trip.status}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Vehicle Details */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-700 font-medium block">
                          {trip.vehicleDetails || 'Fleet Vehicle'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {trip.vehicleType || 'Standard'}
                        </span>
                      </td>

                      {/* Trip Salary */}
                      <td className="px-4 py-3.5">
                        <span className="font-heading font-extrabold text-sm text-slate-900 block">
                          ₹{salary.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">Allocated Salary</span>
                      </td>

                      {/* Due / Payment Status */}
                      <td className="px-4 py-3.5">
                        {isPaid ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Paid & Settled</span>
                            </span>
                            {trip.salaryPaymentMode && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                via {trip.salaryPaymentMode}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px] animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Due (Pending)</span>
                            </span>
                            <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                              ₹{salary.toLocaleString()} awaiting payout
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right">
                        {isPaid ? (
                          <span className="text-xs text-emerald-600 font-bold inline-flex items-center gap-1">
                            ✓ Settled
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSettlingTrip(trip)}
                            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Settle Due</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Settle Single Trip Salary */}
      {settlingTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-[#1e1035] to-[#3a1768] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-400" />
                <h3 className="font-heading font-bold text-base text-white">
                  Settle Trip Due Salary
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSettlingTrip(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleTripSalary} className="p-5 space-y-4">
              <div className="p-3.5 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-xs text-slate-600 font-medium">Trip: <strong>{settlingTrip.name}</strong> ({settlingTrip.id})</p>
                <p className="text-xs text-slate-600 mt-1">Pilot: <strong>{settlingTrip.driverName}</strong></p>
                <div className="mt-2.5 pt-2 border-t border-orange-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Salary Due Amount:</span>
                  <span className="font-heading font-extrabold text-lg text-orange-600">
                    ₹{(Number(settlingTrip.salary) || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
                >
                  <option value="UPI / Google Pay">UPI / Google Pay</option>
                  <option value="PhonePe / Paytm">PhonePe / Paytm</option>
                  <option value="Direct Bank NEFT / IMPS">Direct Bank NEFT / IMPS</option>
                  <option value="Cash Payment">Cash Payment</option>
                  <option value="Cheque Transfer">Cheque Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Settlement Notes / Transaction Ref
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. UPI Ref #459203 or Cash handed over"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettlingTrip(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm & Mark as Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk Settle All Dues for a Driver */}
      {bulkSettlingDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <h3 className="font-heading font-bold text-base text-white">
                  Settle All Dues for {bulkSettlingDriver.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkSettlingDriver(null)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleAllDues} className="p-5 space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <p className="text-xs text-slate-600">Total Outstanding Due Balance:</p>
                <p className="font-heading font-extrabold text-3xl text-emerald-800 mt-1">
                  ₹{bulkSettlingDriver.duesPending.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Will clear and mark all pending trip salaries as Paid
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disbursement Mode *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="UPI / Google Pay">UPI / Google Pay</option>
                  <option value="PhonePe / Paytm">PhonePe / Paytm</option>
                  <option value="Direct Bank NEFT / IMPS">Direct Bank NEFT / IMPS</option>
                  <option value="Cash Payment">Cash Payment</option>
                  <option value="Cheque Transfer">Cheque Transfer</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkSettlingDriver(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Settling Dues...' : 'Confirm Bulk Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

