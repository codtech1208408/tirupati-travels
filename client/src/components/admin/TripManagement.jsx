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

export const TripManagement = ({ trips = [], packages = [], clients = [], drivers = [], onRefresh, role = 'admin' }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [closingTrip, setClosingTrip] = useState(null);
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);

  // Adjustment Entry State
  const [adjModalTrip, setAdjModalTrip] = useState(null);
  const [adjForm, setAdjForm] = useState({ type: 'credit', amount: 1000, reason: '' });

  // Trip Form State
  const [formData, setFormData] = useState({
    name: '',
    packageId: '',
    clientId: '',
    travellersCount: 4,
    pickupLocation: 'Tirupati Railway Station',
    dropLocation: 'Alipiri Gate / Tirumala',
    startDate: '',
    endDate: '',
    route: 'Tirupati Circuit',
    stops: 'Alipiri, Srinivasa Mangapuram',
    vehicleDetails: 'Tempo Traveller (AP 39 AB 1234)',
    instructions: 'Pickup pilgrims on time. Assist with VIP entry coordination.',
    driverId: '',
    salary: 16000,
    notes: '',
  });

  const [dateClashError, setDateClashError] = useState('');

  // Auto-populate when selecting package
  const handlePackageChange = (pkgId) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setFormData((prev) => ({
        ...prev,
        packageId: pkg.id,
        name: pkg.name,
        route: pkg.route,
        vehicleDetails: pkg.vehicleType,
      }));
    } else {
      setFormData((prev) => ({ ...prev, packageId: '' }));
    }
  };

  // Helper: check if a driver is busy on given dates
  const isDriverBusy = (driverId, startDate, endDate, excludeTripId = null) => {
    if (!driverId || !startDate || !endDate) return false;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return trips.some((t) => {
      if (t.id === excludeTripId) return false;
      if (t.driverId !== driverId) return false;
      if (t.status === 'Cancelled' || t.status === 'Closed') return false;
      const tStart = new Date(t.startDate).getTime();
      const tEnd = new Date(t.endDate).getTime();
      return start <= tEnd && end >= tStart;
    });
  };

  const handleOpenAdd = () => {
    setEditingTrip(null);
    setDateClashError('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    setFormData({
      name: packages[0]?.name || 'Tirupati Darshan Package',
      packageId: packages[0]?.id || '',
      clientId: clients[0]?.id || '',
      travellersCount: 4,
      pickupLocation: 'Tirupati Central Railway Station',
      dropLocation: 'Alipiri Gate / Hotel Bliss',
      startDate: tomorrow.toISOString().slice(0, 16),
      endDate: dayAfter.toISOString().slice(0, 16),
      route: packages[0]?.route || 'Hyderabad → Tirupati → Tirumala',
      stops: 'Alipiri, Srinivasa Mangapuram, Kapila Theertham',
      vehicleDetails: 'Tempo Traveller Luxury AC (AP 39 AB 1234)',
      instructions: 'Confirm pickup 1 hour prior. Ensure luggage space is clean.',
      driverId: drivers[0]?.id || '',
      salary: 16000,
      notes: 'VIP pilgrimage booking.',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (trip) => {
    setEditingTrip(trip);
    setDateClashError('');
    setFormData({
      name: trip.name,
      packageId: trip.packageId || '',
      clientId: trip.clientId || '',
      travellersCount: trip.travellersCount || 4,
      pickupLocation: trip.pickupLocation,
      dropLocation: trip.dropLocation,
      startDate: trip.startDate ? trip.startDate.slice(0, 16) : '',
      endDate: trip.endDate ? trip.endDate.slice(0, 16) : '',
      route: trip.route,
      stops: trip.stops || '',
      vehicleDetails: trip.vehicleDetails || '',
      instructions: trip.instructions || '',
      driverId: trip.driverId || '',
      salary: trip.salary || 0,
      notes: trip.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDateClashError('');

    // Pre-check date clash on client
    if (formData.driverId && isDriverBusy(formData.driverId, formData.startDate, formData.endDate, editingTrip?.id)) {
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
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.driverName && t.driverName.toLowerCase().includes(search.toLowerCase())) ||
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

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Trip</span>
        </button>
      </div>

      {/* Filter and Status Pills Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar">
          {['all', 'Upcoming', 'Ongoing', 'Completed', 'Closed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
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
            placeholder="Search by ID, route, driver..."
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
                <th className="px-5 py-3">Trip & Package</th>
                <th className="px-4 py-3">Schedule / Dates</th>
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
                return (
                  <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {trip.id}
                          </span>
                          {role === 'admin' && trip.client && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                              {trip.client.name}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-800 text-xs mt-0.5">{trip.name}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{trip.route}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <span className="text-slate-800 font-medium block">
                          {new Date(trip.startDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          to{' '}
                          {new Date(trip.endDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
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
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          trip.status === 'Ongoing'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : trip.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : trip.status === 'Closed'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : trip.status === 'Cancelled'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            trip.status === 'Ongoing'
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
                    </td>

                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-heading font-bold text-slate-900 text-xs block">
                          ₹{(trip.salary || 0).toLocaleString()}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            trip.salaryStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {trip.salaryStatus || 'Pending'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Close Deal Button for Completed Trips */}
                        {trip.status === 'Completed' && (
                          <button
                            onClick={() => setClosingTrip(trip)}
                            className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
                            title="Close Deal & Credit Wallet"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Close Deal</span>
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

                        {!isClosed && (
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
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT TRIP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-[#1e1035] to-[#2b144d] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg">
                  {editingTrip ? `Edit Trip: ${editingTrip.id}` : 'Create New Fleet Trip'}
                </h3>
                <p className="text-xs text-purple-200">
                  Assign verified drivers with real-time schedule conflict prevention
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {dateClashError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span className="font-medium">{dateClashError}</span>
                </div>
              )}

              {/* Package & Client Selection */}
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
                    Client / Traveller Group *
                  </label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.travellersCount} travellers)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trip Name & Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trip Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Travel Route *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Start & End Dates with Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trip Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trip End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Driver Assignment with Live Conflict Detection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Driver (Live Schedule & Conflict Check)
                </label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-hidden"
                >
                  <option value="">-- No Driver (Assign Later) --</option>
                  {drivers.map((drv) => {
                    const busy = isDriverBusy(
                      drv.id,
                      formData.startDate,
                      formData.endDate,
                      editingTrip?.id
                    );
                    return (
                      <option key={drv.id} value={drv.id} disabled={busy}>
                        {drv.name} - {busy ? '⚠️ BUSY (Dates Conflict)' : '✓ AVAILABLE'}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Double booking prevention: drivers with overlapping trip dates are automatically disabled.
                </p>
              </div>

              {/* Pickup & Drop Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Drop Location
                  </label>
                  <input
                    type="text"
                    value={formData.dropLocation}
                    onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Vehicle & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Details & Reg Number
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleDetails}
                    onChange={(e) => setFormData({ ...formData, vehicleDetails: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Driver Trip Salary (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driver Instructions & Stops
                </label>
                <textarea
                  rows="2"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs shadow-md"
                >
                  Save Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRIP DETAILS & STATUS CONTROLS MODAL */}
      {selectedTripDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
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
                  <strong>Dates:</strong> {new Date(selectedTripDetails.startDate).toLocaleString()} →{' '}
                  {new Date(selectedTripDetails.endDate).toLocaleString()}
                </p>
                <p>
                  <strong>Pickup:</strong> {selectedTripDetails.pickupLocation}
                </p>
                <p>
                  <strong>Drop:</strong> {selectedTripDetails.dropLocation}
                </p>
                <p>
                  <strong>Vehicle:</strong> {selectedTripDetails.vehicleDetails}
                </p>
                <p>
                  <strong>Driver:</strong> {selectedTripDetails.driverName || 'Unassigned'}
                </p>
                <p>
                  <strong>Instructions:</strong> {selectedTripDetails.instructions || 'Standard'}
                </p>
              </div>

              {/* Status Actions */}
              <div className="pt-2">
                <p className="font-bold text-slate-700 mb-2">Update Trip Status:</p>
                <div className="flex flex-wrap gap-2">
                  {['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      disabled={selectedTripDetails.status === 'Closed'}
                      onClick={() => handleStatusChange(selectedTripDetails.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                        selectedTripDetails.status === st
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base">Record Adjustment Entry</h3>
                <p className="text-xs text-purple-200">Closed Trip: {adjModalTrip.id}</p>
              </div>
              <button
                onClick={() => setAdjModalTrip(null)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordAdjustment} className="p-6 space-y-4 text-xs">
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

