import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation rules
  const rules = useMemo(() => {
    return {
      length: form.password.length >= 8,
      uppercase: /[A-Z]/.test(form.password),
      match: form.password !== '' && form.password === form.confirmPassword
    };
  }, [form.password, form.confirmPassword]);

  const isValid = rules.length && rules.uppercase && rules.match && form.name && form.email;

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValid) {
      setError(t("auth.errors.invalidForm"));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password
      });

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

  // Component for checking rules visually
  const RuleChecker = ({ isValid, label }) => (
    <div className={`pwd-rule ${isValid ? 'valid' : ''}`}>
      <div className="pwd-icon">
        {isValid ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
      </div>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="auth-page theme-customer">
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />

      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">🍽️</div>
          <span className="brand-name">{t("navbar.logo")}</span>
          <span className="brand-tagline">{t("auth.register.tagline")}</span>
        </div>

        <h1 className="auth-title">{t("auth.register.title")}</h1>
        <p className="auth-subtitle">{t("auth.register.subtitle")}</p>

        {error && (
          <div className="alert--error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">{t("auth.register.form.fullName")}</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="register-name"
                className="form-input"
                type="text"
                name="name"
                placeholder={t("auth.register.form.namePlaceholder")}
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">{t("auth.register.form.email")}</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="register-email"
                className="form-input"
                type="email"
                name="email"
                placeholder={t("auth.register.form.emailPlaceholder")}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "0.5rem" }}>
            <label className="form-label" htmlFor="register-password">{t("auth.register.form.password")}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="register-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder={t("auth.register.form.passwordPlaceholder")}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPwd(v => !v)}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Checker */}
          <div className="pwd-tracker" style={{ marginBottom: "1.25rem" }}>
            <RuleChecker isValid={rules.length} label={t("auth.register.form.rules.length")} />
            <RuleChecker isValid={rules.uppercase} label={t("auth.register.form.rules.uppercase")} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">{t("auth.register.form.confirmPassword")}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="register-confirm-password"
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder={t("auth.register.form.passwordPlaceholder")}
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Match Rule dynamically shown below confirm password */}
          {form.confirmPassword && (
            <div className="pwd-tracker" style={{ marginTop: "-0.75rem", marginBottom: "1.25rem" }}>
              <RuleChecker isValid={rules.match} label={t("auth.register.form.rules.match")} />
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading || !isValid}
            style={{ marginTop: "1rem" }}
          >
            {loading ? t("auth.register.form.loading") : t("auth.register.form.submit")}
          </button>
        </form>

        <div className="auth-footer">
          {t("auth.register.footer.hasAccount")} <Link to="/login" className="auth-link">{t("auth.register.footer.login")}</Link>
        </div>
      </div>
    </div>
  );
}