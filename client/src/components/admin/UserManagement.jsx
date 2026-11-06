import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Key,
  ShieldAlert,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { ManagerPermissionsModal } from './ManagerPermissionsModal';

export const UserManagement = ({ users, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('managers'); // 'managers' | 'drivers'
  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [permissionsModalUser, setPermissionsModalUser] = useState(null);
  const [selectedDriverDoc, setSelectedDriverDoc] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    photo: '',
    role: 'manager',
    licenseNumber: '',
    licenseExpiry: '',
    address: '',
    emergencyContact: '',
  });

  const managers = users.filter((u) => u.role === 'manager');
  const drivers = users.filter((u) => u.role === 'driver');

  const handleOpenAdd = (role) => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      photo:
        role === 'driver'
          ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      role,
      licenseNumber: 'AP-03-2024-009812',
      licenseExpiry: '2034-12-31',
      address: 'Tirupati, Andhra Pradesh',
      emergencyContact: '+91 94401 00000',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      photo: user.photo || '',
      role: user.role,
      licenseNumber: user.licenseNumber || '',
      licenseExpiry: user.licenseExpiry || '',
      address: user.address || '',
      emergencyContact: user.emergencyContact || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('tb_token');
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';

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
      if (!res.ok) throw new Error(data.error || 'Failed to save user');

      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const token = localStorage.getItem('tb_token');
    const newStatus = user.status === 'active' ? 'deactivated' : 'active';
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.role} "${user.name}"?`)) return;
    const token = localStorage.getItem('tb_token');
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSavePermissions = async (managerId, permissions) => {
    const token = localStorage.getItem('tb_token');
    await fetch(`/api/users/${managerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ permissions }),
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Tabs and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('managers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'managers'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-purple-600" />
            <span>Managers ({managers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'drivers'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <span>Drivers ({drivers.length})</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenAdd(activeTab === 'managers' ? 'manager' : 'driver')}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab === 'managers' ? 'Manager' : 'Driver'}</span>
        </button>
      </div>

      {/* MANAGERS TABLE */}
      {activeTab === 'managers' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-purple-950">
                Operations Managers
              </h3>
              <p className="text-xs text-purple-700">
                Managers handle trip scheduling and review driver expenses based on assigned permissions
              </p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
              RBAC Protected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3">Manager</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Assigned Permissions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managers.map((mgr) => (
                  <tr key={mgr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={mgr.photo}
                          alt={mgr.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{mgr.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{mgr.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <p className="text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {mgr.email}
                        </p>
                        <p className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {mgr.mobile || 'No mobile'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(mgr.permissions || []).map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium"
                          >
                            {perm.replace('_', ' ')}
                          </span>
                        ))}
                        {(!mgr.permissions || mgr.permissions.length === 0) && (
                          <span className="text-[11px] text-slate-400 italic">No permissions</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(mgr)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                          mgr.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {mgr.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Deactivated
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPermissionsModalUser(mgr)}
                          className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors"
                          title="Manage Permissions"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(mgr)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit Manager"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(mgr)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Manager"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRIVERS TABLE & DOCUMENT VIEWER */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-orange-50/50 border-b border-orange-100 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-orange-950">Fleet Drivers</h3>
              <p className="text-xs text-orange-700">
                Ghat-road certified chauffeurs, driving license verification, and wallet balances
              </p>
            </div>
            <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">
              Fleet Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3">Driver</th>
                  <th className="px-4 py-3">License & Expiry</th>
                  <th className="px-4 py-3">Address & Emergency</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3">Wallet Balance</th>
                  <th className="px-4 py-3">Documents</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={drv.photo}
                          alt={drv.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/20"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{drv.name}</p>
                          <p className="text-slate-500 text-[11px]">{drv.email}</p>
                          <p className="text-slate-600 text-[11px] font-mono">{drv.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-mono font-semibold text-slate-900 block">
                          {drv.licenseNumber || 'AP-03-2019-0045892'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Expires: {drv.licenseExpiry || '2031-08-15'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="max-w-xs space-y-0.5">
                        <p className="text-slate-700 truncate text-[11px]">
                          <MapPin className="w-3 h-3 inline text-slate-400 mr-1" />
                          {drv.address || 'Tirupati, AP'}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Emergency: <strong>{drv.emergencyContact || 'Family'}</strong>
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          drv.availability === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : drv.availability === 'On Trip'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            drv.availability === 'Available'
                              ? 'bg-emerald-500'
                              : drv.availability === 'On Trip'
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                        ></span>
                        {drv.availability || 'Available'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-purple-700" />
                        <span className="font-heading font-bold text-slate-900 text-sm">
                          ₹{(drv.walletBalance || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedDriverDoc(drv)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-orange-600" />
                        <span>Docs ({(drv.documents || []).length || 3})</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(drv)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            drv.status === 'active'
                              ? 'text-emerald-700 hover:bg-emerald-100'
                              : 'text-red-600 hover:bg-red-100'
                          }`}
                          title={drv.status === 'active' ? 'Deactivate Driver' : 'Activate Driver'}
                        >
                          {drv.status === 'active' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(drv)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit Driver"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(drv)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Driver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-[#1e1035] to-[#2b144d] p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg">
                {editingUser ? `Edit ${editingUser.role}` : `Add New ${formData.role}`}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              {formData.role === 'driver' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        License Expiry
                      </label>
                      <input
                        type="date"
                        value={formData.licenseExpiry}
                        onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) =>
                        setFormData({ ...formData, emergencyContact: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER DOCUMENTS VIEWER MODAL */}
      {selectedDriverDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  {selectedDriverDoc.name}'s Verified Documents
                </h3>
                <p className="text-xs text-slate-500">Commercial Pilot Clearance</p>
              </div>
              <button
                onClick={() => setSelectedDriverDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {(selectedDriverDoc.documents || [
                { name: 'Commercial Heavy Transport Driving License', type: 'PDF', verified: true },
                { name: 'Aadhaar Card Verification', type: 'PDF', verified: true },
                { name: 'Police Verification Background Check', type: 'PDF', verified: true },
              ]).map((doc, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{doc.name}</p>
                      <p className="text-[10px] text-slate-500">{doc.type} Document</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    ✓ Verified
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedDriverDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGER PERMISSIONS MODAL */}
      <ManagerPermissionsModal
        manager={permissionsModalUser}
        isOpen={!!permissionsModalUser}
        onClose={() => setPermissionsModalUser(null)}
        onSave={handleSavePermissions}
      />
    </div>
  );
};

