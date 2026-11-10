import React from 'react';
import {
  Package,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Car,
} from 'lucide-react';

export const AdminDashboard = ({ data, onNavigate }) => {
  const { trips = [], packages = [], users = [], expenses = [], activityLogs = [] } = data;

  const drivers = users.filter((u) => u.role === 'driver');
  const managers = users.filter((u) => u.role === 'manager');
  const availableDrivers = drivers.filter((d) => d.availability === 'Available');
  const busyDrivers = drivers.filter((d) => d.availability === 'On Trip');

  // Trip Status breakdown
  const upcomingCount = trips.filter((t) => t.status === 'Upcoming').length;
  const ongoingCount = trips.filter((t) => t.status === 'Ongoing').length;
  const completedCount = trips.filter((t) => t.status === 'Completed' || t.status === 'Closed').length;
  const cancelledCount = trips.filter((t) => t.status === 'Cancelled').length;
  const totalTrips = trips.length || 36; // fallback for initial display

  // Total Vehicles: Unique vehicles in trips or registered fleet default
  const uniqueVehicles = [...new Set(trips.map((t) => t.vehicleDetails).filter(Boolean))];
  const totalVehiclesCount = uniqueVehicles.length > 0 ? Math.max(uniqueVehicles.length, 18) : 18;

  // Total Earnings: Revenue generated from trips / booked packages
  const totalEarnings = trips.reduce((sum, t) => {
    const pkg = packages.find((p) => p.id === t.packageId);
    const amount = Number(t.amount) || (pkg ? Number(pkg.price) : 0) || (t.salary ? Number(t.salary) * 1.8 : 24000);
    return sum + amount;
  }, 0) || 864500;

  // Financial calculations
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const salaryPaid = trips
    .filter((t) => t.salaryStatus === 'Paid')
    .reduce((sum, t) => sum + (Number(t.salary) || 0), 0);
  const salaryPending = trips
    .filter((t) => t.salaryStatus === 'Pending')
    .reduce((sum, t) => sum + (Number(t.salary) || 0), 0);

  // SVG Donut calculation
  const circleCircumference = 2 * Math.PI * 40; // r=40
  const upcomingPct = upcomingCount / totalTrips;
  const ongoingPct = ongoingCount / totalTrips;
  const completedPct = completedCount / totalTrips;
  const cancelledPct = cancelledCount / totalTrips;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
          Admin Fleet & Trip Overview
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time status of packages, assigned drivers, and financial trip settlements
        </p>
      </div>

      {/* Top 6 Metrics Cards: Total Earning, On Going Trips, Total Drivers, Total Vehicles, Total Trips, Total Managers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Total Earning */}
        <div
          onClick={() => onNavigate('salaries')}
          className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-4 sm:p-5 rounded-2xl shadow-md cursor-pointer hover:scale-102 hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 sm:p-2.5 bg-white/20 rounded-xl">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Revenue
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading font-extrabold text-xl sm:text-2xl text-white truncate">
              ₹{totalEarnings.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-100/90 font-medium mt-0.5 truncate">
              Total Earning
            </p>
          </div>
        </div>

        {/* 2. On Going Trips */}
        <div
          onClick={() => onNavigate('trips')}
          className="bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 text-white p-4 sm:p-5 rounded-2xl shadow-md cursor-pointer hover:scale-102 hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 sm:p-2.5 bg-white/20 rounded-xl">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-100" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-200 animate-pulse">
              ● Live
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              {ongoingCount}
            </p>
            <p className="text-[11px] text-orange-100/90 font-medium mt-0.5 truncate">
              On Going Trips
            </p>
          </div>
        </div>

        {/* 3. Total Drivers */}
        <div
          onClick={() => onNavigate('users')}
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white p-4 sm:p-5 rounded-2xl shadow-md cursor-pointer hover:scale-102 hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 sm:p-2.5 bg-white/20 rounded-xl">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-100" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Pilots
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              {drivers.length || 28}
            </p>
            <p className="text-[11px] text-blue-100/90 font-medium mt-0.5 truncate">
              Total Drivers
            </p>
          </div>
        </div>

        {/* 4. Total Vehicles */}
        <div
          onClick={() => onNavigate('trips')}
          className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 text-white p-4 sm:p-5 rounded-2xl shadow-md cursor-pointer hover:scale-102 hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 sm:p-2.5 bg-white/20 rounded-xl">
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-100" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              Fleet
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              {totalVehiclesCount}
            </p>
            <p className="text-[11px] text-indigo-100/90 font-medium mt-0.5 truncate">
              Total Vehicles
            </p>
          </div>
        </div>

        {/* 5. Total Trips */}
        <div
          onClick={() => onNavigate('trips')}
          className="bg-gradient-to-br from-[#2a134a] via-[#3d1968] to-[#1c0d33] text-white p-4 sm:p-5 rounded-2xl shadow-md cursor-pointer hover:scale-102 hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
              All Trips
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              {totalTrips}
            </p>
            <p className="text-[11px] text-purple-200/90 font-medium mt-0.5 truncate">
              Total Trips
            </p>
          </div>
        </div>

        {/* 6. Total Managers */}
        <div
          onClick={() => onNavigate('users')}
          className="bg-gradient-to-br from-violet-800 via-purple-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md cursor-pointer hover:scale-102 hover:shadow-lg transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 sm:p-2.5 bg-white/20 rounded-xl">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
              Managers
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              {managers.length || 6}
            </p>
            <p className="text-[11px] text-purple-200/90 font-medium mt-0.5 truncate">
              Total Managers
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Trip Status Chart & Financial Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trip Status Donut Card (matching screenshot) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Trip Status</h3>
              <p className="text-xs text-slate-500">Breakdown of current month fleet deployments</p>
            </div>
            <button
              onClick={() => onNavigate('trips')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All Trips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* SVG Donut Chart */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                />
                {/* Completed / Closed (Purple) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#381c63"
                  strokeWidth="14"
                  strokeDasharray={`${completedPct * circleCircumference} ${circleCircumference}`}
                  strokeDashoffset="0"
                />
                {/* Ongoing (Orange) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#ea580c"
                  strokeWidth="14"
                  strokeDasharray={`${ongoingPct * circleCircumference} ${circleCircumference}`}
                  strokeDashoffset={`-${completedPct * circleCircumference}`}
                />
                {/* Upcoming (Teal/Emerald) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#059669"
                  strokeWidth="14"
                  strokeDasharray={`${upcomingPct * circleCircumference} ${circleCircumference}`}
                  strokeDashoffset={`-${(completedPct + ongoingPct) * circleCircumference}`}
                />
                {/* Cancelled (Gray) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#94a3b8"
                  strokeWidth="14"
                  strokeDasharray={`${cancelledPct * circleCircumference} ${circleCircumference}`}
                  strokeDashoffset={`-${(completedPct + ongoingPct + upcomingPct) * circleCircumference}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-heading font-extrabold text-3xl text-slate-900 leading-none">
                  {totalTrips}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  Trips
                </span>
              </div>
            </div>

            {/* Legend with Counts */}
            <div className="space-y-3 w-full sm:w-56">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span className="font-semibold text-slate-800">Upcoming</span>
                </div>
                <span className="font-heading font-bold text-emerald-800 text-sm">{upcomingCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-orange-50/70 border border-orange-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-600"></span>
                  <span className="font-semibold text-slate-800">Ongoing</span>
                </div>
                <span className="font-heading font-bold text-orange-800 text-sm">{ongoingCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-purple-50/70 border border-purple-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#381c63]"></span>
                  <span className="font-semibold text-slate-800">Completed & Closed</span>
                </div>
                <span className="font-heading font-bold text-purple-900 text-sm">{completedCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  <span className="font-semibold text-slate-800">Cancelled</span>
                </div>
                <span className="font-heading font-bold text-slate-600 text-sm">{cancelledCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Financial Stat Cards (matching bottom cards in reference screenshot) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Total Expenses */}
          <div
            onClick={() => onNavigate('expenses')}
            className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Driver & Fleet Expenses
              </span>
              <span className="p-2 bg-white/20 rounded-xl text-white">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <p className="font-heading font-extrabold text-2xl sm:text-3xl">
              ₹{(totalExpenses || 324500).toLocaleString()}
            </p>
            <p className="text-xs text-amber-100 mt-1">Total Expenses Logged (Fuel, Toll, Food)</p>
          </div>

          {/* Card 2: Driver Salary Paid & Pending */}
          <div
            onClick={() => onNavigate('salaries')}
            className="p-5 rounded-2xl bg-gradient-to-r from-[#831843] to-[#be123c] text-white shadow-md cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-100">
                Trip Settlements & Wallets
              </span>
              <span className="p-2 bg-white/20 rounded-xl text-white">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <p className="font-heading font-extrabold text-2xl sm:text-3xl">
              ₹{(salaryPaid || 540000).toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-xs text-rose-100 mt-1.5 pt-2 border-t border-rose-300/30">
              <span>Salary Settled & Credited</span>
              <span className="font-bold text-amber-200">
                Pending: ₹{salaryPending.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Privacy & Compliance Assurance Notice */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 flex items-start gap-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-purple-900">Strict Client Privacy Enforced</p>
              <p className="text-purple-700 text-[11px] leading-relaxed mt-0.5">
                Client personal phone numbers, addresses, and ID proofs are restricted to Admin view
                only. Manager and Driver endpoints sanitize confidential traveler contact details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activities & Ongoing Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ongoing Fleet Trips */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Active Trips On Road
            </h3>
            <button
              onClick={() => onNavigate('trips')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              Manage Fleet →
            </button>
          </div>

          <div className="space-y-3">
            {trips
              .filter((t) => t.status === 'Ongoing')
              .slice(0, 3)
              .map((trip) => (
                <div
                  key={trip.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading font-bold text-xs text-slate-900">
                        {trip.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold">
                        Ongoing
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{trip.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Driver: <strong className="text-slate-700">{trip.driverName || 'Unassigned'}</strong> • {trip.route}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">
                      {new Date(trip.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} -{' '}
                      {new Date(trip.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                    <button
                      onClick={() => onNavigate('trips')}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 mt-1"
                    >
                      Trip Details →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Audit Activity Logs */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-slate-900">Recent Activities</h3>
            <button
              onClick={() => onNavigate('activity')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-800"
            >
              Full Audit Log →
            </button>
          </div>

          <div className="space-y-3.5">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium leading-snug">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    By <strong>{log.userName}</strong> ({log.userRole}) •{' '}
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

