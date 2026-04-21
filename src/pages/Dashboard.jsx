import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Utensils, Award } from 'lucide-react';
import RestaurantRatingCard from '../components/RestaurantRatingCard';

export default function Dashboard() {
  const { auth, logout } = useAuth();

  return (
    <div
      className="auth-page"
      style={{ alignItems: 'flex-start', paddingTop: 'var(--sp-xl)' }}
    >
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 600,
          margin: '0 auto',
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: 'var(--sp-lg)',
            marginBottom: 'var(--sp-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="brand-name" style={{ fontSize: 'var(--text-xl)' }}>
              🍽️ EasyEat
            </div>
            <p
              style={{
                color: 'var(--clr-text-muted)',
                fontSize: 'var(--text-sm)',
                marginTop: 4,
              }}
            >
              Bienvenido,{' '}
              <strong style={{ color: 'var(--clr-text)' }}>
                {auth?.user?.name}
              </strong>
            </p>
          </div>

          <button
            id="logout-btn"
            className="btn btn--ghost"
            onClick={logout}
            style={{ gap: '6px', padding: '10px 16px' }}
          >
            <LogOut size={16} /> Salir
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--sp-md)',
          }}
        >
          <RestaurantRatingCard rating={8.7} />

          <div
            className="glass-card"
            style={{ padding: 'var(--sp-md)', textAlign: 'center' }}
          >
            <Utensils
              size={28}
              color="var(--clr-accent)"
              style={{ marginBottom: 8 }}
            />
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--clr-accent)',
              }}
            >
              0
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--clr-text-muted)',
              }}
            >
              Visitas
            </div>
          </div>

          <div
            className="glass-card"
            style={{ padding: 'var(--sp-md)', textAlign: 'center' }}
          >
            <Award
              size={28}
              color="var(--clr-blue)"
              style={{ marginBottom: 8 }}
            />
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--clr-blue)',
              }}
            >
              0
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--clr-text-muted)',
              }}
            >
              Insignias
            </div>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--clr-text-muted)',
            marginTop: 'var(--sp-lg)',
            fontSize: 'var(--text-sm)',
          }}
        >
          Dashboard en construcción ·{' '}
          <Link to="/login" className="auth-link">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}