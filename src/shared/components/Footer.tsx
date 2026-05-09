import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="lp-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">{t('navbar.logo')}</div>
          <p className="footer-tagline">{t('footer.tagline')}</p>
        </div>
        <div>
          <h4 className="footer-title">{t('footer.sections.platform')}</h4>
          <ul className="footer-links">
            <li><Link to="/#clientes" className="footer-link">{t('navbar.links.customers')}</Link></li>
            <li><Link to="/#restaurantes" className="footer-link">{t('navbar.links.restaurants')}</Link></li>
            <li><Link to="/#funciona" className="footer-link">{t('navbar.links.howItWorks')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-title">{t('footer.sections.legal')}</h4>
          <ul className="footer-links">
            <li><Link to="/aviso-legal" className="footer-link">{t('footer.links.legalNotice')}</Link></li>
            <li><Link to="/aviso-legal" className="footer-link">{t('footer.links.privacy')}</Link></li>
            <li><Link to="/aviso-legal" className="footer-link">{t('footer.links.cookies')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t('footer.copy')}</p>
      </div>
    </footer>
  );
}
