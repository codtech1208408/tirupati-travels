import React from 'react';
import {
  ShieldCheck,
  Briefcase,
  Smartphone,
  ChevronRight,
  UserPlus,
  Lock,
  Sparkles,
  ArrowRight,
  Car,
} from 'lucide-react';

export const WelcomeScreen = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120824] via-[#1e1035] to-[#2b144d] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Brand Header */}
      <div className="w-full max-w-md sm:max-w-xl mx-auto pt-4 sm:pt-8 text-center">
        <div className="inline-block p-2 bg-white rounded-2xl shadow-2xl mb-4 border border-purple-200/20">
          <img
            src="/logo.png"
            alt="Tirupati Balaji Tours & Travels"
            className="h-12 sm:h-16 w-auto object-contain mx-auto"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wider uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Fleet & Trip Management Platform
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
          Welcome to <span className="text-orange-400">Tirupati Balaji</span>
        </h1>
        <p className="text-xs sm:text-sm text-purple-200/80 mt-1.5 max-w-sm mx-auto">
          Select your designated role below to sign in or request workspace access.
        </p>
      </div>

      {/* Main Options: Three Options Displayed Vertically */}
      <div className="w-full max-w-md sm:max-w-xl mx-auto my-6 space-y-4">
        {/* OPTION 1: ADMIN LOGIN */}
        <div className="group relative bg-white/95 text-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl border border-white/20 transition-all duration-200 hover:shadow-2xl hover:scale-[1.01]">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1e1035] to-[#3b1768] text-orange-400 shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading font-extrabold text-lg text-slate-900 group-hover:text-purple-950 transition-colors">
                  Admin Login
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Full fleet management, client privacy directory, driver dispatch, expense approvals, deal settlements & audit logs.
              </p>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigate('/admin')}
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                <span>Restricted portal • Master accounts only</span>
              </div>
            </div>
          </div>
        </div>

        {/* OPTION 2: MANAGER LOGIN */}
        <div className="group relative bg-white/95 text-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl border border-white/20 transition-all duration-200 hover:shadow-2xl hover:scale-[1.01]">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-800 to-purple-950 text-white shrink-0 shadow-md">
              <Briefcase className="w-6 h-6 text-purple-200" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading font-extrabold text-lg text-slate-900 group-hover:text-purple-950 transition-colors">
                  Manager Login
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Operations
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Manage assigned trips, driver allocations, operational expense scrutiny, and reports under delegated RBAC permissions.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => onNavigate('/manager')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1e1035] hover:bg-[#2b144d] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In as Manager</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Need manager access?</span>
                <button
                  onClick={() => onNavigate('/manager/register')}
                  className="text-orange-600 hover:text-orange-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Request Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* OPTION 3: DRIVER LOGIN */}
        <div className="group relative bg-white/95 text-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl border border-white/20 transition-all duration-200 hover:shadow-2xl hover:scale-[1.01]">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shrink-0 shadow-md">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading font-extrabold text-lg text-slate-900 group-hover:text-purple-950 transition-colors">
                  Driver Login
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  Fleet Pilot
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Mobile terminal to view upcoming trips, record fuel & toll bills with photo proof, and track instant wallet earnings.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => onNavigate('/driver')}
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Driver Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">New driver joining fleet?</span>
                <button
                  onClick={() => onNavigate('/driver/register')}
                  className="text-purple-900 hover:text-purple-950 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-orange-600" />
                  <span>Register Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="w-full max-w-md sm:max-w-xl mx-auto pb-4 text-center">
        <p className="text-[11px] text-purple-300/60 font-medium">
          Tirupati Balaji Tours & Travels • Official Fleet Trip Management Suite
        </p>
        <p className="text-[10px] text-purple-300/40 mt-0.5">
          Secure Role-Based Access Control • Android & Web Ready
        </p>
      </footer>
    </div>
  );
};
