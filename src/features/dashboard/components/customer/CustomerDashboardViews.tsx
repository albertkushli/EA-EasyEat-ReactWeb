import { type FormEvent, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Coins,
  Flag,
  Gift,
  Heart,
  Home,
  Map,
  MapPin,
  QrCode,
  Save,
  Search,
  SlidersHorizontal,
  Star,
  Trophy,
  User,
  Wallet,
  X,
  Mail,
  Lock,
  LogOut,
  ShieldCheck,
  Moon,
  Sun,
  Bot,
} from 'lucide-react';
import LanguageDropdown from '@/shared/components/ui/LanguageDropdown';
import type { ICustomer, IReview } from '@/types';
import type {
  CustomerBadge,
  CustomerPointsWalletEntry,
  CustomerRestaurant,
  CustomerReward,
  CustomerTabId,
  CustomerVisit,
} from '../../hooks/useCustomerDashboard';
import CustomerChatButton from '@/features/chat/components/CustomerChatButton';
import { reviewService } from '@/services';
import { reportService } from '@/services/report.service';
import { trackEvent } from '@/services/matomo';
import AssistantChat from '@/features/assistant/components/AssistantChat';
import { useTheme } from '@/context/ThemeContext';

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

function getRestaurantId(
  entry:
    | CustomerRestaurant
    | CustomerReward
    | CustomerPointsWalletEntry
    | CustomerVisit
    | null
    | undefined,
): string | undefined {
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

function CustomerReportModal({
  open,
  restaurant,
  onClose,
}: {
  open: boolean;
  restaurant: CustomerRestaurant;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const restaurantId = getRestaurantId(restaurant) || '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedReason = reason.trim();

    if (trimmedReason.length < 3) {
      setError(t('report.validation.min', 'El motivo debe tener al menos 3 caracteres.'));
      return;
    }

    if (trimmedReason.length > 500) {
      setError(t('report.validation.max', 'El motivo no puede superar los 500 caracteres.'));
      return;
    }

    if (!restaurantId) {
      alert(t('report.error', 'No se ha podido enviar la denuncia'));
      return;
    }

    setSubmitting(true);
    setError('');

    const createdReport = await reportService.createRestaurantReport(restaurantId, trimmedReason);
    setSubmitting(false);

    if (createdReport) {
      alert(t('report.success', 'Denuncia enviada correctamente'));
      onClose();
      return;
    }

    alert(t('report.error', 'No se ha podido enviar la denuncia'));
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15, 23, 42, 0.58)', backdropFilter: 'blur(8px)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="auth-card hc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-report-title"
        onClick={(event) => event.stopPropagation()}
        style={{ width: '100%', maxWidth: '560px', padding: '2rem', background: '#fff' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <h3 id="restaurant-report-title" style={{ margin: 0, fontSize: '1.6rem', color: '#1e293b' }}>
            {t('report.title', 'Denunciar restaurante')}
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {t('report.description', 'Cuéntanos por qué este restaurante debería revisarse.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="restaurant-report-reason" className="text-sm font-semibold text-slate-700">
              {t('report.fieldLabel', 'Motivo de la denuncia')}
            </label>
            <textarea
              id="restaurant-report-reason"
              className="form-input"
              style={{ minHeight: '140px', resize: 'none', padding: '1rem' }}
              value={reason}
              maxLength={500}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError('');
              }}
              placeholder={t('report.placeholder', 'Describe qué información es incorrecta, inexistente, cerrada o fraudulenta...')}
            />
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>{t('report.helper', 'Escribe un motivo claro y breve.')}</span>
              <span>{t('report.remaining', '{{count}} / 500 caracteres', { count: reason.length })}</span>
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{ width: 'auto', minWidth: '140px', background: '#fff', color: '#ea580c', border: '1px solid rgba(249, 115, 22, 0.22)' }}
            >
              {t('report.actions.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              className="btn"
              disabled={submitting}
              style={{
                width: 'auto',
                minWidth: '170px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#ffffff',
                boxShadow: '0 12px 25px -8px rgba(249, 115, 22, 0.75)',
              }}
            >
              {submitting ? t('report.actions.sending', 'Enviando…') : t('report.actions.send', 'Enviar denuncia')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerReviewModal({
  open,
  restaurant,
  onClose,
  onReviewCreated,
}: {
  open: boolean;
  restaurant: CustomerRestaurant;
  onClose: () => void;
  onReviewCreated: (newReview: IReview) => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [globalRating, setGlobalRating] = useState(10);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const restaurantId = restaurant._id ?? (restaurant as any).id ?? '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedComment = comment.trim();

    if (!restaurantId) {
      alert(t('reviews.error.missingRestaurant', 'No s\'ha pogut identificar el restaurant.'));
      return;
    }

    if (!user?._id && !user?.id) {
      alert(t('reviews.error.missingUser', 'Has d\'iniciar sessió per publicar una opinió.'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newReview = await reviewService.createReview({
        customer_id: user?._id || user?.id,
        restaurant_id: restaurantId,
        globalRating,
        comment: trimmedComment,
        likes: 0,
        images: [],
        ratings: {
          foodQuality: globalRating,
          staffService: globalRating,
          cleanliness: globalRating,
          environment: globalRating,
        },
      });

      if (newReview) {
        alert(t('reviews.success', 'Opinió enviada correctament!'));
        onReviewCreated(newReview);
        onClose();
      } else {
        setError(t('reviews.error.failed', 'No s\'ha pogut publicar la opinió.'));
      }
    } catch (err) {
      console.error('Error creating review:', err);
      setError(t('reviews.error.failed', 'No s\'ha pogut publicar la opinió.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.58)',
        backdropFilter: 'blur(8px)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="auth-card hc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-review-title"
        onClick={(event) => event.stopPropagation()}
        style={{ width: '100%', maxWidth: '560px', padding: '2rem', background: '#fff' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <h3 id="restaurant-review-title" style={{ margin: 0, fontSize: '1.6rem', color: '#1e293b' }}>
            {t('reviews.modal.title', 'Escriure una opinió')}
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {t('reviews.modal.description', 'Comparteix la teva experiència en aquest restaurant.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Valoració */}
          <div className="flex flex-col gap-2" style={{ marginBottom: '1rem' }}>
            <label className="text-sm font-semibold text-slate-700">
              {t('reviews.modal.ratingLabel', 'Valoració global (1-10)')}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setGlobalRating(val)}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: globalRating === val ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#f8fafc',
                    color: globalRating === val ? '#fff' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: globalRating === val ? '0 4px 10px rgba(249, 115, 22, 0.3)' : 'none',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Comentari */}
          <div className="flex flex-col gap-2">
            <label htmlFor="restaurant-review-comment" className="text-sm font-semibold text-slate-700">
              {t('reviews.modal.commentLabel', 'El teu comentari')}
            </label>
            <textarea
              id="restaurant-review-comment"
              className="form-input"
              style={{ minHeight: '100px', resize: 'none', padding: '1rem', width: '100%', boxSizing: 'border-box' }}
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                if (error) setError('');
              }}
              placeholder={t('reviews.modal.placeholder', 'Què t\'ha semblat el menjar, el servei i l\'ambient?')}
            />
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{ width: 'auto', minWidth: '120px', background: '#fff', color: '#ea580c', border: '1px solid rgba(249, 115, 22, 0.22)' }}
            >
              {t('reviews.actions.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              className="btn"
              disabled={submitting}
              style={{
                width: 'auto',
                minWidth: '150px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#ffffff',
                boxShadow: '0 12px 25px -8px rgba(249, 115, 22, 0.75)',
              }}
            >
              {submitting ? t('reviews.actions.submitting', 'Publicant…') : t('reviews.actions.submit', 'Publicar opinió')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getRestaurantVisitsCount(restaurant: CustomerRestaurant) {
  return (
    restaurant.profile?.visits ??
    (restaurant as CustomerRestaurant & { visits?: number }).visits ??
    0
  );
}

function CustomerRestaurantCard({
  restaurant,
  onClick,
}: {
  restaurant: CustomerRestaurant;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const img = getRestaurantImage(restaurant);
  const rating = getRestaurantRating(restaurant);

  return (
    <div className="hc-res-card" onClick={onClick}>
      <div className="hc-res-card__img">
        {img ? <img src={img} alt={getRestaurantName(restaurant)} /> : null}
        <div className="hc-res-card__img--placeholder" style={{ display: img ? 'none' : 'flex' }}>
          🍽️
        </div>
        <div className="hc-res-card__rating">
          <Star size={12} fill="currentColor" />
          {rating}
        </div>
      </div>
      <div className="hc-res-card__body">
        <p className="hc-res-card__name">{getRestaurantName(restaurant)}</p>
        {getRestaurantDescription(restaurant) && (
          <p className="hc-res-card__desc">{getRestaurantDescription(restaurant)}</p>
        )}
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
            <Clock size={12} /> {getRestaurantVisitsCount(restaurant)}{' '}
            {t('dashboard.customer.status.visits')}
          </span>
        </div>
      </div>
    </div>
  );
}

function CustomerLargeRestaurantCard({
  restaurant,
  onClick,
}: {
  restaurant: CustomerRestaurant;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const img = getRestaurantImage(restaurant);
  const rating = getRestaurantRating(restaurant);
  const distance = getRestaurantDistance(restaurant, '0.5 km');

  return (
    <div className="hc-large-card" onClick={onClick}>
      <div className="hc-large-card__banner">
        {img ? (
          <img src={img} alt={getRestaurantName(restaurant)} />
        ) : (
          <div className="hc-banner-placeholder" />
        )}
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
          <span className="hc-large-card__dist">
            <MapPin size={14} /> {distance}
          </span>
          {restaurant.profile?.pointsMultiplier && (
            <div className="hc-large-card__points-badge">
              <Gift size={14} /> {restaurant.profile.pointsMultiplier}x{' '}
              {t('dashboard.customer.status.points').toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-white p-5 shadow-sm space-y-4 ${className}`}>
      {children}
    </div>
  );
}

function formatDate(dateValue: string | Date | undefined | null): string {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
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
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const img = getRestaurantImage(restaurant);
  const rating = getRestaurantRating(restaurant);
  const userPointsForRestaurant =
    pointsWallet.find((wallet) => getRestaurantId(wallet) === restaurant._id)?.points || 0;
  const restaurantRewards = allRewards.filter(
    (reward) => getRestaurantId(reward) === restaurant._id,
  );
  const isFavorite = favoriteRestaurants.some((favorite) => favorite._id === restaurant._id);

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const isReviewLiked = (review: IReview) => {
    const userId = user?.id || user?._id;
    if (!userId || !review.likedBy) return false;
    return review.likedBy.some(id => String(id) === String(userId));
  };

  const handleLikeReview = async (reviewId?: string, currentLikes = 0) => {
    if (!reviewId) return;
    const review = reviews.find(r => r._id === reviewId || r.id === reviewId);
    if (!review) return;

    const isAlreadyLiked = isReviewLiked(review);
    const nextLikes = isAlreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
    const userId = user?.id || user?._id;

    // Optimistic UI update
    setReviews(prev => prev.map(rev => {
      const id = rev._id ?? rev.id;
      if (id === reviewId) {
        let updatedLikedBy = rev.likedBy || [];
        if (isAlreadyLiked) {
          updatedLikedBy = updatedLikedBy.filter(uid => String(uid) !== String(userId));
        } else if (userId) {
          updatedLikedBy = [...updatedLikedBy, String(userId)];
        }
        return { ...rev, likes: nextLikes, likedBy: updatedLikedBy };
      }
      return rev;
    }));

    try {
      const updatedReview = await reviewService.likeReview(reviewId);
      if (updatedReview) {
        setReviews(prev => prev.map(rev => {
          const id = rev._id ?? rev.id;
          const updatedId = updatedReview._id ?? updatedReview.id;
          return id === updatedId ? updatedReview : rev;
        }));
      }
    } catch (err) {
      console.error('Error updating review likes:', err);
      // Rollback
      setReviews(prev => prev.map(rev => {
        const id = rev._id ?? rev.id;
        if (id === reviewId) {
          return review;
        }
        return rev;
      }));
    }
  };

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      const resId = restaurant._id ?? (restaurant as any).id;
      if (!resId) {
        setReviews([]);
        setLoadingReviews(false);
        return;
      }
      setLoadingReviews(true);
      try {
        const data = await reviewService.fetchRestaurantReviews(resId);
        if (active) {
          setReviews(data || []);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        if (active) {
          setLoadingReviews(false);
        }
      }
    }
    loadReviews();
    return () => {
      active = false;
    };
  }, [restaurant]);

  return (
    <div className="hc-restaurant-detail">
      <button className="hc-back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
      </button>
      <div className="hc-restaurant-detail__banner hc-animate-fade">
        {img ? (
          <img src={img} alt={getRestaurantName(restaurant)} />
        ) : (
          <div className="hc-banner-placeholder" />
        )}
      </div>
      <div
        className="hc-restaurant-detail__header hc-animate-slide"
        style={{
          animationDelay: '0.1s',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h2>{getRestaurantName(restaurant)}</h2>
          <p>{getRestaurantCategory(restaurant).join(', ')}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className={`hc-fav-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(restaurant)}
            title={
              isFavorite
                ? t('dashboard.customer.actions.removeFavorite')
                : t('dashboard.customer.actions.addFavorite')
            }
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <div className="hc-restaurant-detail__rating">
            <Star size={16} fill="currentColor" /> {rating}
          </div>
        </div>
      </div>

      {restaurant.profile?.pointsMultiplier && (
        <div
          className="hc-points-multiplier-banner hc-animate-slide"
          style={{ animationDelay: '0.2s' }}
        >
          <div>
            <p className="hc-pmb-title">{t('dashboard.customer.details.multiplierTitle')}</p>
            <h3 className="hc-pmb-value">{restaurant.profile.pointsMultiplier}x</h3>
            <p className="hc-pmb-desc">{t('dashboard.customer.details.multiplierDesc')}</p>
          </div>
          <Gift size={48} opacity={0.5} />
        </div>
      )}

      <div
        className="hc-restaurant-detail__info-grid hc-animate-slide"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="hc-info-box">
          <Coins size={18} className="text-orange" />
          <div>
            <p>
              {userPointsForRestaurant} {t('dashboard.customer.status.points')}
            </p>
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

      <div
        className="hc-restaurant-detail__section hc-animate-slide"
        style={{ animationDelay: '0.4s' }}
      >
        <h3>{t('dashboard.customer.details.about')}</h3>
        <p>
          {getRestaurantDescription(restaurant) ||
            'El millor restaurant del barri amb ingredients frescos i de qualitat.'}
        </p>
      </div>

      <div className="hc-restaurant-detail__section">
        <h3>{t('rewards.title', 'Recompenses disponibles')}</h3>
        <div className="hc-rewards-list">
          {restaurantRewards.length > 0 ? (
            restaurantRewards.map((reward) => (
              <div key={reward._id} className="hc-reward-item">
                <div>
                  <h4>{reward.name}</h4>
                  <span>
                    {reward.pointsRequired} {t('dashboard.customer.status.points')}
                  </span>
                </div>
                <button
                  className="hc-reward-btn"
                  onClick={() => {
                    onSelectedReward(reward);
                    return onOpenRewardQrModal();
                  }}
                >
                  <Gift size={20} className="text-orange" />{' '}
                  {t('dashboard.customer.actions.redeem')}
                </button>
              </div>
            ))
          ) : (
            <p className="hc-empty">
              {t('rewards.noRewards', 'Aquest restaurant no té recompenses registrades.')}
            </p>
          )}
        </div>
      </div>

      <div className="hc-restaurant-detail__section hc-animate-slide" style={{ animationDelay: '0.5s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{t('reviews.title', 'Opinions dels clients')}</h3>
          <button
            onClick={() => setReviewOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              border: 'none',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(249, 115, 22, 0.2)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Star size={16} fill="currentColor" />
            {t('reviews.addReview', 'Opinar')}
          </button>
        </div>
        {loadingReviews ? (
          <div className="text-center py-4 text-sm text-slate-500">{t('reviews.loading', 'Carregant opinions...')}</div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-4" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {reviews.map((review) => (
              <Card key={review._id || review.id}>
                <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-semibold text-orange-500" style={{ fontWeight: 600, color: '#f97316' }}>
                    ⭐ {review.globalRating}/10
                  </span>

                  <span className="text-gray-500 text-sm" style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {formatDate(review.date || review.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-slate-700" style={{ fontSize: '0.9rem', color: '#334155', margin: '0.5rem 0' }}>
                  {review.comment || t('reviews.noComment', 'Sense comentaris')}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', margin: '0.5rem 0' }}>
                    {review.images.map((img) => (
                      <img
                        key={img}
                        src={img}
                        className="rounded-lg h-24 w-full object-cover"
                        style={{ borderRadius: '0.5rem', height: '6rem', width: '100%', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                )}

                <button
                  className="btn-like"
                  onClick={() => handleLikeReview(review._id || review.id, review.likes)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    border: isReviewLiked(review)
                      ? '1px solid rgba(249, 115, 22, 0.3)'
                      : '1px solid rgba(0,0,0,0.05)',
                    background: isReviewLiked(review)
                      ? '#fff7ed'
                      : '#f8fafc',
                    color: isReviewLiked(review)
                      ? '#ea580c'
                      : 'inherit',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: isReviewLiked(review)
                      ? 600
                      : 'normal',
                    transition: 'all 0.2s ease'
                  }}
                >
                  👍 {review.likes || 0}
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <p className="hc-empty" style={{ marginTop: '1rem' }}>
            {t('reviews.noReviews', 'Aquest restaurant encara no té opinions.')}
          </p>
        )}
      </div>

      <button className="hc-checkin-btn" onClick={onOpenQrModal}>
        <QrCode size={20} /> {t('dashboard.customer.actions.checkIn')}
      </button>

      <button className="hc-report-btn" type="button" onClick={() => setReportOpen(true)}>
        <Flag size={18} /> {t('dashboard.customer.actions.reportRestaurant', 'Denunciar restaurante')}
      </button>

      {
    reportOpen && (
      <CustomerReportModal
        open={reportOpen}
        restaurant={restaurant}
        onClose={() => setReportOpen(false)}
      />
    )
  }

  {
    reviewOpen && (
      <CustomerReviewModal
        open={reviewOpen}
        restaurant={restaurant}
        onClose={() => setReviewOpen(false)}
        onReviewCreated={(newReview) => {
          setReviews((prev) => [newReview, ...prev]);
        }}
      />
    )
  }

  {/* Chat con el restaurante */ }
  <div style={{ marginTop: '1rem' }}>
    <CustomerChatButton
      restaurantId={restaurant._id ?? (restaurant as any).id ?? ''}
      restaurantName={getRestaurantName(restaurant)}
    />
  </div>
    </div >
  );
}

export function CustomerSidebar({ activeTab, onTabChange, user, onLogout }: CustomerSidebarProps) {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  return (
    <aside className="hc-sidebar">
      <div className="hc-sidebar__brand">
        <div className="hc-sidebar__logo">🍽️</div>
        <div>
          <p className="hc-sidebar__title">{t('navbar.logo', 'EasyEat')}</p>
          <p className="hc-sidebar__subtitle">
            {t('auth.login.tagline', 'Tu experiencia gastronómica')}
          </p>
        </div>
      </div>

      <nav className="hc-sidebar-nav">
        <button
          type="button"
          className={activeTab === 'home' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'}
          onClick={() => onTabChange('home')}
        >
          <Home size={18} />
          <span>{t('sidebar.home', 'Inici')}</span>
        </button>
        <button
          type="button"
          className={
            activeTab === 'discover' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'
          }
          onClick={() => onTabChange('discover')}
        >
          <MapPin size={18} />
          <span>{t('sidebar.discover', 'Descobrir')}</span>
        </button>
        <button
          type="button"
          className={
            activeTab === 'rewards' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'
          }
          onClick={() => onTabChange('rewards')}
        >
          <Gift size={18} />
          <span>{t('sidebar.pointsWallet', 'Cartera de Punts')}</span>
        </button>
        <button
          type="button"
          className={
            activeTab === 'profile' ? 'hc-sidebar-nav__item active' : 'hc-sidebar-nav__item'
          }
          onClick={() => onTabChange('profile')}
        >
          <User size={18} />
          <span>{t('sidebar.profile', 'Perfil')}</span>
        </button>
      </nav>

      <div className="hc-sidebar-footer">
        <div className="hc-sidebar-user">
          <div className="hc-sidebar-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p>{user?.name}</p>
            <span>
              {user?.role === 'owner'
                ? t('auth.roles.owner')
                : user?.role === 'staff'
                  ? t('auth.roles.staff')
                  : t('auth.roles.customer')}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="hc-theme-toggle"
          aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          <span className="hc-theme-toggle__label">
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
            {isDark ? 'Modo Oscuro' : 'Modo Claro'}
          </span>
          <span className={`hc-theme-toggle__switch ${isDark ? 'active' : ''}`}>
            <span />
          </span>
        </button>
        <button onClick={onLogout} className="hc-sidebar-logout">
          {t('sidebar.logout', 'Logout')}
        </button>
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
          <p className="hc-hero__sub">
            {t('dashboard.customer.discover', 'Descubre sabores que te esperan hoy')}
          </p>
        </div>
        <div className="hc-hero__orbs">
          <div className="hc-orb hc-orb--1" />
          <div className="hc-orb hc-orb--2" />
        </div>
      </section>

      <section className="hc-stats">
        <div className="hc-stat-card hc-stat-card--points">
          <div className="hc-stat-card__icon">
            <Coins size={22} />
          </div>
          <div className="hc-stat-card__info">
            <span className="hc-stat-card__value">{totalPoints.toLocaleString()}</span>
            <span className="hc-stat-card__label">
              {t('dashboard.customer.stats.totalPoints', 'Punts totals')}
            </span>
          </div>
        </div>
        <div className="hc-stat-card hc-stat-card--visits">
          <div className="hc-stat-card__icon">
            <Clock size={22} />
          </div>
          <div className="hc-stat-card__info">
            <span className="hc-stat-card__value">{visits.length}</span>
            <span className="hc-stat-card__label">
              {t('dashboard.customer.stats.visits', 'Visites')}
            </span>
          </div>
        </div>
        <div className="hc-stat-card hc-stat-card--badges">
          <div className="hc-stat-card__icon">
            <Trophy size={22} />
          </div>
          <div className="hc-stat-card__info">
            <span className="hc-stat-card__value">{badges.length}</span>
            <span className="hc-stat-card__label">
              {t('dashboard.customer.stats.badges', 'Badges')}
            </span>
          </div>
        </div>
        <div className="hc-stat-card hc-stat-card--favs">
          <div className="hc-stat-card__icon">
            <Heart size={22} />
          </div>
          <div className="hc-stat-card__info">
            <span className="hc-stat-card__value">{displayFavorites.length}</span>
            <span className="hc-stat-card__label">
              {t('dashboard.customer.stats.favorites', 'Favorits')}
            </span>
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
          <h2 className="hc-section__title">
            <Heart size={18} /> {t('dashboard.customer.sections.favorites', 'Els teus favorits')}
          </h2>
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
          <div className="hc-empty">
            {t('dashboard.customer.empty.favorites', 'No tienes restaurantes favoritos todavía.')}
          </div>
        )}
      </section>

      {allRewards.length > 0 && (
        <section className="hc-section">
          <div className="hc-section__head">
            <h2 className="hc-section__title">
              <Gift size={18} />{' '}
              {t('dashboard.customer.sections.rewards', 'Recompensas destacadas')}
            </h2>
          </div>
          <div
            className="hc-rewards-carousel"
            style={{
              display: 'flex',
              gap: '1.5rem',
              overflowX: 'auto',
              paddingBottom: '1.5rem',
              scrollSnapType: 'x mandatory',
            }}
          >
            {allRewards.slice(0, 6).map((reward, index) => {
              const restaurant = restaurants.find(
                (item) => getRestaurantId(item) === getRestaurantId(reward),
              );
              const image = restaurant ? getRestaurantImage(restaurant) : '';

              return (
                <div
                  key={reward._id || index}
                  className="hc-reward-card-premium hc-animate-slide"
                  style={{
                    animationDelay: `${0.1 * index}s`,
                    backgroundImage: image
                      ? `url(${image})`
                      : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  }}
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
            <h2 className="hc-section__title">
              <Trophy size={18} /> {t('dashboard.customer.sections.badges', 'Tus logros')}
            </h2>
          </div>
          <div className="hc-badges-row">
            {badges.map((badge, index) => (
              <div key={`${badge.title || 'badge'}-${index}`} className="hc-badge-card">
                <div className="hc-badge-card__icon">{badge.icon || '🏆'}</div>
                <div className="hc-badge-card__info">
                  <p>{badge.title || `Badge ${index + 1}`}</p>
                  <span>
                    {badge.subtitle ||
                      t('dashboard.customer.objectives.level', 'Objetivo completado')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="hc-section">
        <div className="hc-section__head">
          <h2 className="hc-section__title">
            <Clock size={18} />{' '}
            {t('dashboard.customer.sections.objectives', 'Objetivos por alcanzar')}
          </h2>
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
            <small>
              {t('dashboard.customer.objectives.progress', 'Progreso:')} {objective1Progress}%
            </small>
          </div>
          <div className="hc-objective-card">
            <div className="hc-objective-card__header">
              <p>{t('dashboard.customer.objectives.points', 'Acumula 2000 puntos totales')}</p>
              <span>{totalPoints} / 2000</span>
            </div>
            <div className="hc-progress-bar">
              <div className="hc-progress-bar__fill" style={{ width: `${objective2Progress}%` }} />
            </div>
            <small>
              {t('dashboard.customer.objectives.progress', 'Progreso:')} {objective2Progress}%
            </small>
          </div>
          <div className="hc-objective-card">
            <div className="hc-objective-card__header">
              <p>
                {t('dashboard.customer.objectives.level', 'Alcanza nivel 10 en un restaurante')}
              </p>
              <span>{Math.min(visits.length, 10)} / 10</span>
            </div>
            <div className="hc-progress-bar">
              <div className="hc-progress-bar__fill" style={{ width: `${objective3Progress}%` }} />
            </div>
            <small>
              {t('dashboard.customer.objectives.progress', 'Progreso:')} {objective3Progress}%
            </small>
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
              {user?.role === 'owner'
                ? t('auth.roles.owner')
                : user?.role === 'staff'
                  ? t('auth.roles.staff')
                  : t('auth.roles.customer', 'Cuenta Verificada')}
            </div>

            <div className="w-full h-px bg-slate-100 my-6"></div>

            <div className="w-full flex justify-between items-center text-sm mb-4">
              <span className="text-slate-500 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />{' '}
                {t('dashboard.customer.stats.visits', 'Visitas totales')}
              </span>
              <span className="font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-md">
                {visits.length}
              </span>
            </div>
            <div className="w-full flex justify-between items-center text-sm mb-6">
              <span className="text-slate-500 flex items-center gap-2">
                <Coins size={16} className="text-orange-500" />{' '}
                {t('dashboard.customer.stats.totalPoints', 'Puntos acumulados')}
              </span>
              <span className="font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                {totalPoints}
              </span>
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
                  <h3 className="text-base font-bold text-slate-800">
                    {t('dashboard.customer.profile.title', 'Información Personal')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      'dashboard.customer.profile.subtitle',
                      'Actualiza tus datos básicos de contacto.',
                    )}
                  </p>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      {t('auth.register.form.fullName', 'Nombre completo')}
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none ${nameError ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}`}
                        placeholder={t('auth.register.form.namePlaceholder')}
                        value={customerName}
                        onChange={(event) => onNameChange(event.target.value)}
                        required
                      />
                    </div>
                    {nameError && (
                      <span className="text-xs text-red-500 mt-1 font-medium">{nameError}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      {t('auth.register.form.email', 'Correo electrónico')}
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none ${emailError ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}`}
                        placeholder={t('auth.register.form.emailPlaceholder')}
                        value={customerEmail}
                        onChange={(event) => onEmailChange(event.target.value)}
                        required
                      />
                    </div>
                    {emailError && (
                      <span className="text-xs text-red-500 mt-1 font-medium">{emailError}</span>
                    )}
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
                  <h3 className="text-base font-bold text-slate-800">
                    {t('settings.security.title', 'Seguridad de la Cuenta')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      'profile.form.passwordHint',
                      'Deja este campo en blanco si no deseas cambiarla.',
                    )}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-1.5 max-w-md">
                  <label className="text-sm font-semibold text-slate-700">
                    {t('profile.form.password', 'Nueva contraseña')}
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all outline-none ${passwordError ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}`}
                      placeholder="••••••••"
                      value={customerPassword}
                      onChange={(event) => onPasswordChange(event.target.value)}
                    />
                  </div>
                  {passwordError && (
                    <span className="text-xs text-red-500 mt-1 font-medium">{passwordError}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones y Estados */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-2 mb-8">
              <div className="w-full sm:w-auto">
                {success && (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">
                    <CheckCircle size={18} />{' '}
                    {t('settings.form.updated', 'Perfil actualizado con éxito')}
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
                      'Estás a punto de eliminar tu cuenta.\n\nEsta acción es IRREVERSIBLE y perderás todos tus puntos, recompensas y tu historial de visitas de forma permanente.\n\n¿Estás completamente seguro de que quieres proceder?',
                    );
                    if (window.confirm(message)) {
                      onDeleteAccount();
                    }
                  }}
                  className="px-6 py-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <X size={16} />
                  <span>
                    {t('dashboard.customer.profile.dangerZone.delete', 'Eliminar cuenta')}
                  </span>
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
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
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
    const matchesSearch =
      (restaurant.profile?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.profile?.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (restaurant.profile?.category || []).some((category) =>
        category.toLowerCase().includes(selectedCategory.toLowerCase()),
      );
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
    <>
      <div className="hc-discover-view">
        <div className="hc-discover-header">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{t('discover.title', 'Descobrir')}</h2>
            <button
              type="button"
              className='hc-map-btn'
              onClick={() => setIsAssistantOpen(true)}
              title={t("discover.talkAssistant", "Parla amb l'assistent")}
              aria-label={t('discover.talkAssistant', "Parla amb l'assistent")}
            >
              <Bot size={18} />
              <span>{t('discover.assistant', "Assistent")}</span>
            </button>
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
                onClick={() => {
                  trackEvent('Discover', 'Filter category', category.name);
                  onCategoryChange(category.name);
                }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hc-discover-results">
          <p className="hc-results-count">
            <strong>{filteredRestaurants.length}</strong>{' '}
            {t('discover.resultsCount', 'restaurants trobats')}
          </p>
          <div className="hc-large-cards">
            {filteredRestaurants.map((restaurant) => (
              <CustomerLargeRestaurantCard
                key={restaurant._id || restaurant.id}
                restaurant={restaurant}
                onClick={() => {
                  trackEvent('Restaurant', 'Open detail', restaurant.profile?.name);
                  onSelectRestaurant(restaurant);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI Assistant side panel */}
      <AssistantChat isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
}

export function CustomerHistoryRewardsView({
  visits,
  restaurants,
}: CustomerHistoryRewardsViewProps) {
  const totalVisits = visits.length;
  const totalMoneySpent = visits.reduce((sum, visit) => sum + (Number(visit.billAmount) || 0), 0);
  const totalPointsEarned = visits.reduce(
    (sum, visit) => sum + (Number(visit.pointsEarned) || 0),
    0,
  );

  const getRestaurantInfo = (restaurantData: CustomerVisit['restaurant_id']) => {
    if (!restaurantData) return null;
    if (typeof restaurantData === 'object') return restaurantData;
    return restaurants.find(
      (restaurant) => restaurant._id === restaurantData || restaurant.id === restaurantData,
    );
  };

  const { t, i18n } = useTranslation();
  return (
    <div className="hc-rewards-dashboard hc-animate-fade">
      <div className="hc-discover-header">
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', marginTop: 0 }}>
          {t('stats_dashboard.title', 'Les teves Estadístiques')}
        </h2>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem' }}>
          {t('stats_dashboard.tagline', 'Així és com has aprofitat EasyEat fins ara.')}
        </p>
      </div>

      <div className="hc-rewards-stats">
        <div
          className="hc-stat-card hc-stat-card--money hc-animate-slide"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="hc-stat-card__icon">
            <Wallet size={24} />
          </div>
          <div>
            <h3>{totalMoneySpent.toFixed(2)}€</h3>
            <p>{t('stats_dashboard.spent', 'Diners gastats')}</p>
          </div>
        </div>
        <div
          className="hc-stat-card hc-stat-card--points hc-animate-slide"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="hc-stat-card__icon">
            <Coins size={24} />
          </div>
          <div>
            <h3>{totalPointsEarned}</h3>
            <p>{t('stats_dashboard.earned', 'Punts acumulats')}</p>
          </div>
        </div>
        <div
          className="hc-stat-card hc-stat-card--visits hc-animate-slide"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="hc-stat-card__icon">
            <Clock size={24} />
          </div>
          <div>
            <h3>{totalVisits}</h3>
            <p>{t('stats_dashboard.visits', 'Visites realitzades')}</p>
          </div>
        </div>
      </div>

      <div
        className="hc-rewards-history-section hc-animate-slide"
        style={{ animationDelay: '0.4s' }}
      >
        <h3 className="hc-rewards-history-title">
          {t('stats_dashboard.history.title', "Historial d'activitat i recompenses escanejades")}
        </h3>
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
                      {image ? (
                        <img
                          src={image}
                          alt={restaurant ? getRestaurantName(restaurant) : 'Restaurant'}
                        />
                      ) : (
                        <div className="placeholder">🍽️</div>
                      )}
                    </div>
                    <div className="hc-history-item__info">
                      <h4>
                        {restaurant
                          ? getRestaurantName(restaurant)
                          : t('stats_dashboard.history.unknownRestaurant', 'Restaurant desconegut')}
                      </h4>
                      <p>
                        {date.toLocaleDateString(
                          i18n.language === 'ca'
                            ? 'ca-ES'
                            : i18n.language === 'es'
                              ? 'es-ES'
                              : 'en-US',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
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
            <div className="hc-empty">
              {t(
                'stats_dashboard.history.empty',
                'No tens cap visita ni recompensa registrada encara.',
              )}
            </div>
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
        <p>
          {t('qr.user.desc', 'Mostra aquest codi al cambrer per fer el check-in i guanyar punts.')}
        </p>
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

export function RewardQrModal({
  open,
  onClose,
  userId,
  restaurantId,
  rewardId,
}: RewardQrModalProps) {
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
