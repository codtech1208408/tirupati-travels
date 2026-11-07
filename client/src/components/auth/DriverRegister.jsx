import React, { useState } from 'react';
import {
  Car,
  Mail,
  User,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export const DriverRegister = ({ onNavigateLogin, onNavigateHome }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    gender: 'Male',
    dob: '1992-06-15',
    licenseNumber: '',
  });

  const [licensePreview, setLicensePreview] = useState('/uploads/fuel_receipt_sample.jpg');
  const [fileName, setFileName] = useState('driving-licence-proof.jpg');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicensePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.mobile.trim() ||
      !formData.licenseNumber.trim()
    ) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    // UI dummy interaction (simulating registration submission)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120824] via-[#1e1035] to-[#2b144d] flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-900/40 my-4 sm:my-8">
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

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <Car className="w-3.5 h-3.5" />
            FLEET DRIVER REGISTRATION
          </div>

          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white mt-1.5">
            Join Our Driver Fleet
          </h2>
          <p className="text-xs text-purple-200/80 mt-1 max-w-xs mx-auto">
            Submit your driving credentials for Admin license verification and wallet setup
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8">
          {submitted ? (
            /* Success State */
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Registration Submitted!
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Welcome to the fleet, <span className="font-semibold text-slate-800">{formData.fullName}</span>! Your driver application and licence details have been registered.
                </p>
              </div>

              <div className="p-4 bg-orange-50/70 border border-orange-200/60 rounded-2xl text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-orange-900 font-bold">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Admin Verification In Progress</span>
                </div>
                <div className="text-slate-600 space-y-1 text-[11px] leading-relaxed">
                  <p>• <strong>Licence No:</strong> {formData.licenseNumber}</p>
                  <p>• <strong>Registered Email:</strong> {formData.email}</p>
                  <p>• Once approved by Admin, your driver wallet will be activated and you can sign in directly to view assigned trips and log expenses.</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={onNavigateLogin}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Go to Driver Login
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
                  Full Name (as per Licence) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Naidu"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Email & Mobile 2-column on tablet/desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="driver@tirupati.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Mobile */}
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
                      placeholder="+91 99890 24680"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Gender & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="date"
                      name="dob"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Driving Licence Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driving Licence Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="licenseNumber"
                    required
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="e.g. AP-03-2019-0045892"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Driving Licence Document Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driving Licence Document / Photo Proof <span className="text-rose-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-4 bg-slate-50 text-center transition-colors">
                  <input
                    type="file"
                    id="licenseFileInput"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="licenseFileInput" className="cursor-pointer block">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      Tap to upload Licence Document
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Accepted: PNG, JPG, JPEG or PDF (Max 10MB)
                    </p>
                  </label>

                  {fileName && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{fileName}</span>
                    </div>
                  )}
                </div>
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
                  <span>Submit Driver Registration</span>
                )}
              </button>

              {/* Footer Switch */}
              <div className="pt-2 text-center">
                <p className="text-xs text-slate-600">
                  Already registered as driver?{' '}
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="text-orange-600 hover:text-orange-700 font-bold hover:underline cursor-pointer"
                  >
                    Driver Login
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

