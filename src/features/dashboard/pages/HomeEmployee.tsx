// ========================
// IMPORTS
// ========================

import { useState, useEffect, FC } from 'react';
import { LogOut, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Context
import { useAuth } from '@/context/AuthContext';

// Services
import {
  restaurantService,
  reviewService,
} from '@/services';

// Types
import { IVisit, IReview, IEmployeeStats, IRestaurantStats } from '@/types';

// Constants
import {
  DEFAULT_META,
  VISITS_LIMIT,
  VISITS_PAGE_SIZE,
  USER_ROLES,
} from '@/constants';

// Components
import RestaurantReviewsBarChart from '@/features/dashboard/components/RestaurantReviewsBarChart';
import PeakVisitHoursChart from '@/features/dashboard/components/PeakVisitHoursChart';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import Clients from '@/features/customers/pages/Clients';
import Dishes from '@/features/dishes/components/Dish';
import Employees from '@/features/employees/components/Employees';
import Rewards from '@/features/rewards/components/Rewards';
import Analytics from '@/features/dashboard/components/Analytics';
import RestaurantSettings from '@/shared/components/ui/Settings';

// ========================
// COMPONENT
// ========================

const HomeEmployee: FC = () => {
  const { t } = useTranslation();
  const { user, logout, role, token, restaurant } = useAuth();

  const [visits, setVisits] = useState<IVisit[]>([]);
  const [allVisits, setAllVisits] = useState<IVisit[]>([]);
  const [visitsMeta, setVisitsMeta] = useState(DEFAULT_META);
  const [visitsPage, setVisitsPage] = useState(1);
  const [restaurantKpis, setRestaurantKpis] = useState<IRestaurantStats | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [employees, setEmployees] = useState<IEmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');

  const isOwner = role === USER_ROLES.OWNER;

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
          VISITS_LIMIT
        );
        setVisits(response.data);
        setVisitsMeta(response.meta);
      } catch (err) {
        console.error('Error fetching visits:', err);
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
        VISITS_PAGE_SIZE
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
        const stats = await restaurantService.fetchRestaurantStats(
          user.restaurant_id
        );
        setRestaurantKpis(stats);
      } catch (err) {
        console.error('Error fetching restaurant KPIs:', err);
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
        const data = await reviewService.fetchAllReviews();
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    }
    fetchReviews();
  }, [token, user?.restaurant_id]);

  // employees loading removed from central view (kept state for other views)

  const restName =
    restaurant?.profile?.name || t('dashboard.employee.yourRestaurant');
  const restRating = restaurant?.profile?.globalRating;
  const restAddress = restaurant?.profile?.location?.address;

  const loyalCustomers = Number(restaurantKpis?.loyalCustomers ?? 0);
  const averagePointsPerVisit = Number(
    restaurantKpis?.averagePointsPerVisit ?? 0
  );

  const isDataLoading =
    loading ||
    ((role === USER_ROLES.OWNER || role === USER_ROLES.STAFF) && !restaurant);

  if (isDataLoading) {
    return (
      <div className="he-loading">
        <div className="he-loading__spinner" />
        <p>
          {isOwner
            ? t('dashboard.employee.loadingOwner')
            : t('dashboard.employee.loadingStaff')}
        </p>
      </div>
    );
  }

  return (
    <div className="he-page">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        restaurantName={restName}
        restaurantAddress={restAddress}
      />

      <div style={{ marginLeft: '16rem', minHeight: '100vh' }}>
        {activeView === 'dashboard' ? (
          <>
      <header className="he-header">
        <div className="he-header__inner">
          <div className="he-brand">
            <span className="he-brand__icon"><Store size={18} /></span>
            <div>
              <span className="he-brand__name">{t('navbar.logo')}</span>
              <span className={`he-role-badge he-role-badge--${role}`}>
                {role?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="he-header__right">
            <div className="he-user-pill">
              <div className="he-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name?.split(' ')[0]}</span>
            </div>

            <button
              onClick={logout}
              className="he-logout-btn"
              title={t('navbar.links.logout')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

            <main className="he-main">
              <div className="max-w-6xl mx-auto px-6 py-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">VISTA GENERAL</h1>

                {/* Top summary cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl">🏆</div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">{Number(averagePointsPerVisit || 0)}</div>
                      <div className="text-xs font-semibold tracking-widest text-slate-500">AVERAGE POINTS / VISIT</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl">👥</div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">{Number(loyalCustomers || 0)}</div>
                      <div className="text-xs font-semibold tracking-widest text-slate-500">LOYAL CUSTOMERS</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl">⭐</div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">{Number(restRating ?? 0).toFixed(1)}</div>
                      <div className="text-xs font-semibold tracking-widest text-slate-500">AVG RATING</div>
                    </div>
                  </div>
                </section>

                {/* Charts */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[320px]">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">RENDIMIENTO DE RESEÑAS</h3>
                    <div className="h-[260px]">
                      <RestaurantReviewsBarChart
                        reviews={reviews}
                        restaurantId={user?.restaurant_id}
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[320px]">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">HORAS PUNTA DE VISITAS</h3>
                    <div className="h-[260px]">
                      <PeakVisitHoursChart
                        visits={visits}
                        restaurantId={user?.restaurant_id}
                      />
                    </div>
                  </div>
                </section>

                {/* Ranking */}
                <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">RANKING DE PLATOS ESTRELLAS</h3>
                  <div className="space-y-3">
                    {(() => {
                      const map: Record<string, { total: number; count: number }> = {};
                      (reviews || []).forEach((r: any) => {
                        const name = r.dish?.name || r.dishName || r.itemName || r.name;
                        const score = Number(r.rating ?? r.score ?? 0);
                        if (!name) return;
                        if (!map[name]) map[name] = { total: 0, count: 0 };
                        map[name].total += score;
                        if (score > 0) map[name].count += 1;
                      });

                      let list: Array<{ name: string; score: number }> = Object.keys(map).map((k) => ({
                        name: k,
                        score: map[k].count ? +(map[k].total / map[k].count).toFixed(1) : 0,
                      }));

                      if (list.length === 0) {
                        list = [
                          { name: 'Pan con Tomate', score: 8.0 },
                          { name: 'Pulpo a la Gallega', score: 7.0 },
                        ];
                      }

                      list = list.sort((a, b) => b.score - a.score).slice(0, 10);

                      return list.map((d, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center">★</div>
                            <div className="text-sm text-slate-800">{d.name}</div>
                          </div>
                          <div className="text-sm font-medium text-slate-700">{d.score.toFixed(1)}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </section>
              </div>
            </main>
          </>
        ) : activeView === 'clients' ? (
          <div style={{ padding: '2rem' }}>
            <Clients />
          </div>
        ) : activeView === 'dishes' ? (
          <div style={{ padding: '2rem' }}>
            <Dishes />
          </div>
        ) : activeView === 'employees' ? (
          <div style={{ padding: '2rem' }}>
            <Employees />
          </div>
        ) : activeView === 'rewards' ? (
          <div style={{ padding: '2rem' }}>
            <Rewards />
          </div>
        ) : activeView === 'analytics' ? (
          <div style={{ padding: '2rem' }}>
            <Analytics visits={allVisits} restaurantId={user?.restaurant_id} />
          </div>
        ) : activeView === 'settings' ? (
          <div style={{ padding: '2rem' }}>
            <RestaurantSettings restaurant={restaurant} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HomeEmployee;
