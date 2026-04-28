import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useTopDishes(restaurantId) {
  const [topDishes, setTopDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    setLoading(true);

    fetch(`http://localhost:1337/dish-ratings/top-dishes/${restaurantId}`)
      .then(res => res.json())
      .then(data => {
        setTopDishes(data);
      })
      .catch(err => {
        console.error("Error fetching top dishes:", err);
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  return { topDishes, loading };
}

export default function TopDishCard({ restaurantId }) {
  const { t } = useTranslation();
  const { topDishes, loading } = useTopDishes(restaurantId);

  if (loading) {
    return (
      <div className="card">
        <h3>{t("components.topDishes.title")}</h3>
        <p>{t("components.topDishes.loading")}</p>
      </div>
    );
  }

  if (!topDishes.length) {
    return (
      <div className="card">
        <h3>{t("components.topDishes.title")}</h3>
        <p>{t("components.topDishes.none")}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>{t("components.topDishes.title")}</h3>

      {topDishes.map((dish, index) => (
        <div
          key={dish.dish_id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
             borderBottom: '1px solid rgba(255,255,255,0.05)',
            
          }}
        >
          <span>
            #{index + 1} - {dish.name}
          </span>

          <strong>⭐ {dish.avgRating.toFixed(1)}</strong>
        </div>
      ))}
    </div>
  );
}