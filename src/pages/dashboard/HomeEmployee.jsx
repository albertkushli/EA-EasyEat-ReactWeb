// ========================
// IMPORTS
// ========================

// Hooks de React
import { useState, useEffect } from 'react';

// Iconos
import { LogOut, QrCode, List, Settings, Clock, User, ChevronRight } from 'lucide-react';

// Contexto de autenticación (usuario, rol, restaurante, token)
import { useAuth } from '../../context/AuthContext';

// Componentes de gráficos
import RestaurantReviewsBarChart from '../../components/dashboard/RestaurantReviewsBarChart';
import PeakVisitHoursChart from '../../components/dashboard/PeakVisitHoursChart';
import RealPredictionsChart from '../../components/dashboard/RealPredictionsChart';
import TopDishCard from '../../components/dashboard/TopDishCard';
import DashboardTrendsCard from '../../components/dashboard/DashboardTrendsCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import EmployeeCard from '../../components/EmployeeCard';

import RestaurantTimetableCard from "../../components/dashboard/RestaurantTimetableCard";// Cliente API (axios)
import apiClient from '../../lib/apiClient';
import Clients from "../Clients";
import Employees from "../../components/Employees";
import Dishes from "../../components/Dish";
import Rewards from "../../components/Rewards";
import Analytics from "../../components/Analytics";
import SettingsView from "../../components/Settings";

// Componentes de métricas
import AvgPointsVisitCard from '../../components/dashboard/AvgPointsVisitCard';
import LoyalCustomersCard from '../../components/dashboard/LoyalCustomersCard';
import AvgRatingCard from '../../components/dashboard/AvgRatingCard';

import { Sidebar } from '../../components/Sidebar';

// ========================
// CONSTANTES
// ========================

// Meta por defecto para paginación de visitas
const DEFAULT_META = { total: 0, page: 1, limit: 1, totalPages: 1 };

// Número de visitas por página
const VISITS_LIMIT = 1000;

// ========================
// FUNCIONES AUXILIARES
// ========================

// Obtiene estadísticas del restaurante desde el backend
async function getRestaurantStats(restaurantId) {
  const res = await apiClient.get(`/statistics/restaurant/${restaurantId}`);

  // Soporta distintos formatos de respuesta
  if (res.data?.data && !Array.isArray(res.data.data)) return res.data.data;
  if (res.data && !Array.isArray(res.data)) return res.data;
  return null;
}

/**
 * Obtiene lista de empleados con estadísticas desde el backend
 * @param {string} restaurantId - ID del restaurante
 * @returns {Promise<Array>} Array de empleados con stats
 */
async function fetchEmployeesWithStats(restaurantId) {
  if (!restaurantId) return [];

  try {
    const res = await apiClient.get(
      `/employees/restaurant/${restaurantId}/stats`
    );

    // Normaliza respuesta: { data: [...] } o [...]
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  } catch (err) {
    console.error('Error al cargar empleados:', err);
    return [];
  }
}

// Normaliza la respuesta paginada de visitas
function parsePaginatedVisitsResponse(payload, fallbackLimit = 8) {
  // Caso: { visits: [] }
  if (Array.isArray(payload?.visits)) {
    const visitsData = payload.visits;
    return {
      data: visitsData,
      meta: { total: visitsData.length, page: 1, limit: fallbackLimit, totalPages: 1 }
    };
  }

  // Caso estándar: { data: [], meta: {} }
  const data = Array.isArray(payload?.data) ? payload.data : [];
  const rawMeta = payload?.meta || {};

  const total = Number.isFinite(rawMeta.total) ? rawMeta.total : data.length;
  const page = Number.isFinite(rawMeta.page) ? rawMeta.page : 1;
  const limit = Number.isFinite(rawMeta.limit) ? rawMeta.limit : fallbackLimit;

  const totalPages = Number.isFinite(rawMeta.totalPages)
    ? rawMeta.totalPages
    : Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return { data, meta: { total, page, limit, totalPages } };
}

// Extrae reviews independientemente de la estructura de la respuesta
function extractReviews(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  return [];
}

