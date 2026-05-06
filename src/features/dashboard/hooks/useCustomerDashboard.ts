import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import { customerService } from '@/services/customer-service';
import type { ICustomer, IRestaurant } from '@/types';

export interface CustomerRestaurantLocation {
  city?: string;
  distance?: string;
  address?: string;
}

export interface CustomerRestaurantProfile {
  name?: string;
  description?: string;
  category?: string[];
  image?: string[];
  globalRating?: number | string;
  pointsMultiplier?: number | string;
  hasOffer?: boolean;
  distance?: string;
  location?: CustomerRestaurantLocation;
  visits?: number;
}

export interface CustomerRestaurant {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  image?: string[];
  location?: CustomerRestaurantLocation;
  profile?: CustomerRestaurantProfile;
}

export interface CustomerReward {
  _id?: string;
  id?: string;
  name?: string;
  pointsRequired?: number;
  restaurant_id?: string | CustomerRestaurant | { _id?: string; id?: string };
}

export interface CustomerBadge {
  icon?: string;
  title?: string;
  subtitle?: string;
}

export interface CustomerPointsWalletEntry {
  _id?: string,
  id?: string,
  restaurant_id?: string | CustomerRestaurant | { _id?: string; id?: string };
  points?: number;
}

export interface CustomerVisit {
  _id?: string;
  id?: string;
  restaurant_id?: string | CustomerRestaurant | { _id?: string; id?: string };
  restaurant_name?: string;
  date?: string;
  createdAt?: string;
  billAmount?: number;
  pointsEarned?: number;
}

export type CustomerTabId = 'home' | 'discover' | 'qr' | 'rewards' | 'profile';

interface PaginatedList<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseCustomerDashboardResult {
  activeTab: CustomerTabId;
  setActiveTab: (tab: CustomerTabId) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedRestaurant: CustomerRestaurant | null;
  setSelectedRestaurant: (restaurant: CustomerRestaurant | null) => void;
  showQrModal: boolean;
  setShowQrModal: (value: boolean) => void;
  favoriteRestaurants: CustomerRestaurant[];
  pointsWallet: CustomerPointsWalletEntry[];
  badges: CustomerBadge[];
  visits: CustomerVisit[];
  restaurants: CustomerRestaurant[];
  allRewards: CustomerReward[];
  loadingCustomerData: boolean;
  customer: ICustomer | null;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPassword: string;
  setCustomerPassword: (value: string) => void;
  nameError: string;
  emailError: string;
  passwordError: string;
  updating: boolean;
  success: boolean;
  totalPoints: number;
  uniqueRestaurantsVisited: number;
  objective1Progress: number;
  objective2Progress: number;
  objective3Progress: number;
  displayFavorites: CustomerRestaurant[];
  handleTabChange: (tab: CustomerTabId) => void;
  handleToggleFavorite: (restaurant: CustomerRestaurant) => void;
  handleSubmitProfile: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  logout: () => Promise<void>;
  user: ICustomer | null;
  token: string | null;
}

const DEFAULT_META = { total: 0, page: 1, limit: 1, totalPages: 1 };
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePaginatedListResponse<T>(payload: unknown, fallbackLimit = 10): PaginatedList<T> {
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      meta: { total: payload.length, page: 1, limit: fallbackLimit, totalPages: 1 },
    };
  }

  if (!isRecord(payload)) {
    return { data: [], meta: DEFAULT_META };
  }

  const data = Array.isArray(payload.data) ? (payload.data as T[]) : [];
  const rawMeta = isRecord(payload.meta) ? payload.meta : {};
  const total = toNumber(rawMeta.total, data.length);
  const page = toNumber(rawMeta.page, 1);
  const limit = toNumber(rawMeta.limit, fallbackLimit);
  const totalPages = toNumber(rawMeta.totalPages, Math.max(1, Math.ceil(total / Math.max(1, limit))));

  return { data, meta: { total, page, limit, totalPages } };
}

