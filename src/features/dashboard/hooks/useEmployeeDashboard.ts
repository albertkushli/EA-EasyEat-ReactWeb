import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { restaurantService, reviewService } from '@/services';
import { getDishesByRestaurant } from '@/services/dish.service';
import { DEFAULT_META, USER_ROLES, VISITS_LIMIT, VISITS_PAGE_SIZE } from '@/constants';
import type { IEmployeeStats, IRestaurantStats, IReview, IVisit, UserRole } from '@/types';
import type { Dish } from '@/types/Dish';

interface UseEmployeeDashboardResult {
  t: ReturnType<typeof useTranslation>['t'];
  user: ReturnType<typeof useAuth>['user'];
  role: UserRole | null;
  token: string | null;
  restaurant: ReturnType<typeof useAuth>['restaurant'];
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
  const { view } = useParams();
  const [loading, setLoading] = useState(true);
  const isOwner = role === USER_ROLES.OWNER;
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
      if (!user?.restaurant_id) {
        setLoading(false);
        return;
      }

      try {
        const response = await restaurantService.fetchRestaurantVisits(
          user.restaurant_id,
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
  }, [user?.restaurant_id, token, visitsPage]);

  useEffect(() => {
    async function loadAllVisits() {
      if (!user?.restaurant_id) {
        setAllVisits([]);
        return;
      }

      const visitsData = await restaurantService.fetchAllRestaurantVisits(
        user.restaurant_id,
        VISITS_PAGE_SIZE,
      );
      setAllVisits(visitsData);
    }

    loadAllVisits();
  }, [user?.restaurant_id, token]);

  useEffect(() => {
    async function fetchKpis() {
      if (!token || !user?.restaurant_id) {
        setRestaurantKpis(null);
        return;
      }

      try {
        const stats = await restaurantService.fetchRestaurantStats(user.restaurant_id);
        setRestaurantKpis(stats);
      } catch (error) {
        console.error('Error fetching restaurant KPIs:', error);
        setRestaurantKpis(null);
      }
    }

    fetchKpis();
  }, [token, user?.restaurant_id]);

  useEffect(() => {
    async function fetchReviews() {
      if (!token || !user?.restaurant_id) {
        setReviews([]);
        return;
      }

      try {
        const data = await reviewService.fetchRestaurantReviews(user.restaurant_id);
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      }
    }

    fetchReviews();
  }, [token, user?.restaurant_id]);

  useEffect(() => {
    async function fetchDishes() {
      if (!token || !user?.restaurant_id) {
        setDishes([]);
        return;
      }

      try {
        const data = await getDishesByRestaurant(user.restaurant_id);
        setDishes(data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
        setDishes([]);
      }
    }

    fetchDishes();
  }, [token, user?.restaurant_id]);

  const restName = restaurant?.profile?.name || t('dashboard.employee.yourRestaurant');
  const restRating = restaurant?.profile?.globalRating;
  const restAddress = restaurant?.profile?.location?.address;

  const loyalCustomers = Number(restaurantKpis?.loyalCustomers ?? 0);
  const averagePointsPerVisit = Number(restaurantKpis?.averagePointsPerVisit ?? 0);

  const isDataLoading =
    loading || ((role === USER_ROLES.OWNER || role === USER_ROLES.STAFF) && !restaurant);

  return {
    t,
    user,
    role: role as UserRole | null,
    token,
    restaurant,
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
