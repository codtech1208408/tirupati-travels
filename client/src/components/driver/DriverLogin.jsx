import React, { useState } from 'react';
import { Smartphone, Mail, Key, AlertCircle, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DriverLogin = ({ onLoginSuccess, onNavigateHome }) => {
  const { sendOtp, verifyOtp, loginWithGoogle, quickSwitchRole } = useAuth();
  const [email, setEmail] = useState('ramesh.driver@tirupatibalaji.com');
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
      if (data.user.role !== 'driver') {
        throw new Error('Access denied: This portal is for Fleet Drivers only.');
      }
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDriver = () => {
    quickSwitchRole('driver');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b1030] via-[#241344] to-[#120824] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-900/40">
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
            className="h-12 sm:h-14 w-auto mx-auto bg-white p-1 rounded-lg object-contain shadow-md mb-3"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <Smartphone className="w-4 h-4" />
            DRIVER TERMINAL
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white mt-2">
            Welcome Back, Driver
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Access assigned trips, submit expenses & view wallet ledger
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
                  Registered Driver Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh.driver@tirupatibalaji.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Get Verification OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950">
                Enter the 6-digit verification OTP sent to <strong>{email}</strong>
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
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Open Terminal'}
              </button>
            </form>
          )}

          {/* Continue with Google */}
          <div className="relative text-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">or</span>
          </div>

          <button
            type="button"
            onClick={() => {
              loginWithGoogle('ramesh.driver@tirupatibalaji.com')
                .then(() => onLoginSuccess())
                .catch((err) => setError(err.message));
            }}
            className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
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

          {/* Quick Demo Access Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickDriver}
              className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>One-Click Driver Access (Ramesh)</span>
            </button>
          </div>

          <div className="text-center pt-1 text-[11px] text-slate-400">
            Only accounts registered by Super Admin can access the fleet system.
          </div>
        </div>
      </div>
    </div>
  );
};

