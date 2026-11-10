import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Receipt,
  Wallet,
  User,
  ArrowLeft,
  Plus,
  ChevronRight,
  Clock,
  MapPin,
  Car,
  Fuel,
  Utensils,
  CheckCircle,
  AlertCircle,
  X,
  Upload,
  Camera,
  LogOut,
  Bell,
  Check,
  Coins,
  ShieldCheck,
  FileText,
  DollarSign,
  TrendingUp,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationsDrawer } from '../common/NotificationsDrawer';

export const DriverApp = ({ onNavigateHome }) => {
  const { user, token, logout, refreshUser, unreadCount } = useAuth();

  // Screen states: 'dashboard' | 'trips' | 'trip_details' | 'add_expense' | 'wallet' | 'availability' | 'profile'
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripsTab, setTripsTab] = useState('ongoing'); // 'upcoming' | 'ongoing' | 'completed'
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Driver data
  const [driverTrips, setDriverTrips] = useState([]);
  const [driverExpenses, setDriverExpenses] = useState([]);
  const [walletData, setWalletData] = useState({
    walletBalance: 24500,
    totalEarnings: 42000,
    totalExpenses: 17500,
    transactions: [],
  });
  const [availability, setAvailability] = useState(user?.availability || 'Available');
  const [loading, setLoading] = useState(false);

  // Add Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    tripId: '',
    category: 'Fuel',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    fuelFilled: '',
    odometerReading: '',
    proofFile: null,
    proofPreview: '/uploads/fuel_receipt_sample.jpg',
  });
  const [expenseSaved, setExpenseSaved] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tb_offline_expenses') || '[]').length;
    } catch {
      return 0;
    }
  });

  // Fetch driver data
  const fetchDriverData = async () => {
    if (!user || user.role !== 'driver') return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tripsRes, expRes, walletRes] = await Promise.all([
        fetch('/api/trips', { headers }),
        fetch('/api/expenses', { headers }),
        fetch(`/api/wallet/${user.id}`, { headers }),
      ]);

      if (tripsRes.ok) {
        const d = await tripsRes.json();
        setDriverTrips(d.trips || []);
      }
      if (expRes.ok) {
        const d = await expRes.json();
        setDriverExpenses(d.expenses || []);
      }
      if (walletRes.ok) {
        const d = await walletRes.json();
        setWalletData(d);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [user, token]);

  // Online / offline auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineExpenses();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineExpenses = async () => {
    try {
      const queue = JSON.parse(localStorage.getItem('tb_offline_expenses') || '[]');
      if (queue.length === 0) return;
      const t = localStorage.getItem('tb_token');
      for (const item of queue) {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify(item),
        });
      }
      localStorage.removeItem('tb_offline_expenses');
      setOfflineQueueCount(0);
      fetchDriverData();
      alert(`Network restored! ${queue.length} offline expense(s) synced.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateAvailability = async (newStatus) => {
    setAvailability(newStatus);
    try {
      await fetch('/api/driver/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability: newStatus }),
      });
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTripStatusUpdate = async (tripId, newStatus) => {
    if (newStatus === 'Completed') {
      const confirmEnd = window.confirm(
        'Are you sure you want to End this Trip? Your trip completion date and time will be directly recorded and sent to dispatch.'
      );
      if (!confirmEnd) return;
    }

    try {
      const res = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update trip status');

      await fetchDriverData();
      if (selectedTrip && selectedTrip.id === tripId) {
        setSelectedTrip(data.trip);
      }
      if (newStatus === 'Completed') {
        alert('Trip ended successfully! Trip End Date & Time has been recorded directly.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.tripId) {
      alert('Please select a trip and enter the expense amount.');
      return;
    }

    if (!navigator.onLine) {
      const offlineItem = {
        tripId: expenseForm.tripId,
        category: expenseForm.category,
        amount: expenseForm.amount,
        date: expenseForm.date,
        notes: expenseForm.notes,
        fuelFilled: expenseForm.fuelFilled,
        odometerReading: expenseForm.odometerReading,
        proofSample: expenseForm.proofPreview || '/uploads/fuel_receipt_sample.jpg',
      };
      const q = JSON.parse(localStorage.getItem('tb_offline_expenses') || '[]');
      q.push(offlineItem);
      localStorage.setItem('tb_offline_expenses', JSON.stringify(q));
      setOfflineQueueCount(q.length);
      alert('Saved offline on device. Will auto-sync when online!');
      setCurrentScreen('dashboard');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('tripId', expenseForm.tripId);
    formData.append('category', expenseForm.category);
    formData.append('amount', expenseForm.amount);
    formData.append('date', expenseForm.date);
    formData.append('notes', expenseForm.notes);
    if (expenseForm.category === 'Fuel') {
      formData.append('fuelFilled', expenseForm.fuelFilled);
      formData.append('odometerReading', expenseForm.odometerReading);
    }
    if (expenseForm.proofFile) {
      formData.append('proofFile', expenseForm.proofFile);
    } else {
      formData.append('proofSample', expenseForm.proofPreview);
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit expense');

      setExpenseSaved(true);
      setTimeout(() => {
        setExpenseSaved(false);
        fetchDriverData();
        setCurrentScreen('dashboard');
      }, 1200);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (exp) => {
    const trip = driverTrips.find((t) => t.id === exp.tripId);
    if (trip && trip.status === 'Closed') {
      alert('Cannot delete: This trip is already closed.');
      return;
    }
    if (!window.confirm(`Delete ${exp.category} expense of ₹${exp.amount}?`)) return;
    try {
      const res = await fetch(`/api/expenses/${exp.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchDriverData();
    } catch (e) {
      alert('Failed to delete expense');
    }
  };

  const upcomingTrips = driverTrips.filter((t) => t.status === 'Upcoming');
  const ongoingTrips = driverTrips.filter((t) => t.status === 'Ongoing');
  const completedTrips = driverTrips.filter((t) => t.status === 'Completed' || t.status === 'Closed');
  const currentOngoingTrip = ongoingTrips[0] || driverTrips[0];

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex flex-col bg-slate-100 font-sans overscroll-none">
      {/* FIXED TOP HEADER: Never moves when scrolling, fully responsive on mobile */}
      <header className="sticky top-0 z-30 h-16 bg-[#1e1035] text-white px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-md gap-2">
        {/* Left: Logo and App Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="min-w-0 flex items-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Tirupati Balaji Tours & Travels"
              className="h-[34px] sm:h-10 max-w-[160px] min-[380px]:max-w-[190px] sm:max-w-none w-auto bg-white p-1 rounded-lg object-contain cursor-pointer shrink-0"
              onClick={onNavigateHome}
            />
          </div>
          <div className="hidden sm:block h-5 w-px bg-purple-800 mx-1 shrink-0"></div>
          <span className="hidden sm:inline-block font-heading font-extrabold text-sm text-orange-400 uppercase tracking-wider truncate">
            Driver Terminal
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-xl">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Car },
            { id: 'trips', label: 'My Trips', icon: Calendar },
            { id: 'add_expense', label: 'Add Expense', icon: Receipt },
            { id: 'wallet', label: 'My Wallet', icon: Wallet },
            { id: 'availability', label: 'Availability', icon: ShieldCheck },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'add_expense' && currentOngoingTrip) {
                    setExpenseForm((prev) => ({ ...prev, tripId: currentOngoingTrip.id }));
                  }
                  setCurrentScreen(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-orange-500 text-white shadow-sm' : 'text-purple-200 hover:text-white'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Availability Pill */}
          <button
            onClick={() => setCurrentScreen('availability')}
            className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 border shrink-0 ${availability === 'Available'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : availability === 'On Trip'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${availability === 'Available'
                ? 'bg-emerald-400'
                : availability === 'On Trip'
                  ? 'bg-orange-400'
                  : 'bg-red-400'
                }`}
            ></span>
            <span>{availability}</span>
          </button>

          {/* Wallet Balance Badge */}
          <div
            onClick={() => setCurrentScreen('wallet')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-colors shrink-0"
          >
            <Wallet className="w-3.5 h-3.5 text-orange-400" />
            <span>₹{(walletData.walletBalance || 24500).toLocaleString()}</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-colors shrink-0"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Exit / Logout */}
          <button
            onClick={logout}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-purple-200 hover:text-rose-200 transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN RESPONSIVE SCROLLABLE BODY */}
      <main className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-20 md:pb-8">
        {currentScreen !== 'dashboard' && (
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentScreen('dashboard')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 text-xs font-semibold shadow-xs transition-all cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-orange-500" />
              <span>Back to Dashboard</span>
            </button>
            <span className="text-[11px] text-slate-500 font-medium capitalize">
              Driver Terminal &bull; {currentScreen.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* =========================================================================
           1. DASHBOARD OVERVIEW
           ========================================================================= */}
        {currentScreen === 'dashboard' && (
          <div className="space-y-6">
            {/* Driver Greeting Banner */}
            <div className="bg-gradient-to-r from-[#1e1035] to-[#2c134f] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={user?.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120'}
                  alt="Driver"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-orange-500 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                      Hi, {user?.name || 'Ramesh'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                      Fleet Pilot
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 mt-1">
                    {user?.licenseNumber || 'AP-03-2019-0045892'} • Assigned Fleet Driver
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (currentOngoingTrip) {
                      setExpenseForm((prev) => ({ ...prev, tripId: currentOngoingTrip.id }));
                    }
                    setCurrentScreen('add_expense');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Expense</span>
                </button>
              </div>
            </div>

            {/* Top 2 Stat Tiles: Purple Wallet & Orange Assigned Trips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Purple Wallet Balance */}
              <div
                onClick={() => setCurrentScreen('wallet')}
                className="p-6 rounded-3xl bg-[#1e1035] text-white shadow-md cursor-pointer hover:shadow-lg transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-xs text-purple-200 uppercase tracking-wider font-semibold">
                    Available Wallet Balance
                  </span>
                  <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
                    ₹{(walletData.walletBalance || 24500).toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-3 mt-3 text-xs text-purple-200">
                    <span className="text-emerald-400">↑ Earnings: ₹{(walletData.totalEarnings || 42000).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-rose-400">↓ Expenses: ₹{(walletData.totalExpenses || 17500).toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                  🪙
                </div>
              </div>

              {/* Orange Assigned Trips */}
              <div
                onClick={() => {
                  setTripsTab('ongoing');
                  setCurrentScreen('trips');
                }}
                className="p-6 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md cursor-pointer hover:shadow-lg transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-xs text-orange-100 uppercase tracking-wider font-semibold">
                    My Assigned Trips
                  </span>
                  <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
                    {driverTrips.length || 3} Trips
                  </h3>
                  <p className="text-xs text-orange-100 mt-3">
                    {ongoingTrips.length} Ongoing • {upcomingTrips.length} Upcoming • {completedTrips.length} Completed
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <Calendar className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* Ongoing Trip Card Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">Current Ongoing Trip</h3>
                  <p className="text-xs text-slate-500">Live pilgrim transit status</p>
                </div>
                <button
                  onClick={() => {
                    setTripsTab('ongoing');
                    setCurrentScreen('trips');
                  }}
                  className="text-xs text-orange-600 font-bold hover:underline"
                >
                  All Trips →
                </button>
              </div>

              {currentOngoingTrip ? (
                <div
                  onClick={() => {
                    setSelectedTrip(currentOngoingTrip);
                    setCurrentScreen('trip_details');
                  }}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {currentOngoingTrip.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {currentOngoingTrip.status}
                      </span>
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-slate-900">
                      {currentOngoingTrip.name}
                    </h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      {currentOngoingTrip.route}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left md:text-right text-xs text-slate-500">
                      <span>Schedule:</span>
                      <p className="font-semibold text-slate-800">
                        {new Date(currentOngoingTrip.startDate).toLocaleDateString()} -{' '}
                        {new Date(currentOngoingTrip.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 border border-dashed rounded-2xl text-xs">
                  No active ongoing trip right now
                </div>
              )}
            </div>

            {/* Upcoming Trips Section (Directly below Current Ongoing Trip) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">Upcoming Trips</h3>
                  <p className="text-xs text-slate-500">Scheduled journeys assigned to you ({upcomingTrips.length})</p>
                </div>
                {upcomingTrips.length > 0 && (
                  <button
                    onClick={() => {
                      setTripsTab('upcoming');
                      setCurrentScreen('trips');
                    }}
                    className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    All Upcoming ({upcomingTrips.length}) →
                  </button>
                )}
              </div>

              {upcomingTrips.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTrips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => {
                        setSelectedTrip(trip);
                        setCurrentScreen('trip_details');
                      }}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {trip.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                            Upcoming
                          </span>
                          {trip.clientName && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              👤 {trip.clientName}
                            </span>
                          )}
                        </div>
                        <h4 className="font-heading font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                          {trip.name}
                        </h4>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="truncate max-w-md">{trip.route}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-xs">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pickup Date</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(trip.startDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 border border-dashed rounded-2xl text-xs">
                  No upcoming trips scheduled at the moment
                </div>
              )}
            </div>

            {/* Quick 4 Action Cards for Desktop & Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                onClick={() => setCurrentScreen('trips')}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-2">
                  <Car className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-sm text-slate-900">My Trips</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Assigned schedules</p>
              </div>

              <div
                onClick={() => {
                  if (currentOngoingTrip) {
                    setExpenseForm((prev) => ({ ...prev, tripId: currentOngoingTrip.id }));
                  }
                  setCurrentScreen('add_expense');
                }}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-2">
                  <Receipt className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-sm text-slate-900">Add Expense</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Fuel, tolls, food</p>
              </div>

              <div
                onClick={() => setCurrentScreen('wallet')}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <Wallet className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-sm text-slate-900">Wallet Ledger</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Payouts & balances</p>
              </div>

              <div
                onClick={() => setCurrentScreen('availability')}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-sm text-slate-900">Availability</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{availability}</p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
           2. MY TRIPS
           ========================================================================= */}
        {currentScreen === 'trips' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">My Trips</h2>
                <p className="text-xs text-slate-500">View upcoming, ongoing, and completed pilgrim routes</p>
              </div>
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            {/* 3 Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 gap-1 text-xs font-bold shadow-xs">
              <button
                onClick={() => setTripsTab('upcoming')}
                className={`flex-1 py-2.5 rounded-xl transition-all ${tripsTab === 'upcoming' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Upcoming ({upcomingTrips.length})
              </button>
              <button
                onClick={() => setTripsTab('ongoing')}
                className={`flex-1 py-2.5 rounded-xl transition-all ${tripsTab === 'ongoing' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Ongoing ({ongoingTrips.length})
              </button>
              <button
                onClick={() => setTripsTab('completed')}
                className={`flex-1 py-2.5 rounded-xl transition-all ${tripsTab === 'completed' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Completed ({completedTrips.length})
              </button>
            </div>

            {/* Trips List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(tripsTab === 'upcoming' ? upcomingTrips : tripsTab === 'ongoing' ? ongoingTrips : completedTrips).map(
                (trip) => (
                  <div
                    key={trip.id}
                    onClick={() => {
                      setSelectedTrip(trip);
                      setCurrentScreen('trip_details');
                    }}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {trip.id}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-800">
                          {trip.status}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-base text-slate-900">{trip.name}</h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        {trip.route}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-orange-600 font-bold">
                      <span>View Route & Instructions →</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
           3. TRIP DETAILS
           ========================================================================= */}
        {currentScreen === 'trip_details' && selectedTrip && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentScreen('trips')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to My Trips
              </button>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-orange-100 text-orange-800">
                {selectedTrip.status}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Trip Identifier: {selectedTrip.id}
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
                  {selectedTrip.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block">Travel Route</span>
                  <p className="font-semibold text-slate-800 mt-1">{selectedTrip.route}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block">Temple Stops</span>
                  <p className="font-semibold text-slate-800 mt-1">{selectedTrip.stops || 'Tirumala Hills, Alipiri'}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block">Pickup Location</span>
                  <p className="font-semibold text-slate-800 mt-1">{selectedTrip.pickupLocation}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block">Drop Location</span>
                  <p className="font-semibold text-slate-800 mt-1">{selectedTrip.dropLocation}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block">Vehicle Assigned</span>
                  <p className="font-semibold text-slate-800 mt-1">{selectedTrip.vehicleDetails}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block">Schedule Timings</span>
                  <div className="mt-1 space-y-1">
                    <p className="font-semibold text-slate-800">
                      <strong>Start:</strong> {new Date(selectedTrip.startDate).toLocaleString()}
                    </p>
                    <p className="font-semibold text-slate-800">
                      <strong>Trip End Date & Time:</strong>{' '}
                      {selectedTrip.status === 'Completed' || selectedTrip.status === 'Closed' ? (
                        <span className="text-emerald-700 font-bold">
                          {new Date(selectedTrip.endDate || selectedTrip.endedAt || selectedTrip.completedAt).toLocaleString()} (Completed)
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">
                          ⏳ In Progress (Recorded directly when you end the trip)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-700 text-xs block mb-1">Pilgrim Instructions:</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedTrip.instructions || 'Drive carefully and maintain vehicle cleanliness.'}
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
                🔒 <strong>Strict Privacy Compliance:</strong> Pilgrim personal contact information is managed by dispatch.
                Drivers do not receive private phone numbers or personal documents.
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {selectedTrip.status === 'Upcoming' && (
                    <button
                      onClick={() => handleTripStatusUpdate(selectedTrip.id, 'Ongoing')}
                      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>▶ Start Trip</span>
                    </button>
                  )}
                  {selectedTrip.status === 'Ongoing' && (
                    <button
                      onClick={() => handleTripStatusUpdate(selectedTrip.id, 'Completed')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer animate-pulse"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>End Trip (Complete Now)</span>
                    </button>
                  )}
                  {(selectedTrip.status === 'Completed' || selectedTrip.status === 'Closed') && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Trip Finished & Ended Directly</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setExpenseForm((prev) => ({ ...prev, tripId: selectedTrip.id }));
                    setCurrentScreen('add_expense');
                  }}
                  className="px-5 py-2.5 bg-[#1e1035] hover:bg-[#2a134a] text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-orange-400" />
                  <span>+ Add Expense Against This Trip</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
           4. ADD EXPENSE (DESKTOP & MOBILE FRIENDLY)
           ========================================================================= */}
        {currentScreen === 'add_expense' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">Record Trip Expense</h2>
                <p className="text-xs text-slate-500">Submit fuel, FASTag toll, food, or maintenance receipts with photo proof</p>
              </div>
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Form */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <form onSubmit={handleSaveExpense} className="space-y-4 text-xs sm:text-sm">
                  {expenseSaved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Expense submitted successfully! Sent to Admin for review.</span>
                    </div>
                  )}

                  {/* Trip Selector */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">Select Assigned Trip *</label>
                    <select
                      required
                      value={expenseForm.tripId}
                      onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold"
                    >
                      <option value="">-- Choose Trip --</option>
                      {driverTrips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.id} - {t.name} ({t.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Pills */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-2 text-xs">Expense Category</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {['Fuel', 'Toll Gate', 'Food', 'Parking', 'Maintenance', 'Other'].map((cat) => {
                        const isSel = expenseForm.category === cat;
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setExpenseForm({ ...expenseForm, category: cat })}
                            className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${isSel ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-xs' : 'bg-white border-slate-200 text-slate-600'
                              }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="3500"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">Expense Date</label>
                      <input
                        type="date"
                        value={expenseForm.date}
                        onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Fuel Fields */}
                  {expenseForm.category === 'Fuel' && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-orange-50/50 rounded-xl border border-orange-200 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Fuel Filled (Litres)</label>
                        <input
                          type="number"
                          placeholder="38.5"
                          value={expenseForm.fuelFilled}
                          onChange={(e) => setExpenseForm({ ...expenseForm, fuelFilled: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Odometer Reading (km)</label>
                        <input
                          type="number"
                          placeholder="45210"
                          value={expenseForm.odometerReading}
                          onChange={(e) => setExpenseForm({ ...expenseForm, odometerReading: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">Notes / Details</label>
                    <input
                      type="text"
                      placeholder="Nellore Indian Oil pump fuel refill..."
                      value={expenseForm.notes}
                      onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  {/* Proof Photo Upload */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">Screenshot / Photo Proof</label>
                    <div className="flex items-center gap-3">
                      {expenseForm.proofPreview && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-orange-500 shrink-0">
                          <img src={expenseForm.proofPreview} alt="Proof" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="flex-1 h-20 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-500 text-xs">
                        <Camera className="w-5 h-5 text-orange-500 mb-1" />
                        <span>Take Photo or Upload Receipt</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              setExpenseForm({
                                ...expenseForm,
                                proofFile: f,
                                proofPreview: URL.createObjectURL(f),
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Save & Submit Expense'}
                  </button>
                </form>
              </div>

              {/* Right: Submitted Expenses Audit History */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Recent Submissions ({driverExpenses.length})
                </h3>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                  {driverExpenses.map((exp) => (
                    <div key={exp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {exp.category} • ₹{exp.amount?.toLocaleString()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${exp.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : exp.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {exp.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Trip: <strong>{exp.tripId}</strong> • {exp.date}
                      </p>
                      {exp.adminRemarks && (
                        <p className="text-slate-600 text-[11px] bg-white p-1.5 rounded-md border border-slate-100">
                          <strong>Admin Remark:</strong> {exp.adminRemarks}
                        </p>
                      )}
                    </div>
                  ))}

                  {driverExpenses.length === 0 && (
                    <p className="text-center py-8 text-slate-400 text-xs">No expenses submitted yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
           5. MY WALLET (FULL-WIDTH DESKTOP & MOBILE VIEW)
           ========================================================================= */}
        {currentScreen === 'wallet' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">Driver Wallet Ledger</h2>
                <p className="text-xs text-slate-500">Trip salary settlements, expense reimbursements & transaction audit</p>
              </div>
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            {/* Wallet Balance Hero Card */}
            <div className="bg-gradient-to-r from-[#1e1035] via-[#281347] to-[#160a2b] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-purple-300 font-semibold">Available Balance</span>
                <h3 className="font-heading font-extrabold text-3xl sm:text-4xl mt-1">
                  ₹{(walletData.walletBalance || 24500).toLocaleString()}
                </h3>
                <p className="text-xs text-purple-200 mt-2">
                  Automatically credited upon Admin deal closing with salary and approved reimbursements
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-emerald-300 block font-bold">Total Earnings</span>
                  <span className="font-heading font-bold text-lg text-white">
                    ₹{(walletData.totalEarnings || 42000).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-rose-300 block font-bold">Total Expenses</span>
                  <span className="font-heading font-bold text-lg text-white">
                    ₹{(walletData.totalExpenses || 17500).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-heading font-bold text-base text-slate-900">Transaction History</h4>
                <span className="text-xs text-slate-400">Ledger audit record</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Transaction</th>
                      <th className="px-4 py-3">Trip ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(walletData.transactions?.length > 0
                      ? walletData.transactions
                      : [
                        { id: 'wt-1', category: 'Trip Salary', tripId: 'TIR-2026-031', date: '03 Nov 2026', type: 'credit', amount: 18000 },
                        { id: 'wt-2', category: 'Fuel Expense', tripId: 'TIR-2026-034', date: '02 Nov 2026', type: 'debit', amount: 3500 },
                        { id: 'wt-3', category: 'Toll Expense', tripId: 'TIR-2026-034', date: '02 Nov 2026', type: 'debit', amount: 420 },
                        { id: 'wt-4', category: 'Trip Salary', tripId: 'TIR-2026-030', date: '28 Oct 2026', type: 'credit', amount: 12000 },
                      ]
                    ).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{tx.category}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">{tx.tripId || '—'}</td>
                        <td className="px-4 py-3.5 text-slate-500">{tx.date}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}
                          >
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-heading font-bold text-sm">
                          <span className={tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}>
                            {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount?.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
           6. DRIVER AVAILABILITY
           ========================================================================= */}
        {currentScreen === 'availability' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">My Availability</h2>
                <p className="text-xs text-slate-500">Update your current duty status for trip dispatching</p>
              </div>
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              {[
                { id: 'Available', label: 'Available', desc: 'Ready to accept new trips and pilgrimage routes', color: 'emerald', icon: '✓' },
                { id: 'On Trip', label: 'On Trip', desc: 'Currently handling an assigned trip on highway/ghat road', color: 'orange', icon: '🚗' },
                { id: 'On Leave', label: 'On Leave', desc: 'Resting or personal leave; unavailable for dispatch', color: 'red', icon: '🏖️' },
              ].map((opt) => {
                const isChecked = availability === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleUpdateAvailability(opt.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${isChecked ? 'border-orange-500 bg-orange-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-base">
                        {opt.icon}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-slate-900">{opt.label}</h4>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isChecked ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
                        }`}
                    >
                      {isChecked && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
           7. DRIVER PROFILE
           ========================================================================= */}
        {currentScreen === 'profile' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">Driver Profile</h2>
                <p className="text-xs text-slate-500">Commercial credentials and verified documents</p>
              </div>
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm">
              <div className="text-center">
                <img
                  src={user?.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140'}
                  alt="Driver"
                  className="w-20 h-20 rounded-2xl mx-auto object-cover ring-4 ring-orange-500/20 mb-3 shadow-md"
                />
                <h3 className="font-heading font-bold text-xl text-slate-900">{user?.name || 'Ramesh'}</h3>
                <p className="text-slate-500 font-mono">{user?.mobile || '+91 99890 24680'}</p>
                <p className="text-slate-400 text-xs">{user?.email}</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Driving License:</span>
                  <span className="font-mono font-bold text-slate-900">{user?.licenseNumber || 'AP-03-2019-0045892'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">License Expiry:</span>
                  <span className="font-bold text-slate-900">{user?.licenseExpiry || '2031-08-15'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Home Address:</span>
                  <span className="text-slate-800">{user?.address || 'Gandhi Road, Tirupati'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Emergency Contact:</span>
                  <span className="text-slate-800">{user?.emergencyContact || '+91 99890 24681'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Verified Documents</h4>
                <div className="space-y-2">
                  {['Heavy Vehicle Driving License', 'Aadhaar Identity Card', 'Police Verification Clearance'].map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="flex items-center gap-2 text-slate-700">
                        <FileText className="w-4 h-4 text-purple-600" />
                        {d}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                        ✓ Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR: Appears on small screens */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#1e1035] text-white border-t border-purple-900/60 px-2 py-2 flex items-center justify-around z-30 shadow-2xl">
        {[
          { id: 'dashboard', label: 'Home', icon: Car },
          { id: 'trips', label: 'Trips', icon: Calendar },
          { id: 'add_expense', label: 'Add Exp', icon: Receipt },
          { id: 'wallet', label: 'Wallet', icon: Wallet },
          { id: 'profile', label: 'Profile', icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'add_expense' && currentOngoingTrip) {
                  setExpenseForm((prev) => ({ ...prev, tripId: currentOngoingTrip.id }));
                }
                setCurrentScreen(item.id);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${isActive ? 'text-orange-400 font-bold' : 'text-purple-300 hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
