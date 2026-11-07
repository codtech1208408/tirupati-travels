import React, { useState } from 'react';
import {
  Briefcase,
  Mail,
  User,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const ManagerRegister = ({ onNavigateLogin, onNavigateHome }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    // UI dummy interaction (simulating request submission)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120824] via-[#1e1035] to-[#2b144d] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-900/40">
        {/* Header */}
        <div className="bg-[#1b1030] p-6 text-center text-white relative">
          <button
            onClick={onNavigateHome}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 text-purple-200 hover:text-white hover:bg-white/20 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="Back to Welcome Screen"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Role Selection</span>
          </button>

          <img
            src="/logo.png"
            alt="Tirupati Balaji Tours & Travels"
            className="h-10 sm:h-12 w-auto mx-auto bg-white p-1 rounded-lg object-contain shadow-md mb-2"
          />

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Briefcase className="w-3.5 h-3.5" />
            MANAGER ONBOARDING
          </div>

          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white mt-1.5">
            Request Manager Access
          </h2>
          <p className="text-xs text-purple-200/80 mt-1 max-w-xs mx-auto">
            Submit your credentials to Admin for authorization and RBAC role assignment
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            /* Success State */
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Request Submitted!
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Thank you, <span className="font-semibold text-slate-800">{formData.fullName}</span>. Your manager access request has been forwarded to the Super Admin.
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-purple-900 font-bold">
                  <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Admin Approval Required</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Once the Administrator approves your application and assigns permissions, you will be able to log in using <strong className="text-slate-800">{formData.email}</strong> via OTP or Google.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={onNavigateLogin}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Go to Manager Login
                </button>
                <button
                  onClick={onNavigateHome}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Return to Role Selection
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. suresh@tirupatibalaji.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  You will use this email address to receive OTPs and sign in.
                </p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="e.g. +91 98480 12345"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-purple-900 leading-relaxed">
                  Submitted requests are routed to the Super Admin for identity verification and permission allocation.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Submit Manager Access Request</span>
                )}
              </button>

              {/* Footer Switch */}
              <div className="pt-2 text-center">
                <p className="text-xs text-slate-600">
                  Already have an approved account?{' '}
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="text-orange-600 hover:text-orange-700 font-bold hover:underline cursor-pointer"
                  >
                    Manager Login
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

