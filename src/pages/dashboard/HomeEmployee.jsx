import { useState, useEffect } from 'react';
import { Briefcase, LogOut, User, Store, PlusCircle, Award, List, Settings, QrCode, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:1337';

export default function HomeEmployee() {
  const { user, logout, role, token } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwner = role === 'owner';

  useEffect(() => {
    async function fetchData() {
      if (!user.restaurant_id) {
        setLoading(false);
        return;
      }
      try {
        const [resRes, visRes] = await Promise.all([
          fetch(`${API_BASE}/restaurants/${user.restaurant_id}`),
          fetch(`${API_BASE}/visits?restaurant_id=${user.restaurant_id}`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
          })
        ]);

        if (resRes.ok) setRestaurant(await resRes.json());
        if (visRes.ok) {
          const visData = await visRes.json();
          // Sort by date desc and take top 5
          setVisits(visData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching employee dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.restaurant_id, token]);

  return (
    <div className="dashboard-page dash-employee">
      {/* Header */}
      <header className="dash-header glass-card">
        <div className="dash-header__content">
          <div className="dash-header__left">
            <div className="brand brand--sm">
              <div className="brand-icon">🍽️</div>
              <span className="brand-name">EasyEat <span className="badge badge--brand">{role.toUpperCase()}</span></span>
            </div>
          </div>
          <div className="dash-header__right">
            <div className="user-pill glass-card">
              <Briefcase size={16} />
              <span>{user.name}</span>
            </div>
            <button onClick={logout} className="btn-icon">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="dash-content container">
        <div className="employee-layout">
          {/* Main Panel */}
          <div className="employee-main">
            <section className="welcome-banner glass-card">
              <div className="welcome-banner__text">
                <h1>Hola, {user?.name?.split(' ')[0] || 'Bienvenido'} 🛠️</h1>
                <p>Gestionando el restaurante: <strong>{restaurant?.profile?.name || 'Cargando...'}</strong></p>
                {restaurant?.profile?.location?.address && <p className="res-loc">📍 {restaurant.profile.location.address}</p>}
              </div>
            </section>

            {/* Quick Actions (All employees) */}
            <section className="section">
              <h2 className="section-title">Acciones rápidas</h2>
              <div className="action-grid">
                <button className="action-card glass-card">
                  <div className="action-icon action-icon--plus"><PlusCircle /></div>
                  <span>Registrar Visita</span>
                </button>
                <button className="action-card glass-card">
                  <div className="action-icon action-icon--award"><Award /></div>
                  <span>Canjear Puntos</span>
                </button>
                <button className="action-card glass-card">
                  <div className="action-icon action-icon--qr"><QrCode /></div>
                  <span>Escanear QR</span>
                </button>
              </div>
            </section>

            {/* Recent Activity List */}
            <section className="section recent-activity">
              <div className="section-header">
                <h2 className="section-title"><Clock size={20} /> Visitas recientes</h2>
                <button className="btn-text">Historial completo <ChevronRight size={16} /></button>
              </div>
              <div className="activity-list glass-card">
                {visits.length > 0 ? (
                  visits.map(visit => (
                    <div key={visit._id} className="activity-item">
                      <div className="activity-avatar">
                        {visit.customer_name?.[0] || 'U'}
                      </div>
                      <div className="activity-info">
                        <p className="activity-user">{visit.customer_name || 'Cliente'}</p>
                        <p className="activity-time">{new Date(visit.date).toLocaleString()}</p>
                      </div>
                      <div className="activity-amount">
                        <span className="pts">+{visit.pointsEarned} pts</span>
                        <span className="price">{visit.billAmount}€</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-activity">No hay visitas registradas recientemente.</p>
                )}
              </div>
            </section>

            {/* Management Section (Owner Only) */}
            {isOwner && (
              <section className="section">
                <h2 className="section-title">Gestión de Negocio</h2>
                <div className="management-grid">
                  <div className="management-item glass-card">
                    <Store size={24} />
                    <div className="management-text">
                      <h3>Información del Local</h3>
                      <p>Edita detalles, horarios y fotos</p>
                    </div>
                  </div>
                  <div className="management-item glass-card">
                    <List size={24} />
                    <div className="management-text">
                      <h3>Recompensas Activas</h3>
                      <p>Gestiona el catálogo de puntos</p>
                    </div>
                  </div>
                  <div className="management-item glass-card">
                    <Settings size={24} />
                    <div className="management-text">
                      <h3>Ajustes de Cuenta</h3>
                      <p>Configuración y equipo</p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Stats Sidebar */}
          <aside className="employee-sidebar">
            <div className="stats-card glass-card">
              <h3>Visitas Totales</h3>
              <div className="stat-big">{visits.length}</div>
              <p className="stat-trend trend-up">Filtro: Este restaurante</p>
            </div>
            <div className="stats-card glass-card">
              <h3>Recompensas</h3>
              <div className="stat-big">{restaurant?.rewards?.length || 0}</div>
              <p className="stat-trend">Catálogo activo</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
