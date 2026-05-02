import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ICustomer } from '../../models/customer-model';
import { customerService } from '../../services/customer-service'
import { Link } from 'react-router-dom';
import { LogOut, Settings, User, Mail, Lock, Save, ArrowLeft, CheckCircle } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ConfigurationCustomer() {
  const { t } = useTranslation();
  const { user, logout, token, updateUser } = useAuth() as { user: ICustomer | null, logout: any, token: any, updateUser: any };
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);
  const [customer, setCustomer] = useState<any>({});
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPassword, setCustomerPassword] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchCustomerData() {
      if (!token || !user?._id) {
        setLoadingCustomerData(false);
        return;
      }
      try {
        const data = await customerService.fetchCustomer(user._id!);
        setCustomer(data);
        setCustomerName(data.name);
        setCustomerEmail(data.email);
      } catch (err) {
        console.error('Error fetching customer data:', err);
      } finally {
        setLoadingCustomerData(false);
      }
    }
    fetchCustomerData();
  }, [token, user?._id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !customer._id) {
      return;
    }

    setNameError('');
    setEmailError('');
    setPasswordError('');
    let hasError = false;

    if (customerName.length < 2 || customerName.length > 100) {
      setNameError(t("settings.form.nameError"));
      hasError = true;
    }

    if (!EMAIL_REGEX.test(customerEmail)) {
      setEmailError(t("settings.form.emailError"));
      hasError = true;
    }

    if (customerPassword.length > 0 && !PASSWORD_REGEX.test(customerPassword)) {
      setPasswordError(t("settings.form.passwordError"));
      hasError = true;
    }

    if (hasError) return;

    setUpdating(true);
    setSuccess(false);
    try {
      const updatedCustomer = await customerService.updateCustomer(customer._id, {
        name: customerName ?? customer.name,
        email: customerEmail ?? customer.email,
        password: customerPassword.length > 0 ? customerPassword : undefined,
      });
      setCustomer(updatedCustomer);
      updateUser({ name: updatedCustomer.name, email: updatedCustomer.email });
      setSuccess(true);
      setCustomerPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating customer:', err);
    } finally {
      setUpdating(false);
    }
  }

  if (loadingCustomerData) {
    return (
      <div className="hc-loading">
        <div className="hc-loading__spinner" />
        <p>{t("dashboard.customer.loading")}</p>
      </div>
    );
  }

  return (
    <div className="hc-page">
      {/* ── Header ── */}
      <header className="hc-header">
        <div className="hc-header__inner">
          <Link to="/dashboard" className="hc-brand" style={{ textDecoration: 'none' }}>
            <span className="hc-brand__icon">🍽️</span>
            <span className="hc-brand__name">{t("navbar.logo")}</span>
          </Link>
          <div className="hc-header__right">
            <div className="hc-user-pill">
              <div className="hc-user-avatar">{customer.name?.[0]?.toUpperCase()}</div>
              <span>{customer.name?.split(' ')[0]}</span>
            </div>
            <button onClick={logout} className="hc-logout-btn" title={t("navbar.links.logout")}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="hc-main">
        {/* ── Title & Navigation ── */}
        <section className="hc-section">
          <div className="hc-section__head" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/dashboard" className="hc-settings-btn" style={{ textDecoration: 'none', display: 'flex', gap: '0.5rem', width: 'auto', padding: '0 1rem' }}>
                <ArrowLeft size={18} />
                <span>{t("navbar.back")}</span>
              </Link>
              <h2 className="hc-section__title">
                <Settings size={22} className="text-orange" />
                {t("settings.settings")}
              </h2>
            </div>
          </div>

          <div className="auth-card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{t("settings.title")}</h3>
              <p style={{ color: 'var(--lp-text-muted)', fontSize: '0.9rem' }}>{t("settings.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">{t("auth.register.form.fullName")}</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t("auth.register.form.namePlaceholder")}
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    required
                    style={nameError ? { borderColor: '#ef4444' } : {}}
                  />
                </div>
                {nameError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{nameError}</span>}
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">{t("auth.register.form.email")}</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder={t("auth.register.form.emailPlaceholder")}
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    required
                    style={emailError ? { borderColor: '#ef4444' } : {}}
                  />
                </div>
                {emailError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{emailError}</span>}
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">
                  {t("settings.form.password")}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7, marginLeft: '0.5rem' }}>
                    {t("settings.form.passwordHint")}
                  </span>
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={customerPassword}
                    onChange={(e) => {
                      setCustomerPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    style={passwordError ? { borderColor: '#ef4444' } : {}}
                  />
                </div>
                {passwordError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{passwordError}</span>}
              </div>

              {success && (
                <div className="alert--success" style={{
                  background: 'hsla(142, 71%, 45%, 0.1)',
                  color: 'hsl(142, 71%, 40%)',
                  padding: '1rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  <CheckCircle size={18} /> {t("settings.form.updated")}
                </div>
              )}

              <button type="submit" className="btn btn--primary" disabled={updating} style={{ marginTop: '1rem' }}>
                {updating ? (
                  <div className="hc-loading__spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                ) : (
                  <>
                    <Save size={18} />
                    <span>{t("settings.form.save")}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}