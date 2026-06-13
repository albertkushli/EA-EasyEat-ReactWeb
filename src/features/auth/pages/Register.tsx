import { useState, useMemo, useEffect, type ChangeEvent, type FormEvent, type FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RuleCheckerProps {
  isValid: boolean;
  label: string;
}

const RuleChecker: FC<RuleCheckerProps> = ({ isValid, label }) => (
  <div className={`pwd-rule ${isValid ? 'valid' : ''}`}>
    <div className="pwd-icon">
      {isValid ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
    </div>
    <span>{label}</span>
  </div>
);

export default function Register() {
  const { t } = useTranslation();
  const { register, loginGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const scriptId = 'google-gsi-client';
    const existingScript = document.getElementById(scriptId);

    const loadScript = () => {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleSignIn();
      document.body.appendChild(script);
    };

    if (!existingScript) {
      loadScript();
    } else if ((window as any).google) {
      initializeGoogleSignIn();
    }

    function initializeGoogleSignIn() {
      try {
        const google = (window as any).google;
        if (!google) return;

        const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        google.accounts.id.initialize({
          client_id: clientID,
          callback: async (response: any) => {
            setLoading(true);
            setError('');
            try {
              const res = await loginGoogle(response.credential, 'customer');
              if (res.success) {
                navigate('/dashboard');
              } else {
                setError(res.error ?? 'Google authentication failed');
              }
            } catch {
              setError(t('auth.errors.serverError'));
            } finally {
              setLoading(false);
            }
          },
        });

        const btnElement = document.getElementById('google-signin-btn');
        if (btnElement) {
          google.accounts.id.renderButton(btnElement, {
            theme: 'outline',
            size: 'large',
            width: btnElement.clientWidth || 364,
            text: 'signup_with',
            shape: 'rectangular',
          });
        }

        google.accounts.id.prompt();
      } catch (e) {
        console.error('Failed to initialize Google Sign In:', e);
      }
    }
  }, [loginGoogle, navigate, t]);

  const rules = useMemo(
    () => ({
      length: form.password.length >= 8,
      uppercase: /[A-Z]/.test(form.password),
      match: form.password !== '' && form.password === form.confirmPassword,
    }),
    [form.password, form.confirmPassword],
  );

  const isValid = Boolean(
    rules.length && rules.uppercase && rules.match && form.name && form.email,
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid) {
      setError(t('auth.errors.invalidForm'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error ?? t('auth.errors.serverError'));
      }
    } catch {
      setError(t('auth.errors.serverError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page theme-customer">
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />

      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">🍽️</div>
          <span className="brand-name">{t('navbar.logo')}</span>
          <span className="brand-tagline">{t('auth.register.tagline')}</span>
        </div>

        <h1 className="auth-title">{t('auth.register.title')}</h1>
        <p className="auth-subtitle">{t('auth.register.subtitle')}</p>

        {error && (
          <div className="alert--error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              {t('auth.register.form.fullName')}
            </label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="register-name"
                className="form-input"
                type="text"
                name="name"
                placeholder={t('auth.register.form.namePlaceholder')}
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              {t('auth.register.form.email')}
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="register-email"
                className="form-input"
                type="email"
                name="email"
                placeholder={t('auth.register.form.emailPlaceholder')}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label className="form-label" htmlFor="register-password">
              {t('auth.register.form.password')}
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="register-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder={t('auth.register.form.passwordPlaceholder')}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPwd((value) => !value)}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pwd-tracker" style={{ marginBottom: '1.25rem' }}>
            <RuleChecker isValid={rules.length} label={t('auth.register.form.rules.length')} />
            <RuleChecker
              isValid={rules.uppercase}
              label={t('auth.register.form.rules.uppercase')}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              {t('auth.register.form.confirmPassword')}
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="register-confirm-password"
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder={t('auth.register.form.passwordPlaceholder')}
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

          {form.confirmPassword && (
            <div className="pwd-tracker" style={{ marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
              <RuleChecker isValid={rules.match} label={t('auth.register.form.rules.match')} />
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading || !isValid}
            style={{ marginTop: '1rem' }}
          >
            {loading ? t('auth.register.form.loading') : t('auth.register.form.submit')}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t('auth.login.divider') || 'O'}</span>
        </div>

        <div className="google-signin-container">
          <div id="google-signin-btn" style={{ width: '100%' }}></div>
        </div>

        <div className="auth-footer">
          {t('auth.register.footer.hasAccount')}{' '}
          <Link to="/login" className="auth-link">
            {t('auth.register.footer.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
