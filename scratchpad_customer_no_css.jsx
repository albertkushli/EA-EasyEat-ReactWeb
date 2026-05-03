import { useState, useEffect } from 'react';
import { LogOut, User, MapPin, Star, Coins, Trophy, Heart, Clock, ChevronRight, Home, Compass, Gift, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

const DEFAULT_META = { total: 0, page: 1, limit: 1, totalPages: 1 };

const DEFAULT_FAVORITE_RESTAURANTS = [
  {
    profile: {
      name: 'Sukashi',
      description: 'Sushi Japon├¿s',
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
        <p>Cargando tu experienciaÔÇª</p>
      </div>
    );
  }

  return (
    <div className="hc-page">
      <div className="hc-layout">
        <aside className="hc-sidebar">
          <div className="hc-sidebar__brand">
            <div className="hc-sidebar__logo">­ƒì¢´©Å</div>
            <div>
              <p className="hc-sidebar__title">EasyEat</p>
              <p className="hc-sidebar__subtitle">Tu experiencia gastron├│mica</p>
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
            {/* ÔöÇÔöÇ Hero Welcome ÔöÇÔöÇ */}
            <section className="hc-hero">
              <div className="hc-hero__text">
            <p className="hc-hero__greeting">Hola,</p>
            <h1 className="hc-hero__name">{user?.name?.split(' ')[0]}! ­ƒæï</h1>
            <p className="hc-hero__sub">Aix├▓ ├®s el teu resum d'avui</p>
          </div>
          <div className="hc-hero__orbs">
            <div className="hc-orb hc-orb--1" />
            <div className="hc-orb hc-orb--2" />
          </div>
        </section>

        {/* ÔöÇÔöÇ Stats Row ÔöÇÔöÇ */}
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


        {/* ÔöÇÔöÇ Favoritos ÔöÇÔöÇ */}
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

        {/* ÔöÇÔöÇ Badges ÔöÇÔöÇ */}
        {Array.isArray(badges) && badges.length > 0 && (
          <section className="hc-section">
            <div className="hc-section__head">
              <h2 className="hc-section__title"><Trophy size={18} /> Els teus logros</h2>
            </div>
            <div className="hc-badges-row">
              {badges.map((b, i) => (
                <div key={i} className="hc-badge-card">
                  <div className="hc-badge-card__icon">{b.icon || '­ƒÅà'}</div>
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
                <h2>{activeTab === 'discover' ? 'Descobreix nous restaurants i ofertes' : activeTab === 'qr' ? 'El teu QR est├á preparat' : activeTab === 'rewards' ? 'Les teves recompenses' : 'La teva informaci├│'}</h2>
                <p className="hc-tab-panel__text">Aqu├¡ podr├ás accedir r├ápidament a la funcionalitat corresponent des del men├║ inferior.</p>
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

      
    </div>
  );
}

function RestaurantCard({ restaurant: r }) {
  const img = r?.profile?.image?.[0];
  const distance = r?.profile?.distance || r?.profile?.location?.distance || 'ÔÇö';
  const visitsCount = r?.profile?.visits ?? r?.visits ?? 0;
  const rating = r?.profile?.globalRating ? Number(r.profile.globalRating).toFixed(1) : null;

  return (
    <div className="hc-res-card">
      <div className="hc-res-card__img">
        {img
          ? <img src={img} alt={r?.profile?.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          : null}
        <div className="hc-res-card__img--placeholder" style={{ display: img ? 'none' : 'flex' }}>­ƒì┤</div>
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


