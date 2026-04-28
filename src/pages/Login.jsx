import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User as UserIcon, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState('customer'); // 'customer' | 'employee'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Apply theme class to body/page
  useEffect(() => {
    document.body.className = '';
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError(t("auth.errors.completeFields"));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(form.email, form.password, loginType);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch {
      setError(t("auth.errors.serverError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`auth-page theme-${loginType}`}>
      {/* Background Effect Orbs */}
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />

      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">🍽️</div>
          <span className="brand-name">{t("navbar.logo")}</span>
          <span className="brand-tagline">{t("auth.login.tagline")}</span>
        </div>

        <h1 className="auth-title">{t("auth.login.title")}</h1>
        <p className="auth-subtitle">{t("auth.login.subtitle")}</p>

        {/* Tab Switcher - Changes the entire theme dynamically */}
        <div className="login-tabs">
          <button
            type="button"
            className={`tab-btn ${loginType === 'customer' ? 'active' : ''}`}
            onClick={() => setLoginType('customer')}
          >
            <UserIcon size={16} /> {t("auth.login.tabs.customer")}
          </button>
          <button
            type="button"
            className={`tab-btn ${loginType === 'employee' ? 'active' : ''}`}
            onClick={() => setLoginType('employee')}
          >
            <Briefcase size={16} /> {t("auth.login.tabs.restaurant")}
          </button>
        </div>

        {error && (
          <div className="alert--error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">{t("auth.login.form.email")}</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                className="form-input"
                type="email"
                name="email"
                placeholder={t("auth.login.form.emailPlaceholder")}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">{t("auth.login.form.password")}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder={t("auth.login.form.passwordPlaceholder")}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="input-icon-right" 
                onClick={() => setShowPwd(v => !v)}
                title={showPwd ? t("auth.login.form.hidePassword") : t("auth.login.form.showPassword")}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button id="login-submit-btn" type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? t("auth.login.form.loading") : t("auth.login.form.submit")}
          </button>
        </form>

        {loginType === 'customer' && (
          <div className="auth-footer">
            {t("auth.login.footer.noAccount")} <Link to="/register" className="auth-link">{t("auth.login.footer.register")}</Link>
          </div>
        )}
      </div>
    </div>
  );
}