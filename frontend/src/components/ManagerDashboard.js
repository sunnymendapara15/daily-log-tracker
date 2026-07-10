import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import LogList from './LogList';
import './ManagerDashboard.css';
import { useAuth } from '../context/AuthContext';

function ManagerDashboard({ notify }) {
  const { token } = useAuth();
  const [filters, setFilters] = useState({ date: '', employee: '' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return null;
  }

  const headers = { Authorization: `Bearer ${token}` };

  const fetchLogs = () => {
    setLoading(true);
    api
      .get('/logs', { params: filters, headers })
      .then((res) => setLogs(res.data))
      .catch((err) => notify(err?.response?.data?.message || 'Unable to load logs', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchLogs();
  };

  return (
    <div className="manager-dashboard">
      <section className="filter-card">
        <h2>Filters</h2>
        <form className="filter-form" onSubmit={handleSubmit}>
          <label>
            Date
            <input name="date" type="date" value={filters.date} onChange={handleChange} />
          </label>
          <label>
            Employee email
            <input name="employee" type="email" value={filters.employee} onChange={handleChange} placeholder="jane@example.com" />
          </label>
        </form>
      </section>
      <section className="log-list-card">
        <div className="section-title">
          <h2>Team logs</h2>
          <button className="text-btn" type="button" onClick={fetchLogs}>
            Refresh
          </button>
        </div>
        <LogList logs={logs} loading={loading} showOuner />
      </section>
    </div>
  );
}

export default ManagerDashboard;