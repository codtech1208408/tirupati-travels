import React from 'react';
import { useAuth } from './context/AuthContext';
import { useRouter } from './router/useRouter';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { AdminApp } from './components/admin/AdminApp';
import { AdminLogin } from './components/admin/AdminLogin';
import { ManagerApp } from './components/manager/ManagerApp';
import { ManagerLogin } from './components/manager/ManagerLogin';
import { ManagerRegister } from './components/auth/ManagerRegister';
import { DriverApp } from './components/driver/DriverApp';
import { DriverLogin } from './components/driver/DriverLogin';
import { DriverRegister } from './components/auth/DriverRegister';

export const App = () => {
  const { user } = useAuth();
  const { currentPath, navigate } = useRouter();

  // Normalize path
  const path = currentPath.toLowerCase();

  // 1. MANAGER REGISTRATION ROUTE (/manager/register)
  if (path.includes('/manager/register') || path.includes('/manager-register')) {
    return (
      <ManagerRegister
        onNavigateLogin={() => navigate('/manager')}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  // 2. DRIVER REGISTRATION ROUTE (/driver/register)
  if (path.includes('/driver/register') || path.includes('/driver-register')) {
    return (
      <DriverRegister
        onNavigateLogin={() => navigate('/driver')}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  // 3. ADMIN PORTAL ROUTE (/admin)
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

  // 4. MANAGER PORTAL ROUTE (/manager)
  if (path.startsWith('/manager')) {
    if (user && user.role === 'manager') {
      return <ManagerApp onNavigateHome={() => navigate('/')} />;
    } else {
      return (
        <ManagerLogin
          onLoginSuccess={() => navigate('/manager')}
          onNavigateHome={() => navigate('/')}
          onNavigateRegister={() => navigate('/manager/register')}
        />
      );
    }
  }

  // 5. DRIVER TERMINAL ROUTE (/driver)
  if (path.startsWith('/driver')) {
    if (user && user.role === 'driver') {
      return <DriverApp onNavigateHome={() => navigate('/')} />;
    } else {
      return (
        <DriverLogin
          onLoginSuccess={() => navigate('/driver')}
          onNavigateHome={() => navigate('/')}
          onNavigateRegister={() => navigate('/driver/register')}
        />
      );
    }
  }

  // 6. DEFAULT APPLICATION ENTRY POINT: APP-STYLE WELCOME / ROLE SELECTION SCREEN (/)
  return (
    <WelcomeScreen
      onNavigate={(targetPath) => navigate(targetPath)}
    />
  );
};

export default App;
