import { useMemo, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Clock3,
  CreditCard,
  Euro,
  Repeat2,
  Star,
  TrendingUp,
  Users,
  Utensils,
} from "lucide-react";
import type { IRestaurantStats, IReview, IVisit } from "@/types";
import type { Dish } from "@/types/Dish";
import CustomerDonutChart from "../CustomerDonutChart";
import PeakVisitHoursChart from "../PeakVisitHoursChart";
import RevenueLineChart, { type StatisticsPeriod } from "../RevenueLineChart";
import TopDishesBarChart from "../TopDishesBarChart";

interface EmployeeStatisticsPanelProps {
  visits: IVisit[];
  reviews: IReview[];
  dishes: Dish[];
  restaurantId: string;
  restaurantKpis?: IRestaurantStats | null;
  restRating?: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}

const PERIOD_OPTIONS: Array<{ value: StatisticsPeriod; label: string }> = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "12m", label: "12 meses" },
];

function normalizeId(value: unknown) {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id?: string })._id ?? "");
  }

  return String(value ?? "");
}

function getVisitDate(visit: IVisit) {
  return new Date(visit.date || visit.createdAt || Date.now());
}

function getReviewDate(review: IReview) {
  return new Date(review.date || review.createdAt || Date.now());
}

function getReferenceDate(visits: IVisit[], restaurantId: string) {
  const selectedRestaurantId = normalizeId(restaurantId);

  const visitTimes = visits
    .filter(
      (visit) => normalizeId(visit.restaurant_id) === selectedRestaurantId,
    )
    .map((visit) => getVisitDate(visit).getTime())
    .filter((time) => !Number.isNaN(time));

  if (!visitTimes.length) {
    return new Date();
  }

  const referenceDate = new Date(Math.max(...visitTimes));
  referenceDate.setHours(23, 59, 59, 999);

  return referenceDate;
}