// Ordena visitas por fecha descendente (más recientes primero)
function sortVisitsByDateDesc(visits) {
  return visits.sort(
    (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
  );
}

/**
 * Obtiene todas las visitas del restaurante recorriendo todas las páginas.
 * Se usa solo para la tarjeta de tendencias, no para la lista paginada.
 */
async function fetchAllRestaurantVisits(restaurantId) {
  if (!restaurantId) return [];

  const pageSize = 200;

  try {
    const firstResponse = await apiClient.get(
      `/restaurants/${restaurantId}/visits`,
      { params: { page: 1, limit: pageSize } }
    );

    const firstPage = parsePaginatedVisitsResponse(firstResponse.data, pageSize);
    const collectedVisits = [...firstPage.data];

    for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
      const response = await apiClient.get(
        `/restaurants/${restaurantId}/visits`,
        { params: { page, limit: pageSize } }
      );

      const parsedPage = parsePaginatedVisitsResponse(response.data, pageSize);
      collectedVisits.push(...parsedPage.data);
    }

    return sortVisitsByDateDesc(collectedVisits);
  } catch (err) {
    console.error('Error fetching all visits for trends:', err);
    return [];
  }
}


// ========================
// COMPONENTE PRINCIPAL
// ========================

export default function HomeEmployee() {

  // Contexto global
  const { user, logout, role, token, restaurant } = useAuth();

  // ========================
  // STATE
  // ========================

  const [visits, setVisits] = useState([]);
  const [allVisits, setAllVisits] = useState([]);
  const [visitsMeta, setVisitsMeta] = useState(DEFAULT_META);
  const [visitsPage, setVisitsPage] = useState(1);
  const [restaurantKpis, setRestaurantKpis] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const isOwner = role === 'owner';


  // ========================
  // FETCH VISITS
  // ========================

  useEffect(() => {
    async function fetchVisits() {
      setLoading(true);

      // Si no hay restaurante, no hacemos la petición
      if (!user?.restaurant_id) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get(`/restaurants/${user?.restaurant_id}/visits`, {
          params: { page: visitsPage, limit: VISITS_LIMIT }
        });

        if (res.status === 200) {
          const parsedVisits = parsePaginatedVisitsResponse(res.data, VISITS_LIMIT);

          // Ordenamos visitas
          setVisits(sortVisitsByDateDesc(parsedVisits.data));

          // Guardamos metadata de paginación
          setVisitsMeta(parsedVisits.meta);
        }

      } catch (err) {
        console.error('Error fetching visits:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVisits();
  }, [user?.restaurant_id, token, visitsPage]);


  // ========================
  // FETCH VISITAS COMPLETAS PARA TENDENCIAS
  // ========================

  useEffect(() => {
    async function loadAllVisits() {
      if (!user?.restaurant_id) {
        setAllVisits([]);
        return;
      }

      const visitsData = await fetchAllRestaurantVisits(user?.restaurant_id);
      setAllVisits(visitsData);
    }

    loadAllVisits();
  }, [user?.restaurant_id, token]);


  // ========================
  // FETCH KPIs
  // ========================

  useEffect(() => {
    async function fetchRestaurantKpis() {

      // Si no hay token o restaurante → reset
      if (!token || !user?.restaurant_id) {
        setRestaurantKpis(null);
        return;
      }

      try {
        const currentRestaurantId = String(user?.restaurant_id ?? '');

        const stats = await getRestaurantStats(currentRestaurantId);

        const statsRestaurantId = String(
          stats?.restaurant_id?._id ?? stats?.restaurant_id ?? ''
        );

        // Solo guardamos si coincide el restaurante
        setRestaurantKpis(
          statsRestaurantId === currentRestaurantId ? stats : null
        );

      } catch (err) {
        console.error('Error fetching restaurant KPIs:', err);
        setRestaurantKpis(null);
      }
    }

    fetchRestaurantKpis();
  }, [token, user?.restaurant_id]);


  // ========================
  // FETCH REVIEWS
  // ========================

  useEffect(() => {
    async function fetchReviews() {

      if (!token || !user?.restaurant_id) {
        setReviews([]);
        return;
      }

      try {
        const res = await apiClient.get('/reviews');

        // Normalizamos respuesta
        setReviews(extractReviews(res.data));

      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    }

    fetchReviews();
  }, [token, user?.restaurant_id]);
  // ========================
  // FETCH EMPLEADOS
  // ========================
  useEffect(() => {
    async function loadEmployees() {
      if (!user?.restaurant_id) {
        setEmployees([]);
        return;
      }

      const employees = await fetchEmployeesWithStats(user?.restaurant_id);
      setEmployees(employees);
    }

    loadEmployees();
  }, [user?.restaurant_id, token]);

  // ========================
  // DATOS DERIVADOS
  // ========================

  const restName = restaurant?.profile?.name || 'Tu restaurante';
  const restRating = restaurant?.profile?.globalRating;
  const restAddress = restaurant?.profile?.location?.address;

  const loyalCustomers = Number(restaurantKpis?.loyalCustomers ?? 0);
  const averagePointsPerVisit = Number(restaurantKpis?.averagePointsPerVisit ?? 0);


  // ========================
  // LOADING
  // ========================

  const isDataLoading =
    loading ||
    ((role === 'owner' || role === 'staff') && !restaurant);

  if (isDataLoading) {
    return (
      <div className="he-loading">
        <div className="he-loading__spinner" />
        <p>Cargando panel de {isOwner ? 'Dueño' : 'Personal'}…</p>
      </div>
    );
  }

  const handleSidebarViewChange = (view) => {
    setActiveView(view);
  };


  // ========================
  // RENDER
  // ========================

  return (
    <div className="he-layout">

      {/* SIDEBAR */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleSidebarViewChange}
        restaurantName={restName}
        restaurantAddress={restAddress}
      />

      {/* CONTENIDO */}
      <div className="he-content">
        <main className="he-main pt-8">

          {/* ════════════════════════════════════════════ */}
          {/* TAB: DASHBOARD - Estadísticas del restaurante */}
          {/* ════════════════════════════════════════════ */}
          {activeView === 'dashboard' && (
            <div className="max-w-7xl mx-auto w-full space-y-10">
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-6">Vista General</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AvgPointsVisitCard value={Number(averagePointsPerVisit ?? 0)} />
                  <LoyalCustomersCard value={Number(loyalCustomers ?? 0)} />
                  <AvgRatingCard value={Number(restRating ?? 0).toFixed(1)} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardCard title="Rendimiento de Reseñas">
                  <RestaurantReviewsBarChart
                    reviews={reviews}
                    restaurantId={user?.restaurant_id}
                  />
                </DashboardCard>

                <DashboardCard title="Horas Punta de Visitas">
                  <PeakVisitHoursChart
                    visits={visits}
                    restaurantId={user?.restaurant_id}
                  />
                </DashboardCard>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <DashboardCard title="Ranking de Platos Estrellas">
                  <TopDishCard
                    restaurantId={user?.restaurant_id}
                  />
                </DashboardCard>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════ */}
          {/* TAB: EMPLEADOS */}
          {/* ════════════════════════════════════════════ */}
          {activeView === 'employees' && (
             <Employees />
          )}



          {/* ════════════════════════════════════════════ */}
          {/* TAB: Clientes */}
          {/* ════════════════════════════════════════════ */}
          {activeView === 'clients' && (
            <section className="he-section">
              <h2 className="he-section__title"></h2>
              <Clients />
            </section>
          )}

          {/* ════════════════════════════════════════════ */}
          {/* TAB: Platos */}
          {/* ════════════════════════════════════════════ */}
          {activeView === 'dishes' && (
            <section className="he-section">
              <h2 className="he-section__title"></h2>
              <Dishes />
            </section>
          )}

          {/* ════════════════════════════════════════════ */}
          {/* TAB: Recompensas */}
          {/* ════════════════════════════════════════════ */}
          {activeView === 'rewards' && (
            <section className="he-section">
              <h2 className="he-section__title"></h2>
              <Rewards />
            </section>
          )}


          {/* ════════════════════════════════════════════ */}
          {/* TAB: ANÁLISIS - Gráficas */}
          {/* ════════════════════════════════════════════ */}
          {activeView === 'analytics' && (
            <Analytics
              visits={allVisits.length ? allVisits : visits}
              restaurantId={user?.restaurant_id}
            />
          )}




          {/* ════════════════════════════════════════════ */}
          {/* TAB: CONFIGURACIÓN - Horario y ajustes */}
          {/* ════════════════════════════════════════════ */}
          {activeView === 'settings' && (
            <SettingsView restaurant={restaurant} />
          )}

        </main>

        <style>{`
        .he-layout {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: var(--clr-bg);
        }

        .he-content {
          margin-left: 16rem;
          width: calc(100% - 16rem);
          min-height: 100vh;
          background: #f8fafc; /* Fondo SaaS suave */
          color: #0f172a;
        }

        .he-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem 2rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        /* Hero */
        .he-hero {
          position: relative;
          padding: 3.5rem;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          color: white;
        }

        .he-hero__left { position: relative; z-index: 1; }
        .he-hero__label { font-size: 0.8rem; color: hsl(217,91%,70%); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
        .he-hero__name { font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 800; margin: 0.25rem 0 0.75rem; }
        .he-hero__meta { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
        .he-hero__tag {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.8rem; color: var(--clr-text-muted);
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          padding: 3px 10px; border-radius: 999px;
        }
        .he-hero__tag--star { color: hsl(48,96%,60%); }
        .he-hero__address { font-size: 0.82rem; color: var(--clr-text-muted); margin-top: 0.25rem; }
        .he-hero__orbs { position: absolute; inset: 0; pointer-events: none; }
        .he-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.25; }
        .he-orb--1 { width: 200px; height: 200px; background: hsl(217,91%,60%); top: -60px; right: -40px; }
        .he-orb--2 { width: 120px; height: 120px; background: var(--clr-accent); bottom: -30px; right: 100px; }

        /* Stats */
        .he-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
        .he-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .he-stat {
          padding: 1.25rem; border-radius: 16px;
          border: 1px solid var(--glass-border); background: var(--glass-bg);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; gap: 0.85rem;
          transition: transform 0.2s;
        }
        .he-stat:hover { transform: translateY(-3px); }
        .he-stat__icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
          .he-stats-center {
          display: flex;
          gap: 20px;
          justify-content: center;
           min-width: 160px;
          }
        .he-stat--visits .he-stat__icon { background: hsla(142,71%,45%,0.12); color: var(--clr-accent); }
        .he-stat--customers .he-stat__icon { background: hsla(217,91%,60%,0.12); color: hsl(217,91%,70%); }
        .he-stat--rating .he-stat__icon { background: hsla(48,96%,53%,0.12); color: hsl(48,96%,60%); }
        .he-stat__value { display: block; font-size: 1.6rem; font-weight: 800; line-height: 1; }
        .he-stat__label { display: block; font-size: 0.75rem; color: var(--clr-text-muted); margin-top: 3px; }

        /* Charts */
        .he-charts-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          width: 100%;
          margin-top: 2.5rem;
          align-items: stretch;
        }
        .he-chart-slot {
          min-width: 0;
          display: flex;
        }

        .he-trends-card {
          width: 100%;
          padding: 1.25rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .he-trends-card__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }
        .he-trends-card__title {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
        }
        .he-trends-card__subtitle {
          margin: 0.3rem 0 0;
          font-size: 0.78rem;
          color: var(--clr-text-muted);
          line-height: 1.4;
        }
        .he-trends-card__badge {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 0.35rem 0.65rem;
          border-radius: 999px;
          color: var(--clr-primary);
          background: hsla(26,95%,55%,0.12);
          border: 1px solid hsla(26,95%,55%,0.2);
          white-space: nowrap;
        }
        .he-trends-card__summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.85rem;
        }
        .he-trends-card__metric {
          padding: 0.9rem 1rem;
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          background: transparent;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .he-trends-card__metric-label {
          font-size: 0.72rem;
          color: var(--clr-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .he-trends-card__metric-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--clr-text);
        }
        .he-trends-card__metric-change {
          font-size: 0.78rem;
          font-weight: 700;
        }
        .he-trends-card__metric-change--positive { color: hsl(142, 71%, 45%); }
        .he-trends-card__metric-change--negative { color: hsl(0, 84%, 60%); }
        .he-trends-card__metric-change--neutral { color: var(--clr-text-muted); }
        .he-trends-card__charts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }
        .he-trends-card__panel {
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          background: transparent;
          padding: 0.9rem;
          min-width: 0;
        }
        .he-trends-card__panel-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--clr-text);
          margin-bottom: 0.75rem;
          letter-spacing: 0.02em;
        }
        .he-trends-card__alerts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .he-trends-card__alert {
          padding: 0.8rem 0.95rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: transparent;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .he-trends-card__alert--warning { color: hsl(48, 96%, 60%); }
        .he-trends-card__alert--danger { color: hsl(0, 84%, 65%); }
        .he-trends-card__alert--success { color: hsl(142, 71%, 45%); }
        .he-trends-card__legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--clr-text-muted);
        }
        .he-trends-card__legend span {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
        }
        .he-trends-card__dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          display: inline-block;
        }
        .he-trends-card__dot--real { background: rgba(249, 115, 22, 0.95); }
        .he-trends-card__dot--predicted { background: rgba(16, 185, 129, 0.95); }
        .he-trends-card__empty {
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--clr-text-muted);
          font-size: 0.9rem;
          padding: 1rem;
        }

        /* Section */
        .he-section { display: flex; flex-direction: column; gap: 1rem; }
        .he-section__head { display: flex; align-items: center; justify-content: space-between; }
        .he-section__title { font-size: 1.05rem; font-weight: 700; }
        .he-section__count { font-size: 0.8rem; color: var(--clr-text-muted); }

        /* Actions */
        .he-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
        .he-action-card {
          padding: 1.5rem 1rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border); background: var(--glass-bg);
          backdrop-filter: blur(12px);
          display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem;
          cursor: pointer; transition: all 0.2s var(--ease-out); text-align: left;
          color: var(--clr-text);
        }
        .he-action-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--clr-primary); }
        .he-action-card span { font-size: 0.95rem; font-weight: 700; }
        .he-action-card p { font-size: 0.75rem; color: var(--clr-text-muted); }
        .he-action-card__icon {
          width: 48px; height: 48px; border-radius: 14px; margin-bottom: 0.25rem;
          display: flex; align-items: center; justify-content: center;
        }
        .he-action-card__icon--qr { background: hsla(26,95%,55%,0.15); color: var(--clr-primary); }
        .he-action-card__icon--list { background: hsla(217,91%,60%,0.12); color: hsl(217,91%,70%); }
        .he-action-card__icon--settings { background: hsla(142,71%,45%,0.12); color: var(--clr-accent); }

        /* Visits */
        .he-visits {
          border: 1px solid var(--glass-border); border-radius: 16px;
          overflow: hidden; background: var(--glass-bg); backdrop-filter: blur(12px);
        }
        .he-visit-row {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--glass-border);
          transition: background 0.2s;
        }
        .he-visit-row:last-child { border-bottom: none; }
        .he-visit-row:hover { background: hsla(255,255,255,0.03); }
        .he-visit-row__avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, hsla(217,91%,60%,0.3), hsla(142,71%,45%,0.3));
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: 800; flex-shrink: 0; color: var(--clr-text);
        }
        .he-visit-row__info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .he-visit-row__name { font-size: 0.9rem; font-weight: 600; }
        .he-visit-row__date { font-size: 0.75rem; color: var(--clr-text-muted); display: flex; align-items: center; gap: 4px; }
        .he-visit-row__pts { font-size: 0.8rem; font-weight: 700; color: var(--clr-accent); }
        .he-visit-row__arrow { color: var(--clr-text-muted); }

        /* Empty */
        .he-empty {
          padding: 3rem; text-align: center; color: var(--clr-text-muted);
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
        }
        .he-empty p { font-size: 0.9rem; }
        .he-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
        .he-pagination__btn {
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--clr-text);
          padding: 0.45rem 0.9rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .he-pagination__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .he-pagination__info {
          font-size: 0.8rem;
          color: var(--clr-text-muted);
        }
          

        @media (max-width: 900px) {
          .he-content {
            margin-left: 0;
            width: 100%;
          }

          .he-charts-grid {
            grid-template-columns: 1fr;
          }
          .he-trends-card__charts {
            grid-template-columns: 1fr;
          }
          .he-trends-card__summary {
            grid-template-columns: 1fr;
          }
        }
          
        /* Employees */
        .he-employees {
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          overflow: hidden;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
        }
        .he-employee-card {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--glass-border);
          transition: background 0.2s, transform 0.2s;
        }
        .he-employee-card:last-child {
          border-bottom: none;
        }
        .he-employee-card:hover {
          background: hsla(255, 255, 255, 0.03);
          transform: translateY(-2px);
        }
        .he-employee-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, hsl(217, 91%, 60%), hsl(142, 71%, 45%));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }
        .he-employee-content {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) auto minmax(0, 0.8fr);
          gap: 1rem;
          align-items: center;
          flex: 1;
          min-width: 0;
        }
        .he-employee-left,
        .he-employee-center,
        .he-employee-right {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }
        .he-employee-center {
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0.35rem 0.9rem;
          border-left: 1px solid var(--glass-border);
          border-right: 1px solid var(--glass-border);
        }
        .he-employee-right {
          align-items: flex-end;
          justify-content: center;
          text-align: right;
        }
        .he-employee-name {
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .he-employee-sub {
          font-size: 0.75rem;
          color: var(--clr-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
          .he-employee-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
        .he-role-pill {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
          width: fit-content;
        }
        .he-role-owner {
          background: hsla(26,95%,55%,0.2);
          color: var(--clr-primary);
        }
        .he-role-staff {
          background: hsla(217,91%,60%,0.15);
          color: hsl(217,91%,70%);
        }
        
        /* Métricas de empleado (base uniforme) */
        .he-employee-metric {
          font-size: 0.8rem;
          font-weight: 600;
          display: block;
          white-space: nowrap;
        }
        .he-employee-rating,
        .he-employee-visits,
        .he-employee-revenue {
          /* Heredan estilos de .he-employee-metric */
        }
        
        /* Estados de empleado */
        .he-active {
          color: #22c55e;
          font-weight: 700;
        }
        .he-inactive {
          color: #f59e0b;
          opacity: 0.8;
          font-weight: 700;
        }

        @media (max-width: 700px) {
          .he-employee-card {
            align-items: flex-start;
          }
          .he-employee-content {
            grid-template-columns: 1fr;
          }
          .he-employee-center {
            align-items: flex-start;
            text-align: left;
            padding: 0;
            border-left: 0;
            border-right: 0;
          }
          .he-employee-right {
            align-items: flex-start;
            text-align: left;
          }
        }

        /* ============================= */
/* TIMETABLE CARD */
/* ============================= */

.he-timetable-card {
  margin-top: -10px;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* HEADER */
.he-timetable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.he-timetable-title {
  font-size: 0.95rem;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Estado abierto/cerrado */
.he-status {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: 0.05em;
}

.he-status.open {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.he-status.closed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* LISTA */
.he-timetable-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* FILA */
.he-timetable-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  padding: 8px 10px;
  border-radius: 10px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

/* Hover suave */
.he-timetable-row:hover {
  background: hsla(255,255,255,0.04);
}

/* Día */
.he-timetable-day {
  font-weight: 600;
  text-transform: capitalize;
}

/* Horas */
.he-timetable-hours {
  color: var(--clr-text-muted);
  text-align: right;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* Día actual 🔥 */
.he-timetable-row.active {
  background: hsla(26,95%,55%,0.12);
  border: 1px solid hsla(26,95%,55%,0.3);
  color: var(--clr-primary);
  font-weight: 700;
}

/* Texto horas en activo */
.he-timetable-row.active .he-timetable-hours {
  color: var(--clr-primary);
}

/* Responsive */
@media (max-width: 600px) {
  .he-timetable-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .he-timetable-hours {
    text-align: left;
    justify-content: flex-start;
  }
}

        
      `}</style>
      </div>
    </div>
  );
}
