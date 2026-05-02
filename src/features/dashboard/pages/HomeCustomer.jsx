import { useState, useEffect } from 'react';
import { LogOut, User, MapPin, Star, Coins, Trophy, Heart, Clock, ChevronRight, Home, Compass, Gift, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

const DEFAULT_META = { total: 0, page: 1, limit: 1, totalPages: 1 };

const DEFAULT_FAVORITE_RESTAURANTS = [
  {
    profile: {
      name: 'Sukashi',
      description: 'Sushi Japonès',
      location: { city: 'Barcelona' },
      image: ['https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80&w=400'],
      globalRating: 4.8,
      distance: '0.5 km',
      visits: 28,
    }
  },
  {
    profile: {
      name: 'La Trattoria',
      description: 'Pasta Italiana',
      location: { city: 'Barcelona' },
      image: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400'],
      globalRating: 4.9,
      distance: '2.0 km',
      visits: 18,
    }
  },
  {
    profile: {
      name: 'Bella Napoli',
      description: 'Pizza Italiana',
      location: { city: 'Barcelona' },
      image: ['https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&q=80&w=400'],
      globalRating: 4.6,
      distance: '1.2 km',
      visits: 12,
    }
  }
];

function parsePaginatedListResponse(payload, fallbackLimit = 10) {
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
  const { user, logout, token } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsMeta, setRestaurantsMeta] = useState(DEFAULT_META);
  const [restaurantsPage, setRestaurantsPage] = useState(1);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [pointsWallet, setPointsWallet] = useState([]);
  const [badges, setBadges] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Ensure pointsWallet is an array before reducing
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
    : DEFAULT_FAVORITE_RESTAURANTS;

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const restaurantLimit = 6;
        const res = await apiClient.get('/restaurants', { params: { page: restaurantsPage, limit: restaurantLimit } });
        if (res.status === 200 && res.data) {
          const parsedRestaurants = parsePaginatedListResponse(res.data, restaurantLimit);
          setRestaurants(parsedRestaurants.data);
          setRestaurantsMeta(parsedRestaurants.meta);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      } finally {
        setLoadingRestaurants(false);
      }
    }
    fetchRestaurants();
  }, [restaurantsPage]);

  useEffect(() => {
    async function fetchCustomerData() {
      if (!token || !user?.id) {
        setLoadingCustomerData(false);
        return;
      }
      try {
        const [favRes, ptsRes, badgesRes, visitsRes] = await Promise.allSettled([
          apiClient.get(`/customers/${user.id}/favouriteRestaurants`, { params: { page: 1, limit: 10 } }),
          apiClient.get(`/customers/${user.id}/pointsWallet`, { params: { page: 1, limit: 20 } }),
          apiClient.get(`/customers/${user.id}/badges`, { params: { page: 1, limit: 10 } }),
          apiClient.get(`/customers/${user.id}/visits`, { params: { page: 1, limit: 20 } }),
        ]);

        if (favRes.status === 'fulfilled' && favRes.value.data) {
          const parsedFavorites = parsePaginatedListResponse(favRes.value.data, 10);
          setFavoriteRestaurants(parsedFavorites.data);
        }
        if (ptsRes.status === 'fulfilled' && ptsRes.value.data) {
          const parsedPoints = parsePaginatedListResponse(ptsRes.value.data, 20);
          setPointsWallet(parsedPoints.data);
        }
        if (badgesRes.status === 'fulfilled' && badgesRes.value.data) {
          const parsedBadges = parsePaginatedListResponse(badgesRes.value.data, 10);
          setBadges(parsedBadges.data);
        }
        if (visitsRes.status === 'fulfilled' && visitsRes.value.data) {
          const parsedVisits = parsePaginatedListResponse(visitsRes.value.data, 20);
          setVisits(parsedVisits.data);
        }
      } catch (err) {
        console.error('Error fetching customer data:', err);
      } finally {
        setLoadingCustomerData(false);
      }
    }
    fetchCustomerData();
  }, [token, user?.id]);

  const loading = loadingRestaurants || loadingCustomerData;

  if (loading) {
    return (
      <div className="hc-loading">
        <div className="hc-loading__spinner" />
        <p>Cargando tu experiencia…</p>
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
            {/* ── Hero Welcome ── */}
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

        {/* ── Stats Row ── */}
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


        {/* ── Favoritos ── */}
        <section className="hc-section">
          <div className="hc-section__head">
            <h2 className="hc-section__title"><Heart size={18} /> Els teus favorits</h2>
          </div>
          <div className="hc-cards hc-cards--favs">
            {displayFavorites.map((r, i) => (
              <RestaurantCard key={i} restaurant={r} featured />
            ))}
          </div>
        </section>

        {/* ── Badges ── */}
        {Array.isArray(badges) && badges.length > 0 && (
          <section className="hc-section">
            <div className="hc-section__head">
              <h2 className="hc-section__title"><Trophy size={18} /> Els teus logros</h2>
            </div>
            <div className="hc-badges-row">
              {badges.map((b, i) => (
                <div key={i} className="hc-badge-card">
                  <div className="hc-badge-card__icon">{b.icon || '🏅'}</div>
                  <div className="hc-badge-card__info">
                    <p>{b.title || `Badge ${i + 1}`}</p>
                    <span>{b.subtitle || 'Objectiu completat'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
        ) : (
          <section className="hc-section hc-tab-panel">
            <div className="hc-tab-panel__hero">
              <div>
                <p className="hc-tab-panel__label">{activeTab === 'discover' ? 'Descobrir' : activeTab === 'qr' ? 'El meu QR' : activeTab === 'rewards' ? 'Recompenses' : 'Perfil'}</p>
                <h2>{activeTab === 'discover' ? 'Descobreix nous restaurants i ofertes' : activeTab === 'qr' ? 'El teu QR està preparat' : activeTab === 'rewards' ? 'Les teves recompenses' : 'La teva informació'}</h2>
                <p className="hc-tab-panel__text">Aquí podràs accedir ràpidament a la funcionalitat corresponent des del menú inferior.</p>
              </div>
              <div className="hc-tab-panel__icon">
                {activeTab === 'discover' && <Compass size={32} />}
                {activeTab === 'qr' && <QrCode size={32} />}
                {activeTab === 'rewards' && <Gift size={32} />}
                {activeTab === 'profile' && <User size={32} />}
              </div>
            </div>
          </section>
        )}

      </main>

      </div>

      <style>{`
        /* ── Page ── */
        .hc-page {
          min-height: 100vh;
          background: #f6f8fb;
          color: #111827;
          font-family: var(--font);
          overflow-x: hidden;
        }

        .hc-main {
          max-width: 100%;
          width: 100%;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          background: #ffffff;
          border-radius: 32px;
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.05);
        }

        .hc-hero {
          position: relative;
          padding: 2.5rem;
          background: linear-gradient(135deg, hsla(26,95%,55%,0.12) 0%, hsla(142,71%,45%,0.06) 100%);
          border: 1px solid hsla(26,95%,55%,0.2);
          border-radius: 20px;
          overflow: hidden;
        }

        .hc-layout {
          display: flex;
          min-height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
          gap: 1.75rem;
          padding: 2rem 1.5rem;
        }

        .hc-sidebar {
          flex: 0 0 280px;
          position: sticky;
          top: 2rem;
          align-self: flex-start;
          min-height: calc(100vh - 4rem);
          padding: 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          background: linear-gradient(180deg, #08182f 0%, #0e2743 100%);
          border-radius: 32px;
          color: #ffffff;
        }

        .hc-sidebar__brand {
          display: flex;
          gap: 0.85rem;
          align-items: center;
          padding: 0.9rem 0.85rem;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .hc-sidebar__logo {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.08);
          font-size: 1.2rem;
        }

        .hc-sidebar__title {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
        }

        .hc-sidebar__subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.7);
        }

        .hc-sidebar-nav {
          display: grid;
          gap: 0.5rem;
        }

        .hc-sidebar-nav__item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.9rem;
          padding: 0.95rem 1rem;
          border-radius: 16px;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(255,255,255,0.78);
          font-size: 0.95rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hc-sidebar-nav__item:hover {
          background: rgba(255,255,255,0.08);
          color: #ffffff;
        }

        .hc-sidebar-nav__item.active {
          color: #ffffff;
          background: linear-gradient(135deg, #f97316 0%, #fb7f2e 100%);
          box-shadow: 0 18px 38px rgba(249,115,22,0.18);
          border-color: rgba(255,255,255,0.12);
        }

        .hc-sidebar-nav__item svg {
          min-width: 20px;
        }

        .hc-sidebar-footer {
          margin-top: auto;
          padding: 1rem 0.8rem;
          border-radius: 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .hc-sidebar-user {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .hc-sidebar-user-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #f97316, #fb7f2e);
          font-weight: 700;
          color: #0b1220;
        }

        .hc-sidebar-user p {
          margin: 0;
          font-weight: 700;
          color: #ffffff;
        }

        .hc-sidebar-user span {
          display: block;
          margin-top: 0.25rem;
          color: rgba(255,255,255,0.68);
          font-size: 0.82rem;
        }

        .hc-sidebar-logout {
          width: 100%;
          border: none;
          color: #ffffff;
          background: rgba(255,255,255,0.08);
          padding: 0.85rem 1rem;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 700;
        }

        .hc-sidebar-logout:hover {
          background: rgba(255,255,255,0.12);
        }

        /* ── Loading ── */
        .hc-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: var(--clr-text-muted);
        }
        .hc-loading__spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--clr-border);
          border-top-color: var(--clr-primary);
          border-radius: 50%;
          animation: hc-spin 0.8s linear infinite;
        }
        @keyframes hc-spin { to { transform: rotate(360deg); } }

        /* ── Header ── */
        .hc-header {
          position: sticky; top: 0; z-index: 100;
          background: hsla(220,20%,6%,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
        }
        .hc-header__inner {
          max-width: 1200px; margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .hc-brand { display: flex; align-items: center; gap: 0.5rem; }
        .hc-brand__icon { font-size: 1.4rem; }
        .hc-brand__name { font-size: 1.1rem; font-weight: 700; color: var(--clr-primary); }
        .hc-header__right { display: flex; align-items: center; gap: 0.75rem; }
        .hc-user-pill {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 999px;
          font-size: 0.875rem; font-weight: 500;
        }
        .hc-user-avatar {
          width: 26px; height: 26px;
          background: var(--grad-brand);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 800; color: #000;
        }
        .hc-logout-btn {
          width: 36px; height: 36px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          color: var(--clr-text-muted);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .hc-logout-btn:hover { color: hsl(0,80%,65%); border-color: hsla(0,80%,50%,0.4); background: hsla(0,80%,50%,0.08); }

        /* ── Main ── */
        .hc-main {
          max-width: 100%;
          width: 100%;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          background: #ffffff;
          border-radius: 32px;
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.05);
        }

        /* ── Hero ── */
        .hc-hero {
          position: relative;
          padding: 2.5rem;
          background: linear-gradient(135deg, hsla(26,95%,55%,0.12) 0%, hsla(142,71%,45%,0.06) 100%);
          border: 1px solid hsla(26,95%,55%,0.2);
          border-radius: 20px;
          overflow: hidden;
        }
        .hc-hero__text { position: relative; z-index: 1; }
        .hc-hero__greeting { font-size: 0.875rem; color: var(--clr-primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
        .hc-hero__name { font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 800; margin: 0.2rem 0 0.5rem; }
        .hc-hero__sub { font-size: 0.95rem; color: var(--clr-text-muted); }
        .hc-hero__orbs { position: absolute; inset: 0; pointer-events: none; }
        .hc-orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); opacity: 0.3;
        }
        .hc-orb--1 { width: 200px; height: 200px; background: var(--clr-primary); top: -60px; right: -40px; }
        .hc-orb--2 { width: 140px; height: 140px; background: var(--clr-accent); bottom: -40px; right: 80px; }

        /* ── Stats ── */
        .hc-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 640px) { .hc-stats { grid-template-columns: repeat(4, 1fr); } }

        .hc-stat-card {
          padding: 1.25rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; gap: 0.85rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hc-stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .hc-stat-card__icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .hc-stat-card--points .hc-stat-card__icon { background: hsla(26,95%,55%,0.15); color: var(--clr-primary); }
        .hc-stat-card--visits .hc-stat-card__icon { background: hsla(0,80%,60%,0.12); color: hsl(0,80%,65%); }
        .hc-stat-card--badges .hc-stat-card__icon { background: hsla(48,96%,53%,0.12); color: hsl(48,96%,60%); }
        .hc-stat-card--favs .hc-stat-card__icon { background: hsla(340,80%,60%,0.12); color: hsl(340,80%,65%); }
        .hc-stat-card__value { display: block; font-size: 1.5rem; font-weight: 800; line-height: 1; }
        .hc-stat-card__label { display: block; font-size: 0.75rem; color: var(--clr-text-muted); margin-top: 3px; }

        .hc-tab-panel {
          min-height: calc(100vh - 5.5rem);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem 8rem;
        }
        .hc-tab-panel__hero {
          width: 100%;
          max-width: 640px;
          padding: 2rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          backdrop-filter: blur(22px);
          text-align: left;
        }
        .hc-tab-panel__label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--clr-primary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
          display: inline-flex;
        }
        .hc-tab-panel__hero h2 {
          margin: 0 0 0.75rem;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
        }
        .hc-tab-panel__text {
          color: var(--clr-text-muted);
          font-size: 0.95rem;
          line-height: 1.8;
          max-width: 36rem;
        }
        .hc-tab-panel__icon {
          margin-top: 1.75rem;
          width: 72px;
          height: 72px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--clr-primary);
        }

        /* ── Section ── */
        .hc-section { display: flex; flex-direction: column; gap: 1rem; }
        .hc-section__head { display: flex; align-items: center; justify-content: space-between; }
        .hc-section__title {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 1.1rem; font-weight: 700;
        }
        .hc-section__count { font-size: 0.8rem; color: var(--clr-text-muted); }

        /* ── Restaurant Cards ── */
        .hc-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }
        .hc-cards--favs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .hc-res-card {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 1rem;
          align-items: center;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .hc-res-card:hover { transform: translateY(-4px); box-shadow: 0 22px 40px rgba(15, 23, 42, 0.12); }
        .hc-res-card__img {
          width: 120px;
          height: 120px;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          display: grid;
          place-items: center;
          background: #f8fafc;
        }
        .hc-res-card__img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hc-res-card__img--placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          background: linear-gradient(135deg, #eef2ff, #e2e8f0);
        }
        .hc-res-card__rating {
          position: absolute;
          right: 10px;
          bottom: 10px;
          background: rgba(15, 23, 42, 0.85);
          color: #ffffff;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .hc-res-card__body {
          padding: 1.2rem 1rem 1.2rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .hc-res-card__name {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
          color: #111827;
        }
        .hc-res-card__desc {
          margin: 0;
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
        }
        .hc-res-card__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.9rem;
          color: #64748b;
          font-size: 0.84rem;
          margin-top: auto;
        }
        .hc-res-card__meta span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .hc-res-card__meta .meta-dist {
          color: #0f172a;
          font-weight: 600;
        }

        /* ── Visits ── */
        .hc-visits {
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          overflow: hidden;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
        }
        .hc-visit-item {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--glass-border);
          transition: background 0.2s;
        }
        .hc-visit-item:last-child { border-bottom: none; }
        .hc-visit-item:hover { background: hsla(255,255,255,0.03); }
        .hc-visit-item__dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--clr-accent); flex-shrink: 0;
        }
        .hc-visit-item__info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .hc-visit-item__name { font-size: 0.9rem; font-weight: 600; }
        .hc-visit-item__date { font-size: 0.75rem; color: var(--clr-text-muted); }
        .hc-visit-item__pts { font-size: 0.8rem; font-weight: 700; color: var(--clr-accent); }
        .hc-visit-item__arrow { color: var(--clr-text-muted); }

        /* ── Badges ── */
        .hc-badges {
          display: flex; flex-wrap: wrap; gap: 0.75rem;
        }
        .hc-badge {
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          padding: 1rem 1.25rem;
          border-radius: 14px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          transition: transform 0.2s, border-color 0.2s;
          min-width: 80px;
        }
        .hc-badge:hover { transform: translateY(-3px); border-color: hsl(48,96%,53%); }
        .hc-badge__icon { font-size: 2rem; }
        .hc-badge__name { font-size: 0.7rem; color: var(--clr-text-muted); text-align: center; font-weight: 600; }

        .hc-badges-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }

        .hc-badge-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 1.15rem 1rem;
          border-radius: 18px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          min-height: 90px;
        }

        .hc-badge-card__icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #f97316 0%, #fb7f2e 100%);
          color: #fff;
          font-size: 1.35rem;
        }

        .hc-badge-card__info p {
          margin: 0;
          font-weight: 700;
          color: var(--clr-text);
          font-size: 0.95rem;
        }

        .hc-badge-card__info span {
          display: block;
          margin-top: 0.25rem;
          color: var(--clr-text-muted);
          font-size: 0.82rem;
        }

        .hc-objectives {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }

        .hc-objective-card {
          padding: 1.15rem 1.2rem;
          border-radius: 18px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .hc-objective-card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .hc-objective-card__header p {
          margin: 0;
          font-weight: 700;
          color: var(--clr-text);
          font-size: 0.95rem;
        }

        .hc-objective-card__header span {
          color: var(--clr-text-muted);
          font-size: 0.82rem;
        }

        .hc-progress-bar {
          width: 100%;
          height: 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          overflow: hidden;
        }

        .hc-progress-bar__fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%);
          box-shadow: 0 8px 24px rgba(56,189,248,0.18);
        }

        .hc-objective-card small {
          color: var(--clr-text-muted);
          font-size: 0.82rem;
        }

        /* ── Empty ── */
        .hc-empty {
          padding: 2.5rem;
          text-align: center;
          color: var(--clr-text-muted);
          border: 1px dashed var(--clr-border);
          border-radius: 16px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

function RestaurantCard({ restaurant: r }) {
  const img = r?.profile?.image?.[0];
  const distance = r?.profile?.distance || r?.profile?.location?.distance || '—';
  const visitsCount = r?.profile?.visits ?? r?.visits ?? 0;
  const rating = r?.profile?.globalRating ? Number(r.profile.globalRating).toFixed(1) : null;

  return (
    <div className="hc-res-card">
      <div className="hc-res-card__img">
        {img
          ? <img src={img} alt={r?.profile?.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          : null}
        <div className="hc-res-card__img--placeholder" style={{ display: img ? 'none' : 'flex' }}>🍴</div>
        {rating && (
          <div className="hc-res-card__rating">
            <Star size={12} fill="currentColor" />
            {rating}
          </div>
        )}
      </div>
      <div className="hc-res-card__body">
        <p className="hc-res-card__name">{r?.profile?.name}</p>
        {r?.profile?.description && <p className="hc-res-card__desc">{r.profile.description}</p>}
        <div className="hc-res-card__meta">
          {r?.profile?.location?.city && (
            <span>
              <MapPin size={12} /> {r.profile.location.city}
            </span>
          )}
          {distance && (
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

