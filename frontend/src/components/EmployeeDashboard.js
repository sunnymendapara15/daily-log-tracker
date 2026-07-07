import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import LogList from './LogList';
import './EmployeeDashboard.css';

const today = new Date().toISOString().split('T')[0];

function EmployeeDashboard({ token, notify }) {
  const [form, setForm] = useState({ date: today, summary: '', blockers: '', status: 'done' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const refresh = () => {
    setLoading(true);
    api
      .get('/logs/me', { headers })
      .then((res) => setLogs(res.data))
      .catch((err) => notify(err?.response?.data?.message || 'Unable to load logs', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    api
      .post(
        '/logs',
        {
          date: form.date,
          summary: form.summary,
          blockers: form.blockers,
          status: form.status
        },
        { headers }
      )
      .then(() => {
        notify('Log submitted successfully', 'success');
        setForm((prev) => ({ ...prev, summary: '', blockers: '' }));
        refresh();
      })
      .catch((err) => {
        notify(err?.response?.data?.message || 'Unable to submit log', 'error');
      });
  };

  return (
    <div className="employee-dashboard">
      <section className="log-form-card">
        <h2>Submit today's log</h2>
        <form onSubmit={handleSubmit} className="log-form">
          <label>
            Date
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
          </label>
          <label>
            Summary
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              placeholder="What did you accomplish?"
              rows={3}
              required
            />
          </label>
          <label>
            Blockers (optional)
            <textarea name="blockers" value={form.blockers} onChange={handleChange} rows={2} />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="done">Done</option>
              <option value="in-progress">In progress</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
          <button type="submit">Submit log</button>
        </form>
      </section>
      <section className="log-list-card">
        <div className="section-title">
          <h2>Your recent logs</h2>
          <button type="button" className="text-btn" onClick={refresh}>
            Refresh
          </button>
        </div>
        <LogList logs={logs} loading={loading} />
      </section>
    </div>
  );
}

export default EmployeeDashboard;
