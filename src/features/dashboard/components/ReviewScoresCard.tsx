import DashboardCard from '@/features/dashboard/components/DashboardCard';
import RestaurantReviewsBarChart from '@/features/dashboard/components/RestaurantReviewsBarChart';
import { useTranslation } from 'react-i18next';

export default function ReviewScoresCard({ reviews, restaurantId }) {
  const { t } = useTranslation();
  return (
    <DashboardCard title={t("components.reviewScores.title")}>
      <RestaurantReviewsBarChart
        reviews={reviews}
        restaurantId={restaurantId}
      />
    </DashboardCard>
  );
}
