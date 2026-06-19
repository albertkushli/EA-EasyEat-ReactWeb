import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { IVisit } from "@/types";

export type StatisticsPeriod = "7d" | "30d" | "12m";

interface RevenueLineChartProps {
  visits: IVisit[];
  restaurantId?: string;
  period?: StatisticsPeriod;
}

function normalizeRestaurantId(value: unknown) {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id?: string })._id ?? "");
  }

  return String(value ?? "");
}

function getPeriodStart(period?: StatisticsPeriod) {
  if (!period) return null;

  const now = new Date();
  const start = new Date(now);

  if (period === "7d") {
    start.setDate(now.getDate() - 6);
  } else if (period === "30d") {
    start.setDate(now.getDate() - 29);
  } else {
    start.setMonth(now.getMonth() - 11);
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

export default function RevenueLineChart({
  visits,
  restaurantId,
  period,
}: RevenueLineChartProps) {
  const data = useMemo(() => {
    const currentRestaurantId = normalizeRestaurantId(restaurantId);
    const periodStart = getPeriodStart(period);

    const grouped = visits.reduce(
      (acc, visit) => {
        const visitDateValue = visit.date || visit.createdAt;

        if (!visitDateValue) return acc;

        if (
          currentRestaurantId &&
          normalizeRestaurantId(visit.restaurant_id) !== currentRestaurantId
        ) {
          return acc;
        }

        const visitDate = new Date(visitDateValue);

        if (
          periodStart &&
          (Number.isNaN(visitDate.getTime()) || visitDate < periodStart)
        ) {
          return acc;
        }

        const dateStr = visitDate.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
        });
        acc[dateStr] = (acc[dateStr] || 0) + (Number(visit.billAmount) || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.keys(grouped)
      .slice(-15)
      .map((date) => ({ date, revenue: grouped[date] }));
  }, [visits, restaurantId, period]);

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 35 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `€${val}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Ingresos"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ r: 4, fill: "#f97316" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
