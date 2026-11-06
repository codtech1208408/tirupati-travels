import React, { useState } from 'react';
import { X, ShieldCheck, Check, AlertCircle } from 'lucide-react';

const ALL_PERMISSIONS = [
  {
    id: 'view_trips',
    name: 'View Trips',
    description: 'Allows manager to view the trip schedules and fleet statuses (client contact details masked).',
  },
  {
    id: 'add_trips',
    name: 'Add / Create Trips',
    description: 'Allows manager to create new trips and schedule itineraries.',
  },
  {
    id: 'assign_drivers',
    name: 'Assign Drivers',
    description: 'Allows manager to assign available drivers to trips with date-clash prevention.',
  },
  {
    id: 'review_expenses',
    name: 'Review Driver Expenses',
    description: 'Allows manager to approve, reject, or flag fuel/toll expenses submitted by drivers.',
  },
  {
    id: 'view_reports',
    name: 'View Reports',
    description: 'Allows manager to view trip summaries, fuel/toll expense reports, and statistics.',
  },
  {
    id: 'close_deals',
    name: 'Close Deals & Enter Salary (Restricted)',
    description: 'Special permission to close completed trips, record driver salary, and trigger wallet credits.',
  },
];

export const ManagerPermissionsModal = ({ manager, isOpen, onClose, onSave }) => {
  const [selectedPerms, setSelectedPerms] = useState(manager?.permissions || []);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !manager) return null;

  const togglePerm = (permId) => {
    if (selectedPerms.includes(permId)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== permId));
    } else {
      setSelectedPerms([...selectedPerms, permId]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(manager.id, selectedPerms);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-[#1e1035] to-[#2b144d] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Manager Role & Permissions</h3>
              <p className="text-xs text-purple-200">
                Configuring permissions for {manager.name} ({manager.email})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
            <strong>Strict RBAC Enforcement:</strong> Managers only have access to modules explicitly
            checked below. Managers NEVER have access to client contact or personal identity details.
          </div>

          <div className="space-y-3">
            {ALL_PERMISSIONS.map((perm) => {
              const isChecked = selectedPerms.includes(perm.id);
              return (
                <div
                  key={perm.id}
                  onClick={() => togglePerm(perm.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? 'bg-orange-50/60 border-orange-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      isChecked ? 'bg-orange-500 text-white' : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-3" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">{perm.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {perm.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Apply Permissions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

