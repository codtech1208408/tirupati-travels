import React from 'react';
import { ShieldCheck, Briefcase, Car, Sparkles, ArrowRight, Lock, UserPlus } from 'lucide-react';

export const WelcomeScreen = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120824] via-[#1e1035] to-[#2b144d] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Brand Header */}
      <header className="w-full max-w-3xl mx-auto pt-4 sm:pt-8 text-center">
        <div className="inline-block p-2.5 bg-white rounded-2xl shadow-2xl mb-4 border border-purple-200/20">
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

        <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
          Welcome to <span className="text-orange-400">Tirupati Balaji</span>
        </h1>
        <p className="text-xs sm:text-sm text-purple-200/80 mt-1.5 max-w-md mx-auto">
          Select your dedicated portal below to open the full login page
        </p>
      </header>

      {/* Main Content: THREE EQUAL OPTIONS HORIZONTALLY SIDE BY SIDE IN A SINGLE ROW */}
      <main className="w-full max-w-3xl mx-auto my-auto py-6">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full">
          {/* OPTION 1: ADMIN LOGIN */}
          <button
            type="button"
            onClick={() => onNavigate('/admin')}
            className="p-3 sm:p-5 rounded-2xl bg-white/95 hover:bg-white text-slate-800 shadow-xl hover:shadow-2xl hover:scale-102 border-2 border-transparent hover:border-orange-500 transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 text-center cursor-pointer group"
          >
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#1e1035] text-orange-400 group-hover:bg-orange-500 group-hover:text-white shadow-md transition-colors">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xs sm:text-base text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                Admin Login
              </h2>
              <span className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                Super Admin
              </span>
            </div>
          </button>

          {/* OPTION 2: MANAGER LOGIN */}
          <button
            type="button"
            onClick={() => onNavigate('/manager')}
            className="p-3 sm:p-5 rounded-2xl bg-white/95 hover:bg-white text-slate-800 shadow-xl hover:shadow-2xl hover:scale-102 border-2 border-transparent hover:border-purple-600 transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 text-center cursor-pointer group"
          >
            <div className="p-2.5 sm:p-3 rounded-2xl bg-purple-900 text-purple-200 group-hover:bg-purple-950 group-hover:text-white shadow-md transition-colors">
              <Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xs sm:text-base text-slate-900 group-hover:text-purple-900 transition-colors leading-tight">
                Manager Login
              </h2>
              <span className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                Operations
              </span>
            </div>
          </button>

          {/* OPTION 3: DRIVER LOGIN */}
          <button
            type="button"
            onClick={() => onNavigate('/driver')}
            className="p-3 sm:p-5 rounded-2xl bg-white/95 hover:bg-white text-slate-800 shadow-xl hover:shadow-2xl hover:scale-102 border-2 border-transparent hover:border-orange-500 transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 text-center cursor-pointer group"
          >
            <div className="p-2.5 sm:p-3 rounded-2xl bg-orange-500 text-white group-hover:bg-orange-600 shadow-md transition-colors">
              <Car className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xs sm:text-base text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                Driver Login
              </h2>
              <span className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                Fleet Pilot
              </span>
            </div>
          </button>
        </div>

        {/* Quick Helper Note & Registration Shortcuts */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-purple-200/70 font-medium">
            Click any login heading above to open that full login page
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-purple-200/90 pt-2">
            <button
              onClick={() => onNavigate('/manager/register')}
              className="hover:text-orange-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-orange-400" />
              <span>Request Manager Access</span>
            </button>
            <span className="text-purple-400/40">•</span>
            <button
              onClick={() => onNavigate('/driver/register')}
              className="hover:text-orange-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-orange-400" />
              <span>New Driver Registration</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-3xl mx-auto pb-4 text-center">
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
