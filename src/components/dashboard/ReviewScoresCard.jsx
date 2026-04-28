import DashboardCard from './DashboardCard';
import RestaurantReviewsBarChart from './RestaurantReviewsBarChart';
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