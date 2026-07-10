import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Notification from './components/Notification';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AppContent() {
  const [notification, setNotification] = useState(null);
  const { user, logout } = useAuth();

  const notify = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = () => {
    logout();
    notify('You have logged out', 'info');
  };

  return (
    <div className="app-shell">
      <header>
        <div>
          <h1>Daily Log Tracker</h1>
          <p>Employees submit daily progress logs. Managers review the team's history.</p>
        </div>
        {user && (
          <div className="user-actions">
            <span>
              {user.name || user.email} ({user.role})
            </span>
            <button className="text-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {notification && <Notification {...notification} />}

      <main>
        {!user ? (
          <AuthForm notify={notify} />
        ) : user.role === 'manager' ? (
          <ManagerDashboard notify={notify} />
        ) : (
          <EmployeeDashboard notify={notify} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;