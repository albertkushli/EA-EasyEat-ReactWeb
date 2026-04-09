import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, User as UserIcon, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function parseResponseBody(res) {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await res.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
}

function getLoginAttempts(type, email, password) {
  const specificEndpoint = type === 'customer' ? '/auth/customer/login' : '/auth/employee/login';
  return [
    { endpoint: specificEndpoint, body: { email, password } },
    { endpoint: '/auth/login', body: { email, password, role: type } },
    { endpoint: '/auth/local', body: { identifier: email, password } },
  ];
}

function getRequestUrl(endpoint) {
  if (API_BASE.endsWith('/api') && endpoint.startsWith('/api/')) {
    return `${API_BASE}${endpoint.slice(4)}`;
  }
  return `${API_BASE}${endpoint}`;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState('customer'); // 'customer' | 'employee'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const attempts = getLoginAttempts(loginType, form.email, form.password);

      for (const attempt of attempts) {
        const res = await fetch(getRequestUrl(attempt.endpoint), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(attempt.body),
        });

        const data = await parseResponseBody(res);

        if (res.ok) {
          const token = data?.accessToken ?? data?.jwt;
          const user = data?.user ?? null;

          if (!token) {
            setError('El servidor no devolvió un token de acceso válido.');
            return;
          }

          login(token, user);
          navigate('/dashboard');
          return;
        }

        if (![404, 405, 500].includes(res.status)) {
          setError(data?.message ?? data?.error ?? 'Credenciales inválidas.');
          return;
        }
      }

      setError('No se encontró un endpoint de login compatible en el servidor.');
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />
      <div className="auth-orb auth-orb--3" />

      <div className="auth-card glass-card">
        <div className="brand">
          <div className="brand-icon">🍽️</div>
          <span className="brand-name">EasyEat</span>
          <span className="brand-tagline">Tu experiencia gastronómica, simplificada</span>
        </div>

        <h1 className="auth-title">Bienvenido de vuelta</h1>
        <p className="auth-subtitle">Inicia sesión para acceder a tu panel</p>

        {/* Tab Switcher */}
        <div className="login-tabs">
          <button 
            className={`tab-btn ${loginType === 'customer' ? 'active' : ''}`}
            onClick={() => setLoginType('customer')}
          >
            <UserIcon size={16} /> Cliente
          </button>
          <button 
            className={`tab-btn ${loginType === 'employee' ? 'active' : ''}`}
            onClick={() => setLoginType('employee')}
          >
            <Briefcase size={16} /> Empleado
          </button>
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={17} />
              <input
                id="login-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={17} />
              <input
                id="login-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button id="login-submit-btn" type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Iniciando sesión…</> : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate gratis</Link>
        </div>
      </div>
    </div>
  );
}
