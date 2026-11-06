import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Car,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Users,
  CheckCircle2,
  Send,
  Award,
  HeartHandshake,
  Bus,
  Briefcase,
  Smartphone,
  Menu,
  X,
} from 'lucide-react';
import { PackageBookingModal } from './PackageBookingModal';

export const PublicWebsite = ({ onNavigate }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.packages) setPackages(data.packages);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleBookClick = (pkg) => {
    setSelectedPkg(pkg);
    setIsModalOpen(true);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    setContactLoading(true);
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          packageName: 'Direct Contact Message',
        }),
      });
      setContactSuccess(true);
      setContactForm({ name: '', phone: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* =========================================================================
         DEDICATED PUBLIC WEBSITE HEADER (Brand Logo, Navigation, Portal Links)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#1e1035] text-white border-b border-purple-900/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Tirupati Balaji Tours & Travels"
                  className="h-12 sm:h-14 w-auto object-contain bg-white rounded-md p-1 shadow-sm hover:scale-102 transition-transform"
                />
              </a>
            </div>

            {/* Public Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-purple-200">
              <a href="#home" className="hover:text-white transition-colors">
                Home
              </a>
              <a href="#about" className="hover:text-white transition-colors">
                About Us
              </a>
              <a href="#packages" className="hover:text-white transition-colors">
                Tour Packages
              </a>
              <a href="#services" className="hover:text-white transition-colors">
                Fleet & Services
              </a>
              <a href="#contact" className="hover:text-white transition-colors">
                Contact Us
              </a>
            </nav>

            {/* Portal Logins Dropdown */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Staff & Driver Portals ▾</span>
                </button>

                {isPortalDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Role-Based Portals
                    </div>
                    <button
                      onClick={() => {
                        setIsPortalDropdownOpen(false);
                        onNavigate('/admin');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-purple-50 text-purple-900 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <div>
                        <div>Admin Dashboard</div>
                        <div className="text-[10px] text-slate-400">/admin</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsPortalDropdownOpen(false);
                        onNavigate('/manager');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-purple-50 text-purple-900 transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-purple-700" />
                      <div>
                        <div>Manager Dashboard</div>
                        <div className="text-[10px] text-slate-400">/manager</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsPortalDropdownOpen(false);
                        onNavigate('/driver');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-orange-50 text-orange-600 transition-colors"
                    >
                      <Smartphone className="w-4 h-4 text-orange-500" />
                      <div>
                        <div>Driver Terminal</div>
                        <div className="text-[10px] text-slate-400">/driver</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="p-2 rounded-xl bg-white/10 text-white"
              >
                {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="lg:hidden bg-[#160a2b] border-t border-purple-900/60 p-4 space-y-3 text-sm">
            <a
              href="#home"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-purple-200 hover:text-white"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-purple-200 hover:text-white"
            >
              About Us
            </a>
            <a
              href="#packages"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-purple-200 hover:text-white"
            >
              Tour Packages
            </a>
            <a
              href="#services"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-purple-200 hover:text-white"
            >
              Fleet & Services
            </a>
            <a
              href="#contact"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-purple-200 hover:text-white"
            >
              Contact Us
            </a>

            <div className="pt-3 border-t border-purple-900/40 grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onNavigate('/admin');
                }}
                className="py-2 text-center bg-purple-900 text-white rounded-lg text-xs font-bold"
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onNavigate('/manager');
                }}
                className="py-2 text-center bg-purple-900 text-white rounded-lg text-xs font-bold"
              >
                Manager
              </button>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onNavigate('/driver');
                }}
                className="py-2 text-center bg-orange-500 text-white rounded-lg text-xs font-bold"
              >
                Driver
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 1. HERO SECTION */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-[#1e1035] via-[#281347] to-[#160a2b] text-white pt-12 pb-24 lg:pt-16 lg:pb-32">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ff6b00_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Trusted Pilgrimage & Fleet Partner Since 2010
              </div>

              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
                Sacred Pilgrimages,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-amber-200">
                  Seamless Journeys
                </span>{' '}
                with Lord Balaji's Blessings
              </h1>

              <p className="text-base sm:text-lg text-purple-200/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Experience hassle-free divine darshan with Andhra's premier travel operator. Luxury AC
                Tempo Travellers, sanitized coaches, VIP entry assistance, and experienced ghat-road
                drivers for an unforgettable spiritual journey.
              </p>

              {/* Highlights Chips */}
              <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start text-xs sm:text-sm font-medium text-purple-100">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                  <CheckCircle2 className="w-4 h-4 text-orange-400" />
                  VIP Break Darshan Assistance
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                  <CheckCircle2 className="w-4 h-4 text-orange-400" />
                  Fleet of 30+ Luxury Vehicles
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                  <CheckCircle2 className="w-4 h-4 text-orange-400" />
                  24/7 Station & Airport Pickup
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#packages"
                  className="px-7 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-base shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 text-center"
                >
                  Explore Darshan Packages
                </a>
                <button
                  onClick={() => {
                    setSelectedPkg(null);
                    setIsModalOpen(true);
                  }}
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-base backdrop-blur-md transition-all hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-orange-400" />
                  Request Custom Quote
                </button>
              </div>
            </div>

            {/* Right Visual Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80"
                    alt="Luxury Bus Fleet"
                    className="w-full h-72 sm:h-80 object-cover"
                  />
                  <div className="p-5 bg-gradient-to-r from-[#241142] to-[#1c0d35] border-t border-purple-900/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-orange-400 font-bold uppercase tracking-wider">
                        Premium Fleet
                      </p>
                      <h4 className="text-white font-heading font-bold text-base">
                        Force Urbania & Tempo Traveller Coaches
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      Sanitized Daily
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white text-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Customer Rating</p>
                    <p className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-1">
                      4.9 / 5.0 <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-white border-y border-slate-200/80 py-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-slate-100">
            <div className="p-3">
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1e1035]">15+ Years</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Pilgrimage Excellence</p>
            </div>
            <div className="p-3">
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-orange-600">25,000+</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Happy Pilgrims Escorted</p>
            </div>
            <div className="p-3">
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1e1035]">35+ Fleets</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Luxury AC Vehicles</p>
            </div>
            <div className="p-3">
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-emerald-600">100% Safe</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Ghat-Road Certified Drivers</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TOUR PACKAGES */}
      <section id="packages" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full">
              Divine Itineraries
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 mt-3">
              Popular Tirupati Darshan & Pilgrimage Packages
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Curated spiritual journeys with doorstep pickup from Hyderabad, Chennai, Bangalore, or
              Tirupati. Every package includes dedicated chauffeurs and comfortable temple halts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#1e1035]/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    {pkg.duration}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md">
                    Starting ₹{pkg.price?.toLocaleString()}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {pkg.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 mb-6">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span className="font-medium text-slate-700">{pkg.route}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>{pkg.vehicleType}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookClick(pkg)}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Book Package Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FLEET & SERVICES */}
      <section id="services" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full">
              Our Premium Fleet
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 mt-3">
              Fleet Options Built for Spiritual Travel
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Comfortable pushback seats, ample luggage capacity, and whisper-quiet air-conditioning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <Bus className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                Tempo Traveller (12 - 16 Seater)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Perfect for large joint families and pilgrim groups. High roof, individual AC vents, 2x1
                luxury pushback Maharaja seats, and LCD screen.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
                <li className="flex items-center gap-2">✓ Sanitized daily before trip</li>
                <li className="flex items-center gap-2">✓ Experienced ghat-road driver</li>
                <li className="flex items-center gap-2">✓ Large boot space for bags & laddus</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                Toyota Innova Crysta & Ertiga
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Supreme ride comfort for small nuclear families (4 to 7 travellers). Smooth cruising on
                highways and swift ascent up the sacred Seven Hills.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
                <li className="flex items-center gap-2">✓ Captain seat comfort</li>
                <li className="flex items-center gap-2">✓ Chilled climate control AC</li>
                <li className="flex items-center gap-2">✓ Mobile fast charging on all seats</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                Luxury Mini Coaches (20 - 32 Seater)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Ideal for corporate groups, wedding pilgrim guests, and community yatras. Air suspension
                for the smoothest journey across Andhra Pradesh.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
                <li className="flex items-center gap-2">✓ Air suspension smooth ride</li>
                <li className="flex items-center gap-2">✓ PA audio & devotional music system</li>
                <li className="flex items-center gap-2">✓ Two experienced licensed pilots</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT US */}
      <section id="about" className="py-20 bg-gradient-to-br from-[#1e1035] to-[#2a134c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
                About Our Company
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">
                Devotion in Every Mile, Safety in Every Journey
              </h2>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                Founded with a mission to make Lord Venkateswara’s darshan accessible and serene for
                devotees across the country, <strong>Tirupati Balaji Tours & Travels</strong> has grown
                from a single vehicle operator into a comprehensive fleet management powerhouse.
              </p>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                We take pride in our 100% verified, police-cleared drivers who understand the sacredness of
                your pilgrimage. From assisting with Alipiri ghat timings to guiding you through
                Srikalahasti pooja queues, our team is with you every step of the way.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <HeartHandshake className="w-8 h-8 text-orange-400 mb-2" />
                  <h4 className="font-bold text-sm text-white">Pilgrim First</h4>
                  <p className="text-xs text-purple-200 mt-1">Special priority for senior citizens & kids.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
                  <h4 className="font-bold text-sm text-white">Safety Assured</h4>
                  <p className="text-xs text-purple-200 mt-1">Ghat-road certified defensive driving.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop&q=80"
                  alt="Tirumala Sacred Temple Gopuram"
                  className="rounded-2xl shadow-2xl border-4 border-white/10 object-cover w-full h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl flex items-end p-6">
                  <div>
                    <span className="text-xs text-orange-300 font-bold uppercase tracking-wider">
                      Sacred Tirumala Hills
                    </span>
                    <h3 className="text-xl font-heading font-bold text-white">
                      Ananda Nilayam & Seven Hills Circuit
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT US */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 bg-gradient-to-br from-[#1e1035] to-[#2c134f] text-white p-8 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-4 h-4" />
                    Get In Touch
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl mb-4">
                    Plan Your Tirupati Yatra Today
                  </h3>
                  <p className="text-purple-200 text-xs sm:text-sm leading-relaxed mb-8">
                    Have questions about VIP darshan tickets, ghat road timings, or vehicle availability?
                    Our 24/7 pilgrimage helpdesk is here to assist.
                  </p>

                  <div className="space-y-5 text-xs sm:text-sm text-purple-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-white/10 rounded-xl text-orange-400 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Main Office & Booking Hub</p>
                        <p className="text-xs text-purple-200 mt-0.5">
                          14-2-198, Gandhi Road, Opp. Tirupati Main Railway Station, Tirupati, AP 517501
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-white/10 rounded-xl text-orange-400 shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Direct Hotline / WhatsApp</p>
                        <p className="text-xs text-purple-200 mt-0.5">+91 94401 98765 / +91 98480 12345</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-white/10 rounded-xl text-orange-400 shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Email Address</p>
                        <p className="text-xs text-purple-200 mt-0.5">contact@tirupatibalaji.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-purple-300">
                  Govt. Approved Commercial Fleet Operator • Andhra Pradesh Tourism Registered
                </div>
              </div>

              <div className="lg:col-span-7 p-8 lg:p-12">
                <h4 className="font-heading font-bold text-2xl text-slate-900 mb-2">
                  Send Us an Inquiry
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mb-6">
                  Fill out your details and we'll reply within 30 minutes with a customized quote.
                </p>

                {contactSuccess ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h5 className="font-heading font-bold text-lg text-emerald-900 mb-1">
                      Inquiry Submitted Successfully!
                    </h5>
                    <p className="text-xs text-emerald-700">
                      Our pilgrimage coordinator has received your request and will call you right away.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 94401 23456"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@domain.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Message / Travel Requirements
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Dates, number of travellers, vehicle preference, VIP darshan requirement..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {contactLoading ? 'Sending...' : 'Send Inquiry Now'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#120824] text-white pt-12 pb-8 border-t border-purple-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-purple-900/40">
            <div className="md:col-span-2 space-y-4">
              <img
                src="/logo.png"
                alt="Tirupati Balaji Tours & Travels"
                className="h-12 w-auto object-contain bg-white rounded-lg p-1.5 shadow-sm"
              />
              <p className="text-xs text-purple-300 max-w-sm leading-relaxed">
                Tirupati Balaji Tours & Travels is Tirupati's foremost fleet operator, specializing in
                VIP pilgrim services, temple circuits, and luxury outstation group tours.
              </p>
            </div>

            <div>
              <h5 className="font-heading font-bold text-sm text-orange-400 mb-3">Quick Links</h5>
              <ul className="text-xs space-y-2 text-purple-200">
                <li><a href="#packages" className="hover:text-white transition-colors">Tirupati Darshan Package</a></li>
                <li><a href="#packages" className="hover:text-white transition-colors">Srisailam Jyotirlinga Yatra</a></li>
                <li><a href="#packages" className="hover:text-white transition-colors">Local City Temple Circuit</a></li>
                <li><a href="#packages" className="hover:text-white transition-colors">Kanipakam & Golden Temple</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-heading font-bold text-sm text-orange-400 mb-3">Portals & Login</h5>
              <ul className="text-xs space-y-2 text-purple-200">
                <li><button onClick={() => onNavigate('/admin')} className="hover:text-orange-400 transition-colors">Admin Portal (/admin)</button></li>
                <li><button onClick={() => onNavigate('/manager')} className="hover:text-orange-400 transition-colors">Manager Portal (/manager)</button></li>
                <li><button onClick={() => onNavigate('/driver')} className="hover:text-orange-400 transition-colors">Driver Portal (/driver)</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-400">
            <p>© {new Date().getFullYear()} Tirupati Balaji Tours & Travels. All Rights Reserved.</p>
            <p className="mt-2 sm:mt-0">Tirupati Balaji Fleet & Trip Management System</p>
          </div>
        </div>
      </footer>

      {/* Package Booking Modal */}
      <PackageBookingModal
        pkg={selectedPkg}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
