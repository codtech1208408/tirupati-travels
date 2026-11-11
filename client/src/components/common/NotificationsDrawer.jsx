import React from 'react';
import { X, CheckCheck, Bell, Calendar, ReceiptIndianRupee, IndianRupee, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotificationsDrawer = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'trip_assigned':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'expense_reviewed':
      case 'expense_approved':
        return <ReceiptIndianRupee className="w-5 h-5 text-emerald-600" />;
      case 'deal_closed':
        return <IndianRupee className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#1e1035] to-[#2b144d] text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <Bell className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg">Notifications</h3>
              <p className="text-xs text-purple-200">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs bg-white/10 hover:bg-white/20 text-orange-300 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Bell className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">No notifications yet</p>
              <p className="text-xs text-slate-400">Important trip and expense updates will appear here</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? 'bg-white border-slate-100 opacity-75'
                    : 'bg-orange-50/50 border-orange-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-heading font-semibold text-sm text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

