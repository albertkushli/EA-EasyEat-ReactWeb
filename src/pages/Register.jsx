import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:1337';

function getStrength(pwd) {
  let score = 0;
  if (!pwd) return -1;
  if (pwd.length >= 8)  score++; // Required: 8+
  if (/[A-Z]/.test(pwd)) score++; // Required: 1+ Uppercase
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4); 
}

const strengthMeta = [
  { label: 'Muy débil',  cls: 'active-weak' },
  { label: 'Débil',      cls: 'active-weak' },
  { label: 'Regular',    cls: 'active-fair' },
  { label: 'Buena',      cls: 'active-good' },
  { label: 'Fuerte 🔥',  cls: 'active-strong' },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed,      setAgreed]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  const strength = form.password ? getStrength(form.password) : -1;

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError('La contraseña debe contener al menos una letra mayúscula.');
      setLoading(false);
      return;
    }
    if (!agreed) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create account
      const res  = await fetch(`${API_BASE}/customers`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? 'No se pudo crear la cuenta.');
        setLoading(false);
        return;
      }

      // 2. Auto-login
      const loginRes = await fetch(`${API_BASE}/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        login(loginData.accessToken, loginData.user);
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // If auto-login fails, redirect to manual login
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2200);
      }
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-card glass-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 'var(--sp-md)' }}>🎉</div>
          <h1 className="auth-title">¡Bienvenido, {form.name.split(' ')[0]}!</h1>
          <p className="auth-subtitle">Preparando tu mesa personalizada...</p>
          <div style={{ marginTop: 'var(--sp-lg)' }}>
            <div className="strength-bar">
              {[0,1,2,3].map(i => (
                <div key={i} className={`strength-segment active-strong`} style={{ height: 6 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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

        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-subtitle">Únete y empieza a ganar puntos en cada visita</p>

        {error && (
          <div className="alert alert--error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Nombre completo</label>
            <div className="input-wrapper">
              <User className="input-icon" size={17} />
              <input
                id="register-name"
                className="form-input"
                type="text"
                name="name"
                placeholder="Nombre Apellido"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Correo electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={17} />
              <input
                id="register-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={17} />
              <input
                id="register-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {form.password.length > 0 && (
              <>
                <div className="strength-bar">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`strength-segment ${i <= strength ? strengthMeta[strength].cls : ''}`} />
                  ))}
                </div>
                <span className="strength-label">{strengthMeta[strength]?.label}</span>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm">Confirmar contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={17} />
              <input
                id="register-confirm"
                className={`form-input${form.confirm && form.confirm !== form.password ? ' input--error' : ''}`}
                type={showConfirm ? 'text' : 'password'}
                name="confirm"
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button type="button" className="input-icon-right" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <label className="checkbox-row">
            <div
              className={`checkbox-custom${agreed ? ' checked' : ''}`}
              onClick={() => setAgreed(v => !v)}
              role="checkbox"
              aria-checked={agreed}
              tabIndex={0}
            >
              {agreed && <CheckCircle2 size={12} color="hsl(20,80%,10%)" />}
            </div>
            <span>Acepto los <Link to="/terms" className="auth-link">términos y condiciones</Link></span>
          </label>

          <button id="register-submit-btn" type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Creando cuenta…</> : 'Crear cuenta gratis'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