function getRestaurantIdFromEntry(entry: CustomerRestaurant | CustomerPointsWalletEntry | CustomerVisit | CustomerReward | null | undefined): string | undefined {
  if (!entry || !isRecord(entry)) return undefined;

  const directRestaurantId = entry.restaurant_id;
  if (typeof directRestaurantId === 'string') return directRestaurantId;
  if (isRecord(directRestaurantId)) {
    return String(directRestaurantId._id ?? directRestaurantId.id ?? '');
  }

  return String(entry._id ?? entry.id ?? '');
}

export function useCustomerDashboard(): UseCustomerDashboardResult {
  const { t } = useTranslation();
  const { user, logout, token, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get('tab') as CustomerTabId) || 'home';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tots');
  const [selectedRestaurant, setSelectedRestaurant] = useState<CustomerRestaurant | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const [favoriteRestaurants, setFavoriteRestaurants] = useState<CustomerRestaurant[]>([]);
  const [pointsWallet, setPointsWallet] = useState<CustomerPointsWalletEntry[]>([]);
  const [badges, setBadges] = useState<CustomerBadge[]>([]);
  const [visits, setVisits] = useState<CustomerVisit[]>([]);
  const [restaurants, setRestaurants] = useState<CustomerRestaurant[]>([]);
  const [allRewards, setAllRewards] = useState<CustomerReward[]>([]);
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);

  const [customer, setCustomer] = useState<ICustomer | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTabChange = useCallback((tab: CustomerTabId) => {
    setSearchParams({ tab });
    setSelectedRestaurant(null);
  }, [setSearchParams]);

  useEffect(() => {
    async function fetchCustomerData() {
      const customerId = user?._id || user?.id;
      if (!token || !customerId) {
        setLoadingCustomerData(false);
        return;
      }

      try {
        const [favRes, ptsRes, badgesRes, visitsRes, profileRes, restRes, rewardsRes] = await Promise.allSettled([
          apiClient.get(`/customers/${customerId}/favouriteRestaurants`, { params: { page: 1, limit: 10 } }),
          apiClient.get(`/customers/${customerId}/pointsWallet`, { params: { page: 1, limit: 20 } }),
          apiClient.get(`/customers/${customerId}/badges`, { params: { page: 1, limit: 10 } }),
          apiClient.get(`/customers/${customerId}/visits`, { params: { page: 1, limit: 20 } }),
          customerService.fetchCustomer(customerId),
          apiClient.get('/restaurants', { params: { page: 1, limit: 100 } }),
          apiClient.get('/rewards', { params: { page: 1, limit: 500 } }),
        ]);

        if (favRes.status === 'fulfilled') {
          const parsedFavorites = parsePaginatedListResponse<CustomerRestaurant>(favRes.value.data, 10);
          setFavoriteRestaurants(parsedFavorites.data);
        }

        if (ptsRes.status === 'fulfilled') {
          const parsedPoints = parsePaginatedListResponse<CustomerPointsWalletEntry>(ptsRes.value.data, 20);
          setPointsWallet(parsedPoints.data);
        }

        if (badgesRes.status === 'fulfilled') {
          const parsedBadges = parsePaginatedListResponse<CustomerBadge>(badgesRes.value.data, 10);
          setBadges(parsedBadges.data);
        }

        if (visitsRes.status === 'fulfilled') {
          const parsedVisits = parsePaginatedListResponse<CustomerVisit>(visitsRes.value.data, 20);
          setVisits(parsedVisits.data);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setCustomer(profileRes.value);
          setCustomerName(profileRes.value.name || '');
          setCustomerEmail(profileRes.value.email || '');
        }

        if (restRes.status === 'fulfilled') {
          const parsedRest = parsePaginatedListResponse<CustomerRestaurant>(restRes.value.data, 100);
          setRestaurants(parsedRest.data);
        }

        if (rewardsRes.status === 'fulfilled') {
          const parsedRewards = parsePaginatedListResponse<CustomerReward>(rewardsRes.value.data, 500);
          setAllRewards(parsedRewards.data);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoadingCustomerData(false);
      }
    }

    if (user && (user._id || user.id)) {
      fetchCustomerData();
    }
  }, [user, token]);

  const handleToggleFavorite = useCallback((restaurant: CustomerRestaurant) => {
    const isFavorite = favoriteRestaurants.some((favorite) => favorite._id === restaurant._id);

    if (isFavorite) {
      setFavoriteRestaurants(favoriteRestaurants.filter((favorite) => favorite._id !== restaurant._id));
    } else {
      setFavoriteRestaurants([...favoriteRestaurants, restaurant]);
    }
  }, [favoriteRestaurants]);

  const handleSubmitProfile = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !customer?._id) return;

    setNameError('');
    setEmailError('');
    setPasswordError('');

    let hasError = false;

    if (customerName.length < 2 || customerName.length > 100) {
      setNameError(t('settings.form.nameError'));
      hasError = true;
    }

    if (!EMAIL_REGEX.test(customerEmail)) {
      setEmailError(t('settings.form.emailError'));
      hasError = true;
    }

    if (customerPassword.length > 0 && !PASSWORD_REGEX.test(customerPassword)) {
      setPasswordError(t('settings.form.passwordError'));
      hasError = true;
    }

    if (hasError) return;

    setUpdating(true);
    setSuccess(false);

    try {
      const updatedCustomer = await customerService.updateCustomer(customer._id, {
        ...customer,
        name: customerName,
        email: customerEmail,
        password: customerPassword.length > 0 ? customerPassword : undefined,
      });

      setCustomer(updatedCustomer);
      updateUser({ name: updatedCustomer.name, email: updatedCustomer.email });
      setSuccess(true);
      setCustomerPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setUpdating(false);
    }
  }, [customer, customerEmail, customerName, customerPassword, t, token, updateUser]);

  const totalPoints = useMemo(
    () => pointsWallet.reduce((sum, wallet) => sum + toNumber(wallet.points, 0), 0),
    [pointsWallet],
  );

  const uniqueRestaurantsVisited = useMemo(
    () => new Set(visits.map((visit) => {
      if (isRecord(visit.restaurant_id)) {
        const restaurantProfile = isRecord((visit.restaurant_id as any).profile) ? (visit.restaurant_id as any).profile : null;
        return String(restaurantProfile?.name ?? visit.restaurant_name ?? '');
      }

      return visit.restaurant_name || '';
    })).size,
    [visits],
  );

  const objective1Progress = Math.min(100, Math.round((uniqueRestaurantsVisited / 10) * 100));
  const objective2Progress = Math.min(100, Math.round((totalPoints / 2000) * 100));
  const objective3Progress = Math.min(100, Math.round((Math.min(visits.length, 10) / 10) * 100));

  const displayFavorites = useMemo(
    () => (favoriteRestaurants.length > 0 ? favoriteRestaurants.slice(0, 3) : []),
    [favoriteRestaurants],
  );

  return {
    activeTab,
    setActiveTab: handleTabChange,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedRestaurant,
    setSelectedRestaurant,
    showQrModal,
    setShowQrModal,
    favoriteRestaurants,
    pointsWallet,
    badges,
    visits,
    restaurants,
    allRewards,
    loadingCustomerData,
    customer,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPassword,
    setCustomerPassword,
    nameError,
    emailError,
    passwordError,
    updating,
    success,
    totalPoints,
    uniqueRestaurantsVisited,
    objective1Progress,
    objective2Progress,
    objective3Progress,
    displayFavorites,
    handleTabChange,
    handleToggleFavorite,
    handleSubmitProfile,
    logout,
    user: user as ICustomer | null,
    token,
  };
}