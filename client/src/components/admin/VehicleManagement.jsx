import React, { useState } from 'react';
import {
  Car,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Users,
  Fuel,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const VehicleManagement = ({ vehicles = [], onRefresh, role = 'admin' }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    regNumber: '',
    vehicleType: 'Tempo Traveller Luxury AC (12 Seater)',
    model: 'Force Tempo Traveller 3350',
    capacity: 12,
    fuelType: 'Diesel',
    status: 'Active',
  });

  const vehicleTypePresets = [
    { type: 'Tempo Traveller Luxury AC (12 Seater)', capacity: 12 },
    { type: 'Tempo Traveller Luxury AC (14 Seater)', capacity: 14 },
    { type: 'Force Urbania Executive (10 Seater)', capacity: 10 },
    { type: 'Toyota Innova Crysta (7 Seater)', capacity: 7 },
    { type: 'Toyota Innova Hycross (7 Seater)', capacity: 7 },
    { type: 'Swift Dzire Luxury Sedan (4 Seater)', capacity: 4 },
    { type: 'Toyota Etios AC Sedan (4 Seater)', capacity: 4 },
    { type: 'Mini Bus AC Coach (22 Seater)', capacity: 22 },
    { type: 'Ashok Leyland Air Suspended Coach (32 Seater)', capacity: 32 },
    { type: 'Volvo Multi-Axle Luxury Coach (44 Seater)', capacity: 44 },
  ];

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setError('');
    setFormData({
      regNumber: '',
      vehicleType: vehicleTypePresets[0].type,
      model: 'Force Tempo Traveller 3350',
      capacity: vehicleTypePresets[0].capacity,
      fuelType: 'Diesel',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (veh) => {
    setEditingVehicle(veh);
    setError('');
    setFormData({
      regNumber: veh.regNumber,
      vehicleType: veh.vehicleType,
      model: veh.model || veh.vehicleType,
      capacity: veh.capacity || 4,
      fuelType: veh.fuelType || 'Diesel',
      status: veh.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const handleTypeSelect = (presetType) => {
    const found = vehicleTypePresets.find((p) => p.type === presetType);
    setFormData((prev) => ({
      ...prev,
      vehicleType: presetType,
      capacity: found ? found.capacity : prev.capacity,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.regNumber.trim()) {
      setError('Vehicle Registration Number is required (e.g. AP 39 AB 1234)');
      return;
    }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('tb_token');
    const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : '/api/vehicles';
    const method = editingVehicle ? 'PUT' : 'POST';

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
      if (!res.ok) throw new Error(data.error || 'Failed to save vehicle');

      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, regNumber) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${regNumber}?`)) return;
    const token = localStorage.getItem('tb_token');
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete vehicle');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      v.regNumber.toLowerCase().includes(q) ||
      v.vehicleType.toLowerCase().includes(q) ||
      (v.model && v.model.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <Car className="w-6 h-6 text-orange-500" />
            <span>Create Vehicle & Asset Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Register and manage tour vehicles, passenger capacities, and registration numbers for instant trip allocation
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['all', 'Active', 'Maintenance'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? `All Vehicles (${vehicles.length})` : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by reg number, type, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
          />
        </div>
      </div>

      {/* Vehicles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((veh) => (
          <div
            key={veh.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200 inline-block tracking-wider">
                    {veh.regNumber}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-slate-900 mt-2">
                    {veh.vehicleType}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{veh.model || veh.vehicleType}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    veh.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {veh.status || 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{veh.capacity || 4} Passenger Seats</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Fuel className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{veh.fuelType || 'Diesel'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-mono">{veh.id}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(veh)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Edit Vehicle"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                {role === 'admin' && (
                  <button
                    onClick={() => handleDelete(veh.id, veh.regNumber)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredVehicles.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <Car className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No vehicles matching your criteria</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register First Vehicle</span>
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT VEHICLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-[#1e1035] to-[#2b144d] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base sm:text-lg">
                    {editingVehicle ? `Edit Vehicle: ${editingVehicle.regNumber}` : 'Create New Fleet Vehicle'}
                  </h3>
                  <p className="text-[11px] text-purple-200">
                    Add vehicle details for allocation in trips
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Registration Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Registration Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AP 39 AB 1234"
                  value={formData.regNumber}
                  onChange={(e) => setFormData({ ...formData, regNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 tracking-wider text-sm focus:ring-2 focus:ring-orange-500 outline-hidden uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">Official RTO number plate registration</p>
              </div>

              {/* Vehicle Type Preset Quick Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Type Preset *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleTypeSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                >
                  {vehicleTypePresets.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Vehicle Type / Make Model */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Model & Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Force Motors Tempo Traveller 3350 Luxury"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              {/* Seating Capacity & Fuel Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seating Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Petrol / CNG">Petrol / CNG</option>
                    <option value="Electric (EV)">Electric (EV)</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                >
                  <option value="Active">Active (Ready for dispatch)</option>
                  <option value="Maintenance">Under Maintenance / Service</option>
                </select>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

