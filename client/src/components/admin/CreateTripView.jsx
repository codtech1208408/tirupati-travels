import React, { useState } from 'react';
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Car,
  Clock,
  RotateCcw,
  Sparkles,
  MapPin,
  User,
  Phone,
  FileText,
} from 'lucide-react';

export const CreateTripView = ({
  packages = [],
  drivers = [],
  vehicles = [],
  trips = [],
  onRefresh,
  onNavigate,
  role = 'admin',
}) => {
  const defaultVeh = vehicles[0] || {};
  const defaultReg = defaultVeh.regNumber || 'AP 39 AB 1234';
  const defaultType = defaultVeh.vehicleType || 'Tempo Traveller Luxury AC (12 Seater)';

  // Initial Route Days State
  const initialDays = [
    { day: 1, route: 'Tirupati Arrival, Hotel Check-in & Alipiri Darshan' },
    { day: 2, route: 'Tirumala VIP Balaji Darshan, Padmavathi Temple' },
  ];

  const getInitialFormData = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    now.setMinutes(0);
    const startStr = now.toISOString().slice(0, 16);

    return {
      name: 'Tirupati Darshan Package',
      packageId: '',
      clientName: '',
      clientMobile: '',
      travellersCount: 4,
      pickupLocation: 'Tirupati Central Railway Station',
      dropLocation: 'Sightseeing / Destination',
      startDate: startStr,
      endDate: startStr,
      route: 'Day 1: Tirupati Arrival & Alipiri → Day 2: Tirumala VIP Darshan',
      routeDays: initialDays,
      stops: 'Alipiri, Srinivasa Mangapuram',
      vehicleType: defaultType,
      vehicleRegNumber: defaultReg,
      vehicleDetails: `${defaultType} (${defaultReg})`,
      instructions: 'Confirm pickup 1 hour prior. Ensure luggage space is clean and vehicle sanitized.',
      driverId: '',
      salary: 0,
      amount: 25000,
      notes: 'Pilgrimage booking.',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [routeDays, setRouteDays] = useState(initialDays);
  const [dateClashError, setDateClashError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper: Check if a driver is busy on given dates
  const isDriverBusy = (driverId, startDate, endDate) => {
    if (!driverId || !startDate) return false;
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : start;

    return trips.some((t) => {
      if (t.driverId !== driverId) return false;
      if (t.status === 'Cancelled' || t.status === 'Closed') return false;
      const tStart = new Date(t.startDate).getTime();
      const tEnd = new Date(t.endDate || t.startDate).getTime();
      return start <= tEnd && end >= tStart;
    });
  };

  // Available drivers only
  const availableDrivers = drivers.filter((drv) => {
    if (drv.status === 'deactivated') return false;
    if (drv.availability === 'On Trip' || drv.availability === 'Unavailable') return false;
    const busy = isDriverBusy(drv.id, formData.startDate, formData.startDate);
    return !busy;
  });

  const handlePackageChange = (pkgId) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      const pkgDays = pkg.route
        ? [{ day: 1, route: pkg.route }]
        : [{ day: 1, route: 'Tirupati Circuit & Tirumala Balaji' }];
      setRouteDays(pkgDays);
      setFormData((prev) => ({
        ...prev,
        packageId: pkg.id,
        name: pkg.name,
        route: pkg.route || prev.route,
        routeDays: pkgDays,
        vehicleType: pkg.vehicleType || prev.vehicleType,
        vehicleDetails: prev.vehicleRegNumber
          ? `${pkg.vehicleType || prev.vehicleType} (${prev.vehicleRegNumber})`
          : pkg.vehicleType,
      }));
    } else {
      setFormData((prev) => ({ ...prev, packageId: '' }));
    }
  };

  const handleAddDay = () => {
    const nextDayNum = routeDays.length + 1;
    setRouteDays([...routeDays, { day: nextDayNum, route: '' }]);
  };

  const handleRemoveDay = (indexToRemove) => {
    if (routeDays.length <= 1) return;
    const updated = routeDays
      .filter((_, idx) => idx !== indexToRemove)
      .map((item, idx) => ({ ...item, day: idx + 1 }));
    setRouteDays(updated);
  };

  const handleDayRouteChange = (index, value) => {
    const updated = [...routeDays];
    updated[index].route = value;
    setRouteDays(updated);
  };

  const handleVehicleTypeChange = (type) => {
    setFormData((prev) => {
      const matchVeh = vehicles.find((v) => v.vehicleType === type);
      const reg = matchVeh ? matchVeh.regNumber : prev.vehicleRegNumber;
      return {
        ...prev,
        vehicleType: type,
        vehicleRegNumber: reg,
        vehicleDetails: reg ? `${type} (${reg})` : type,
      };
    });
  };

  const handleVehicleRegSelect = (reg) => {
    const found = vehicles.find((v) => v.regNumber === reg);
    setFormData((prev) => ({
      ...prev,
      vehicleRegNumber: reg,
      vehicleType: found?.vehicleType || prev.vehicleType,
      vehicleDetails: found ? `${found.vehicleType} (${reg})` : `${prev.vehicleType} (${reg})`,
    }));
  };

  const handleReset = () => {
    setFormData(getInitialFormData());
    setRouteDays(initialDays);
    setDateClashError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDateClashError('');
    setSuccessMessage('');

    if (!formData.clientName.trim()) {
      setDateClashError('Please enter the client / traveller name.');
      return;
    }

    if (!formData.clientMobile.trim()) {
      setDateClashError('Please enter the client mobile number.');
      return;
    }

    const effectiveEndDate = formData.startDate;

    // Check conflict
    if (formData.driverId && isDriverBusy(formData.driverId, formData.startDate, effectiveEndDate)) {
      const busyDriver = drivers.find((d) => d.id === formData.driverId);
      setDateClashError(
        `Double-booking prevented: Driver ${busyDriver?.name || 'selected'} is already assigned to another active trip during these dates!`
      );
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('tb_token');

    try {
      const combinedRoute = routeDays
        .filter((d) => d.route.trim())
        .map((d) => `Day ${d.day}: ${d.route.trim()}`)
        .join(' → ') || formData.route;

      const formattedVeh = formData.vehicleRegNumber
        ? `${formData.vehicleType || 'Tempo Traveller'} (${formData.vehicleRegNumber})`
        : formData.vehicleDetails;

      const payload = {
        ...formData,
        endDate: effectiveEndDate,
        route: combinedRoute,
        routeDays: routeDays,
        vehicleDetails: formattedVeh,
        clientName: formData.clientName.trim(),
        clientMobile: formData.clientMobile.trim(),
      };

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save trip');

      setSuccessMessage('✓ Trip created successfully!');
      if (onRefresh) await onRefresh();

      // Automatically transition to Trips & Dispatch tab so user sees their newly created trip
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('trips');
        }
      }, 700);
    } catch (err) {
      setDateClashError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Trip Creation Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1e1035] via-[#2d144d] to-[#3f196a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-white">
                Create New Fleet Trip
              </h2>
              <p className="text-xs text-purple-200">
                Assign verified drivers with real-time schedule conflict prevention
              </p>
            </div>
          </div>
        </div>

        {/* Notifications / Alerts */}
        {dateClashError && (
          <div className="m-5 sm:m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span className="font-medium">{dateClashError}</span>
          </div>
        )}

        {successMessage && (
          <div className="m-5 sm:m-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
          {/* Section 1: Client Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-500" />
              <span>Client / Traveller Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Enter client / traveller name"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.clientMobile}
                  onChange={(e) => setFormData({ ...formData, clientMobile: e.target.value })}
                  placeholder="e.g. +91 98480 12345"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Trip Route & Packages */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Tour Package & Trip Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Tour Package (Optional)
                </label>
                <select
                  value={formData.packageId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
                >
                  <option value="">-- Custom Route --</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trip Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tirupati Darshan Package"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>
            </div>

            {/* Travel Route & Day-by-Day Route Planner */}
            <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    Travel Route (Day-by-Day Itinerary) *
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Add destinations and sightseeing stops for each day of travel
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Day</span>
                </button>
              </div>

              <div className="space-y-2.5 pt-1">
                {routeDays.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-lg bg-[#1e1035] text-white font-bold text-xs shrink-0 whitespace-nowrap">
                      Day {d.day}
                    </span>
                    <input
                      type="text"
                      required
                      value={d.route}
                      onChange={(e) => handleDayRouteChange(idx, e.target.value)}
                      placeholder={`e.g. Day ${d.day} Route & Temple Destinations`}
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
                    />
                    {routeDays.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(idx)}
                        className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                        title="Remove Day"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Schedule & Driver Allocation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>Schedule & Pilot Assignment</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trip Start Date & Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trip Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ⏱️ Trip End Date & Time will be directly recorded when the driver ends the trip.
                </p>
              </div>

              {/* Driver Assignment: Available Drivers Only */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Driver ({availableDrivers.length} Available)
                </label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
                >
                  <option value="">-- No Driver (Assign Later) --</option>
                  {availableDrivers.map((drv) => (
                    <option key={drv.id} value={drv.id}>
                      {drv.name} ({drv.mobile || 'Pilot'}) - Available
                    </option>
                  ))}
                </select>
                {availableDrivers.length === 0 ? (
                  <p className="text-[11px] text-amber-600 mt-1">
                    ⚠️ No drivers are currently available for this date/time. You can leave unassigned and allocate later.
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-600 mt-1">
                    ✓ Showing only available drivers with no conflicting trip schedule.
                  </p>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Vehicle & Pickup Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-orange-500" />
              <span>Vehicle Specifications & Locations</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
                >
                  <option value="Tempo Traveller Luxury AC (12 Seater)">Tempo Traveller Luxury AC (12 Seater)</option>
                  <option value="Tempo Traveller Luxury AC (14 Seater)">Tempo Traveller Luxury AC (14 Seater)</option>
                  <option value="Toyota Innova Crysta (7 Seater)">Toyota Innova Crysta (7 Seater)</option>
                  <option value="Toyota Innova Hycross (7 Seater)">Toyota Innova Hycross (7 Seater)</option>
                  <option value="Swift Dzire Luxury Sedan (4 Seater)">Swift Dzire Luxury Sedan (4 Seater)</option>
                  <option value="Force Urbania Executive (10 Seater)">Force Urbania Executive (10 Seater)</option>
                  <option value="Mini Bus AC Coach (22 Seater)">Mini Bus AC Coach (22 Seater)</option>
                  <option value="Ashok Leyland Air Suspended Coach (32 Seater)">Ashok Leyland Coach (32 Seater)</option>
                  {vehicles.filter(v => ![
                    'Tempo Traveller Luxury AC (12 Seater)',
                    'Tempo Traveller Luxury AC (14 Seater)',
                    'Toyota Innova Crysta (7 Seater)',
                    'Toyota Innova Hycross (7 Seater)',
                    'Swift Dzire Luxury Sedan (4 Seater)',
                    'Force Urbania Executive (10 Seater)',
                    'Mini Bus AC Coach (22 Seater)',
                    'Ashok Leyland Air Suspended Coach (32 Seater)'
                  ].includes(v.vehicleType)).map(v => (
                    <option key={v.id} value={v.vehicleType}>{v.vehicleType}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Registration Number *
                </label>
                {vehicles.length > 0 ? (
                  <select
                    value={formData.vehicleRegNumber}
                    onChange={(e) => handleVehicleRegSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-mono font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-hidden"
                  >
                    <option value="">-- Choose Registered Vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.regNumber}>
                        {v.regNumber} ({v.vehicleType || v.model})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.vehicleRegNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleRegNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. AP 39 AB 1234"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Choose from registered fleet or register in <strong>Create Vehicle</strong> tab
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  placeholder="e.g. Tirupati Central Railway Station"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driver Instructions & Stops
                </label>
                <input
                  type="text"
                  value={formData.stops}
                  onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                  placeholder="e.g. Alipiri, Padmavathi Temple, Hotel Bliss"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Trip'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
