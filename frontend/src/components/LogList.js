import React from 'react';
import './LogList.css';

const statusLabels = {
  done: 'Done',
  'in-progress': 'In progress',
  blocked: 'Blocked'
};

function LogList({ logs = [], loading, showOwner = false }) {
  if (loading) {
    return <p className="log-list-placeholder">Loading logs…</p>;
  }

  if (!logs.length) {
    return <p className="log-list-placeholder">No log entries found yet.</p>;
  }

  return (
    <div className="log-list">
      {logs.map((log) => (
        <article className="log-card" key={log.id}>
          <header>
            <div>
              <strong>{statusLabels[log.status] || log.status}</strong>
              <span>{log.date}</span>
            </div>
            {showOwner && log.name && (
              <div className="log-owner">
                <span>{log.name}</span>
                <small>{log.email}</small>
              </div>
            )}
          </header>
          <p className="summary">{log.summary}</p>
          {log.blockers && <p className="blockers">Blockers: {log.blockers}</p>}
          <small className="timestamp">Submitted {new Date(log.created_at).toLocaleString()}</small>
        </article>
      ))}
    </div>
  );
}

export default LogList;
