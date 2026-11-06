import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Demo users initialized for quick switching
  const demoUsers = {
    admin: {
      id: 'usr-admin-1',
      role: 'admin',
      name: 'Super Admin',
      email: 'admin@tirupatibalaji.com',
      mobile: '+91 94401 98765',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'active',
    },
    manager: {
      id: 'usr-mgr-1',
      role: 'manager',
      name: 'Suresh Kumar',
      email: 'suresh@tirupatibalaji.com',
      mobile: '+91 98480 12345',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      status: 'active',
      permissions: [
        'view_trips',
        'add_trips',
        'assign_drivers',
        'review_expenses',
        'view_reports',
      ],
    },
    driver: {
      id: 'usr-drv-1',
      role: 'driver',
      name: 'Ramesh',
      email: 'ramesh.driver@tirupatibalaji.com',
      mobile: '+91 99890 24680',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      status: 'active',
      availability: 'Available',
      licenseNumber: 'AP-03-2019-0045892',
      licenseExpiry: '2031-08-15',
      address: '14-2-198, Gandhi Road, Tirupati, AP 517501',
      emergencyContact: '+91 99890 24681 (Wife)',
      walletBalance: 24500,
      totalEarnings: 42000,
      totalExpenses: 17880,
      totalReimbursements: 17500,
    },
  };

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tb_user');
    return saved ? JSON.parse(saved) : demoUsers.admin; // default to admin for preview
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('tb_token') || 'demo-token';
  });

  const [activePortal, setActivePortal] = useState(() => {
    return localStorage.getItem('tb_portal') || 'admin';
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync token and user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('tb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tb_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('tb_token', token);
    } else {
      localStorage.removeItem('tb_token');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('tb_portal', activePortal);
  }, [activePortal]);

  // Fetch notifications for the current user
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [user, token]);

  // Refresh user data (wallet balance, availability, etc.)
  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  // Quick switch role for testing convenience
  const quickSwitchRole = (targetRole) => {
    if (demoUsers[targetRole]) {
      const targetUser = demoUsers[targetRole];
      setUser(targetUser);
      setToken(`demo-token-${targetRole}`);
      if (targetRole === 'admin') setActivePortal('admin');
      else if (targetRole === 'manager') setActivePortal('manager');
      else if (targetRole === 'driver') setActivePortal('driver');
    }
  };

  // Send OTP
  const sendOtp = async (email) => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid OTP');

    setUser(data.user);
    setToken(data.token);
    if (data.user.role === 'admin') setActivePortal('admin');
    else if (data.user.role === 'manager') setActivePortal('manager');
    else if (data.user.role === 'driver') setActivePortal('driver');
    return data;
  };

  // Google Login
  const loginWithGoogle = async (email) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google login failed');

    setUser(data.user);
    setToken(data.token);
    if (data.user.role === 'admin') setActivePortal('admin');
    else if (data.user.role === 'manager') setActivePortal('manager');
    else if (data.user.role === 'driver') setActivePortal('driver');
    return data;
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tb_user');
    localStorage.removeItem('tb_token');
    setActivePortal('public');
  };

  // Mark notification as read
  const markNotificationRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch(`/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        role: user ? user.role : 'guest',
        activePortal,
        setActivePortal,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        fetchNotifications,
        refreshUser,
        quickSwitchRole,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        logout,
        demoUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

