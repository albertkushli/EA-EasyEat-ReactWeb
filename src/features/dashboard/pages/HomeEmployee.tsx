import { useTranslation } from 'react-i18next';
import { useEmployeeDashboard } from '../hooks/useEmployeeDashboard';
import EmployeeOverviewPanel from '../components/employee/EmployeeOverviewPanel';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Clients } from '@/features/customers';
import { Dishes } from '@/features/dishes';
import { Employees } from '@/features/employees';
import { Rewards } from '@/features/rewards';
import Analytics from '../components/Analytics';
import RestaurantSettings from '@/shared/components/ui/Settings';
import StaffProfilePanel from '../components/employee/StaffProfilePanel';
import LanguageDropdown from '@/shared/components/ui/LanguageDropdown';
import RestaurantChatDashboard from '@/features/chat/pages/RestaurantChatDashboard';
import BillingPanel from '../components/employee/BillingPanel';

export default function HomeEmployee() {
  const { t } = useTranslation();
  const dashboard = useEmployeeDashboard();

  if (dashboard.isDataLoading) {
    return (
      <div className="he-loading">
        <div className="he-loading__spinner" />
        <p>
          {dashboard.isOwner
            ? t('dashboard.employee.loadingOwner')
            : t('dashboard.employee.loadingStaff')}
        </p>
      </div>
    );
  }

  return (
    <div className="he-page he-page--employee">
      <Sidebar
        activeView={dashboard.activeView}
        onViewChange={dashboard.setActiveView}
        restaurantName={dashboard.restName}
        restaurantAddress={dashboard.restAddress}
      />

      <div className="he-shell">
        <div className="he-topbar">
          <LanguageDropdown />
        </div>
        <div className="he-content">
          {dashboard.activeView === 'profile' ? (
            <StaffProfilePanel user={dashboard.user} restaurant={dashboard.restaurant} />
          ) : dashboard.activeView === 'dashboard' ? (
            <EmployeeOverviewPanel
              visits={dashboard.visits}
              reviews={dashboard.reviews}
              dishes={dashboard.dishes}
              restaurantId={dashboard.user?.restaurant_id!}
              averagePointsPerVisit={dashboard.averagePointsPerVisit}
              loyalCustomers={dashboard.loyalCustomers}
              restRating={dashboard.restRating}
            />
          ) : dashboard.activeView === 'clients' ? (
            <div style={{ padding: '2rem' }}>
              <Clients />
            </div>
          ) : dashboard.activeView === 'dishes' ? (
            <div style={{ padding: '2rem' }}>
              <Dishes />
            </div>
          ) : dashboard.activeView === 'employees' ? (
            <div style={{ padding: '2rem' }}>
              <Employees />
            </div>
          ) : dashboard.activeView === 'rewards' ? (
            <div style={{ padding: '2rem' }}>
              <Rewards />
            </div>
          ) : dashboard.activeView === 'analytics' ? (
            <div style={{ padding: '2rem' }}>
              <Analytics
                visits={dashboard.allVisits}
                restaurantId={dashboard.user?.restaurant_id!}
              />
            </div>
          ) : dashboard.activeView === 'settings' ? (
            <div style={{ padding: '2rem' }}>
              <RestaurantSettings restaurant={dashboard.restaurant} />
            </div>
          ) : dashboard.activeView === 'chat' ? (
            <div style={{ padding: '2rem' }}>
              <RestaurantChatDashboard />
            </div>
          ) : dashboard.activeView === 'billing' ? (
            <div style={{ padding: '2rem' }}>
              <BillingPanel />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