function getPeriodStart(period: StatisticsPeriod, referenceDate: Date) {
  const start = new Date(referenceDate);

  if (period === "7d") {
    start.setDate(referenceDate.getDate() - 6);
  } else if (period === "30d") {
    start.setDate(referenceDate.getDate() - 29);
  } else {
    start.setMonth(referenceDate.getMonth() - 11);
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

function filterVisits(
  visits: IVisit[],
  restaurantId: string,
  period: StatisticsPeriod,
  referenceDate: Date,
) {
  const selectedRestaurantId = normalizeId(restaurantId);
  const start = getPeriodStart(period, referenceDate);
  const end = new Date(referenceDate);

  return visits.filter((visit) => {
    if (normalizeId(visit.restaurant_id) !== selectedRestaurantId) return false;

    const date = getVisitDate(visit);
    return !Number.isNaN(date.getTime()) && date >= start && date <= end;
  });
}

function filterReviews(
  reviews: IReview[],
  restaurantId: string,
  period: StatisticsPeriod,
  referenceDate: Date,
) {
  const selectedRestaurantId = normalizeId(restaurantId);
  const start = getPeriodStart(period, referenceDate);
  const end = new Date(referenceDate);

  return reviews.filter((review) => {
    if (normalizeId(review.restaurant_id) !== selectedRestaurantId)
      return false;

    const date = getReviewDate(review);
    return !Number.isNaN(date.getTime()) && date >= start && date <= end;
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function getBestHour(visits: IVisit[]) {
  const hours: Record<string, number> = {};

  visits.forEach((visit) => {
    const date = getVisitDate(visit);
    if (Number.isNaN(date.getTime())) return;

    const hour = `${String(date.getHours()).padStart(2, "0")}:00`;
    hours[hour] = (hours[hour] || 0) + 1;
  });

  return Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
}

function getTopDish(dishes: Dish[]) {
  return dishes
    .filter(
      (dish) => dish.active !== false && (dish.avgRating || dish.ratingsCount),
    )
    .sort(
      (a, b) =>
        Number(b.avgRating ?? 0) - Number(a.avgRating ?? 0) ||
        Number(b.ratingsCount ?? 0) - Number(a.ratingsCount ?? 0),
    )[0];
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}: MetricCardProps) {
  return (
    <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex min-h-[390px] flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">
        {value}
      </div>
      <p className="mt-2 text-sm font-medium text-slate-500">{description}</p>
    </article>
  );
}

export default function EmployeeStatisticsPanel({
  visits,
  reviews,
  dishes,
  restaurantId,
  restaurantKpis,
  restRating,
}: EmployeeStatisticsPanelProps) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<StatisticsPeriod>("30d");

  const referenceDate = useMemo(
    () => getReferenceDate(visits, restaurantId),
    [restaurantId, visits],
  );

  const filteredVisits = useMemo(
    () => filterVisits(visits, restaurantId, period, referenceDate),
    [period, restaurantId, referenceDate, visits],
  );
  const filteredReviews = useMemo(
    () => filterReviews(reviews, restaurantId, period, referenceDate),
    [period, restaurantId, referenceDate, reviews],
  );

  const metrics = useMemo(() => {
    const totalRevenue = filteredVisits.reduce(
      (sum, visit) => sum + Number(visit.billAmount ?? 0),
      0,
    );
    const totalVisits = filteredVisits.length;
    const uniqueCustomerIds = new Set(
      filteredVisits
        .map((visit) => normalizeId(visit.customer_id))
        .filter(Boolean),
    );
    const customerVisitCounts = filteredVisits.reduce<Record<string, number>>(
      (acc, visit) => {
        const customerId = normalizeId(visit.customer_id);
        if (!customerId) return acc;

        acc[customerId] = (acc[customerId] || 0) + 1;
        return acc;
      },
      {},
    );
    const recurrentCustomers = Object.values(customerVisitCounts).filter(
      (count) => count > 1,
    ).length;
    const loyaltyRate =
      uniqueCustomerIds.size > 0
        ? (recurrentCustomers / uniqueCustomerIds.size) * 100
        : 0;
    const averageTicket = totalVisits > 0 ? totalRevenue / totalVisits : 0;
    const averageRating =
      filteredReviews.length > 0
        ? filteredReviews.reduce(
            (sum, review) => sum + Number(review.globalRating ?? 0),
            0,
          ) / filteredReviews.length
        : Number(restRating ?? restaurantKpis?.averageRating ?? 0);

    return {
      totalRevenue,
      averageTicket,
      totalVisits,
      uniqueCustomers: uniqueCustomerIds.size,
      recurrentCustomers,
      loyaltyRate,
      averageRating,
    };
  }, [filteredReviews, filteredVisits, restRating, restaurantKpis]);

  const bestHour = useMemo(() => getBestHour(filteredVisits), [filteredVisits]);
  const topDish = useMemo(() => getTopDish(dishes), [dishes]);

  return (
    <main className="min-h-screen flex-1 bg-slate-50/60 px-8 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-5 rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-orange-500">
              {t(
                "dashboard.employee.statisticsLabel",
                "Rendimiento del negocio",
              )}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              {t(
                "dashboard.employee.statisticsTitle",
                "Panel de estadísticas del restaurante",
              )}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              {t(
                "dashboard.employee.statisticsSubtitle",
                "Analiza ingresos, clientes, fidelización y tendencias para entender mejor el rendimiento del restaurante.",
              )}
            </p>
          </div>

          <div className="flex rounded-2xl bg-slate-100 p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  period === option.value
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title={t("dashboard.employee.totalRevenue", "Ingresos totales")}
            value={formatCurrency(metrics.totalRevenue)}
            description={t(
              "dashboard.employee.totalRevenueDescription",
              "Suma de facturación del periodo",
            )}
            icon={Euro}
            accent="bg-orange-50 text-orange-500"
          />
          <MetricCard
            title={t("dashboard.employee.averageTicket", "Ticket medio")}
            value={formatCurrency(metrics.averageTicket)}
            description={t(
              "dashboard.employee.averageTicketDescription",
              "Promedio de gasto por visita",
            )}
            icon={CreditCard}
            accent="bg-blue-50 text-blue-500"
          />
          <MetricCard
            title={t("dashboard.employee.uniqueCustomers", "Clientes únicos")}
            value={metrics.uniqueCustomers}
            description={`${metrics.recurrentCustomers} ${t("dashboard.employee.recurrentCustomers", "clientes recurrentes")}`}
            icon={Users}
            accent="bg-emerald-50 text-emerald-500"
          />
          <MetricCard
            title={t("dashboard.employee.averageRating", "Rating medio")}
            value={metrics.averageRating.toFixed(1)}
            description={t(
              "dashboard.employee.averageRatingDescription",
              "Valoración media del restaurante",
            )}
            icon={Star}
            accent="bg-amber-50 text-amber-500"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex min-h-[390px] flex-col">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  {t("components.revenueLine.title", "Evolución de ingresos")}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t(
                    "components.revenueLine.subtitle",
                    "Tendencia económica del restaurante",
                  )}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div className="mt-4 h-[300px] overflow-hidden">
              <div className="mt-4 h-[300px] overflow-visible">
                <RevenueLineChart
                  visits={filteredVisits}
                  restaurantId={restaurantId}
                />
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex min-h-[390px] flex-col">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  {t(
                    "components.customerDonut.title",
                    "Clientes nuevos y recurrentes",
                  )}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t(
                    "components.customerDonut.subtitle",
                    "Distribución de fidelización",
                  )}
                </p>
              </div>
              <Repeat2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-4 h-[300px] overflow-hidden">
              <div className="mt-4 h-[300px] overflow-visible">
                <CustomerDonutChart
                  visits={filteredVisits}
                  restaurantId={restaurantId}
                />
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex min-h-[390px] flex-col">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  {t("components.topDishes.title", "Top platos por valoración")}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t(
                    "components.topDishes.subtitle",
                    "Platos con mejor rendimiento",
                  )}
                </p>
              </div>
              <Utensils className="h-5 w-5 text-violet-500" />
            </div>
            <div className="mt-4 h-[300px] overflow-hidden">
              <div className="mt-4 h-[300px] overflow-visible">
                <TopDishesBarChart dishes={dishes} />
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex min-h-[390px] flex-col">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  {t("components.peakHours.title", "Horas punta de visitas")}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t(
                    "components.peakHours.subtitle",
                    "Franjas horarias con más actividad",
                  )}
                </p>
              </div>
              <Clock3 className="h-5 w-5 text-sky-500" />
            </div>
            <div className="mt-4 h-[300px] overflow-hidden">
              <div className="mt-4 h-[300px] overflow-visible">
                <PeakVisitHoursChart
                  visits={filteredVisits}
                  restaurantId={restaurantId}
                />
              </div>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <BarChart3 className="mb-4 h-5 w-5 text-orange-500" />
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              {t("dashboard.employee.loyaltyRate", "Ratio de fidelización")}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {metrics.loyaltyRate.toFixed(1)}%
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {t(
                "dashboard.employee.loyaltyRateDescription",
                "Clientes que han repetido visita en el periodo seleccionado.",
              )}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <Clock3 className="mb-4 h-5 w-5 text-sky-500" />
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              {t("dashboard.employee.bestHour", "Mejor franja horaria")}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {bestHour?.[0] ?? "--:--"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {bestHour
                ? `${bestHour[1]} ${t("dashboard.employee.bestHourVisits", "visitas registradas")}`
                : t(
                    "dashboard.employee.noBestHour",
                    "Todavía no hay datos suficientes.",
                  )}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <Utensils className="mb-4 h-5 w-5 text-violet-500" />
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              {t("dashboard.employee.bestDish", "Plato destacado")}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {topDish?.name ?? "-"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {topDish
                ? `${Number(topDish.avgRating ?? 0).toFixed(1)} ★ · ${Number(topDish.ratingsCount ?? 0)} ${t("dashboard.employee.ratings", "valoraciones")}`
                : t(
                    "dashboard.employee.noBestDish",
                    "No hay platos con datos suficientes.",
                  )}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
