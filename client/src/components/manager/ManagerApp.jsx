import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Receipt,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Lock,
  LogOut,
  Menu,
  X,
  Bell,
  ArrowLeft,
  Users,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TripManagement } from '../admin/TripManagement';
import { ExpenseReview } from '../admin/ExpenseReview';
import { Reports } from '../admin/Reports';
import { NotificationsDrawer } from '../common/NotificationsDrawer';

export const ManagerApp = ({ onNavigateHome }) => {
  const { user, token, logout, unreadCount } = useAuth();
  const permissions = user?.permissions || [];

  // Allowed tabs based on permissions
  const hasTripsPerm = permissions.includes('view_trips');
  const hasExpensePerm = permissions.includes('review_expenses');
  const hasReportsPerm = permissions.includes('view_reports');

  const [activeTab, setActiveTab] = useState(
    hasTripsPerm ? 'trips' : hasExpensePerm ? 'expenses' : hasReportsPerm ? 'reports' : 'no_access'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Data
  const [trips, setTrips] = useState([]);
  const [packages, setPackages] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tripsRes, pkgsRes, expRes, usersRes, vehRes] = await Promise.all([
        fetch('/api/trips', { headers }),
        fetch('/api/packages'),
        fetch('/api/expenses', { headers }),
        fetch('/api/users?role=driver', { headers }),
        fetch('/api/vehicles'),
      ]);

      if (tripsRes.ok) {
        const d = await tripsRes.json();
        setTrips(d.trips || []);
      }
      if (pkgsRes.ok) {
        const d = await pkgsRes.json();
        setPackages(d.packages || []);
      }
      if (expRes.ok) {
        const d = await expRes.json();
        setExpenses(d.expenses || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setDrivers(d.users || []);
      }
      if (vehRes && vehRes.ok) {
        const d = await vehRes.json();
        setVehicles(d.vehicles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex bg-slate-100 font-sans overscroll-none">
      {/* FIXED LEFT SIDEBAR (No scrolling away, duplicate logo removed) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1b1030] text-white flex flex-col shrink-0 border-r border-purple-900/60 transition-transform duration-300 lg:static lg:translate-x-0 h-full ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Header - No duplicate logo */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="font-heading font-extrabold text-sm text-white tracking-wider">
              MANAGER SUITE
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manager Profile Header */}
        <div className="p-4 border-b border-purple-900/40 bg-purple-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={user?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500"
            />
            <div className="min-w-0">
              <p className="font-semibold text-xs text-white truncate">{user?.name || 'Operations Manager'}</p>
              <p className="text-[10px] text-purple-300 truncate">{user?.email}</p>
              <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold uppercase">
                Delegated Access
              </span>
            </div>
          </div>
        </div>

        {/* Permissions Granted Pills */}
        <div className="p-3 border-b border-purple-900/30 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Admin Permitted Actions
          </p>
          <div className="flex flex-wrap gap-1">
            {permissions.map((p) => (
              <span
                key={p}
                className="text-[9px] px-2 py-0.5 rounded-md bg-purple-900/70 text-orange-300 font-medium"
              >
                ✓ {p.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Items (Only permitted items show) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {hasTripsPerm && (
            <button
              onClick={() => {
                setActiveTab('create_trip');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'create_trip'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-4 h-4" />
                <span>Create New Trip</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-900/80 text-orange-300 uppercase font-bold">
                New
              </span>
            </button>
          )}

          {hasTripsPerm ? (
            <button
              onClick={() => {
                setActiveTab('trips');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'trips'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Trips & Dispatch</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 text-xs text-slate-500 flex items-center gap-2 cursor-not-allowed opacity-50">
              <Lock className="w-3.5 h-3.5" />
              <span>Trips (Locked by Admin)</span>
            </div>
          )}

          {hasExpensePerm ? (
            <button
              onClick={() => {
                setActiveTab('expenses');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'expenses'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Review Driver Expenses</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 text-xs text-slate-500 flex items-center gap-2 cursor-not-allowed opacity-50">
              <Lock className="w-3.5 h-3.5" />
              <span>Expenses (Locked by Admin)</span>
            </div>
          )}

          {hasReportsPerm ? (
            <button
              onClick={() => {
                setActiveTab('reports');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'reports'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Fleet Reports</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 text-xs text-slate-500 flex items-center gap-2 cursor-not-allowed opacity-50">
              <Lock className="w-3.5 h-3.5" />
              <span>Reports (Locked by Admin)</span>
            </div>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-purple-900/40 space-y-1 shrink-0">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-purple-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            title="Return to Welcome / Role Selection"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Role Selection</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE: FIXED HEADER & SCROLLABLE MAIN CONTENT */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        {/* FIXED HEADER: Never moves when scrolling, fully responsive on mobile */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-xs gap-2">
          {/* Left: Mobile Menu Toggle + Company Logo + Current Tab */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex items-center overflow-hidden">
              <img
                src="/logo.png"
                alt="Tirupati Balaji Tours & Travels"
                className="h-[34px] sm:h-10 max-w-[160px] min-[380px]:max-w-[190px] sm:max-w-none w-auto object-contain cursor-pointer shrink-0"
                onClick={onNavigateHome}
              />
            </div>
            <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1 shrink-0"></div>
            <h2 className="hidden sm:block font-heading font-extrabold text-base text-slate-900 capitalize truncate">
              Manager Panel: {activeTab}
            </h2>
          </div>

          {/* Right: Badge + Notifications + Sign Out */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <span className="hidden sm:inline-flex text-[11px] bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full font-bold">
              Restricted RBAC Session
            </span>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={logout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-purple-700 hover:border-purple-300 text-xs font-semibold shadow-xs transition-all cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-purple-600" />
              <span>Back to Role Selection</span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium capitalize">
              Manager Panel &bull; {activeTab.replace('_', ' ')}
            </span>
          </div>

          {/* Privacy Enforcement Banner */}
          <div className="p-4 bg-purple-900 text-white rounded-2xl shadow-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs sm:text-sm">Client Privacy Policy Enforced</p>
              <p className="text-[11px] text-purple-200 leading-relaxed mt-0.5">
                Client personal phone numbers, emails, addresses, and ID proofs are confidential and
                masked for Manager roles. You may coordinate trips, review receipts, and dispatch
                vehicles in accordance with your permissions.
              </p>
            </div>
          </div>

          {(activeTab === 'trips' || activeTab === 'create_trip') && hasTripsPerm && (
            <TripManagement
              key={activeTab}
              trips={trips}
              packages={packages}
              clients={[]}
              drivers={drivers}
              vehicles={vehicles}
              onRefresh={fetchData}
              role="manager"
              initialOpenAdd={activeTab === 'create_trip'}
            />
          )}

          {activeTab === 'expenses' && hasExpensePerm && (
            <ExpenseReview
              expenses={expenses}
              trips={trips}
              drivers={drivers}
              onRefresh={fetchData}
              role="manager"
            />
          )}

          {activeTab === 'reports' && hasReportsPerm && (
            <Reports trips={trips} expenses={expenses} users={drivers} packages={packages} />
          )}

          {activeTab === 'no_access' && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-slate-800">
                No Modules Currently Assigned
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Please contact the Super Admin to configure your manager role permissions (View Trips,
                Review Expenses, or View Reports).
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
