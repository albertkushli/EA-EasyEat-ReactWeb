import { useAuth } from '../context/AuthContext';
import ConfigurationCustomer from './dashboard/ConfigurationCustomer';
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
    return <ConfigurationCustomer />;
    //   } else if (role === 'owner' || role === 'staff') {
    //     return <ConfigurationEmployee />;
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