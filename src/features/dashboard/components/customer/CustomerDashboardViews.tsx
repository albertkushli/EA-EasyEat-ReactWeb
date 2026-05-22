import { type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, CheckCircle, Clock, Coins, Gift, Heart, Home, Map, MapPin, QrCode, Save, Search, SlidersHorizontal, Star, Trophy, User, Wallet, X, Mail, Lock, LogOut, ShieldCheck } from 'lucide-react';
import LanguageDropdown from '@/shared/components/ui/LanguageDropdown';
import type { ICustomer } from '@/types';
import type { CustomerBadge, CustomerPointsWalletEntry, CustomerRestaurant, CustomerReward, CustomerTabId, CustomerVisit } from '../../hooks/useCustomerDashboard';
import CustomerChatButton from '@/features/chat/components/CustomerChatButton';

interface CustomerSidebarProps {
  activeTab: CustomerTabId;
  onTabChange: (tab: CustomerTabId) => void;
  user: ICustomer | null;
  onLogout: () => Promise<void>;
}

interface CustomerHomeTabProps {
  user: ICustomer | null;
  totalPoints: number;
  visits: CustomerVisit[];
  badges: CustomerBadge[];
  displayFavorites: CustomerRestaurant[];
  allRewards: CustomerReward[];
  restaurants: CustomerRestaurant[];
  uniqueRestaurantsVisited: number;
  objective1Progress: number;
  objective2Progress: number;
  objective3Progress: number;
  onSelectRestaurant: (restaurant: CustomerRestaurant) => void;
  onOpenDiscover: () => void;
  onOpenQrModal: () => void;
}

interface CustomerProfileTabProps {
  customerName: string;
  customerEmail: string;
  customerPassword: string;
  nameError: string;
  emailError: string;
  passwordError: string;
  success: boolean;
  updating: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  user?: ICustomer | null;
  totalPoints?: number;
  visits?: CustomerVisit[];
  onLogout?: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
}

interface CustomerDiscoverViewProps {
  restaurants: CustomerRestaurant[];
  allRewards: CustomerReward[];
  selectedRestaurant: CustomerRestaurant | null;
  onSelectRestaurant: (restaurant: CustomerRestaurant) => void;
  selectedReward: CustomerReward | null;
  onSelectedReward: (reward: CustomerReward) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  pointsWallet: CustomerPointsWalletEntry[];
  favoriteRestaurants: CustomerRestaurant[];
  onToggleFavorite: (restaurant: CustomerRestaurant) => void;
  onBack: () => void;
  onOpenQrModal: () => void;
  onOpenRewardQrModal: () => void;
}

interface CustomerHistoryRewardsViewProps {
  visits: CustomerVisit[];
  restaurants: CustomerRestaurant[];
}

interface CustomerQrModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

interface RewardQrModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  restaurantId: string;
  rewardId: string;
}

function getRestaurantId(entry: CustomerRestaurant | CustomerReward | CustomerPointsWalletEntry | CustomerVisit | null | undefined): string | undefined {
  if (!entry) return undefined;
  const restaurantId = 'restaurant_id' in entry ? entry.restaurant_id : undefined;

  if (typeof restaurantId === 'string') return restaurantId;
  if (restaurantId && typeof restaurantId === 'object') {
    return String(restaurantId._id ?? restaurantId.id ?? '');
  }

  return String(entry._id ?? entry.id ?? '');
}

function getRestaurantImage(restaurant: CustomerRestaurant) {
  return restaurant.profile?.image?.[0] || restaurant.image?.[0] || '';
}

function getRestaurantRating(restaurant: CustomerRestaurant) {
  const rating = restaurant.profile?.globalRating;
  return rating ? Number(rating).toFixed(1) : '4.5';
}

function getRestaurantName(restaurant: CustomerRestaurant) {
  return restaurant.profile?.name || restaurant.name || 'Restaurant';
}

function getRestaurantDescription(restaurant: CustomerRestaurant) {
  return restaurant.profile?.description || restaurant.description || '';
}

function getRestaurantCategory(restaurant: CustomerRestaurant) {
  return restaurant.profile?.category || [];
}

function getRestaurantCity(restaurant: CustomerRestaurant) {
  return restaurant.profile?.location?.city || restaurant.location?.city || '';
}

function getRestaurantDistance(restaurant: CustomerRestaurant, fallback = '—') {
  return restaurant.profile?.distance || restaurant.profile?.location?.distance || fallback;
}

