import DashboardCard from '@/features/dashboard/components/DashboardCard';
import RestaurantReviewsBarChart from '@/features/dashboard/components/RestaurantReviewsBarChart';

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
