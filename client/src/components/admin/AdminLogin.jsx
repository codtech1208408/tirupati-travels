import React, { useState } from 'react';
import { ShieldCheck, Mail, Key, AlertCircle, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin = ({ onLoginSuccess, onNavigateHome }) => {
  const { sendOtp, verifyOtp, loginWithGoogle, quickSwitchRole } = useAuth();
  const [email, setEmail] = useState('admin@tirupatibalaji.com');
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
      if (data.user.role !== 'admin') {
        throw new Error('Access denied: This portal is for Super Administrators only.');
      }
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    quickSwitchRole('admin');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120824] via-[#1e1035] to-[#2b144d] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-900/40">
        {/* Top Header */}
        <div className="bg-[#1e1035] p-6 text-center text-white relative">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <ShieldCheck className="w-4 h-4" />
            ADMINISTRATOR PORTAL
          </div>
          <h2 className="font-heading font-extrabold text-xl text-white mt-2">
            Secure Admin Login
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Fleet operations, client privacy & financial controls
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
                  Registered Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tirupatibalaji.com"
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
                {loading ? 'Verifying...' : 'Verify & Enter Admin Suite'}
              </button>
            </form>
          )}

          {/* Quick Demo Access Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>One-Click Super Admin Access (Demo)</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400">
              Only authorized administrators registered in the system database may sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

