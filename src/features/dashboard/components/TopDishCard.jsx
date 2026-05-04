import { useEffect, useState } from 'react';
import { Trophy, Star, TrendingUp } from 'lucide-react';

export function useTopDishes(restaurantId) {
  const [topDishes, setTopDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    fetch(`http://localhost:1337/dish-ratings/top-dishes/${restaurantId}`)
      .then(res => res.json())
      .then(data => setTopDishes(data))
      .catch(err => console.error("Error fetching top dishes:", err))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  return { topDishes, loading };
}

export default function TopDishCard({ restaurantId }) {
  const { topDishes, loading } = useTopDishes(restaurantId);

  const getMedal = (index) => {
    if (index === 0) return { emoji: "🥇", color: "text-yellow-500", bg: "bg-yellow-50" };
    if (index === 1) return { emoji: "🥈", color: "text-gray-400", bg: "bg-gray-50" };
    if (index === 2) return { emoji: "🥉", color: "text-orange-400", bg: "bg-orange-50" };
    return { emoji: `#${index + 1}`, color: "text-gray-400", bg: "bg-gray-50" };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!topDishes.length) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No hay datos suficientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topDishes.slice(0, 5).map((dish, index) => {
        const medal = getMedal(index);
        return (
          <div
            key={dish.dish_id}
            className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${medal.bg} flex items-center justify-center font-bold text-sm ${medal.color}`}>
                {medal.emoji}
              </div>
              <span className="font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                {dish.name}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-50">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span className="font-black text-sm text-gray-800">{dish.avgRating.toFixed(1)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}