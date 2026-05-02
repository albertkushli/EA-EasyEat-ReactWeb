// ========================
// IMPORTS
// ========================

import { useState, useEffect, FC } from 'react';
import { LogOut, QrCode, List, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Context
import { useAuth } from '../../context/AuthContext';

// Services
import {
  restaurantService,
  employeeService,
  reviewService,
} from '../../services';

// Types
import { IVisit, IReview, IEmployeeStats, IRestaurantStats } from '../../types';

// Utils
import { sortByDateDesc } from '../../utils/response-parser';

// Constants
import {
  DEFAULT_META,
  VISITS_LIMIT,
  VISITS_PAGE_SIZE,
  USER_ROLES,
} from '../../constants';

// Components
import RestaurantReviewsBarChart from '../../components/dashboard/RestaurantReviewsBarChart';
import PeakVisitHoursChart from '../../components/dashboard/PeakVisitHoursChart';
import TopDishCard from '../../components/dashboard/TopDishCard';
import DashboardTrendsCard from '../../components/dashboard/DashboardTrendsCard';
import EmployeeCard from '../../components/EmployeeCard';
import RestaurantTimetableCard from '../../components/dashboard/RestaurantTimetableCard';
import AvgPointsVisitCard from '../../components/dashboard/AvgPointsVisitCard';
import LoyalCustomersCard from '../../components/dashboard/LoyalCustomersCard';
import AvgRatingCard from '../../components/dashboard/AvgRatingCard';

// ========================
// COMPONENT
// ========================

const HomeEmployee: FC = () => {
  const { t } = useTranslation();
  const { user, logout, role, token, restaurant } = useAuth();

  // ========================
  // STATE
  // ========================

  const [visits, setVisits] = useState<IVisit[]>([]);
  const [allVisits, setAllVisits] = useState<IVisit[]>([]);
  const [visitsMeta, setVisitsMeta] = useState(DEFAULT_META);
  const [visitsPage, setVisitsPage] = useState(1);
  const [restaurantKpis, setRestaurantKpis] = useState<IRestaurantStats | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [employees, setEmployees] = useState<IEmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = role === USER_ROLES.OWNER;

  // ========================
  // EFFECTS
  // ========================

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

  useEffect(() => {
    async function loadEmployees() {
      if (!user?.restaurant_id) {
        setEmployees([]);
        return;
      }
      const employeeList = await employeeService.fetchEmployeesWithStats(
        user.restaurant_id
      );
      setEmployees(employeeList);
    }
    loadEmployees();
  }, [user?.restaurant_id, token]);

  // ========================
  // DERIVED DATA
  // ========================

  const restName =
    restaurant?.profile?.name || t('dashboard.employee.yourRestaurant');
  const restRating = restaurant?.profile?.globalRating;
  const restAddress = restaurant?.profile?.location?.address;

  const loyalCustomers = Number(restaurantKpis?.loyalCustomers ?? 0);
  const averagePointsPerVisit = Number(
    restaurantKpis?.averagePointsPerVisit ?? 0
  );

  // ========================
  // LOADING STATE
  // ========================

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

  // ========================
  // RENDER
  // ========================

  return (
    <div className="he-page">
      {/* HEADER */}
      <header className="he-header">
        <div className="he-header__inner">
          <div className="he-brand">
            <span className="he-brand__icon">🍽️</span>
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
        {/* HERO SECTION */}
        <section className="he-hero">
          <div className="he-hero__left">
            <h1 className="he-hero__name">{restName}</h1>
            {restAddress && <p className="he-hero__address">📍 {restAddress}</p>}
          </div>
          <div className="he-hero__orbs">
            <div className="he-orb he-orb--1" />
            <div className="he-orb he-orb--2" />
          </div>
        </section>

        <RestaurantTimetableCard timetable={restaurant?.profile?.timetable} />

        {/* METRICS */}
        <h2 className="he-section__title">{t('dashboard.employee.statsTitle')}</h2>

        <div className="he-metrics-grid">
          <AvgPointsVisitCard value={Number(averagePointsPerVisit ?? 0)} />
          <LoyalCustomersCard value={Number(loyalCustomers ?? 0)} />
          <AvgRatingCard value={Number(restRating ?? 0).toFixed(1)} />
        </div>

        {/* CHARTS */}
        <div className="he-charts-grid">
          <div className="he-chart-slot">
            <RestaurantReviewsBarChart
              reviews={reviews}
              restaurantId={user?.restaurant_id}
            />
          </div>

          <div className="he-chart-slot">
            <PeakVisitHoursChart
              visits={visits}
              restaurantId={user?.restaurant_id}
            />
          </div>

          <div className="he-chart-slot">
            <TopDishCard
              restaurantId={user?.restaurant_id}
              title={t('dashboard.employee.topDish')}
            />
          </div>
        </div>

        {/* EMPLOYEES SECTION */}
        <section className="he-section">
          <div className="he-section__head">
            <h2 className="he-section__title">
              {t('dashboard.employee.employees.title')}
            </h2>
            <span className="he-section__count">
              {employees.length} {t('dashboard.employee.employees.count')}
            </span>
          </div>

          <div className="he-employees">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <EmployeeCard
                  key={employee?._id || employee?.id}
                  employee={employee}
                  visits={visits}
                />
              ))
            ) : (
              <div className="he-empty">
                <User size={32} />
                <p>{t('dashboard.employee.employees.none')}</p>
              </div>
            )}
          </div>
        </section>

        {/* TRENDS SECTION */}
        <section className="he-section">
          <DashboardTrendsCard
            visits={allVisits}
            averageRating={Number(restRating ?? 0)}
          />
        </section>

        {/* QUICK ACTIONS */}
        <section className="he-section">
          <h2 className="he-section__title">
            {t('dashboard.employee.quickActions.title')}
          </h2>

          <div className="he-actions">
            <button className="he-action-card">
              <div className="he-action-card__icon he-action-card__icon--qr">
                <QrCode size={26} />
              </div>
              <span>{t('dashboard.employee.quickActions.generateQr.title')}</span>
              <p>{t('dashboard.employee.quickActions.generateQr.desc')}</p>
            </button>

            <button className="he-action-card">
              <div className="he-action-card__icon he-action-card__icon--list">
                <List size={26} />
              </div>
              <span>{t('dashboard.employee.quickActions.viewVisits.title')}</span>
              <p>{t('dashboard.employee.quickActions.viewVisits.desc')}</p>
            </button>

            {isOwner && (
              <button className="he-action-card">
                <div className="he-action-card__icon he-action-card__icon--settings">
                  <Settings size={26} />
                </div>
                <span>
                  {t('dashboard.employee.quickActions.settings.title')}
                </span>
                <p>{t('dashboard.employee.quickActions.settings.desc')}</p>
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomeEmployee;
