import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { IReview, IVisit } from "@/types";
import type { Dish } from "@/types/Dish";

interface EmployeeOverviewPanelProps {
  visits: IVisit[];
  reviews: IReview[];
  dishes: Dish[];
  restaurantId: string;
  averagePointsPerVisit: number;
  loyalCustomers: number;
  restRating?: number | string;
}

<<<<<<< HEAD
function normalizeId(value: unknown) {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id?: string })._id ?? "");
  }
=======
function buildRatingRanking(dishes: Dish[]) {
  const ranking = dishes
    .filter((dish) => dish.avgRating !== undefined && dish.avgRating > 0)
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    .slice(0, 10)
    .map((dish) => ({
      name: dish.name,
      score: dish.avgRating || 0,
    }));
>>>>>>> origin/develop

  return String(value ?? "");
}

function buildPeakHour(visits: IVisit[], restaurantId: string) {
  const currentRestaurantId = normalizeId(restaurantId);
  const hourMap: Record<string, number> = {};

  visits.forEach((visit) => {
    if (normalizeId(visit.restaurant_id) !== currentRestaurantId) return;

    const date = new Date(visit.date || visit.createdAt || Date.now());
    if (Number.isNaN(date.getTime())) return;

    const hour = `${String(date.getHours()).padStart(2, "0")}:00`;
    hourMap[hour] = (hourMap[hour] || 0) + 1;
  });

  return Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];
}

function buildTopDishes(dishes: Dish[]) {
  return dishes
    .filter(
      (dish) =>
        dish.active !== false &&
        dish.avgRating !== undefined &&
        dish.avgRating > 0,
    )
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    .slice(0, 3)
    .map((dish) => ({
      name: dish.name,
      score: dish.avgRating || 0,
    }));
}

