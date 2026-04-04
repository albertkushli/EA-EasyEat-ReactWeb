import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Star, Utensils, Award } from 'lucide-react';

export default function Dashboard() {
  const { auth, logout } = useAuth();

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 'var(--sp-xl)' }}>
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div className="glass-card" style={{ padding: 'var(--sp-lg)', marginBottom: 'var(--sp-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="brand-name" style={{ fontSize: 'var(--text-xl)' }}>🍽️ EasyEat</div>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Bienvenido, <strong style={{ color: 'var(--clr-text)' }}>{auth?.user?.name}</strong>
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

        {/* Stats placeholder */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-md)' }}>
          {[
            { icon: Star,     label: 'Puntos',   value: '0',    color: 'var(--clr-primary)' },
            { icon: Utensils, label: 'Visitas',  value: '0',    color: 'var(--clr-accent)' },
            { icon: Award,    label: 'Insignias', value: '0',   color: 'var(--clr-blue)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card" style={{ padding: 'var(--sp-md)', textAlign: 'center' }}>
              <Icon size={28} color={color} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--clr-text-muted)', marginTop: 'var(--sp-lg)', fontSize: 'var(--text-sm)' }}>
          Dashboard en construcción · <Link to="/login" className="auth-link">Volver al login</Link>
        </p>
      </div>
    </div>
  );
}
