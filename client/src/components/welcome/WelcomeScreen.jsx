import React, { useState } from 'react';
import { ShieldCheck, Briefcase, Car, Sparkles, ArrowLeft } from 'lucide-react';
import { AdminLogin } from '../admin/AdminLogin';
import { ManagerLogin } from '../manager/ManagerLogin';
import { DriverLogin } from '../driver/DriverLogin';

export const WelcomeScreen = ({ initialRole = null, onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState(initialRole);

  const handleSelectRole = (role) => {
    if (selectedRole === role) {
      setSelectedRole(null);
      if (onNavigate) onNavigate('/');
    } else {
      setSelectedRole(role);
      if (onNavigate) onNavigate(`/${role}`);
    }
  };

  const handleCloseLogin = () => {
    setSelectedRole(null);
    if (onNavigate) onNavigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120824] via-[#1e1035] to-[#2b144d] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Brand Header */}
      <header className="w-full max-w-3xl mx-auto pt-3 sm:pt-6 text-center">
        <div className="inline-block p-2 bg-white rounded-2xl shadow-2xl mb-3 border border-purple-200/20">
          <img
            src="/logo.png"
            alt="Tirupati Balaji Tours & Travels"
            className="h-11 sm:h-14 w-auto object-contain mx-auto"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Fleet & Trip Management Platform
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
          Welcome to <span className="text-orange-400">Tirupati Balaji</span>
        </h1>
        <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-md mx-auto">
          Select a login portal below to access your dedicated workspace
        </p>

        {/* =========================================================================
            THREE HEADINGS HORIZONTALLY SIDE BY SIDE IN A SINGLE ROW (EQUAL IN SIZE)
            ========================================================================= */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl sm:max-w-3xl w-full mx-auto mt-6">
          {/* HEADING 1: ADMIN LOGIN */}
          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center sm:text-left cursor-pointer shadow-md ${
              selectedRole === 'admin'
                ? 'bg-orange-500 text-white border-orange-400 shadow-xl ring-2 ring-orange-400/40 scale-[1.02]'
                : 'bg-white/95 text-slate-800 border-white/20 hover:bg-white hover:border-orange-500 hover:shadow-lg'
            }`}
          >
            <div
              className={`p-2 sm:p-2.5 rounded-xl shrink-0 transition-colors ${
                selectedRole === 'admin'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#1e1035] text-orange-400'
              }`}
            >
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-extrabold text-xs sm:text-sm md:text-base leading-tight">
                Admin Login
              </h2>
              <span
                className={`text-[10px] hidden sm:block mt-0.5 ${
                  selectedRole === 'admin' ? 'text-orange-100' : 'text-slate-600'
                }`}
              >
                Super Admin
              </span>
            </div>
          </button>

          {/* HEADING 2: MANAGER LOGIN */}
          <button
            type="button"
            onClick={() => handleSelectRole('manager')}
            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center sm:text-left cursor-pointer shadow-md ${
              selectedRole === 'manager'
                ? 'bg-purple-900 text-white border-purple-400 shadow-xl ring-2 ring-purple-400/40 scale-[1.02]'
                : 'bg-white/95 text-slate-800 border-white/20 hover:bg-white hover:border-purple-600 hover:shadow-lg'
            }`}
          >
            <div
              className={`p-2 sm:p-2.5 rounded-xl shrink-0 transition-colors ${
                selectedRole === 'manager'
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-800 text-purple-200'
              }`}
            >
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-extrabold text-xs sm:text-sm md:text-base leading-tight">
                Manager Login
              </h2>
              <span
                className={`text-[10px] hidden sm:block mt-0.5 ${
                  selectedRole === 'manager' ? 'text-purple-200' : 'text-slate-600'
                }`}
              >
                Operations
              </span>
            </div>
          </button>

          {/* HEADING 3: DRIVER LOGIN */}
          <button
            type="button"
            onClick={() => handleSelectRole('driver')}
            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center sm:text-left cursor-pointer shadow-md ${
              selectedRole === 'driver'
                ? 'bg-orange-500 text-white border-orange-400 shadow-xl ring-2 ring-orange-400/40 scale-[1.02]'
                : 'bg-white/95 text-slate-800 border-white/20 hover:bg-white hover:border-orange-500 hover:shadow-lg'
            }`}
          >
            <div
              className={`p-2 sm:p-2.5 rounded-xl shrink-0 transition-colors ${
                selectedRole === 'driver'
                  ? 'bg-white/20 text-white'
                  : 'bg-orange-500 text-white'
              }`}
            >
              <Car className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-extrabold text-xs sm:text-sm md:text-base leading-tight">
                Driver Login
              </h2>
              <span
                className={`text-[10px] hidden sm:block mt-0.5 ${
                  selectedRole === 'driver' ? 'text-orange-100' : 'text-slate-600'
                }`}
              >
                Fleet Pilot
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* =========================================================================
          CONDITIONAL LOGIN PAGE: SHOWN ONLY AFTER SELECTING A PARTICULAR LOGIN
          ========================================================================= */}
      <main className="w-full max-w-xl mx-auto my-auto py-4">
        {selectedRole === null ? (
          /* Initial State: Only headings are displayed with a simple guidance note */
          <div className="text-center py-8 sm:py-12 animate-in fade-in duration-300">
            <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-3 text-orange-400">
              <Sparkles className="w-6 h-6 mx-auto animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-purple-200/70 font-medium">
              Tap any login heading above to open that portal
            </p>
          </div>
        ) : selectedRole === 'admin' ? (
          /* Admin Login Page */
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-200">
            <AdminLogin
              embedded={true}
              onLoginSuccess={() => {
                if (onNavigate) onNavigate('/admin');
              }}
              onNavigateHome={handleCloseLogin}
            />
          </div>
        ) : selectedRole === 'manager' ? (
          /* Manager Login Page */
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-200">
            <ManagerLogin
              embedded={true}
              onLoginSuccess={() => {
                if (onNavigate) onNavigate('/manager');
              }}
              onNavigateHome={handleCloseLogin}
              onNavigateRegister={() => {
                if (onNavigate) onNavigate('/manager/register');
              }}
            />
          </div>
        ) : selectedRole === 'driver' ? (
          /* Driver Login Page */
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-200">
            <DriverLogin
              embedded={true}
              onLoginSuccess={() => {
                if (onNavigate) onNavigate('/driver');
              }}
              onNavigateHome={handleCloseLogin}
              onNavigateRegister={() => {
                if (onNavigate) onNavigate('/driver/register');
              }}
            />
          </div>
        ) : null}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-3xl mx-auto pb-3 text-center">
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