export default function EmployeeOverviewPanel({
  visits,
  dishes,
  restaurantId,
  averagePointsPerVisit,
  loyalCustomers,
  restRating,
}: EmployeeOverviewPanelProps) {
  const { t } = useTranslation();
  const peakHour = useMemo(
    () => buildPeakHour(visits, restaurantId),
    [visits, restaurantId],
  );
  const topDishes = useMemo(() => buildTopDishes(dishes), [dishes]);
  const recentVisits = visits.filter(
    (visit) => normalizeId(visit.restaurant_id) === normalizeId(restaurantId),
  ).length;

  return (
    <main className="flex-1 w-full h-full bg-slate-50/30">
<<<<<<< HEAD
      <div className="max-w-[1200px] w-full mx-auto px-8 pt-4 pb-10">
        <div className="mb-8 flex flex-col gap-2 text-left">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-orange-500">
            {t("dashboard.employee.overviewLabel", "Resumen operativo")}
          </p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">
            {t(
              "dashboard.employee.statsTitle",
              "VISTA GENERAL DEL RESTAURANTE",
            )}
          </h1>
          <p className="max-w-3xl text-sm font-medium leading-6 text-slate-500">
            {t(
              "dashboard.employee.overviewSubtitle",
              "Vista rápida del estado del restaurante con una previsualización de las estadísticas principales.",
            )}
          </p>
        </div>
=======
      <div className="max-w-[1200px] w-full mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight uppercase">
          {t('dashboard.employee.statsTitle', 'VISTA GENERAL')}
        </h1>
>>>>>>> origin/develop

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-orange-50/60 rounded-2xl p-6 flex items-center gap-5 border border-orange-100/50">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm text-orange-500">
              🏆
            </div>
            <div className="flex flex-col">
              <div className="text-[32px] leading-tight font-bold text-slate-800">
                {Number(averagePointsPerVisit || 0)}
              </div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">
<<<<<<< HEAD
                {t("components.metrics.avgPointsVisit")}
=======
                {t('components.metrics.avgPointsVisit')}
>>>>>>> origin/develop
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-2xl p-6 flex items-center gap-5 border border-blue-100/50">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm text-blue-500">
              👥
            </div>
            <div className="flex flex-col">
              <div className="text-[32px] leading-tight font-bold text-slate-800">
                {Number(loyalCustomers || 0)}
              </div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">
<<<<<<< HEAD
                {t("components.metrics.loyalCustomers")}
=======
                {t('components.metrics.loyalCustomers')}
>>>>>>> origin/develop
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-6 flex items-center gap-5 border border-amber-100/50">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm text-amber-500">
              ⭐
            </div>
            <div className="flex flex-col">
              <div className="text-[32px] leading-tight font-bold text-slate-800">
                {Number(restRating ?? 0).toFixed(1)}
<<<<<<< HEAD
              </div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">
                {t("components.metrics.avgRating")}
=======
              </div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">
                {t('components.metrics.avgRating')}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col min-h-[380px]">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">
              {t('components.reviewScores.title')}
            </h3>
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full h-full min-h-[260px]">
                <RestaurantReviewsBarChart reviews={reviews} restaurantId={restaurantId} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col min-h-[380px]">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">
              {t('components.peakHours.title')}
            </h3>
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full h-full min-h-[260px]">
                <PeakVisitHoursChart visits={visits} restaurantId={restaurantId} />
>>>>>>> origin/develop
              </div>
            </div>
          </div>
        </section>

<<<<<<< HEAD
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <article className="lg:col-span-3 bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  {t(
                    "dashboard.employee.statisticsPreviewTitle",
                    "Vista previa de estadísticas",
                  )}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {t(
                    "dashboard.employee.statisticsPreviewText",
                    "Resumen rápido de actividad reciente. El análisis completo está disponible en la sección Estadísticas.",
=======
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">
            {t('components.topDishes.title')}
          </h3>
          <div className="flex flex-col">
            {ranking.length > 0 ? (
              ranking.map((dish, index) => (
                <div
                  key={`${dish.name}-${index}`}
                  className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 text-lg">★</span>
                    <span className="text-[15px] font-medium text-slate-700">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-slate-800">
                      {dish.score.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-slate-400 text-sm italic">
                  {t(
                    'components.topDishes.none',
                    'No hay datos suficientes para generar el ranking de platos.',
>>>>>>> origin/develop
                  )}
                </p>
              </div>
              <a
                href="/dashboard/analytics"
                className="shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-orange-600"
              >
                {t("dashboard.employee.viewStatistics", "Ver estadísticas")}
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Visitas recientes
                </p>
                <p className="mt-3 text-3xl font-black text-slate-900">
                  {recentVisits}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {t(
                    "dashboard.employee.currentPageData",
                    "Datos cargados en la vista actual",
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {t("dashboard.employee.bestHour", "Mejor franja")}
                </p>
                <p className="mt-3 text-3xl font-black text-slate-900">
                  {peakHour?.[0] ?? "--:--"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {peakHour
                    ? `${peakHour[1]} ${t("dashboard.employee.bestHourVisits", "visitas")}`
                    : t("dashboard.employee.noData", "Sin datos")}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {t("dashboard.employee.bestDish", "Plato destacado")}
                </p>
                <p className="mt-3 text-xl font-black text-slate-900 truncate">
                  {topDishes[0]?.name ?? "-"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {topDishes[0]
                    ? `${topDishes[0].score.toFixed(1)} ★`
                    : t("dashboard.employee.noData", "Sin datos")}
                </p>
              </div>
            </div>
          </article>

          <article className="lg:col-span-2 bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 mb-5 uppercase tracking-wide">
              {t("dashboard.employee.topDishesPreview", "Top platos")}
            </h3>
            <div className="flex flex-col">
              {topDishes.length > 0 ? (
                topDishes.map((dish, index) => (
                  <div
                    key={`${dish.name}-${index}`}
                    className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-slate-300 text-lg">★</span>
                      <span className="text-[15px] font-medium text-slate-700 truncate">
                        {dish.name}
                      </span>
                    </div>
                    <span className="text-[15px] font-semibold text-slate-800">
                      {dish.score.toFixed(1)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-slate-400 text-sm italic">
                  {t(
                    "components.topDishes.none",
                    "No hay datos suficientes para generar el ranking de platos.",
                  )}
                </p>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
