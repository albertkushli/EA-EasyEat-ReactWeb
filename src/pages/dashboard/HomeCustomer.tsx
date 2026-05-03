import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, User, MapPin, Star, Coins, Trophy, Heart, Clock, 
  Home, Compass, Gift, QrCode, Mail, Lock, Save, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ICustomer } from '../../types';
import apiClient from '../../lib/apiClient';
import { customerService } from '../../services/customer-service';

const DEFAULT_META = { total: 0, page: 1, limit: 1, totalPages: 1 };
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parsePaginatedListResponse(payload: any, fallbackLimit = 10) {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: { total: payload.length, page: 1, limit: fallbackLimit, totalPages: 1 }
    };
  }

  const data = Array.isArray(payload?.data) ? payload.data : [];
  const rawMeta = payload?.meta || {};
  const total = Number.isFinite(rawMeta.total) ? rawMeta.total : data.length;
  const page = Number.isFinite(rawMeta.page) ? rawMeta.page : 1;
  const limit = Number.isFinite(rawMeta.limit) ? rawMeta.limit : fallbackLimit;
  const totalPages = Number.isFinite(rawMeta.totalPages)
    ? rawMeta.totalPages
    : Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return { data, meta: { total, page, limit, totalPages } };
}

export default function HomeCustomer() {
  const { t } = useTranslation();
  const { user, logout, token, updateUser } = useAuth() as { user: ICustomer | null, logout: any, token: any, updateUser: any };

  const [activeTab, setActiveTab] = useState('home');

  const [favoriteRestaurants, setFavoriteRestaurants] = useState<any[]>([]);
  const [pointsWallet, setPointsWallet] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);

  // Profile Form State
  const [customer, setCustomer] = useState<any>({});
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPassword, setCustomerPassword] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  // Metrics
  const totalPoints = Array.isArray(pointsWallet) 
    ? pointsWallet.reduce((sum, w) => sum + (w.points || 0), 0)
    : 0;
  const uniqueRestaurantsVisited = Array.isArray(visits)
    ? new Set(visits.map(v => v.restaurant_id?.profile?.name || v.restaurant_name || '')).size
    : 0;
  
  const objective1Progress = Math.min(100, Math.round((uniqueRestaurantsVisited / 10) * 100));
  const objective2Progress = Math.min(100, Math.round((totalPoints / 2000) * 100));
  const objective3Progress = Math.min(100, Math.round((Math.min(Array.isArray(visits) ? visits.length : 0, 10) / 10) * 100));

  const displayFavorites = Array.isArray(favoriteRestaurants) && favoriteRestaurants.length > 0
    ? favoriteRestaurants.slice(0, 3)
    : [];

  useEffect(() => {
    async function fetchCustomerData() {
      const customerId = user?._id || user?.id;
      if (!token || !customerId) {
        setLoadingCustomerData(false);
        return;
      }
      try {
        const [favRes, ptsRes, badgesRes, visitsRes, profileRes] = await Promise.allSettled([
          apiClient.get(`/customers/${customerId}/favouriteRestaurants`, { params: { page: 1, limit: 10 } }),
          apiClient.get(`/customers/${customerId}/pointsWallet`, { params: { page: 1, limit: 20 } }),
          apiClient.get(`/customers/${customerId}/badges`, { params: { page: 1, limit: 10 } }),
          apiClient.get(`/customers/${customerId}/visits`, { params: { page: 1, limit: 20 } }),
          customerService.fetchCustomer(customerId)
        ]);

        if (favRes.status === 'fulfilled' && favRes.value?.data) {
          const parsedFavorites = parsePaginatedListResponse(favRes.value.data, 10);
          setFavoriteRestaurants(parsedFavorites.data);
        }
        if (ptsRes.status === 'fulfilled' && ptsRes.value?.data) {
          const parsedPoints = parsePaginatedListResponse(ptsRes.value.data, 20);
          setPointsWallet(parsedPoints.data);
        }
        if (badgesRes.status === 'fulfilled' && badgesRes.value?.data) {
          const parsedBadges = parsePaginatedListResponse(badgesRes.value.data, 10);
          setBadges(parsedBadges.data);
        }
        if (visitsRes.status === 'fulfilled' && visitsRes.value?.data) {
          const parsedVisits = parsePaginatedListResponse(visitsRes.value.data, 20);
          setVisits(parsedVisits.data);
        }
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setCustomer(profileRes.value);
          setCustomerName(profileRes.value.name || '');
          setCustomerEmail(profileRes.value.email || '');
        }
      } catch (err) {
        console.error('Error fetching customer data:', err);
      } finally {
        setLoadingCustomerData(false);
      }
    }
    fetchCustomerData();
  }, [token, user?._id, user?.id]);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !customer._id) return;

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
        name: customerName,
        email: customerEmail,
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
  };

  if (loadingCustomerData) {
    return (
      <div className="hc-loading">
        <div className="hc-loading__spinner" />
        <p>{t("dashboard.customer.loading") || 'Cargando tu experiencia...'}</p>
      </div>
    );
  }

  return (
    <div className="hc-page">
      <div className="hc-layout">
        <aside className="hc-sidebar">
          <div className="hc-sidebar__brand">
            <div className="hc-sidebar__logo">🍽️</div>
            <div>
              <p className="hc-sidebar__title">EasyEat</p>
              <p className="hc-sidebar__subtitle">Tu experiencia gastronómica</p>
            </div>
          </div>

          <nav className="hc-sidebar-nav">
            <button
              type="button"
              className={activeTab === 'home' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'}
              onClick={() => setActiveTab('home')}
            >
              <Home size={18} />
              <span>Inici</span>
            </button>
            <button
              type="button"
              className={activeTab === 'discover' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'}
              onClick={() => setActiveTab('discover')}
            >
              <Compass size={18} />
              <span>Descobrir</span>
            </button>
            <button
              type="button"
              className={activeTab === 'qr' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'}
              onClick={() => setActiveTab('qr')}
            >
              <QrCode size={18} />
              <span>El meu QR</span>
            </button>
            <button
              type="button"
              className={activeTab === 'rewards' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'}
              onClick={() => setActiveTab('rewards')}
            >
              <Gift size={18} />
              <span>Recompenses</span>
            </button>
            <button
              type="button"
              className={activeTab === 'profile' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>Perfil</span>
            </button>
          </nav>

          <div className="hc-sidebar-footer">
            <div className="hc-sidebar-user">
              <div className="hc-sidebar-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <p>{user?.name}</p>
                <span>{user?.role || 'Cliente'}</span>
              </div>
            </div>
            <button onClick={logout} className="hc-sidebar-logout">Logout</button>
          </div>
        </aside>

        <main className="hc-main">
          {activeTab === 'home' ? (
            <>
              {/* Hero Welcome */}
              <section className="hc-hero">
                <div className="hc-hero__text">
                  <p className="hc-hero__greeting">Hola,</p>
                  <h1 className="hc-hero__name">{user?.name?.split(' ')[0]}! 👋</h1>
                  <p className="hc-hero__sub">Això és el teu resum d'avui</p>
                </div>
                <div className="hc-hero__orbs">
                  <div className="hc-orb hc-orb--1" />
                  <div className="hc-orb hc-orb--2" />
                </div>
              </section>

              {/* Stats Row */}
              <section className="hc-stats">
                <div className="hc-stat-card hc-stat-card--points">
                  <div className="hc-stat-card__icon"><Coins size={22} /></div>
                  <div className="hc-stat-card__info">
                    <span className="hc-stat-card__value">{totalPoints.toLocaleString()}</span>
                    <span className="hc-stat-card__label">Punts totals</span>
                  </div>
                </div>
                <div className="hc-stat-card hc-stat-card--visits">
                  <div className="hc-stat-card__icon"><Clock size={22} /></div>
                  <div className="hc-stat-card__info">
                    <span className="hc-stat-card__value">{Array.isArray(visits) ? visits.length : 0}</span>
                    <span className="hc-stat-card__label">Visites</span>
                  </div>
                </div>
                <div className="hc-stat-card hc-stat-card--badges">
                  <div className="hc-stat-card__icon"><Trophy size={22} /></div>
                  <div className="hc-stat-card__info">
                    <span className="hc-stat-card__value">{Array.isArray(badges) ? badges.length : 0}</span>
                    <span className="hc-stat-card__label">Badges</span>
                  </div>
                </div>
                <div className="hc-stat-card hc-stat-card--favs">
                  <div className="hc-stat-card__icon"><Heart size={22} /></div>
                  <div className="hc-stat-card__info">
                    <span className="hc-stat-card__value">{displayFavorites.length}</span>
                    <span className="hc-stat-card__label">Favorits</span>
                  </div>
                </div>
              </section>

              {/* Favoritos */}
              <section className="hc-section">
                <div className="hc-section__head">
                  <h2 className="hc-section__title"><Heart size={18} /> Els teus favorits</h2>
                </div>
                {displayFavorites.length > 0 ? (
                  <div className="hc-cards hc-cards--favs">
                    {displayFavorites.map((r, i) => (
                      <RestaurantCard key={i} restaurant={r} />
                    ))}
                  </div>
                ) : (
                  <div className="hc-empty">No tens restaurants favorits encara.</div>
                )}
              </section>

              {/* Badges */}
              {Array.isArray(badges) && badges.length > 0 && (
                <section className="hc-section">
                  <div className="hc-section__head">
                    <h2 className="hc-section__title"><Trophy size={18} /> Els teus logros</h2>
                  </div>
                  <div className="hc-badges-row">
                    {badges.map((b, i) => (
                      <div key={i} className="hc-badge-card">
                        <div className="hc-badge-card__icon">{b.icon || '🏆'}</div>
                        <div className="hc-badge-card__info">
                          <p>{b.title || `Badge ${i + 1}`}</p>
                          <span>{b.subtitle || 'Objectiu completat'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Objetivos */}
              <section className="hc-section">
                <div className="hc-section__head">
                  <h2 className="hc-section__title"><Clock size={18} /> Objectius per aconseguir</h2>
                </div>
                <div className="hc-objectives">
                  <div className="hc-objective-card">
                    <div className="hc-objective-card__header">
                      <p>Visita 10 restaurants diferents</p>
                      <span>{uniqueRestaurantsVisited} / 10</span>
                    </div>
                    <div className="hc-progress-bar">
                      <div className="hc-progress-bar__fill" style={{ width: `${objective1Progress}%` }} />
                    </div>
                    <small>Progreso: {objective1Progress}%</small>
                  </div>
                  <div className="hc-objective-card">
                    <div className="hc-objective-card__header">
                      <p>Acumula 2000 punts totals</p>
                      <span>{totalPoints} / 2000</span>
                    </div>
                    <div className="hc-progress-bar">
                      <div className="hc-progress-bar__fill" style={{ width: `${objective2Progress}%` }} />
                    </div>
                    <small>Progreso: {objective2Progress}%</small>
                  </div>
                  <div className="hc-objective-card">
                    <div className="hc-objective-card__header">
                      <p>Aconsegueix nivell 10 en un restaurant</p>
                      <span>{Math.min(Array.isArray(visits) ? visits.length : 0, 10)} / 10</span>
                    </div>
                    <div className="hc-progress-bar">
                      <div className="hc-progress-bar__fill" style={{ width: `${objective3Progress}%` }} />
                    </div>
                    <small>Progreso: {objective3Progress}%</small>
                  </div>
                </div>
              </section>
            </>
          ) : activeTab === 'profile' ? (
            <section className="hc-section">
              <div className="hc-section__head" style={{ marginBottom: '1rem' }}>
                <h2 className="hc-section__title" style={{ fontSize: '1.5rem' }}>
                  <User size={22} className="text-orange" />
                  La teva informació
                </h2>
              </div>
              <div className="auth-card" style={{ maxWidth: '600px', width: '100%', boxSizing: 'border-box', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '24px', padding: '2rem' }}>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Edita els detalls del teu compte
                </p>
                <form onSubmit={handleSubmitProfile} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          ) : (
            <section className="hc-section hc-tab-panel">
              <div className="hc-tab-panel__hero">
                <div>
                  <p className="hc-tab-panel__label">
                    {activeTab === 'discover' ? 'Descobrir' : activeTab === 'qr' ? 'El meu QR' : 'Recompenses'}
                  </p>
                  <h2>
                    {activeTab === 'discover' ? 'Descobreix nous restaurants i ofertes' : activeTab === 'qr' ? 'El teu QR està preparat' : 'Les teves recompenses'}
                  </h2>
                  <p className="hc-tab-panel__text">Aquí podràs accedir ràpidament a la funcionalitat corresponent.</p>
                </div>
                <div className="hc-tab-panel__icon">
                  {activeTab === 'discover' && <Compass size={32} />}
                  {activeTab === 'qr' && <QrCode size={32} />}
                  {activeTab === 'rewards' && <Gift size={32} />}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant: r }: { restaurant: any }) {
  const img = r?.profile?.image?.[0] || r?.image?.[0];
  const distance = r?.profile?.distance || r?.profile?.location?.distance || '—';
  const visitsCount = r?.profile?.visits ?? r?.visits ?? 0;
  const rating = r?.profile?.globalRating ? Number(r.profile.globalRating).toFixed(1) : null;

  return (
    <div className="hc-res-card">
      <div className="hc-res-card__img">
        {img
          ? <img src={img} alt={r?.profile?.name || r?.name} onError={e => { (e.target as any).style.display = 'none'; ((e.target as any).nextSibling as any).style.display = 'flex'; }} />
          : null}
        <div className="hc-res-card__img--placeholder" style={{ display: img ? 'none' : 'flex' }}>🍽️</div>
        {rating && (
          <div className="hc-res-card__rating">
            <Star size={12} fill="currentColor" />
            {rating}
          </div>
        )}
      </div>
      <div className="hc-res-card__body">
        <p className="hc-res-card__name">{r?.profile?.name || r?.name}</p>
        {(r?.profile?.description || r?.description) && <p className="hc-res-card__desc">{r?.profile?.description || r?.description}</p>}
        <div className="hc-res-card__meta">
          {(r?.profile?.location?.city || r?.location?.city) && (
            <span>
              <MapPin size={12} /> {r?.profile?.location?.city || r?.location?.city}
            </span>
          )}
          {distance && distance !== '—' && (
            <span className="meta-dist">
              <MapPin size={12} /> {distance}
            </span>
          )}
          <span>
            <Clock size={12} /> {visitsCount} visites
          </span>
        </div>
      </div>
    </div>
  );
}
