import React from 'react';
import { useAuth } from './context/AuthContext';
import { useRouter } from './router/useRouter';
import { PublicWebsite } from './components/public/PublicWebsite';
import { AdminApp } from './components/admin/AdminApp';
import { AdminLogin } from './components/admin/AdminLogin';
import { ManagerApp } from './components/manager/ManagerApp';
import { ManagerLogin } from './components/manager/ManagerLogin';
import { DriverApp } from './components/driver/DriverApp';
import { DriverLogin } from './components/driver/DriverLogin';

export const App = () => {
  const { user } = useAuth();
  const { currentPath, navigate } = useRouter();

  // Normalize path
  const path = currentPath.toLowerCase();

  // 1. ADMIN PORTAL ROUTE (/admin)
  if (path.startsWith('/admin')) {
    if (user && user.role === 'admin') {
      return <AdminApp onNavigateHome={() => navigate('/')} />;
    } else {
      return (
        <AdminLogin
          onLoginSuccess={() => navigate('/admin')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }
  }

  // 2. MANAGER PORTAL ROUTE (/manager)
  if (path.startsWith('/manager')) {
    if (user && user.role === 'manager') {
      return <ManagerApp onNavigateHome={() => navigate('/')} />;
    } else {
      return (
        <ManagerLogin
          onLoginSuccess={() => navigate('/manager')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }
  }

  // 3. DRIVER TERMINAL ROUTE (/driver)
  if (path.startsWith('/driver')) {
    if (user && user.role === 'driver') {
      return <DriverApp onNavigateHome={() => navigate('/')} />;
    } else {
      return (
        <DriverLogin
          onLoginSuccess={() => navigate('/driver')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }
  }

  // 4. PUBLIC WEBSITE ROUTE (/)
  return <PublicWebsite onNavigate={(targetPath) => navigate(targetPath)} />;
};

export default App;
