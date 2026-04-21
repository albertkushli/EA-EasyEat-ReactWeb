import DashboardCard from './DashboardCard';
import RestaurantReviewsBarChart from './RestaurantReviewsBarChart';

export default function ReviewScoresCard({ reviews, restaurantId }) {
  return (
    <DashboardCard title="Review Scores">
      <RestaurantReviewsBarChart
        reviews={reviews}
        restaurantId={restaurantId}
      />
    </DashboardCard>
  );
}