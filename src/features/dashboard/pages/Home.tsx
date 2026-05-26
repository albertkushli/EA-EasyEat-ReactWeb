import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '@/shared/components/Footer';
import LanguageDropdown from '@/shared/components/ui/LanguageDropdown';
import MapScreenPremium from '@/imports/MapScreenPremium';
import { useMapExperienceData } from '@/features/restaurants/hooks/useMapExperienceData';
import {
  BarChart3,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Gift,
  MapPin,
  Search,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();
  const { restaurants, loading, coords, handleRequestNearby } = useMapExperienceData();

  return (
    <div className="landing-page">
      <nav className="lp-nav">
        <Link to="/" className="lp-logo">
          <span style={{ fontSize: '1.5rem' }}>🍽️</span>
          <span>{t('navbar.logo')}</span>
        </Link>
        <div className="lp-nav-links">
          <a href="#demo" className="lp-link">{t('navbar.links.demo')}</a>
          <a href="#restaurantes" className="lp-link">{t('navbar.links.restaurants')}</a>
          <a href="#funciona" className="lp-link">{t('navbar.links.howItWorks')}</a>
          <LanguageDropdown />
          <Link to="/login" className="lp-btn-acceder">{t('navbar.links.access')}</Link>
        </div>
      </nav>

      <section className="lp-hero">
        <div className="hero-gradient-orb" />
        <div className="hero-gradient-orb hero-gradient-orb--2" />

        <div className="lp-hero-content">
          <p className="lp-hero-badge">{t('hero.badge')}</p>
          <h1 className="lp-hero-title">
            <span className="text-orange">{t('hero.title.win')}</span><br />
            <span className="text-green">{t('hero.title.eat')}</span><br />
            {t('hero.title.live')}
          </h1>
          <p className="lp-hero-subtitle">{t('hero.subtitle')}</p>

          <div className="lp-hero-ctas">
            <a href="#demo" className="lp-cta-btn lp-cta-btn--orange">
              {t('hero.ctas.customer')} <ChevronRight size={20} />
            </a>
            <Link to="/register" className="lp-cta-btn lp-cta-btn--green">
              {t('hero.ctas.restaurant')} <ChevronRight size={20} />
            </Link>
          </div>

          <Link to="/login" className="lp-hero-admin-link">
            {t('hero.ctas.admin')} <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="lp-proof-strip">
        <div className="lp-proof-item">
          <Zap size={16} /> {t('demo.benefits.fast')}
        </div>
        <div className="lp-proof-item">
          <MapPin size={16} /> {t('demo.benefits.visual')}
        </div>
        <div className="lp-proof-item">
          <CheckCircle size={16} /> {t('demo.benefits.decide')}
        </div>
      </section>

      <section className="lp-demo-section" id="demo">
        <div className="lp-demo-header">
          <p className="lp-demo-kicker">{t('demo.kicker')}</p>
          <h2 className="lp-demo-title">{t('demo.title')}</h2>
          <p className="lp-demo-subtitle">{t('demo.subtitle')}</p>
          <div className="lp-demo-ctas">
            <a href="#demo-map" className="lp-cta-btn lp-cta-btn--orange">
              {t('demo.ctas.interact')} <ChevronRight size={18} />
            </a>
            <Link to="/register" className="lp-cta-btn lp-cta-btn--green">
              {t('demo.ctas.start')} <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="lp-demo-map-frame" id="demo-map">
          <MapScreenPremium
            restaurants={restaurants}
            userLocation={coords}
            isLoading={loading}
            onRequestNearby={handleRequestNearby}
            embedded
          />
        </div>
      </section>

      <section className="lp-split-section" id="clientes">
        <div className="lp-split-pane lp-split-pane--customer">
          <div className="split-icon">⭐</div>
          <h2 className="split-title">{t('features.foodie.title')}</h2>
          <ul className="split-list">
            <li className="split-item">
              <div className="split-item-icon"><MapPin size={24} /></div>
              <span>{t('features.foodie.items.discover')}</span>
            </li>
            <li className="split-item">
              <div className="split-item-icon"><Trophy size={24} /></div>
              <span>{t('features.foodie.items.accumulate')}</span>
            </li>
            <li className="split-item">
              <div className="split-item-icon"><Gift size={24} /></div>
              <span>{t('features.foodie.items.redeem')}</span>
            </li>
          </ul>
        </div>

        <div className="lp-split-pane lp-split-pane--restaurant" id="restaurantes">
          <div className="split-icon">📊</div>
          <h2 className="split-title">{t('features.business.title')}</h2>
          <ul className="split-list">
            <li className="split-item">
              <div className="split-item-icon"><BarChart3 size={24} /></div>
              <span>{t('features.business.items.analyze')}</span>
            </li>
            <li className="split-item">
              <div className="split-item-icon"><Users size={24} /></div>
              <span>{t('features.business.items.loyalty')}</span>
            </li>
            <li className="split-item">
              <div className="split-item-icon"><Zap size={24} /></div>
              <span>{t('features.business.items.manage')}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="lp-steps-section" id="funciona">
        <h2 className="lp-section-title">{t('howItWorks.title')}</h2>
        <div className="lp-steps-grid">
          <div className="lp-step-card">
            <div className="step-number">01</div>
            <div className="step-content">
              <div className="step-icon" style={{ color: 'var(--lp-orange)' }}>
                <Search size={32} />
              </div>
              <h3 className="step-title">{t('howItWorks.steps.find.title')}</h3>
              <p className="step-desc">{t('howItWorks.steps.find.desc')}</p>
            </div>
          </div>

          <div className="lp-step-card">
            <div className="step-number">02</div>
            <div className="step-content">
              <div className="step-icon" style={{ color: 'var(--lp-green)' }}>
                <MapPin size={32} />
              </div>
              <h3 className="step-title">{t('howItWorks.steps.visit.title')}</h3>
              <p className="step-desc">{t('howItWorks.steps.visit.desc')}</p>
            </div>
          </div>

          <div className="lp-step-card">
            <div className="step-number">03</div>
            <div className="step-content">
              <div className="step-icon" style={{ color: 'var(--lp-orange)' }}>
                <Gift size={32} />
              </div>
              <h3 className="step-title">{t('howItWorks.steps.enjoy.title')}</h3>
              <p className="step-desc">{t('howItWorks.steps.enjoy.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-stats-section">
        <div className="lp-stats-grid">
          <div className="stat-item">
            <span className="stat-value text-orange">+200</span>
            <span className="stat-label">{t('stats.restaurants')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-green">+3.4k</span>
            <span className="stat-label">{t('stats.users')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-orange">+12k</span>
            <span className="stat-label">{t('stats.visits')}</span>
          </div>
        </div>
        <p style={{ marginTop: '50px', opacity: 0.6, fontWeight: 700, letterSpacing: '1px' }}>
          {t('stats.tagline')}
        </p>
      </section>

      <section className="lp-final-cta">
        <div className="cta-box">
          <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '24px' }}>
            {t('cta.ready')}
          </h2>
          <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            {t('cta.join')}
          </p>
          <Link to="/login" className="lp-cta-btn lp-cta-btn--orange" style={{ display: 'inline-flex', margin: '0 auto' }}>
            {t('cta.access')} <ArrowRight size={20} />
          </Link>
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
              <CheckCircle size={16} className="text-green" /> {t('cta.benefits.noCards')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
              <CheckCircle size={16} className="text-green" /> {t('cta.benefits.free')}
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}