function getRestaurantVisitsCount(restaurant: CustomerRestaurant) {
  return restaurant.profile?.visits ?? (restaurant as CustomerRestaurant & { visits?: number }).visits ?? 0;
}

function CustomerRestaurantCard({ restaurant, onClick }: { restaurant: CustomerRestaurant; onClick?: () => void }) {
  const { t } = useTranslation();
  const img = getRestaurantImage(restaurant);
  const rating = getRestaurantRating(restaurant);

  return (
    <div className="hc-res-card" onClick={onClick}>
      <div className="hc-res-card__img">
        {img
          ? <img src={img} alt={getRestaurantName(restaurant)} />
          : null}
        <div className="hc-res-card__img--placeholder" style={{ display: img ? 'none' : 'flex' }}>🍽️</div>
        <div className="hc-res-card__rating">
          <Star size={12} fill="currentColor" />
          {rating}
        </div>
      </div>
      <div className="hc-res-card__body">
        <p className="hc-res-card__name">{getRestaurantName(restaurant)}</p>
        {getRestaurantDescription(restaurant) && <p className="hc-res-card__desc">{getRestaurantDescription(restaurant)}</p>}
        <div className="hc-res-card__meta">
          {getRestaurantCity(restaurant) && (
            <span>
              <MapPin size={12} /> {getRestaurantCity(restaurant)}
            </span>
          )}
          <span className="meta-dist">
            <MapPin size={12} /> {getRestaurantDistance(restaurant)}
          </span>
          <span>
            <Clock size={12} /> {getRestaurantVisitsCount(restaurant)} {t('dashboard.customer.status.visits')}
          </span>
        </div>
      </div>
    </div>
  );
}

