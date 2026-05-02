import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut, User, MapPin, Star, Search, Coins, Trophy, Heart, Clock, ChevronRight, Flame, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../lib/apiClient';
import { useTranslation } from 'react-i18next';

const DEFAULT_META = { total: 0, page: 1, limit: 1, totalPages: 1 };

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
  const { t, i18n } = useTranslation();
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
  const [search, setSearch] = useState('');

  // Ensure pointsWallet is an array before reducing
  const totalPoints = Array.isArray(pointsWallet)
    ? pointsWallet.reduce((sum, w) => sum + (w.points || 0), 0)
    : 0;

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

  const filtered = Array.isArray(restaurants) ? restaurants.filter(r =>
    r.profile?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.profile?.location?.city?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  if (loading) {
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
          <div className="hc-brand">
            <span className="hc-brand__icon">🍽️</span>
            <span className="hc-brand__name">{t("navbar.logo")}</span>
          </div>
          <div className="hc-header__right">
            <div className="hc-user-pill">
              <div className="hc-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name?.split(' ')[0]}</span>
            </div>
            <Link to='/dashboard/config' className='hc-settings-btn'><Settings size={18} /></Link>
            <button onClick={logout} className="hc-logout-btn" title={t("navbar.links.logout")}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="hc-main">

        {/* ── Hero Welcome ── */}
        <section className="hc-hero">
          <div className="hc-hero__text">
            <p className="hc-hero__greeting">{t("dashboard.customer.welcome")}</p>
            <h1 className="hc-hero__name">{user?.name?.split(' ')[0]} 👋</h1>
            <p className="hc-hero__sub">{t("dashboard.customer.discover")}</p>
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
              <span className="hc-stat-card__label">{t("dashboard.customer.stats.totalPoints")}</span>
            </div>
          </div>
          <div className="hc-stat-card hc-stat-card--visits">
            <div className="hc-stat-card__icon"><Flame size={22} /></div>
            <div className="hc-stat-card__info">
              <span className="hc-stat-card__value">{Array.isArray(visits) ? visits.length : 0}</span>
              <span className="hc-stat-card__label">{t("dashboard.customer.stats.visits")}</span>
            </div>
          </div>
          <div className="hc-stat-card hc-stat-card--badges">
            <div className="hc-stat-card__icon"><Trophy size={22} /></div>
            <div className="hc-stat-card__info">
              <span className="hc-stat-card__value">{Array.isArray(badges) ? badges.length : 0}</span>
              <span className="hc-stat-card__label">{t("dashboard.customer.stats.badges")}</span>
            </div>
          </div>
          <div className="hc-stat-card hc-stat-card--favs">
            <div className="hc-stat-card__icon"><Heart size={22} /></div>
            <div className="hc-stat-card__info">
              <span className="hc-stat-card__value">{Array.isArray(favoriteRestaurants) ? favoriteRestaurants.length : 0}</span>
              <span className="hc-stat-card__label">{t("dashboard.customer.stats.favorites")}</span>
            </div>
          </div>
        </section>

        {/* ── Search ── */}
        <section className="hc-search-wrap">
          <div className="hc-search">
            <Search size={18} className="hc-search__icon" />
            <input
              className="hc-search__input"
              type="text"
              placeholder={t("dashboard.customer.searchPlaceholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </section>

        {/* ── Favoritos ── */}
        {Array.isArray(favoriteRestaurants) && favoriteRestaurants.length > 0 && (
          <section className="hc-section">
            <div className="hc-section__head">
              <h2 className="hc-section__title"><Heart size={18} /> {t("dashboard.customer.sections.favorites")}</h2>
            </div>
            <div className="hc-cards hc-cards--favs">
              {favoriteRestaurants.slice(0, 3).map((r, i) => (
                <RestaurantCard key={i} restaurant={r} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── Todos los restaurantes ── */}
        <section className="hc-section">
          <div className="hc-section__head">
            <h2 className="hc-section__title"><MapPin size={18} /> {t("dashboard.customer.sections.nearYou")}</h2>
            <span className="hc-section__count">{filtered.length} {t("dashboard.customer.results.onThisPage")} · {restaurantsMeta.total} {t("dashboard.customer.results.total")}</span>
          </div>
          {filtered.length > 0 ? (
            <div className="hc-cards">
              {filtered.map((r, i) => (
                <RestaurantCard key={i} restaurant={r} />
              ))}
            </div>
          ) : (
            <div className="hc-empty">
              <p>{t("dashboard.customer.results.noResults")} "<strong>{search}</strong>"</p>
            </div>
          )}
          <div className="hc-pagination">
            <button
              type="button"
              className="hc-pagination__btn"
              disabled={restaurantsMeta.page <= 1}
              onClick={() => setRestaurantsPage(prev => Math.max(1, prev - 1))}
            >
              {t("dashboard.customer.pagination.previous")}
            </button>
            <span className="hc-pagination__info">
              {t("dashboard.customer.pagination.page")} {restaurantsMeta.page} {t("dashboard.customer.pagination.of")} {restaurantsMeta.totalPages}
            </span>
            <button
              type="button"
              className="hc-pagination__btn"
              disabled={restaurantsMeta.page >= restaurantsMeta.totalPages}
              onClick={() => setRestaurantsPage(prev => Math.min(restaurantsMeta.totalPages, prev + 1))}
            >
              {t("dashboard.customer.pagination.next")}
            </button>
          </div>
        </section>

        {/* ── Visitas recientes ── */}
        {Array.isArray(visits) && visits.length > 0 && (
          <section className="hc-section">
            <div className="hc-section__head">
              <h2 className="hc-section__title"><Clock size={18} /> {t("dashboard.customer.sections.recentVisits")}</h2>
            </div>
            <div className="hc-visits">
              {visits.slice(0, 5).map((v, i) => (
                <div key={i} className="hc-visit-item">
                  <div className="hc-visit-item__dot" />
                  <div className="hc-visit-item__info">
                    <span className="hc-visit-item__name">{v.restaurant_id?.profile?.name || v.restaurant_name || t("dashboard.noRestaurantName")}</span>
                    <span className="hc-visit-item__date">{new Date(v.date || v.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {v.pointsEarned && (
                    <span className="hc-visit-item__pts">+{v.pointsEarned} pts</span>
                  )}
                  <ChevronRight size={16} className="hc-visit-item__arrow" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Badges ── */}
        {Array.isArray(badges) && badges.length > 0 && (
          <section className="hc-section">
            <div className="hc-section__head">
              <h2 className="hc-section__title"><Trophy size={18} /> {t("dashboard.customer.sections.achievements")}</h2>
            </div>
            <div className="hc-badges">
              {badges.map((b, i) => (
                <div key={i} className="hc-badge">
                  <div className="hc-badge__icon">{b.icon || '🏅'}</div>
                  <span className="hc-badge__name">{b.title || `${t("dashboard.customer.badge")} ${i + 1}`}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

function RestaurantCard({ restaurant: r }) {
  const img = r?.profile?.image?.[0];
  return (
    <div className="hc-res-card">
      <div className="hc-res-card__img">
        {img
          ? <img src={img} alt={r?.profile?.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          : null}
        <div className="hc-res-card__img--placeholder" style={{ display: img ? 'none' : 'flex' }}>🍴</div>
        {r?.profile?.globalRating && (
          <div className="hc-res-card__rating">
            <Star size={12} fill="currentColor" />
            {Number(r.profile.globalRating).toFixed(1)}
          </div>
        )}
      </div>
      <div className="hc-res-card__body">
        <p className="hc-res-card__name">{r?.profile?.name}</p>
        {r?.profile?.description && <p className="hc-res-card__desc">{r.profile.description}</p>}
        <div className="hc-res-card__meta">
          {r?.profile?.location?.city && (
            <span className="hc-res-card__tag">
              <MapPin size={12} />{r.profile.location.city}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
