import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Dish } from "@/types/Dish";

export default function TopDishesBarChart({ dishes }: { dishes: Dish[] }) {
  const data = useMemo(() => {
    return dishes
      .filter((dish) => dish.active !== false)
      .filter((dish) => dish.avgRating && dish.avgRating > 0)
      .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
      .slice(0, 5)
      .map((dish) => ({
        name:
          dish.name.length > 15
            ? `${dish.name.substring(0, 15)}...`
            : dish.name,
        rating: Number((dish.avgRating || 0).toFixed(1)),
      }));
  }, [dishes]);

  if (data.length === 0) {
    return (
      <div className="w-full h-full min-h-[260px] flex items-center justify-center text-sm text-slate-400 italic">
        No hay datos suficientes para generar el ranking de platos.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 35 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#f1f5f9"
          />
          <XAxis
            type="number"
            domain={[0, 5]}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Bar
            dataKey="rating"
            name="Valoración"
            fill="#8b5cf6"
            radius={[0, 4, 4, 0]}
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
