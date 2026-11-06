import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Search,
  Sparkles,
} from 'lucide-react';

export const ClientManagement = ({ clients = [], onRefresh }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    travellersCount: 4,
    idProof: 'Aadhaar Card Verified',
    specialRequirements: '',
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      address: '',
      travellersCount: 4,
      idProof: 'Aadhaar Card Verified',
      specialRequirements: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      mobile: client.mobile,
      email: client.email || '',
      address: client.address || '',
      travellersCount: client.travellersCount || 1,
      idProof: client.idProof || 'Aadhaar Verified',
      specialRequirements: client.specialRequirements || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('tb_token');
    const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
    const method = editingClient ? 'PUT' : 'POST';

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
      if (!res.ok) throw new Error(data.error || 'Failed to save client');

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete client "${client.name}"?`)) return;
    const token = localStorage.getItem('tb_token');
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onRefresh();
    } catch (err) {
      alert('Failed to delete client');
    }
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl shadow-sm border border-purple-800 flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-500 rounded-xl text-white shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-white">
              Strict Confidentiality: Admin-Only Client Directory
            </h3>
            <p className="text-xs text-purple-200 mt-0.5 leading-relaxed">
              In accordance with project privacy requirements, client personal phone numbers, emails,
              residential addresses, and ID proofs are rendered <strong>ONLY to Super Admin</strong>.
              Managers and Drivers are barred from viewing this data in the UI and backend APIs.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shrink-0 shadow-md transition-colors"
        >
          + Add Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search clients by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
          />
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Total Registered Pilgrims: <strong>{clients.length}</strong>
        </span>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Client / Group Leader</th>
                <th className="px-4 py-3">Contact Details</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Travellers & ID</th>
                <th className="px-4 py-3">Special Instructions</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{client.name}</p>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        {client.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-orange-500" />
                        {client.mobile}
                      </p>
                      {client.email && (
                        <p className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {client.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-600 max-w-xs truncate flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {client.address || 'Not specified'}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {client.travellersCount || 1} Travellers
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 mt-0.5">
                        <FileCheck className="w-3 h-3" />
                        {client.idProof || 'Verified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-600 max-w-xs truncate text-[11px] italic">
                      {client.specialRequirements || 'No special requests'}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit Client"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Client"
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

      {/* ADD / EDIT CLIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-[#1e1035] to-[#2b144d] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg">
                  {editingClient ? 'Edit Client Record' : 'Register New Client'}
                </h3>
                <p className="text-xs text-purple-200">Admin Managed Confidential Directory</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sri Venkataswamy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
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
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Travellers Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.travellersCount}
                    onChange={(e) => setFormData({ ...formData, travellersCount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="Plot 42, Jubilee Hills, Hyderabad"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID Proof (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Aadhaar / Passport / Voter ID"
                  value={formData.idProof}
                  onChange={(e) => setFormData({ ...formData, idProof: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Requirements
                </label>
                <textarea
                  rows="2"
                  placeholder="Wheelchair assistance, VIP Break darshan pass, child safety seats..."
                  value={formData.specialRequirements}
                  onChange={(e) =>
                    setFormData({ ...formData, specialRequirements: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-hidden"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs shadow-md"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

