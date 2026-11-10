import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Calendar,
  Receipt,
  DollarSign,
  FileText,
  Clock,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Bell,
  Sparkles,
  ArrowLeft,
  PlusCircle,
  Car,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { PackageManagement } from './PackageManagement';
import { ClientManagement } from './ClientManagement';
import { TripManagement } from './TripManagement';
import { ExpenseReview } from './ExpenseReview';
import { Reports } from './Reports';
import { ActivityLogs } from './ActivityLogs';
import { InquiriesManagement } from './InquiriesManagement';
import { VehicleManagement } from './VehicleManagement';
import { NotificationsDrawer } from '../common/NotificationsDrawer';

export const AdminApp = ({ onNavigateHome }) => {
  const { user, token, logout, unreadCount } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Core Data State
  const [trips, setTrips] = useState([]);
  const [packages, setPackages] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all admin data
  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [tripsRes, pkgsRes, clientsRes, usersRes, expRes, logsRes, inqRes, vehRes] = await Promise.all([
        fetch('/api/trips', { headers }),
        fetch('/api/packages'),
        fetch('/api/clients', { headers }),
        fetch('/api/users', { headers }),
        fetch('/api/expenses', { headers }),
        fetch('/api/activity-logs', { headers }),
        fetch('/api/inquiries', { headers }),
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
      if (clientsRes.ok) {
        const d = await clientsRes.json();
        setClients(d.clients || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users || []);
      }
      if (expRes.ok) {
        const d = await expRes.json();
        setExpenses(d.expenses || []);
      }
      if (logsRes.ok) {
        const d = await logsRes.json();
        setActivityLogs(d.logs || []);
      }
      if (inqRes && inqRes.ok) {
        const d = await inqRes.json();
        setInquiries(d.inquiries || []);
      }
      if (vehRes && vehRes.ok) {
        const d = await vehRes.json();
        setVehicles(d.vehicles || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create_trip', label: 'Create New Trip', icon: PlusCircle, badge: 'New' },
    { id: 'trips', label: 'Trips & Dispatch', icon: Calendar },
    { id: 'vehicles', label: 'Fleet Vehicles', icon: Car, badge: `${vehicles.length || 0}` },
    {
      id: 'inquiries',
      label: 'Inquiries & Leads',
      icon: Sparkles,
      badge: inquiries.filter((i) => i.status === 'New').length > 0 ? `${inquiries.filter((i) => i.status === 'New').length} New` : null,
    },
    { id: 'users', label: 'Managers & Drivers', icon: ShieldCheck },
    { id: 'expenses', label: 'Expense Review', icon: Receipt },
    { id: 'salaries', label: 'Salaries & Settlements', icon: DollarSign },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'activity', label: 'Audit Activity', icon: Clock },
  ];

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex bg-slate-100 font-sans overscroll-none">
      {/* FIXED LEFT SIDEBAR (No scrolling away, Logo removed as requested in image 2) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1e1035] text-white flex flex-col shrink-0 border-r border-purple-900/60 transition-transform duration-300 lg:static lg:translate-x-0 h-full ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Sidebar Header - Logo removed here because it's already in the fixed top header */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <span className="font-heading font-extrabold text-sm text-white tracking-wider">
              ADMIN PANEL
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-purple-900/40 bg-purple-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={user?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500"
            />
            <div className="min-w-0">
              <p className="font-semibold text-xs text-white truncate">{user?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-purple-300 truncate">{user?.email || 'admin@tirupatibalaji.com'}</p>
              <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-orange-500/20 text-orange-400 text-[9px] font-bold uppercase tracking-wider">
                Full Control
              </span>
            </div>
          </div>
        </div>

        {/* Menu Navigation List (Scrolls independently if screen height is small) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${isActive
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'
                      }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-900/80 text-orange-300 uppercase font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
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
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE: FIXED HEADER & SCROLLABLE CONTENT */}
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
              {activeTab.replace('_', ' ')}
            </h2>
          </div>

          {/* Right: Mode Badge + Notifications + Sign Out */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <span className="hidden sm:inline-flex text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
              ● Live Admin Mode
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

        {/* SCROLLABLE MAIN BODY: The only area that scrolls */}
        <main className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 bg-slate-50/70">
          {activeTab !== 'dashboard' && (
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 text-xs font-semibold shadow-xs transition-all cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-orange-500" />
                <span>Back to Dashboard</span>
              </button>
              <span className="text-[11px] text-slate-400 font-medium capitalize">
                Admin Suite &bull; {activeTab.replace('_', ' ')}
              </span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <AdminDashboard
              data={{ trips, packages, clients, users, expenses, activityLogs, vehicles }}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleManagement vehicles={vehicles} onRefresh={fetchData} role="admin" />
          )}

          {(activeTab === 'trips' || activeTab === 'create_trip') && (
            <TripManagement
              key={activeTab}
              trips={trips}
              packages={packages}
              clients={clients}
              drivers={users.filter((u) => u.role === 'driver')}
              vehicles={vehicles}
              onRefresh={fetchData}
              role="admin"
              initialOpenAdd={activeTab === 'create_trip'}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesManagement inquiries={inquiries} onRefresh={fetchData} />
          )}

          {activeTab === 'users' && (
            <UserManagement users={users} onRefresh={fetchData} />
          )}

          {activeTab === 'expenses' && (
            <ExpenseReview
              expenses={expenses}
              trips={trips}
              drivers={users.filter((u) => u.role === 'driver')}
              onRefresh={fetchData}
              role="admin"
            />
          )}

          {activeTab === 'salaries' && (
            <TripManagement
              trips={trips.filter((t) => t.status === 'Completed' || t.status === 'Closed')}
              packages={packages}
              clients={clients}
              drivers={users.filter((u) => u.role === 'driver')}
              vehicles={vehicles}
              onRefresh={fetchData}
              role="admin"
            />
          )}

          {activeTab === 'reports' && (
            <Reports trips={trips} expenses={expenses} users={users} packages={packages} />
          )}

          {activeTab === 'activity' && <ActivityLogs logs={activityLogs} />}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
