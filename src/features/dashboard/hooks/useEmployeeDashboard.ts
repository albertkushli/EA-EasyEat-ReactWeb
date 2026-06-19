import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { restaurantService, reviewService } from '@/services';
import { getDishesByRestaurant } from '@/services/dish.service';
import { DEFAULT_META, USER_ROLES, VISITS_LIMIT, VISITS_PAGE_SIZE } from '@/constants';
import type { IEmployeeStats, IRestaurant, IRestaurantStats, IReview, IVisit, UserRole } from '@/types';
import type { Dish } from '@/types/Dish';

interface UseEmployeeDashboardResult {
  t: ReturnType<typeof useTranslation>['t'];
  user: ReturnType<typeof useAuth>['user'];
  role: UserRole | null;
  token: string | null;
  restaurant: ReturnType<typeof useAuth>['restaurant'];
  restaurants: IRestaurant[];
  selectedRestaurant: IRestaurant | null;
  setSelectedRestaurant: (restaurant: IRestaurant | null) => void;
  logout: ReturnType<typeof useAuth>['logout'];
  activeView: string;
  setActiveView: (view: string) => void;
  visits: IVisit[];
  allVisits: IVisit[];
  visitsMeta: typeof DEFAULT_META;
  visitsPage: number;
  setVisitsPage: (page: number) => void;
  restaurantKpis: IRestaurantStats | null;
  reviews: IReview[];
  employees: IEmployeeStats[];
  dishes: Dish[];
  loading: boolean;
  restName: string;
  restRating?: number;
  restAddress?: string;
  loyalCustomers: number;
  averagePointsPerVisit: number;
  isOwner: boolean;
  isDataLoading: boolean;
}

export function useEmployeeDashboard(): UseEmployeeDashboardResult {
  const { t } = useTranslation();
  const { user, logout, role, token, restaurant } = useAuth();

  const [visits, setVisits] = useState<IVisit[]>([]);
  const [allVisits, setAllVisits] = useState<IVisit[]>([]);
  const [visitsMeta, setVisitsMeta] = useState(DEFAULT_META);
  const [visitsPage, setVisitsPage] = useState(1);
  const [restaurantKpis, setRestaurantKpis] = useState<IRestaurantStats | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [employees] = useState<IEmployeeStats[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<IRestaurant | null>(null);
  const { view } = useParams();
  const [loading, setLoading] = useState(true);
  const isOwner = role === USER_ROLES.OWNER;
  const activeRestaurant = selectedRestaurant ?? restaurant;
  const activeRestaurantId = activeRestaurant?._id ?? activeRestaurant?.id ?? user?.restaurant_id ?? '';

  const [activeView, setActiveView] = useState(() => {
    if (
      view &&
      [
        'profile',
        'dashboard',
        'clients',
        'dishes',
        'employees',
        'rewards',
        'analytics',
        'settings',
        'chat',
        'billing',
      ].includes(view)
    ) {
      return view;
    }
    return isOwner ? 'dashboard' : 'profile';
  });

  useEffect(() => {
    if (
      view &&
      [
        'profile',
        'dashboard',
        'clients',
        'dishes',
        'employees',
        'rewards',
        'analytics',
        'settings',
        'chat',
        'billing',
      ].includes(view)
    ) {
      setActiveView(view);
    }
  }, [view]);

  useEffect(() => {
    async function fetchVisits() {
      setLoading(true);
      if (!activeRestaurantId) {
        setVisits([]);
        setVisitsMeta(DEFAULT_META);
        setLoading(false);
        return;
      }

      try {
        const response = await restaurantService.fetchRestaurantVisits(
          activeRestaurantId,
          visitsPage,
          VISITS_LIMIT,
        );
        setVisits(response.data);
        setVisitsMeta(response.meta);
      } catch (error) {
        console.error('Error fetching visits:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVisits();
  }, [activeRestaurantId, token, visitsPage]);

  useEffect(() => {
    async function loadAllVisits() {
      if (!activeRestaurantId) {
        setAllVisits([]);
        return;
      }

      const visitsData = await restaurantService.fetchAllRestaurantVisits(
        activeRestaurantId,
        VISITS_PAGE_SIZE,
      );
      setAllVisits(visitsData);
    }

    loadAllVisits();
  }, [activeRestaurantId, token]);

  useEffect(() => {
    async function fetchOwnerRestaurants() {
      if (role !== USER_ROLES.OWNER || !user?._id) {
        return;
      }

      try {
        const ownedRestaurants = await restaurantService.fetchRestaurantsByOwner(user._id);
        setRestaurants(ownedRestaurants);

        if (!selectedRestaurant) {
          const matchedRestaurant =
            ownedRestaurants.find(
              (rest) => rest._id === restaurant?._id || rest._id === restaurant?.id,
            ) ??
            ownedRestaurants.find((rest) => rest._id === user.restaurant_id) ??
            restaurant ??
            ownedRestaurants[0] ??
            null;

          setSelectedRestaurant(matchedRestaurant);
        }
      } catch (error) {
        console.error('Error fetching owner restaurants:', error);
      }
    }

    fetchOwnerRestaurants();
  }, [role, user?._id, restaurant, selectedRestaurant]);

  useEffect(() => {
    async function fetchKpis() {
      if (!token || !activeRestaurantId) {
        setRestaurantKpis(null);
        return;
      }

      try {
        const stats = await restaurantService.fetchRestaurantStats(activeRestaurantId);
        setRestaurantKpis(stats);
      } catch (error) {
        console.error('Error fetching restaurant KPIs:', error);
        setRestaurantKpis(null);
      }
    }

    fetchKpis();
  }, [token, activeRestaurantId]);

  useEffect(() => {
    async function fetchReviews() {
      if (!token || !activeRestaurantId) {
        setReviews([]);
        return;
      }

      try {
        const data = await reviewService.fetchRestaurantReviews(activeRestaurantId);
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      }
    }

    fetchReviews();
  }, [token, activeRestaurantId]);

  useEffect(() => {
    async function fetchDishes() {
      if (!token || !activeRestaurantId) {
        setDishes([]);
        return;
      }

      try {
        const data = await getDishesByRestaurant(activeRestaurantId);
        setDishes(data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
        setDishes([]);
      }
    }

    fetchDishes();
  }, [token, activeRestaurantId]);

  const restName = activeRestaurant?.profile?.name || t('dashboard.employee.yourRestaurant');
  const restRating = activeRestaurant?.profile?.globalRating;
  const restAddress = activeRestaurant?.profile?.location?.address;

  const loyalCustomers = Number(restaurantKpis?.loyalCustomers ?? 0);
  const averagePointsPerVisit = Number(restaurantKpis?.averagePointsPerVisit ?? 0);

  const isDataLoading =
    loading || ((role === USER_ROLES.OWNER || role === USER_ROLES.STAFF) && !activeRestaurant);

  const handleSelectedRestaurantChange = useCallback(
    (restaurant: IRestaurant | null) => {
      setSelectedRestaurant(restaurant);
    },
    [],
  );

  return {
    t,
    user,
    role: role as UserRole | null,
    token,
    restaurant,
    restaurants,
    selectedRestaurant,
    setSelectedRestaurant: handleSelectedRestaurantChange,
    logout,
    activeView,
    setActiveView,
    visits,
    allVisits,
    visitsMeta,
    visitsPage,
    setVisitsPage,
    restaurantKpis,
    reviews,
    employees,
    dishes,
    loading,
    restName,
    restRating,
    restAddress,
    loyalCustomers,
    averagePointsPerVisit,
    isOwner,
    isDataLoading,
  };
}
