import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { IReview, IVisit } from "@/types";
import type { Dish } from "@/types/Dish";

import RevenueLineChart from "../RevenueLineChart";
import CustomerDonutChart from "../CustomerDonutChart";
import TopDishesBarChart from "../TopDishesBarChart";
import PeakVisitHoursChart from "../PeakVisitHoursChart";

interface EmployeeOverviewPanelProps {
  visits: IVisit[];
  reviews: IReview[];
  dishes: Dish[];
  restaurantId: string;
  averagePointsPerVisit: number;
  loyalCustomers: number;
  restRating?: number | string;
}

export default function EmployeeOverviewPanel({
  visits,
  dishes,
  restaurantId,
  loyalCustomers,
  restRating,
}: EmployeeOverviewPanelProps) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<"7d" | "30d" | "12m">("30d");

  const totalRevenue = visits.reduce(
    (acc, visit) => acc + (Number(visit.billAmount) || 0),
    0,
  );
  const ticketMedio = visits.length > 0 ? totalRevenue / visits.length : 0;

  return (
    <main className="flex-1 w-full h-full bg-slate-50/30 overflow-y-auto">
      <div className="max-w-[1200px] w-full mx-auto px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">
            {t(
              "dashboard.employee.statsTitle",
              "VISTA GENERAL DEL RESTAURANTE",
            )}
          </h1>

          <div className="flex bg-slate-200/50 p-1 rounded-lg mt-4 sm:mt-0">
            {[
              { id: "7d", label: "7 días" },
              { id: "30d", label: "30 días" },
              { id: "12m", label: "12 meses" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  activeFilter === filter.id
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-l-orange-500">
            <div className="text-[12px] font-semibold text-slate-400 tracking-wide uppercase mb-1">
              Ingresos Totales
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {totalRevenue.toFixed(2)} €
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
            <div className="text-[12px] font-semibold text-slate-400 tracking-wide uppercase mb-1">
              Ticket Medio
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {ticketMedio.toFixed(2)} €
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-l-emerald-500">
            <div className="text-[12px] font-semibold text-slate-400 tracking-wide uppercase mb-1">
              Clientes Fieles
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {Number(loyalCustomers || 0)}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-l-amber-500">
            <div className="text-[12px] font-semibold text-slate-400 tracking-wide uppercase mb-1">
              Rating Medio
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {Number(restRating ?? 0).toFixed(1)}{" "}
              <span className="text-amber-500 text-xl">★</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">
              Evolución de Ingresos
            </h3>
            <div className="flex-1">
              <RevenueLineChart visits={visits} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">
              Clientes: Nuevos vs Recurrentes
            </h3>
            <div className="flex-1">
              <CustomerDonutChart visits={visits} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">
              Top 5 Platos por Valoración
            </h3>
            <div className="flex-1">
              <TopDishesBarChart dishes={dishes} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">
              Horas Punta de Visitas
            </h3>
            <div className="flex-1">
              <PeakVisitHoursChart
                visits={visits}
                restaurantId={restaurantId}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
