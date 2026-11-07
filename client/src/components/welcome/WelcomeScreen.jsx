import React, { useRef, useState } from 'react';
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
  const scrollContainerRef = useRef(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const scrollToCard = (index) => {
    setActiveCardIndex(index);
    if (scrollContainerRef.current) {
      const cards = scrollContainerRef.current.children;
      if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const cardWidth = e.target.offsetWidth * 0.8;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex >= 0 && newIndex <= 2 && newIndex !== activeCardIndex) {
      setActiveCardIndex(newIndex);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120824] via-[#1e1035] to-[#2b144d] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Brand Header */}
      <header className="w-full max-w-4xl mx-auto pt-4 sm:pt-6 text-center">
        <div className="inline-block p-2 bg-white rounded-2xl shadow-2xl mb-3 border border-purple-200/20">
          <img
            src="/logo.png"
            alt="Tirupati Balaji Tours & Travels"
            className="h-12 sm:h-14 w-auto object-contain mx-auto"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wider uppercase mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Fleet & Trip Management Platform
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-tight">
          Welcome to <span className="text-orange-400">Tirupati Balaji</span>
        </h1>
        <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-lg mx-auto">
          Select your designated role below to sign in or request workspace access.
        </p>

        {/* Mobile Role Switcher Pill (Visible only on small screens) */}
        <div className="md:hidden flex items-center justify-center gap-1.5 mt-4 p-1 bg-white/10 rounded-2xl max-w-xs mx-auto backdrop-blur-xs">
          {[
            { label: 'Admin', index: 0 },
            { label: 'Manager', index: 1 },
            { label: 'Driver', index: 2 },
          ].map((tab) => (
            <button
              key={tab.index}
              onClick={() => scrollToCard(tab.index)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCardIndex === tab.index
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Options: THREE EQUAL OPTIONS HORIZONTALLY SIDE BY SIDE IN A SINGLE ROW */}
      <main className="w-full max-w-6xl mx-auto my-auto py-6">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-3 gap-5 lg:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 px-2 sm:px-4 md:px-0 snap-x snap-mandatory scrollbar-none items-stretch justify-start md:justify-center"
        >
          {/* OPTION 1: ADMIN LOGIN */}
          <div className="w-[84vw] max-w-[340px] sm:w-[360px] md:w-auto md:max-w-none shrink-0 snap-center group relative bg-white/95 text-slate-800 rounded-3xl p-6 shadow-xl border border-white/20 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between">
            <div>
              {/* Header: Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1e1035] to-[#3b1768] text-orange-400 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                  Super Admin
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="font-heading font-extrabold text-xl text-slate-900 group-hover:text-purple-950 transition-colors">
                Admin Login
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed min-h-[50px] sm:min-h-[56px]">
                Full fleet dispatch, client privacy directory, expense approvals, deal settlements & audit logs.
              </p>
            </div>

            {/* Actions & Footer */}
            <div className="mt-5 pt-3">
              <button
                onClick={() => onNavigate('/admin')}
                className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-600 font-medium h-7">
                <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Restricted • Master accounts only</span>
              </div>
            </div>
          </div>

          {/* OPTION 2: MANAGER LOGIN */}
          <div className="w-[84vw] max-w-[340px] sm:w-[360px] md:w-auto md:max-w-none shrink-0 snap-center group relative bg-white/95 text-slate-800 rounded-3xl p-6 shadow-xl border border-white/20 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between">
            <div>
              {/* Header: Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-800 to-purple-950 text-white shadow-md">
                  <Briefcase className="w-6 h-6 text-purple-200" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Operations
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="font-heading font-extrabold text-xl text-slate-900 group-hover:text-purple-950 transition-colors">
                Manager Login
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed min-h-[50px] sm:min-h-[56px]">
                Manage assigned trips, driver allocations, operational expense review, and reports under RBAC permissions.
              </p>
            </div>

            {/* Actions & Footer */}
            <div className="mt-5 pt-3">
              <button
                onClick={() => onNavigate('/manager')}
                className="w-full py-3 px-4 rounded-xl bg-[#1e1035] hover:bg-[#2b144d] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In as Manager</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs h-7">
                <span className="text-slate-600">Need access?</span>
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

          {/* OPTION 3: DRIVER LOGIN */}
          <div className="w-[84vw] max-w-[340px] sm:w-[360px] md:w-auto md:max-w-none shrink-0 snap-center group relative bg-white/95 text-slate-800 rounded-3xl p-6 shadow-xl border border-white/20 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between">
            <div>
              {/* Header: Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-md">
                  <Car className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  Fleet Pilot
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="font-heading font-extrabold text-xl text-slate-900 group-hover:text-purple-950 transition-colors">
                Driver Login
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed min-h-[50px] sm:min-h-[56px]">
                Mobile terminal to view assigned trips, record fuel & toll receipts with photo proof, and track wallet balance.
              </p>
            </div>

            {/* Actions & Footer */}
            <div className="mt-5 pt-3">
              <button
                onClick={() => onNavigate('/driver')}
                className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Driver Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs h-7">
                <span className="text-slate-600">New fleet driver?</span>
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

        {/* Mobile Swipe Guidance Dots */}
        <div className="md:hidden flex items-center justify-center gap-2 mt-4">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => scrollToCard(idx)}
              aria-label={`Go to option ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeCardIndex === idx ? 'w-6 bg-orange-500' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-4xl mx-auto pb-3 text-center">
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
