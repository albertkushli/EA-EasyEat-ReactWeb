import { useTranslation } from 'react-i18next';
import LanguageDropdown from '@/shared/components/ui/LanguageDropdown';
import { useCustomerDashboard } from '../hooks/useCustomerDashboard';
import {
  CustomerDiscoverView,
  CustomerHistoryRewardsView,
  CustomerHomeTab,
  CustomerProfileTab,
  CustomerQrModal,
  CustomerSidebar,
  RewardQrModal,
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
      <div className="hc-layout" style={{ position: 'relative' }}>
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
              user={dashboard.user}
              totalPoints={dashboard.totalPoints}
              visits={dashboard.visits}
              onLogout={dashboard.logout}
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
              onDeleteAccount={dashboard.handleDeleteAccount}
            />
          ) : dashboard.activeTab === 'discover' ? (
            <CustomerDiscoverView
              restaurants={dashboard.restaurants}
              allRewards={dashboard.allRewards}
              selectedRestaurant={dashboard.selectedRestaurant}
              onSelectRestaurant={dashboard.setSelectedRestaurant}
              selectedReward={dashboard.selectedReward}
              onSelectedReward={dashboard.setSelectedReward}
              searchTerm={dashboard.searchTerm}
              onSearchTermChange={dashboard.setSearchTerm}
              selectedCategory={dashboard.selectedCategory}
              onCategoryChange={dashboard.setSelectedCategory}
              pointsWallet={dashboard.pointsWallet}
              favoriteRestaurants={dashboard.favoriteRestaurants}
              onToggleFavorite={dashboard.handleToggleFavorite}
              onBack={() => dashboard.setSelectedRestaurant(null)}
              onOpenQrModal={() => dashboard.setShowQrModal(true)}
              onOpenRewardQrModal={() => dashboard.setShowRewardQrModal(true)}
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
                  <p className="hc-tab-panel__label">{t('qr_panel.label')}</p>
                  <h2>{t('qr_panel.title')}</h2>
                  <p className="hc-tab-panel__text">{t('qr_panel.text')}</p>
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
      <RewardQrModal
        open={dashboard.showRewardQrModal}
        onClose={() => dashboard.setShowRewardQrModal(false)}
        userId={dashboard.user?._id! || dashboard.user?.id!}
        restaurantId={dashboard.selectedRestaurant?._id! || dashboard.selectedRestaurant?.id!}
        rewardId={dashboard.selectedReward?._id! || dashboard.selectedReward?.id!}
      />
    </div>
  );
}
