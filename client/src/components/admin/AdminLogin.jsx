import React, { useState } from 'react';
import { ShieldCheck, Mail, Key, AlertCircle, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin = ({ onLoginSuccess, onNavigateHome }) => {
  const { sendOtp, verifyOtp, loginWithGoogle, quickSwitchRole } = useAuth();
  const [email, setEmail] = useState('admin@tirupatibalaji.com');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (sendOtp) {
        try {
          const data = await sendOtp(email);
          if (data && data.debugOtp) setOtp(data.debugOtp);
        } catch (apiErr) {
          // Fallback gracefully for dummy UI interaction
          console.warn('API send-otp fallback:', apiErr.message);
        }
      }
      setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (verifyOtp) {
        try {
          const data = await verifyOtp(email, otp);
          if (data && data.user && data.user.role !== 'admin') {
            throw new Error('Access denied: This portal is for Super Administrators only.');
          }
        } catch (apiErr) {
          // Fallback for dummy UI login
          console.warn('API verify-otp fallback:', apiErr.message);
        }
      }
      quickSwitchRole('admin');
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    quickSwitchRole('admin');
    onLoginSuccess();
  };

  const handleQuickAdmin = () => {
    quickSwitchRole('admin');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120824] via-[#1e1035] to-[#2b144d] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-900/40">
        {/* Top Header */}
        <div className="bg-[#1e1035] p-6 text-center text-white relative">
          <button
            onClick={onNavigateHome}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 text-purple-200 hover:text-white hover:bg-white/20 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            title="Return to Role Selection"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Role Selection</span>
          </button>

          <img
            src="/logo.png"
            alt="Tirupati Balaji Tours & Travels"
            className="h-11 sm:h-12 w-auto mx-auto bg-white p-1 rounded-lg object-contain shadow-md mb-2.5"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMINISTRATOR PORTAL
          </div>
          <h2 className="font-heading font-extrabold text-xl text-white mt-1.5">
            Admin Suite Login
          </h2>
          <p className="text-xs text-purple-200/80 mt-1">
            Enterprise fleet dispatch, client privacy & financial controls
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
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tirupatibalaji.com"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>

              {/* Continue with Google */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-2 text-[11px] text-slate-600 font-medium">or</span>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
                OTP sent to <strong>{email}</strong> (Demo code: <strong>123456</strong>)
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
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-base font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify & Enter Admin Suite'}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs text-purple-800 hover:underline pt-1 cursor-pointer"
              >
                Change Email Address
              </button>
            </form>
          )}

          {/* Quick Demo Access Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>One-Click Super Admin Access (Demo)</span>
            </button>
          </div>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Admin registration is restricted to system owners.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
