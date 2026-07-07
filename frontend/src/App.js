import React, { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Notification from './components/Notification';
import './App.css';

const storedToken = localStorage.getItem('dlt_token');
const storedUser = localStorage.getItem('dlt_user');

function App() {
  const [auth, setAuth] = useState(() => ({
    token: storedToken || '',
    user: storedUser ? JSON.parse(storedUser) : null
  }));
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem('dlt_token', auth.token);
      localStorage.setItem('dlt_user', JSON.stringify(auth.user));
    } else {
      localStorage.removeItem('dlt_token');
      localStorage.removeItem('dlt_user');
    }
  }, [auth]);

  const notify = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAuth = (user, token) => {
    setAuth({ user, token });
    notify(`Welcome back, ${user.name || user.email}!`, 'success');
  };

  const handleLogout = () => {
    setAuth({ token: '', user: null });
    notify('You have logged out', 'info');
  };

  return (
    <div className="app-shell">
      <header>
        <div>
          <h1>Daily Log Tracker</h1>
          <p>Employees submit daily progress logs. Managers review the team's history.</p>
        </div>
        {auth.user && (
          <div className="user-actions">
            <span>{auth.user.name || auth.user.email} ({auth.user.role})</span>
            <button className="text-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {notification && <Notification {...notification} />}

      <main>
        {!auth.user ? (
          <AuthForm onAuthenticated={handleAuth} notify={notify} />
        ) : auth.user.role === 'manager' ? (
          <ManagerDashboard token={auth.token} notify={notify} />
        ) : (
          <EmployeeDashboard token={auth.token} notify={notify} />
        )}
      </main>
    </div>
  );
}

export default App;
