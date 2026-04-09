import { useState, useEffect } from 'react';
import { LogOut, User, Award, History, Heart, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RestaurantCard from '../../components/RestaurantCard';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export default function HomeCustomer() {
  const { user, logout, token } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [profile, setProfile] = useState(null);
  const [points, setPoints] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resRes, ptsRes, visRes, profRes] = await Promise.all([
          fetch(`${API_BASE}/restaurants`),
          fetch(`${API_BASE}/customers/${user.id}/pointsWallet`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/customers/${user.id}/visits`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/customers/${user.id}/full`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const [resData, ptsData, visData, profData] = await Promise.all([
          resRes.json(),
          ptsRes.json(),
          visRes.json(),
          profRes.json()
        ]);

        if (resRes.ok) setRestaurants(resData);
        if (profRes.ok) setProfile(profData);
        if (ptsRes.ok) {
          const total = ptsData.reduce((acc, curr) => acc + (curr.points || 0), 0);
          setPoints(total);
        }
        if (visRes.ok) setVisitCount(visData.length);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.id, token]);

  const favorites = restaurants.filter(r => 
    profile?.favoriteRestaurants?.some(fav => (fav._id || fav) === r._id)
  ).slice(0, 3);
  const others = restaurants.filter(r => 
    !profile?.favoriteRestaurants?.some(fav => (fav._id || fav) === r._id)
  );

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dash-header glass-card">
        <div className="dash-header__content">
          <div className="dash-header__left">
            <div className="brand brand--sm">
              <div className="brand-icon">🍽️</div>
              <span className="brand-name">EasyEat</span>
            </div>
          </div>
          <div className="dash-header__right">
            <div className="user-pill glass-card">
              <User size={16} />
              <span>{user.name}</span>
            </div>
            <button onClick={logout} className="btn-icon" title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="dash-content container">
        {/* Welcome Section */}
        <section className="welcome-banner glass-card">
          <div className="welcome-banner__text">
            <h1>¡Hola, {user?.name?.split(' ')[0] || 'Bienvenido'}! 👋</h1>
            <p>¿Qué te apetece comer hoy?</p>
          </div>
          <div className="welcome-banner__stats">
            <div className="stat-item">
              <Award size={20} className="stat-icon--gold" />
              <div>
                <span className="stat-value">{points.toLocaleString()}</span>
                <span className="stat-label">Puntos</span>
              </div>
            </div>
            <div className="stat-item">
              <History size={20} className="stat-icon--blue" />
              <div>
                <span className="stat-value">{visitCount}</span>
                <span className="stat-label">Visitas</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Favorite Section */}
        {favorites.length > 0 && (
          <section className="section featured-fav fade-in">
            <div className="section-header">
              <h2 className="section-title">
                <Heart size={20} fill="var(--clr-primary)" color="var(--clr-primary)" /> 
                Tu Restaurante Favorito
              </h2>
            </div>
            <div className="featured-card glass-card">
              <div className="featured-card__res">
                 <RestaurantCard restaurant={favorites[0]} variant="featured" />
              </div>
              <div className="featured-card__promo">
                <h3>Vuelve pronto a {favorites[0].name}</h3>
                <p>Tienes una recompensa esperándote a los 500 puntos.</p>
                <button className="btn btn--primary">Reservar mesa</button>
              </div>
            </div>
          </section>
        )}

        {/* Favorites Grid */}
        {favorites.length > 1 && (
          <section className="section section--favorites">
            <div className="section-header">
              <h2 className="section-title">Otros favoritos</h2>
              <button className="btn-text">Ver todos <ChevronRight size={16} /></button>
            </div>
            <div className="res-grid">
              {favorites.slice(1).map(res => <RestaurantCard key={res._id} restaurant={res} />)}
            </div>
          </section>
        )}

        {/* Explore Section */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Descubre más</h2>
            <button className="btn-text">Filtrar <ChevronRight size={16} /></button>
          </div>
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="skeleton-card glass-card" />
              ))}
            </div>
          ) : (
            <div className="res-grid">
              {others.slice(0, 6).map(res => (
                <RestaurantCard key={res._id} restaurant={res} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
