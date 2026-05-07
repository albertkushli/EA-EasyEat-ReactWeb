import { useTranslation } from 'react-i18next';
import { useCustomerDashboard } from '../hooks/useCustomerDashboard';
import {
  CustomerDiscoverView,
  CustomerHistoryRewardsView,
  CustomerHomeTab,
  CustomerProfileTab,
  CustomerQrModal,
  CustomerSidebar,
} from '../components/customer/CustomerDashboardViews';

export default function HomeCustomer() {
  const { t } = useTranslation();
  const dashboard = useCustomerDashboard();

  if (dashboard.loadingCustomerData) {
    return (
      <div className="hc-loading">
        <div className="hc-loading__spinner" />
        <p>{t('dashboard.customer.loading') || 'Cargando tu experiencia...'}</p>
      </div>
    );
  }

  return (
    <div className="hc-page">
      <div className="hc-layout">
        <CustomerSidebar
          activeTab={dashboard.activeTab}
          onTabChange={dashboard.handleTabChange}
          user={dashboard.user}
          onLogout={dashboard.logout}
        />

        <main className="hc-main">
          {dashboard.activeTab === 'home' ? (
            <CustomerHomeTab
              user={dashboard.user}
              totalPoints={dashboard.totalPoints}
              visits={dashboard.visits}
              badges={dashboard.badges}
              displayFavorites={dashboard.displayFavorites}
              allRewards={dashboard.allRewards}
              restaurants={dashboard.restaurants}
              uniqueRestaurantsVisited={dashboard.uniqueRestaurantsVisited}
              objective1Progress={dashboard.objective1Progress}
              objective2Progress={dashboard.objective2Progress}
              objective3Progress={dashboard.objective3Progress}
              onSelectRestaurant={dashboard.setSelectedRestaurant}
              onOpenDiscover={() => dashboard.handleTabChange('discover')}
              onOpenQrModal={() => dashboard.setShowQrModal(true)}
            />
          ) : dashboard.activeTab === 'profile' ? (
            <CustomerProfileTab
              customerName={dashboard.customerName}
              customerEmail={dashboard.customerEmail}
              customerPassword={dashboard.customerPassword}
              nameError={dashboard.nameError}
              emailError={dashboard.emailError}
              passwordError={dashboard.passwordError}
              success={dashboard.success}
              updating={dashboard.updating}
              onSubmit={dashboard.handleSubmitProfile}
              onNameChange={dashboard.setCustomerName}
              onEmailChange={dashboard.setCustomerEmail}
              onPasswordChange={dashboard.setCustomerPassword}
            />
          ) : dashboard.activeTab === 'discover' ? (
            <CustomerDiscoverView
              restaurants={dashboard.restaurants}
              allRewards={dashboard.allRewards}
              selectedRestaurant={dashboard.selectedRestaurant}
              searchTerm={dashboard.searchTerm}
              onSearchTermChange={dashboard.setSearchTerm}
              selectedCategory={dashboard.selectedCategory}
              onCategoryChange={dashboard.setSelectedCategory}
              pointsWallet={dashboard.pointsWallet}
              favoriteRestaurants={dashboard.favoriteRestaurants}
              onToggleFavorite={dashboard.handleToggleFavorite}
              onBack={() => dashboard.setSelectedRestaurant(null)}
              onSelectRestaurant={dashboard.setSelectedRestaurant}
              onOpenQrModal={() => dashboard.setShowQrModal(true)}
            />
          ) : dashboard.activeTab === 'rewards' ? (
            <CustomerHistoryRewardsView
              visits={dashboard.visits}
              restaurants={dashboard.restaurants}
            />
          ) : (
            <section className="hc-section hc-tab-panel">
              <div className="hc-tab-panel__hero">
                <div>
                  <p className="hc-tab-panel__label">El meu QR</p>
                  <h2>El teu QR està preparat</h2>
                  <p className="hc-tab-panel__text">Aquí podràs accedir ràpidament a la funcionalitat corresponent.</p>
                </div>
                <div className="hc-tab-panel__icon">
                  <span className="text-4xl">QR</span>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <CustomerQrModal
        open={dashboard.showQrModal}
        onClose={() => dashboard.setShowQrModal(false)}
        userId={dashboard.user?._id! || dashboard.user?.id!}
      />
    </div>
  );
}