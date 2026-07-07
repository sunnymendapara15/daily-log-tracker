import React, { useState } from 'react';
import { api } from '../api/client';
import './AuthForm.css';

const initialState = { name: '', email: '', password: '', role: 'employee', managerCode: '' };

function AuthForm({ onAuthenticated, notify }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/login', {
          email: form.email,
          password: form.password
        });
        onAuthenticated(data.user, data.token);
      } else {
        const { data } = await api.post('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          managerCode: form.role === 'manager' ? form.managerCode : undefined
        });
        onAuthenticated(data.user, data.token);
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to authenticate';
      setError(message);
      notify(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <div className="auth-card__header">
        <h2>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
        <p>{mode === 'login' ? 'Sign in to continue' : 'Register as employee or manager'}</p>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'register' && (
          <label>
            Full name
            <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" required />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </label>
        {mode === 'register' && (
          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </label>
        )}
        {mode === 'register' && form.role === 'manager' && (
          <label>
            Manager code
            <input
              name="managerCode"
              value={form.managerCode}
              onChange={handleChange}
              placeholder="Secret code"
              required
            />
          </label>
        )}
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Processing…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <div className="auth-card__footer">
        <span>{mode === 'login' ? "Don't have an account?" : 'Already registered?'} </span>
        <button className="text-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Register' : 'Sign in'}
        </button>
      </div>
    </section>
  );
}

export default AuthForm;