function CustomerLargeRestaurantCard({ restaurant, onClick }: { restaurant: CustomerRestaurant; onClick: () => void }) {
  const { t } = useTranslation();
  const img = getRestaurantImage(restaurant);
  const rating = getRestaurantRating(restaurant);
  const distance = getRestaurantDistance(restaurant, '0.5 km');

  return (
    <div className="hc-large-card" onClick={onClick}>
      <div className="hc-large-card__banner">
        {img ? <img src={img} alt={getRestaurantName(restaurant)} /> : <div className="hc-banner-placeholder" />}
        {restaurant.profile?.hasOffer && (
          <div className="hc-large-card__badge">🔥 {t('dashboard.customer.status.offer')}</div>
        )}
      </div>
      <div className="hc-large-card__body">
        <div className="hc-large-card__header">
          <div>
            <h3>{getRestaurantName(restaurant)}</h3>
            <p>{getRestaurantCategory(restaurant).join(', ')}</p>
          </div>
          <div className="hc-large-card__rating">
            <Star size={14} fill="currentColor" /> {rating}
          </div>
        </div>
        <div className="hc-large-card__footer">
          <span className="hc-large-card__dist"><MapPin size={14} /> {distance}</span>
          {restaurant.profile?.pointsMultiplier && (
            <div className="hc-large-card__points-badge">
              <Gift size={14} /> {restaurant.profile.pointsMultiplier}x {t('dashboard.customer.status.points').toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerRestaurantDetail({
  restaurant,
  pointsWallet,
  allRewards,
  favoriteRestaurants,
  onSelectedReward,
  onBack,
  onToggleFavorite,
  onOpenQrModal,
  onOpenRewardQrModal,
}: {
  restaurant: CustomerRestaurant;
  pointsWallet: CustomerPointsWalletEntry[];
  allRewards: CustomerReward[];
  favoriteRestaurants: CustomerRestaurant[];
  onSelectedReward: (reward: CustomerReward) => void;
  onBack: () => void;
  onToggleFavorite: (restaurant: CustomerRestaurant) => void;
  onOpenQrModal: () => void;
  onOpenRewardQrModal: () => void;
}) {
  const { t } = useTranslation();
  const img = getRestaurantImage(restaurant);
  const rating = getRestaurantRating(restaurant);
  const userPointsForRestaurant = pointsWallet.find((wallet) => getRestaurantId(wallet) === restaurant._id)?.points || 0;
  const restaurantRewards = allRewards.filter((reward) => getRestaurantId(reward) === restaurant._id);
  const isFavorite = favoriteRestaurants.some((favorite) => favorite._id === restaurant._id);

  return (
    <div className="hc-restaurant-detail">
      <button className="hc-back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
      </button>
      <div className="hc-restaurant-detail__banner hc-animate-fade">
        {img ? <img src={img} alt={getRestaurantName(restaurant)} /> : <div className="hc-banner-placeholder" />}
      </div>
      <div className="hc-restaurant-detail__header hc-animate-slide" style={{ animationDelay: '0.1s', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>{getRestaurantName(restaurant)}</h2>
          <p>{getRestaurantCategory(restaurant).join(', ')}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className={`hc-fav-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(restaurant)}
            title={isFavorite ? t('dashboard.customer.actions.removeFavorite') : t('dashboard.customer.actions.addFavorite')}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <div className="hc-restaurant-detail__rating">
            <Star size={16} fill="currentColor" /> {rating}
          </div>
        </div>
      </div>

      {restaurant.profile?.pointsMultiplier && (
        <div className="hc-points-multiplier-banner hc-animate-slide" style={{ animationDelay: '0.2s' }}>
          <div>
            <p className="hc-pmb-title">{t('dashboard.customer.details.multiplierTitle')}</p>
            <h3 className="hc-pmb-value">{restaurant.profile.pointsMultiplier}x</h3>
            <p className="hc-pmb-desc">{t('dashboard.customer.details.multiplierDesc')}</p>
          </div>
          <Gift size={48} opacity={0.5} />
        </div>
      )}

      <div className="hc-restaurant-detail__info-grid hc-animate-slide" style={{ animationDelay: '0.3s' }}>
        <div className="hc-info-box">
          <Coins size={18} className="text-orange" />
          <div>
            <p>{userPointsForRestaurant} {t('dashboard.customer.status.points')}</p>
            <span>{t('dashboard.customer.details.myPoints')}</span>
          </div>
        </div>
        <div className="hc-info-box">
          <Clock size={18} className="text-orange" />
          <div>
            <p>09:00 - 23:00</p>
            <span>{t('settings.schedule.title', 'Horari').replace(' Semanal', '')}</span>
          </div>
        </div>
      </div>

      <div className="hc-restaurant-detail__section hc-animate-slide" style={{ animationDelay: '0.4s' }}>
        <h3>{t('dashboard.customer.details.about')}</h3>
        <p>{getRestaurantDescription(restaurant) || 'El millor restaurant del barri amb ingredients frescos i de qualitat.'}</p>
      </div>

      <div className="hc-restaurant-detail__section">
        <h3>{t('rewards.title', 'Recompenses disponibles')}</h3>
        <div className="hc-rewards-list">
          {restaurantRewards.length > 0 ? (
            restaurantRewards.map((reward) => (
              <div key={reward._id} className="hc-reward-item">
                <div>
                  <h4>{reward.name}</h4>
                  <span>{reward.pointsRequired} {t('dashboard.customer.status.points')}</span>
                </div>
                <button className='hc-reward-btn' onClick={() => { onSelectedReward(reward); return onOpenRewardQrModal() }}>
                  <Gift size={20} className="text-orange" /> {t('dashboard.customer.actions.redeem')}
                </button>
              </div>
            ))
          ) : (
            <p className="hc-empty">{t('rewards.noRewards', 'Aquest restaurant no té recompenses registrades.')}</p>
          )}
        </div>
      </div>

      <button className="hc-checkin-btn" onClick={onOpenQrModal}>
        <QrCode size={20} /> {t('dashboard.customer.actions.checkIn')}
      </button>

      {/* Chat con el restaurante */}
      <div style={{ marginTop: '1rem' }}>
        <CustomerChatButton
          restaurantId={restaurant._id ?? (restaurant as any).id ?? ''}
          restaurantName={getRestaurantName(restaurant)}
        />
      </div>
    </div>
  );
}

export function CustomerSidebar({ activeTab, onTabChange, user, onLogout }: CustomerSidebarProps) {
  const { t } = useTranslation();
  return (
    <aside className="hc-sidebar">
      <div className="hc-sidebar__brand">
        <div className="hc-sidebar__logo">🍽️</div>
        <div>
          <p className="hc-sidebar__title">{t('navbar.logo', 'EasyEat')}</p>
          <p className="hc-sidebar__subtitle">{t('auth.login.tagline', 'Tu experiencia gastronómica')}</p>
        </div>
      </div>

      <nav className="hc-sidebar-nav">
        <button type="button" className={activeTab === 'home' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'} onClick={() => onTabChange('home')}>
          <Home size={18} />
          <span>{t('sidebar.home', 'Inici')}</span>
        </button>
        <button type="button" className={activeTab === 'discover' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'} onClick={() => onTabChange('discover')}>
          <MapPin size={18} />
          <span>{t('sidebar.discover', 'Descobrir')}</span>
        </button>
        <button type="button" className={activeTab === 'rewards' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'} onClick={() => onTabChange('rewards')}>
          <Gift size={18} />
          <span>{t('sidebar.rewards', 'Recompenses')}</span>
        </button>
        <button type="button" className={activeTab === 'profile' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'} onClick={() => onTabChange('profile')}>
          <User size={18} />
          <span>{t('sidebar.profile', 'Perfil')}</span>
        </button>
      </nav>

      <div className="hc-sidebar-footer">
        <div className="hc-sidebar-user">
          <div className="hc-sidebar-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p>{user?.name}</p>
            <span>{
              user?.role === 'owner' ? t('auth.roles.owner') :
                user?.role === 'staff' ? t('auth.roles.staff') :
                  t('auth.roles.customer')
            }</span>
          </div>
        </div>
        <button onClick={onLogout} className="hc-sidebar-logout">{t('sidebar.logout', 'Logout')}</button>
        <LanguageDropdown />
        <Link
          to="/aviso-legal"
          className="text-[10px] text-slate-400 hover:text-orange-600 transition-colors uppercase tracking-widest font-bold whitespace-nowrap"
        >
          {t('footer.links.legalNotice')}
        </Link>
      </div>
    </aside>
  );
}

export function CustomerHomeTab({
  user,
  totalPoints,
  visits,
  badges,
  displayFavorites,
  allRewards,
  restaurants,
  uniqueRestaurantsVisited,
  objective1Progress,
  objective2Progress,
  objective3Progress,
  onSelectRestaurant,
  onOpenDiscover,
  onOpenQrModal,
}: CustomerHomeTabProps) {
  const { t } = useTranslation();
  return (
    <>
      <section className="hc-hero">
        <div className="hc-hero__text">
          <p className="hc-hero__greeting">{t('dashboard.customer.welcome', 'Hola,')}</p>
          <h1 className="hc-hero__name">{user?.name?.split(' ')[0]}! 👋</h1>
          <p className="hc-hero__sub">{t('dashboard.customer.discover', 'Descubre sabores que te esperan hoy')}</p>
        </div>
        <div className="hc-hero__orbs">
          <div className="hc-orb hc-orb--1" />
          <div className="hc-orb hc-orb--2" />
        </div>
      </section>

      <section className="hc-stats">
        <div className="hc-stat-card hc-stat-card--points">
          <div className="hc-stat-card__icon"><Coins size={22} /></div>
          <div className="hc-stat-card__info">
            <span className="hc-stat-card__value">{totalPoints.toLocaleString()}</span>
            <span className="hc-stat-card__label">{t('dashboard.customer.stats.totalPoints', 'Punts totals')}</span>
          </div>
        </div>
        <div className="hc-stat-card hc-stat-card--visits">
          <div className="hc-stat-card__icon"><Clock size={22} /></div>
          <div className="hc-stat-card__info">
            <span className="hc-stat-card__value">{visits.length}</span>
            <span className="hc-stat-card__label">{t('dashboard.customer.stats.visits', 'Visites')}</span>
          </div>
        </div>
        <div className="hc-stat-card hc-stat-card--badges">
          <div className="hc-stat-card__icon"><Trophy size={22} /></div>
          <div className="hc-stat-card__info">
            <span className="hc-stat-card__value">{badges.length}</span>
            <span className="hc-stat-card__label">{t('dashboard.customer.stats.badges', 'Badges')}</span>
          </div>
        </div>
        <div className="hc-stat-card hc-stat-card--favs">
          <div className="hc-stat-card__icon"><Heart size={22} /></div>
          <div className="hc-stat-card__info">
            <span className="hc-stat-card__value">{displayFavorites.length}</span>
            <span className="hc-stat-card__label">{t('dashboard.customer.stats.favorites', 'Favorits')}</span>
          </div>
        </div>
      </section>

      <section>
        <button className="hc-checkin-btn" onClick={onOpenQrModal}>
          <QrCode size={20} /> {t('dashboard.customer.actions.showQr')}
        </button>
      </section>

      <section className="hc-section">
        <div className="hc-section__head">
          <h2 className="hc-section__title"><Heart size={18} /> {t('dashboard.customer.sections.favorites', 'Els teus favorits')}</h2>
        </div>
        {displayFavorites.length > 0 ? (
          <div className="hc-cards hc-cards--favs">
            {displayFavorites.map((restaurant, index) => (
              <CustomerRestaurantCard
                key={restaurant._id || index}
                restaurant={restaurant}
                onClick={() => {
                  onSelectRestaurant(restaurant);
                  onOpenDiscover();
                }}
              />
            ))}
          </div>
        ) : (
          <div className="hc-empty">{t('dashboard.customer.empty.favorites', 'No tienes restaurantes favoritos todavía.')}</div>
        )}
      </section>

      {allRewards.length > 0 && (
        <section className="hc-section">
          <div className="hc-section__head">
            <h2 className="hc-section__title"><Gift size={18} /> {t('dashboard.customer.sections.rewards', 'Recompensas destacadas')}</h2>
          </div>
          <div className="hc-rewards-carousel" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollSnapType: 'x mandatory' }}>
            {allRewards.slice(0, 6).map((reward, index) => {
              const restaurant = restaurants.find((item) => getRestaurantId(item) === getRestaurantId(reward));
              const image = restaurant ? getRestaurantImage(restaurant) : '';

              return (
                <div
                  key={reward._id || index}
                  className="hc-reward-card-premium hc-animate-slide"
                  style={{ animationDelay: `${0.1 * index}s`, backgroundImage: image ? `url(${image})` : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
                >
                  <div className="hc-reward-card-premium__overlay" />
                  <div className="hc-reward-card-premium__content">
                    <div className="hc-reward-card-premium__badge">
                      <Gift size={14} /> {reward.pointsRequired} pts
                    </div>
                    <div className="hc-reward-card-premium__text">
                      <h4>{reward.name}</h4>
                      <p>{restaurant ? getRestaurantName(restaurant) : 'Restaurant'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {badges.length > 0 && (
        <section className="hc-section">
          <div className="hc-section__head">
            <h2 className="hc-section__title"><Trophy size={18} /> {t('dashboard.customer.sections.badges', 'Tus logros')}</h2>
          </div>
          <div className="hc-badges-row">
            {badges.map((badge, index) => (
              <div key={`${badge.title || 'badge'}-${index}`} className="hc-badge-card">
                <div className="hc-badge-card__icon">{badge.icon || '🏆'}</div>
                <div className="hc-badge-card__info">
                  <p>{badge.title || `Badge ${index + 1}`}</p>
                  <span>{badge.subtitle || t('dashboard.customer.objectives.level', 'Objetivo completado')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="hc-section">
        <div className="hc-section__head">
          <h2 className="hc-section__title"><Clock size={18} /> {t('dashboard.customer.sections.objectives', 'Objetivos por alcanzar')}</h2>
        </div>
        <div className="hc-objectives">
          <div className="hc-objective-card">
            <div className="hc-objective-card__header">
              <p>{t('dashboard.customer.objectives.visit', 'Visita 10 restaurantes diferentes')}</p>
              <span>{uniqueRestaurantsVisited} / 10</span>
            </div>
            <div className="hc-progress-bar">
              <div className="hc-progress-bar__fill" style={{ width: `${objective1Progress}%` }} />
            </div>
            <small>{t('dashboard.customer.objectives.progress', 'Progreso:')} {objective1Progress}%</small>
          </div>
          <div className="hc-objective-card">
            <div className="hc-objective-card__header">
              <p>{t('dashboard.customer.objectives.points', 'Acumula 2000 puntos totales')}</p>
              <span>{totalPoints} / 2000</span>
            </div>
            <div className="hc-progress-bar">
              <div className="hc-progress-bar__fill" style={{ width: `${objective2Progress}%` }} />
            </div>
            <small>{t('dashboard.customer.objectives.progress', 'Progreso:')} {objective2Progress}%</small>
          </div>
          <div className="hc-objective-card">
            <div className="hc-objective-card__header">
              <p>{t('dashboard.customer.objectives.level', 'Alcanza nivel 10 en un restaurante')}</p>
              <span>{Math.min(visits.length, 10)} / 10</span>
            </div>
            <div className="hc-progress-bar">
              <div className="hc-progress-bar__fill" style={{ width: `${objective3Progress}%` }} />
            </div>
            <small>{t('dashboard.customer.objectives.progress', 'Progreso:')} {objective3Progress}%</small>
          </div>
        </div>
      </section>
    </>
  );
}

export function CustomerProfileTab({
  customerName,
  customerEmail,
  customerPassword,
  nameError,
  emailError,
  passwordError,
  success,
  updating,
  onSubmit,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  user,
  totalPoints = 0,
  visits = [],
  onLogout,
  onDeleteAccount,
}: CustomerProfileTabProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full bg-slate-50/50 overflow-y-auto pb-12">
      {/* Cabecera con Gradiente SaaS */}
      <div className="w-full h-48 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 lg:px-8 -mt-20 relative z-10 flex flex-col md:flex-row gap-8">

        {/* Columna Izquierda: Resumen y Actividad */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-4xl font-bold mb-4">
              {customerName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{customerName || user?.name}</h2>
            <p className="text-sm text-slate-500 mb-4">{customerEmail || user?.email}</p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wide">
              <ShieldCheck size={14} />
              {user?.role === 'owner' ? t('auth.roles.owner') : user?.role === 'staff' ? t('auth.roles.staff') : t('auth.roles.customer', 'Cuenta Verificada')}
            </div>

            <div className="w-full h-px bg-slate-100 my-6"></div>

            <div className="w-full flex justify-between items-center text-sm mb-4">
              <span className="text-slate-500 flex items-center gap-2"><Clock size={16} className="text-blue-500" /> {t('dashboard.customer.stats.visits', 'Visitas totales')}</span>
              <span className="font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-md">{visits.length}</span>
            </div>
            <div className="w-full flex justify-between items-center text-sm mb-6">
              <span className="text-slate-500 flex items-center gap-2"><Coins size={16} className="text-orange-500" /> {t('dashboard.customer.stats.totalPoints', 'Puntos acumulados')}</span>
              <span className="font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">{totalPoints}</span>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> {t('sidebar.logout', 'Cerrar sesión')}
              </button>
            )}
          </div>
        </div>

        {/* Columna Derecha: Formulario de Configuración */}
        <div className="w-full md:w-2/3">
          <form onSubmit={onSubmit} className="flex flex-col gap-6">

            {/* Tarjeta de Información Personal */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{t('dashboard.customer.profile.title', 'Información Personal')}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t('dashboard.customer.profile.subtitle', 'Actualiza tus datos básicos de contacto.')}</p>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">{t('auth.register.form.fullName', 'Nombre completo')}</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none ${nameError ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}`}
                        placeholder={t('auth.register.form.namePlaceholder')}
                        value={customerName}
                        onChange={(event) => onNameChange(event.target.value)}
                        required
                      />
                    </div>
                    {nameError && <span className="text-xs text-red-500 mt-1 font-medium">{nameError}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">{t('auth.register.form.email', 'Correo electrónico')}</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none ${emailError ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}`}
                        placeholder={t('auth.register.form.emailPlaceholder')}
                        value={customerEmail}
                        onChange={(event) => onEmailChange(event.target.value)}
                        required
                      />
                    </div>
                    {emailError && <span className="text-xs text-red-500 mt-1 font-medium">{emailError}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta de Seguridad */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{t('settings.security.title', 'Seguridad de la Cuenta')}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t('profile.form.passwordHint', 'Deja este campo en blanco si no deseas cambiarla.')}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-1.5 max-w-md">
                  <label className="text-sm font-semibold text-slate-700">{t('profile.form.password', 'Nueva contraseña')}</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all outline-none ${passwordError ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}`}
                      placeholder="••••••••"
                      value={customerPassword}
                      onChange={(event) => onPasswordChange(event.target.value)}
                    />
                  </div>
                  {passwordError && <span className="text-xs text-red-500 mt-1 font-medium">{passwordError}</span>}
                </div>
              </div>
            </div>

            {/* Acciones y Estados */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-2 mb-8">
              <div className="w-full sm:w-auto">
                {success && (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">
                    <CheckCircle size={18} /> {t('settings.form.updated', 'Perfil actualizado con éxito')}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    <span>{t('settings.form.save', 'Guardar cambios')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Botón de Eliminar Cuenta */}
            {onDeleteAccount && (
              <div className="mt-8 pt-6 border-t border-slate-200/60 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const message = t(
                      'dashboard.customer.profile.dangerZone.confirm',
                      'Estás a punto de eliminar tu cuenta.\n\nEsta acción es IRREVERSIBLE y perderás todos tus puntos, recompensas y tu historial de visitas de forma permanente.\n\n¿Estás completamente seguro de que quieres proceder?'
                    );
                    if (window.confirm(message)) {
                      onDeleteAccount();
                    }
                  }}
                  className="px-6 py-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <X size={16} />
                  <span>{t('dashboard.customer.profile.dangerZone.delete', 'Eliminar cuenta')}</span>
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}

export function CustomerDiscoverView({
  restaurants,
  allRewards,
  selectedRestaurant,
  onSelectRestaurant,
  selectedReward,
  onSelectedReward,
  searchTerm,
  onSearchTermChange,
  selectedCategory,
  onCategoryChange,
  pointsWallet,
  favoriteRestaurants,
  onToggleFavorite,
  onBack,
  onOpenQrModal,
  onOpenRewardQrModal,
}: CustomerDiscoverViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const categories = [
    { name: 'all', icon: '🍽️', label: t('discover.categories.all', 'Tots') },
    { name: 'Sushi', icon: '🍣', label: t('discover.categories.sushi', 'Sushi') },
    { name: 'Pizzeria', icon: '🍕', label: t('discover.categories.pizzeria', 'Pizzeria') },
    { name: 'Burger', icon: '🍔', label: t('discover.categories.burger', 'Burger') },
    { name: 'Mexican', icon: '🌮', label: t('discover.categories.mexican', 'Mexicà') },
    { name: 'Italian', icon: '🍝', label: t('discover.categories.italian', 'Italià') },
    { name: 'Seafood', icon: '🐟️', label: t('discover.categories.seafood', 'Marisc') },
  ];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = (restaurant.profile?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.profile?.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
      (restaurant.profile?.category || []).some((category) => category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  if (selectedRestaurant) {
    return (
      <CustomerRestaurantDetail
        restaurant={selectedRestaurant}
        pointsWallet={pointsWallet}
        allRewards={allRewards}
        favoriteRestaurants={favoriteRestaurants}
        onSelectedReward={onSelectedReward}
        onBack={onBack}
        onToggleFavorite={onToggleFavorite}
        onOpenQrModal={onOpenQrModal}
        onOpenRewardQrModal={onOpenRewardQrModal}
      />
    );
  }

  return (
    <div className="hc-discover-view">
      <div className="hc-discover-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>{t('discover.title', 'Descobrir')}</h2>
          <button
            type="button"
            className="hc-map-btn"
            onClick={() => navigate('/map')}
            title={t('discover.openMap', 'Obrir el mapa')}
            aria-label={t('discover.openMap', 'Obrir el mapa')}
          >
            <Map size={18} />
            <span>{t('discover.map', 'Mapa')}</span>
          </button>
        </div>

        <div className="hc-search-bar">
          <div className="hc-search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder={t('discover.searchPlaceholder', 'Busca per nom o cuina...')}
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
            />
          </div>
          <button className="hc-filter-btn">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div className="hc-category-pills">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`hc-category-pill ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.name)}
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hc-discover-results">
        <p className="hc-results-count"><strong>{filteredRestaurants.length}</strong> {t('discover.resultsCount', 'restaurants trobats')}</p>
        <div className="hc-large-cards">
          {filteredRestaurants.map((restaurant) => (
            <CustomerLargeRestaurantCard
              key={restaurant._id || restaurant.id}
              restaurant={restaurant}
              onClick={() => onSelectRestaurant(restaurant)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CustomerHistoryRewardsView({ visits, restaurants }: CustomerHistoryRewardsViewProps) {
  const totalVisits = visits.length;
  const totalMoneySpent = visits.reduce((sum, visit) => sum + (Number(visit.billAmount) || 0), 0);
  const totalPointsEarned = visits.reduce((sum, visit) => sum + (Number(visit.pointsEarned) || 0), 0);

  const getRestaurantInfo = (restaurantData: CustomerVisit['restaurant_id']) => {
    if (!restaurantData) return null;
    if (typeof restaurantData === 'object') return restaurantData;
    return restaurants.find((restaurant) => restaurant._id === restaurantData || restaurant.id === restaurantData);
  };

  const { t, i18n } = useTranslation();
  return (
    <div className="hc-rewards-dashboard hc-animate-fade">
      <div className="hc-discover-header">
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', marginTop: 0 }}>{t('stats_dashboard.title', 'Les teves Estadístiques')}</h2>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem' }}>{t('stats_dashboard.tagline', 'Així és com has aprofitat EasyEat fins ara.')}</p>
      </div>

      <div className="hc-rewards-stats">
        <div className="hc-stat-card hc-stat-card--money hc-animate-slide" style={{ animationDelay: '0.1s' }}>
          <div className="hc-stat-card__icon"><Wallet size={24} /></div>
          <div>
            <h3>{totalMoneySpent.toFixed(2)}€</h3>
            <p>{t('stats_dashboard.spent', 'Diners gastats')}</p>
          </div>
        </div>
        <div className="hc-stat-card hc-stat-card--points hc-animate-slide" style={{ animationDelay: '0.2s' }}>
          <div className="hc-stat-card__icon"><Coins size={24} /></div>
          <div>
            <h3>{totalPointsEarned}</h3>
            <p>{t('stats_dashboard.earned', 'Punts acumulats')}</p>
          </div>
        </div>
        <div className="hc-stat-card hc-stat-card--visits hc-animate-slide" style={{ animationDelay: '0.3s' }}>
          <div className="hc-stat-card__icon"><Clock size={24} /></div>
          <div>
            <h3>{totalVisits}</h3>
            <p>{t('stats_dashboard.visits', 'Visites realitzades')}</p>
          </div>
        </div>
      </div>

      <div className="hc-rewards-history-section hc-animate-slide" style={{ animationDelay: '0.4s' }}>
        <h3 className="hc-rewards-history-title">{t('stats_dashboard.history.title', "Historial d'activitat i recompenses escanejades")}</h3>
        <div className="hc-rewards-history-list">
          {visits.length > 0 ? (
            visits.map((visit, index) => {
              const restaurant = getRestaurantInfo(visit.restaurant_id);
              const image = restaurant ? getRestaurantImage(restaurant) : '';
              const date = new Date(visit.date || visit.createdAt || new Date());

              return (
                <div key={visit._id || index} className="hc-history-item">
                  <div className="hc-history-item__left">
                    <div className="hc-history-item__img">
                      {image ? <img src={image} alt={restaurant ? getRestaurantName(restaurant) : 'Restaurant'} /> : <div className="placeholder">🍽️</div>}
                    </div>
                    <div className="hc-history-item__info">
                      <h4>{restaurant ? getRestaurantName(restaurant) : t('stats_dashboard.history.unknownRestaurant', 'Restaurant desconegut')}</h4>
                      <p>{date.toLocaleDateString(i18n.language === 'ca' ? 'ca-ES' : i18n.language === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="hc-history-item__right">
                    {visit.pointsEarned ? (
                      <div className="hc-history-badge hc-history-badge--points">
                        <Coins size={14} /> +{visit.pointsEarned}
                      </div>
                    ) : null}
                    {visit.billAmount ? (
                      <div className="hc-history-badge hc-history-badge--money">
                        <Wallet size={14} /> {visit.billAmount.toFixed(2)}€
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="hc-empty">{t('stats_dashboard.history.empty', 'No tens cap visita ni recompensa registrada encara.')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CustomerQrModal({ open, onClose, userId }: CustomerQrModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="hc-modal-overlay" onClick={onClose}>
      <div className="hc-modal" onClick={(event) => event.stopPropagation()}>
        <button className="hc-modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h3>{t('qr.user.title', 'El teu Codi QR')}</h3>
        <p>{t('qr.user.desc', 'Mostra aquest codi al cambrer per fer el check-in i guanyar punts.')}</p>
        <div className="hc-qr-container">
          <QRCodeCanvas
            value={userId}
            size={256}
            level="H"
            includeMargin={true}
            fgColor="#08182f"
          />
        </div>
        <p className="hc-qr-user-id">ID: {userId}</p>
      </div>
    </div>
  );
}

export function RewardQrModal({ open, onClose, userId, restaurantId, rewardId }: RewardQrModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="hc-modal-overlay" onClick={onClose}>
      <div className="hc-modal" onClick={(event) => event.stopPropagation()}>
        <button className="hc-modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h3>{t('qr.reward.title', 'El Codi QR de la recompensa')}</h3>
        <p>{t('qr.reward.desc', 'Mostra aquest codi al cambrer per reclamar la recompensa.')}</p>
        <div className="hc-qr-container">
          <QRCodeCanvas
            value={JSON.stringify({
              userId,
              restaurantId,
              rewardId,
            })}
            size={256}
            level="H"
            fgColor="#08182f"
          />
        </div>
      </div>
    </div>
  );
}
