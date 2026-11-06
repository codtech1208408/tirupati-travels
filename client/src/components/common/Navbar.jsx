import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  Briefcase,
  Smartphone,
  Bell,
  LogOut,
  ChevronDown,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationsDrawer } from './NotificationsDrawer';

export const Navbar = () => {
  const {
    user,
    role,
    activePortal,
    setActivePortal,
    unreadCount,
    quickSwitchRole,
    logout,
  } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1e1035] text-white border-b border-purple-900/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePortal('public')}
                className="flex items-center gap-3 focus:outline-hidden group"
              >
                <img
                  src="/logo.png"
                  alt="Tirupati Balaji Tours & Travels"
                  className="h-10 sm:h-12 w-auto object-contain bg-white/95 rounded-md p-1 shadow-sm group-hover:scale-102 transition-transform"
                />
              </button>
            </div>

            {/* Portal Switcher Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-xl backdrop-blur-md">
              <button
                onClick={() => setActivePortal('public')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePortal === 'public'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-purple-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Public Website
              </button>

              <button
                onClick={() => {
                  if (role !== 'admin') quickSwitchRole('admin');
                  setActivePortal('admin');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePortal === 'admin'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-purple-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </button>

              <button
                onClick={() => {
                  if (role !== 'manager') quickSwitchRole('manager');
                  setActivePortal('manager');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePortal === 'manager'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-purple-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Manager Panel
              </button>

              <button
                onClick={() => {
                  if (role !== 'driver') quickSwitchRole('driver');
                  setActivePortal('driver');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePortal === 'driver'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-purple-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Driver App
              </button>
            </nav>

            {/* Right Controls: Quick Switcher + Notifications + Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Switch Role Pill */}
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 text-xs font-medium transition-colors"
                  title="Switch Role for Testing"
                >
                  <Zap className="w-3.5 h-3.5 text-orange-400" />
                  <span className="hidden sm:inline">Role:</span>
                  <span className="font-semibold text-white capitalize">{role}</span>
                  <ChevronDown className="w-3 h-3 text-orange-300" />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role (Demo Mode)
                    </div>
                    <button
                      onClick={() => {
                        quickSwitchRole('admin');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-purple-50 transition-colors ${
                        role === 'admin' ? 'text-purple-700 bg-purple-50/60 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <div>
                          <div>Super Admin</div>
                          <div className="text-[10px] text-slate-400">admin@tirupatibalaji.com</div>
                        </div>
                      </div>
                      {role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>}
                    </button>

                    <button
                      onClick={() => {
                        quickSwitchRole('manager');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-purple-50 transition-colors ${
                        role === 'manager' ? 'text-purple-700 bg-purple-50/60 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        <div>
                          <div>Manager (Suresh)</div>
                          <div className="text-[10px] text-slate-400">suresh@tirupatibalaji.com</div>
                        </div>
                      </div>
                      {role === 'manager' && <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>}
                    </button>

                    <button
                      onClick={() => {
                        quickSwitchRole('driver');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-orange-50 transition-colors ${
                        role === 'driver' ? 'text-orange-600 bg-orange-50/60 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-orange-500" />
                        <div>
                          <div>Driver (Ramesh)</div>
                          <div className="text-[10px] text-slate-400">ramesh.driver@tirupatibalaji.com</div>
                        </div>
                      </div>
                      {role === 'driver' && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Avatar & Logout */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <img
                    src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/50"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold leading-tight">{user.name}</p>
                    <p className="text-[10px] text-purple-300 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-red-400 transition-colors ml-1"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActivePortal('admin')}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Portal Nav Row */}
        <div className="md:hidden flex items-center justify-around bg-[#160a2c] py-2 px-3 border-t border-purple-900/40 text-xs">
          <button
            onClick={() => setActivePortal('public')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md ${
              activePortal === 'public' ? 'bg-orange-500 text-white font-semibold' : 'text-purple-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Website
          </button>
          <button
            onClick={() => {
              if (role !== 'admin') quickSwitchRole('admin');
              setActivePortal('admin');
            }}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md ${
              activePortal === 'admin' ? 'bg-orange-500 text-white font-semibold' : 'text-purple-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </button>
          <button
            onClick={() => {
              if (role !== 'manager') quickSwitchRole('manager');
              setActivePortal('manager');
            }}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md ${
              activePortal === 'manager' ? 'bg-orange-500 text-white font-semibold' : 'text-purple-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Manager
          </button>
          <button
            onClick={() => {
              if (role !== 'driver') quickSwitchRole('driver');
              setActivePortal('driver');
            }}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md ${
              activePortal === 'driver' ? 'bg-orange-500 text-white font-semibold' : 'text-purple-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Driver App
          </button>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

