import React, { useState } from 'react';
import { Briefcase, Mail, Key, AlertCircle, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ManagerLogin = ({ onLoginSuccess, onNavigateHome }) => {
  const { sendOtp, verifyOtp, quickSwitchRole } = useAuth();
  const [email, setEmail] = useState('suresh@tirupatibalaji.com');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await sendOtp(email);
      setOtpSent(true);
      if (data.debugOtp) setOtp(data.debugOtp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verifyOtp(email, otp);
      if (data.user.role !== 'manager') {
        throw new Error('Access denied: This login is for Operations Managers only.');
      }
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickManager = () => {
    quickSwitchRole('manager');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b1030] via-[#241344] to-[#160a2b] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-900/40">
        {/* Top Header */}
        <div className="bg-[#1b1030] p-6 text-center text-white relative">
          <button
            onClick={onNavigateHome}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 text-purple-200 hover:text-white hover:bg-white/20 transition-colors flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Website</span>
          </button>

          <img
            src="/logo.png"
            alt="Tirupati Balaji Tours & Travels"
            className="h-12 w-auto mx-auto bg-white p-1 rounded-lg object-contain shadow-md mb-3"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Briefcase className="w-4 h-4" />
            OPERATIONS MANAGER PORTAL
          </div>
          <h2 className="font-heading font-extrabold text-xl text-white mt-2">
            Manager Sign In
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Trip scheduling, driver dispatch & expense review
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="suresh@tirupatibalaji.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Send Verification OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
                OTP sent to <strong>{email}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-base font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Open Manager Dashboard'}
              </button>
            </form>
          )}

          {/* Quick Demo Access Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickManager}
              className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>One-Click Manager Access (Suresh Kumar)</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed text-center">
            🔒 <strong>Strict Privacy Notice:</strong> Client personal contact details are restricted
            and confidential to the Super Admin.
          </div>
        </div>
      </div>
    </div>
  );
};

