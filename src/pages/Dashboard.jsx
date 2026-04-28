import { useAuth } from '../context/AuthContext';
import HomeCustomer from './dashboard/HomeCustomer';
import HomeEmployee from './dashboard/HomeEmployee';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <h2>{t("dashboard.noAuthorized")}</h2>
          <p>{t("dashboard.noAuthorizedDesc")}</p>
        </div>
      </div>
    );
  }

  // Show different dashboard based on role
  if (role === 'customer') {
    return <HomeCustomer />;
  } else if (role === 'owner' || role === 'staff') {
    return <HomeEmployee />;
  } else {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <h2>{t("dashboard.unknownRole")}</h2>
          <p>{t("dashboard.unknownRoleDesc")}</p>
        </div>
      </div>
    );
  }
}