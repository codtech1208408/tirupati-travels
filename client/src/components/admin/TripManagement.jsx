import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  Car,
  MapPin,
  User,
  Users,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  DollarSign,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { SalaryClosingModal } from './SalaryClosingModal';

export const TripManagement = ({
  trips = [],
  packages = [],
  clients = [],
  drivers = [],
  vehicles = [],
  expenses = [],
  onRefresh,
  role = 'admin',
  initialOpenAdd = false,
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAdd);
  const [editingTrip, setEditingTrip] = useState(null);
  const [closingTrip, setClosingTrip] = useState(null);
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);

  // Adjustment Entry State
  const [adjModalTrip, setAdjModalTrip] = useState(null);
  const [adjForm, setAdjForm] = useState({ type: 'credit', amount: 1000, reason: '' });

  // Route Days State
  const [routeDays, setRouteDays] = useState([
    { day: 1, route: 'Tirupati Arrival, Hotel Check-in & Alipiri Darshan' },
    { day: 2, route: 'Tirumala VIP Balaji Darshan, Padmavathi Temple' },
  ]);

  // Trip Form State
  const [formData, setFormData] = useState({
    name: '',
    packageId: '',
    clientId: '',
    clientName: '',
    clientMobile: '',
    travellersCount: 4,
    pickupLocation: 'Tirupati Railway Station',
    dropLocation: 'Sightseeing / Destination',
    startDate: '',
    endDate: '',
    route: 'Day 1: Tirupati Arrival & Alipiri → Day 2: Tirumala VIP Darshan',
    routeDays: [
      { day: 1, route: 'Tirupati Arrival, Hotel Check-in & Alipiri Darshan' },
      { day: 2, route: 'Tirumala VIP Balaji Darshan, Padmavathi Temple' },
    ],
    stops: 'Alipiri, Srinivasa Mangapuram',
    vehicleType: 'Tempo Traveller Luxury AC (12 Seater)',
    vehicleRegNumber: 'AP 39 AB 1234',
    vehicleDetails: 'Tempo Traveller Luxury AC (12 Seater) (AP 39 AB 1234)',
    instructions: 'Pickup pilgrims on time. Assist with VIP entry coordination.',
    driverId: '',
    salary: 0,
    amount: 25000,
    notes: '',
  });

  const [dateClashError, setDateClashError] = useState('');

  // Route Day-by-Day Handlers
  const handleAddDay = () => {
    setRouteDays((prev) => {
      const nextDay = prev.length + 1;
      const updated = [...prev, { day: nextDay, route: '' }];
      syncRouteString(updated);
      return updated;
    });
  };

  const handleRemoveDay = (index) => {
    setRouteDays((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      const renumbered = filtered.map((d, idx) => ({ ...d, day: idx + 1 }));
      syncRouteString(renumbered);
      return renumbered;
    });
  };

  const handleDayRouteChange = (index, value) => {
    setRouteDays((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], route: value };
      syncRouteString(updated);
      return updated;
    });
  };

  const syncRouteString = (days) => {
    const combined = days
      .filter((d) => d.route.trim())
      .map((d) => `Day ${d.day}: ${d.route.trim()}`)
      .join(' → ');
    setFormData((prev) => ({
      ...prev,
      route: combined || prev.route,
      routeDays: days,
    }));
  };

  // Vehicle Selection Handlers
  const handleVehicleRegSelect = (reg) => {
    const found = vehicles.find((v) => v.regNumber === reg);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        vehicleRegNumber: found.regNumber,
        vehicleType: found.vehicleType,
        vehicleDetails: `${found.vehicleType} (${found.regNumber})`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        vehicleRegNumber: reg,
        vehicleDetails: prev.vehicleType ? `${prev.vehicleType} (${reg})` : reg,
      }));
    }
  };

  const handleVehicleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      vehicleType: type,
      vehicleDetails: prev.vehicleRegNumber ? `${type} (${prev.vehicleRegNumber})` : type,
    }));
  };

  // Auto-populate when selecting package
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

  // Helper: check if a driver is busy on given dates
  const isDriverBusy = (driverId, startDate, endDate, excludeTripId = null) => {
    if (!driverId || !startDate) return false;
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : start;

    return trips.some((t) => {
      if (t.id === excludeTripId) return false;
      if (t.driverId !== driverId) return false;
      if (t.status === 'Cancelled' || t.status === 'Closed') return false;
      const tStart = new Date(t.startDate).getTime();
      const tEnd = new Date(t.endDate || t.startDate).getTime();
      return start <= tEnd && end >= tStart;
    });
  };

  // Available drivers only: not deactivated, not on trip/unavailable, and no date clashes
  const availableDrivers = drivers.filter((drv) => {
    if (drv.status === 'deactivated') return false;
    if (editingTrip && drv.id === editingTrip.driverId) return true;
    if (drv.availability === 'On Trip' || drv.availability === 'Unavailable') return false;
    const busy = isDriverBusy(drv.id, formData.startDate, formData.startDate, editingTrip?.id);
    return !busy;
  });

  const handleOpenAdd = () => {
    setEditingTrip(null);
    setDateClashError('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 16);

    const initialDays = [
      { day: 1, route: 'Arrival at Tirupati Railway Station, Hotel Check-in & Alipiri Gate' },
      { day: 2, route: 'Tirumala Balaji VIP Sheegra Darshan, Padmavathi Ammavari Temple' },
    ];
    setRouteDays(initialDays);

    const defaultVeh = vehicles[0];
    const defaultReg = defaultVeh ? defaultVeh.regNumber : 'AP 39 AB 1234';
    const defaultType = defaultVeh ? defaultVeh.vehicleType : 'Tempo Traveller Luxury AC (12 Seater)';

    setFormData({
      name: packages[0]?.name || 'Tirupati Balaji Divine Darshan Package',
      packageId: packages[0]?.id || '',
      clientId: '',
      clientName: '',
      clientMobile: '',
      travellersCount: 4,
      pickupLocation: 'Tirupati Central Railway Station',
      dropLocation: 'Sightseeing / Destination',
      startDate: dateStr,
      endDate: dateStr,
      route: initialDays.map((d) => `Day ${d.day}: ${d.route}`).join(' → '),
      routeDays: initialDays,
      stops: 'Alipiri, Srinivasa Mangapuram, Kapila Theertham',
      vehicleType: defaultType,
      vehicleRegNumber: defaultReg,
      vehicleDetails: `${defaultType} (${defaultReg})`,
      instructions: 'Confirm pickup 1 hour prior. Ensure luggage space is clean.',
      driverId: '',
      salary: 0,
      amount: 25000,
      notes: 'VIP pilgrimage booking.',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (trip) => {
    setEditingTrip(trip);
    setDateClashError('');
    const startDateStr = trip.startDate ? trip.startDate.slice(0, 16) : '';

    let loadedDays = [];
    if (trip.routeDays && Array.isArray(trip.routeDays) && trip.routeDays.length > 0) {
      loadedDays = trip.routeDays;
    } else if (trip.route && trip.route.includes('Day ')) {
      const parts = trip.route.split(/Day \d+:\s*/).filter(Boolean);
      loadedDays = parts.map((part, idx) => ({
        day: idx + 1,
        route: part.replace(/→\s*$/, '').replace(/\|\s*$/, '').trim(),
      }));
    } else {
      loadedDays = [{ day: 1, route: trip.route || '' }];
    }
    setRouteDays(loadedDays.length > 0 ? loadedDays : [{ day: 1, route: trip.route || '' }]);

    const currentVehType = trip.vehicleType || 'Tempo Traveller Luxury AC (12 Seater)';
    const currentReg = trip.vehicleRegNumber || (trip.vehicleDetails ? trip.vehicleDetails.match(/\(([^)]+)\)/)?.[1] || '' : '');

    setFormData({
      name: trip.name,
      packageId: trip.packageId || '',
      clientId: trip.clientId || '',
      clientName: trip.clientName || trip.client?.name || '',
      clientMobile: trip.clientMobile || trip.client?.phone || '',
      travellersCount: trip.travellersCount || 4,
      pickupLocation: trip.pickupLocation,
      dropLocation: trip.dropLocation || 'Sightseeing / Destination',
      startDate: startDateStr,
      endDate: trip.endDate ? trip.endDate.slice(0, 16) : startDateStr,
      route: trip.route,
      routeDays: loadedDays,
      stops: trip.stops || '',
      vehicleType: currentVehType,
      vehicleRegNumber: currentReg,
      vehicleDetails: trip.vehicleDetails || `${currentVehType} (${currentReg})`,
      instructions: trip.instructions || '',
      driverId: trip.driverId || '',
      salary: trip.salary || 0,
      amount: trip.amount || 25000,
      notes: trip.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDateClashError('');

    const effectiveEndDate = formData.startDate;

    // Pre-check date clash on client
    if (formData.driverId && isDriverBusy(formData.driverId, formData.startDate, effectiveEndDate, editingTrip?.id)) {
      const busyDriver = drivers.find((d) => d.id === formData.driverId);
      setDateClashError(
        `Double-booking prevented: Driver ${busyDriver?.name || 'selected'} is already assigned to another active trip during these dates!`
      );
      return;
    }

    const token = localStorage.getItem('tb_token');
    const url = editingTrip ? `/api/trips/${editingTrip.id}` : '/api/trips';
    const method = editingTrip ? 'PUT' : 'POST';

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
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save trip');

      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      setDateClashError(err.message);
    }
  };

  const handleStatusChange = async (tripId, newStatus) => {
    const token = localStorage.getItem('tb_token');
    try {
      const res = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      onRefresh();
      if (selectedTripDetails && selectedTripDetails.id === tripId) {
        setSelectedTripDetails(data.trip);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecordAdjustment = async (e) => {
    e.preventDefault();
    if (!adjModalTrip) return;
    const token = localStorage.getItem('tb_token');
    try {
      const res = await fetch(`/api/trips/${adjModalTrip.id}/adjustment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adjForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record adjustment');
      setAdjModalTrip(null);
      setAdjForm({ type: 'credit', amount: 1000, reason: '' });
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const clientName = t.clientName || t.client?.name || '';
    const clientMobile = t.clientMobile || t.client?.phone || '';
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.driverName && t.driverName.toLowerCase().includes(search.toLowerCase())) ||
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      clientMobile.includes(search) ||
      t.route.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Fleet Trips & Driver Assignments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch vehicles, assign available drivers with clash prevention, and track lifecycle to completion
          </p>
        </div>
      </div>

      {/* Filter and Status Pills Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar">
          {['all', 'Upcoming', 'Ongoing', 'Completed', 'Closed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === st
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {st === 'all' ? 'All Trips' : st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, route, client, driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Trip & Client</th>
                <th className="px-4 py-3">Schedule / Date</th>
                <th className="px-4 py-3">Assigned Driver</th>
                <th className="px-4 py-3">Vehicle Details</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Salary & Settlement</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrips.map((trip) => {
                const isClosed = trip.status === 'Closed';
                const clientDisplayName = trip.clientName || trip.client?.name;
                const clientDisplayMobile = trip.clientMobile || trip.client?.phone;
                const tripPassengerExp = (expenses || [])
                  .filter((e) => e.tripId === trip.id && e.paidBy === 'passenger' && e.status !== 'Rejected')
                  .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                const tripDriverExp = (expenses || [])
                  .filter((e) => e.tripId === trip.id && (e.paidBy || 'driver') === 'driver' && e.status !== 'Rejected')
                  .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                return (
                  <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {trip.id}
                          </span>
                          {clientDisplayName && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-sm font-medium">
                              👤 {clientDisplayName}
                              {clientDisplayMobile ? ` (${clientDisplayMobile})` : ''}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-800 text-xs mt-0.5">{trip.name}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{trip.route}</p>
                        {tripPassengerExp > 0 && (
                          <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded-sm font-bold block mt-1">
                            👤 Paid by Passenger: ₹{tripPassengerExp.toLocaleString()} (Bal: ₹{Math.max(0, (Number(trip.amount) || 0) - tripPassengerExp).toLocaleString()})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Start</span>
                          <span className="text-slate-800 font-medium block">
                            {new Date(trip.startDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Trip End Time</span>
                          {trip.status === 'Completed' || trip.status === 'Closed' ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              {new Date(trip.endDate || trip.endedAt || trip.completedAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium text-[11px] block">
                              ⏳ Recorded upon completion
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {trip.driverName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">
                            {trip.driverName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{trip.driverName}</p>
                            <span className="text-[10px] text-emerald-600 font-medium">Assigned</span>
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="text-slate-700 max-w-xs truncate">{trip.vehicleDetails}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${trip.status === 'Ongoing'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : trip.status === 'Completed'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200 shadow-xs'
                            : trip.status === 'Closed'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : trip.status === 'Cancelled'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${trip.status === 'Ongoing'
                            ? 'bg-orange-600 animate-pulse'
                            : trip.status === 'Completed'
                              ? 'bg-blue-600'
                              : trip.status === 'Closed'
                                ? 'bg-purple-700'
                                : trip.status === 'Cancelled'
                                  ? 'bg-slate-400'
                                  : 'bg-emerald-600'
                            }`}
                        ></span>
                        {trip.status}
                      </span>
                      {trip.status === 'Completed' && trip.endedAt && (
                        <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                          ✓ Driver Ended
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {trip.status === 'Completed' || trip.status === 'Closed' ? (
                        <div>
                          {Number(trip.salary) > 0 ? (
                            <div>
                              <span className="font-heading font-bold text-slate-900 text-xs block">
                                ₹{(Number(trip.salary) + tripDriverExp).toLocaleString()}
                              </span>
                              <div className="text-[10px] text-slate-500">
                                <span>Sal: ₹{(Number(trip.salary) || 0).toLocaleString()}</span>
                                {tripDriverExp > 0 && (
                                  <span className="text-emerald-700 font-bold block">
                                    +₹{tripDriverExp.toLocaleString()} (Driver Exp)
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase block mt-0.5 ${trip.salaryStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                                  }`}
                              >
                                {trip.salaryStatus || 'Pending'}
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setClosingTrip(trip)}
                              className="px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-[11px] flex items-center gap-1 border border-orange-300 shadow-xs cursor-pointer animate-pulse"
                              title="Trip completed by driver! Click to add salary"
                            >
                              <Plus className="w-3.5 h-3.5 text-orange-600" />
                              <span>+ Add Salary</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic block">
                          ⏳ Assigned upon completion
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Option to Add Salary / Close Project for Completed Trips */}
                        {trip.status === 'Completed' && (
                          <button
                            onClick={() => setClosingTrip(trip)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer animate-pulse"
                            title="Trip submitted as completed! Add driver salary and settle project"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{Number(trip.salary) > 0 ? 'Edit Salary / Settle' : '+ Add Salary'}</span>
                          </button>
                        )}

                        {/* Adjustment Button for Closed Trips */}
                        {isClosed && role === 'admin' && (
                          <button
                            onClick={() => setAdjModalTrip(trip)}
                            className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-semibold text-[11px] flex items-center gap-1"
                            title="Record Adjustment"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Adjust</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedTripDetails(trip)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="View Trip Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        {!isClosed && role === 'admin' && (
                          <button
                            onClick={() => handleOpenEdit(trip)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Edit Trip / Reassign Driver"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-400">
                    No trips found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT TRIP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-[#1e1035] to-[#2b144d] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-heading font-bold text-base sm:text-lg">
                  {editingTrip ? `Edit Trip: ${editingTrip.id}` : 'Create New Fleet Trip'}
                </h3>
                <p className="text-[11px] sm:text-xs text-purple-200">
                  Assign verified drivers with real-time schedule conflict prevention
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer text-sm shrink-0"
                title="Close"
              >
                ✕
              </button>
            </div>

            <form id="trip-add-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {dateClashError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span className="font-medium">{dateClashError}</span>
                </div>
              )}

              {/* Client Name (Manual) & Client Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Package & Trip Name Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Tour Package (Optional)
                  </label>
                  <select
                    value={formData.packageId}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Travel Route & Day-by-Day Route Planner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Travel Route (Day-by-Day Itinerary) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    title="Add Day"
                    aria-label="Add Day"
                    className="w-7 h-7 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {routeDays.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="px-2.5 py-2 rounded-lg bg-[#1e1035] text-white font-bold text-xs shrink-0 whitespace-nowrap">
                        Day {d.day}
                      </span>
                      <input
                        type="text"
                        required
                        value={d.route}
                        onChange={(e) => handleDayRouteChange(idx, e.target.value)}
                        placeholder={`e.g. Day ${d.day} Route & Temple Destinations`}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                      />
                      {routeDays.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDay(idx)}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                          title="Remove Day"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Trip End Date & Time will be automatically recorded directly when the driver ends the trip.
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
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

              {/* Vehicle Type & Vehicle Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => handleVehicleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-mono font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-hidden"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-orange-500 outline-hidden"
                    />
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Choose from registered fleet or create in Create Vehicle tab
                  </p>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  placeholder="e.g. Tirupati Central Railway Station"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              {/* Instructions & Stops */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driver Instructions & Stops
                </label>
                <textarea
                  rows="2"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Special instructions or pilgrimage stops..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                ></textarea>
              </div>

            </form>

            {/* Pinned Modal Footer: Always visible and accessible */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5 shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="trip-add-form"
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
              >
                Save Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRIP DETAILS & STATUS CONTROLS MODAL */}
      {selectedTripDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    {selectedTripDetails.name}
                  </h3>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                    {selectedTripDetails.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{selectedTripDetails.route}</p>
              </div>
              <button
                onClick={() => setSelectedTripDetails(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                <p>
                  <strong>Trip Start:</strong> {new Date(selectedTripDetails.startDate).toLocaleString()}
                </p>
                <p>
                  <strong>Trip End Date & Time:</strong>{' '}
                  {selectedTripDetails.status === 'Completed' || selectedTripDetails.status === 'Closed' ? (
                    <span className="text-emerald-700 font-bold">
                      {new Date(selectedTripDetails.endDate || selectedTripDetails.endedAt || selectedTripDetails.completedAt).toLocaleString()} (Completed)
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">
                      Pending (Will be automatically recorded when driver ends trip)
                    </span>
                  )}
                </p>
                {(selectedTripDetails.clientName || selectedTripDetails.client?.name) && (
                  <p>
                    <strong>Client:</strong> {selectedTripDetails.clientName || selectedTripDetails.client?.name}
                    {(selectedTripDetails.clientMobile || selectedTripDetails.client?.phone) ? ` (${selectedTripDetails.clientMobile || selectedTripDetails.client?.phone})` : ''}
                  </p>
                )}
                <div>
                  <strong>Travel Route:</strong>
                  {selectedTripDetails.routeDays && selectedTripDetails.routeDays.length > 0 ? (
                    <div className="mt-1 space-y-1 pl-1">
                      {selectedTripDetails.routeDays.map((d, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-900 font-bold text-[10px]">
                            Day {d.day}
                          </span>
                          <span className="text-slate-800">{d.route}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="ml-1 text-slate-800">{selectedTripDetails.route}</span>
                  )}
                </div>
                <p>
                  <strong>Pickup:</strong> {selectedTripDetails.pickupLocation}
                </p>
                <p>
                  <strong>Vehicle Assigned:</strong> {selectedTripDetails.vehicleDetails}
                </p>
                <p>
                  <strong>Driver:</strong> {selectedTripDetails.driverName || 'Unassigned'}
                </p>
                <p>
                  <strong>Instructions:</strong> {selectedTripDetails.instructions || 'Standard'}
                </p>
              </div>

              {/* Trip Package Billing & Expense Attribution */}
              {(() => {
                const passExp = (expenses || [])
                  .filter((e) => e.tripId === selectedTripDetails.id && e.paidBy === 'passenger' && e.status !== 'Rejected')
                  .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                const drvExp = (expenses || [])
                  .filter((e) => e.tripId === selectedTripDetails.id && (e.paidBy || 'driver') === 'driver' && e.status !== 'Rejected')
                  .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                const pkgAmount = Number(selectedTripDetails.amount) || 0;
                const netClientBalance = Math.max(0, pkgAmount - passExp);

                return (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-slate-800 block">Trip Financial Breakdown</span>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Client Tour Package Bill:</span>
                      <span className="font-bold">₹{pkgAmount.toLocaleString()}</span>
                    </div>

                    {passExp > 0 && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg space-y-0.5">
                        <div className="flex items-center justify-between text-blue-900 font-bold">
                          <span>👤 Paid on Road by Passenger:</span>
                          <span>-₹{passExp.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-blue-700 text-[11px]">
                          <span>Remaining Balance to Collect from Client:</span>
                          <span className="font-bold">₹{netClientBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {drvExp > 0 && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-900 font-semibold">
                        <span>🚗 Driver Out-of-Pocket Expenses:</span>
                        <span className="font-bold">+₹{drvExp.toLocaleString()} (added to salary)</span>
                      </div>
                    )}

                    {Number(selectedTripDetails.salary) > 0 && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-800">
                        <span>Driver Total Remuneration:</span>
                        <span className="text-orange-600 font-heading">
                          ₹{(Number(selectedTripDetails.salary) + drvExp).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* If trip is completed, provide button to add salary */}
              {selectedTripDetails.status === 'Completed' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-blue-900 block">Trip Completed by Pilot</span>
                    <span className="text-[11px] text-blue-700">
                      Ended: {selectedTripDetails.endedAt ? new Date(selectedTripDetails.endedAt).toLocaleString() : 'Recently'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const tripToClose = selectedTripDetails;
                      setSelectedTripDetails(null);
                      setClosingTrip(tripToClose);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer animate-pulse"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{Number(selectedTripDetails.salary) > 0 ? 'Edit Salary / Settle' : '+ Add Driver Salary'}</span>
                  </button>
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-2">
                <p className="font-bold text-slate-700 mb-2">Update Trip Status:</p>
                <div className="flex flex-wrap gap-2">
                  {['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      disabled={selectedTripDetails.status === 'Closed'}
                      onClick={() => handleStatusChange(selectedTripDetails.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${selectedTripDetails.status === st
                        ? 'bg-purple-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Closed status notice */}
              {selectedTripDetails.status === 'Closed' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs">
                  <strong>Trip Closed & Locked:</strong> Settled on{' '}
                  {new Date(selectedTripDetails.closedAt).toLocaleDateString()}. Driver wallet was
                  credited.
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedTripDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SALARY CLOSING MODAL */}
      <SalaryClosingModal
        trip={closingTrip}
        isOpen={!!closingTrip}
        onClose={() => setClosingTrip(null)}
        onSuccess={onRefresh}
      />

      {/* ADJUSTMENT ENTRY MODAL */}
      {adjModalTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-heading font-bold text-base">Record Adjustment Entry</h3>
                <p className="text-xs text-purple-200">Closed Trip: {adjModalTrip.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdjModalTrip(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer text-sm shrink-0"
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordAdjustment} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Closed trips cannot be edited directly. Use this audit adjustment entry to update the
                driver's wallet balance.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="adjType"
                      checked={adjForm.type === 'credit'}
                      onChange={() => setAdjForm({ ...adjForm, type: 'credit' })}
                    />
                    <span>Credit (+)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="adjType"
                      checked={adjForm.type === 'debit'}
                      onChange={() => setAdjForm({ ...adjForm, type: 'debit' })}
                    />
                    <span>Debit (-)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjForm.amount}
                  onChange={(e) => setAdjForm({ ...adjForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Adjustment *
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="Extra ghat road toll reimbursed, post-trip incentive bonus..."
                  value={adjForm.reason}
                  onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjModalTrip(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-900 text-white font-bold rounded-lg"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Mini eye icon component
function EyeIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

