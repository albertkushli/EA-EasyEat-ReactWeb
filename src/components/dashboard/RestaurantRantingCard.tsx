import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRestaurantById } from '../services/api';
import RestaurantRatingCard from '../components/RestaurantRatingCard';

export default function RestaurantRatingCard() {
  const { auth } = useAuth();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurantById(
          auth?.user?.restaurant_id,
          auth?.token
        );

        setRestaurant(data);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
    };

    if (auth?.user?.restaurant_id) {
      fetchRestaurant();
    }
  }, [auth]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      {/* ⭐ AQUÍ VA EL RATING */}
      {restaurant && (
        <RestaurantRatingCard
          rating={restaurant?.profile?.globalRating}
        />
      )}
    </div>
  );
}