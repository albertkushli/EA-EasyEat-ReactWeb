import { useAuth } from '@/context/AuthContext';
import HomeCustomer from '@/features/dashboard/pages/HomeCustomer';
import HomeEmployee from '@/features/dashboard/pages/HomeEmployee';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <h2>{t('dashboard.noAuthorized')}</h2>
          <p>{t('dashboard.noAuthorizedDesc')}</p>
        </div>
      </div>
    );
  }

  if (role === 'customer') {
    return <HomeCustomer />;
  }

  if (role === 'owner' || role === 'staff') {
    return <HomeEmployee />;
  }

  return (
    <div className="dashboard-page">
      <div className="error-state">
        <h2>{t('dashboard.unknownRole')}</h2>
        <p>{t('dashboard.unknownRoleDesc')}</p>
      </div>
    </div>
  );
}