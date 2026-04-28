import DashboardCard from './DashboardCard';
import TopDishCard from './TopDishCard';
import { useTranslation } from 'react-i18next';

export default function TopDishesCard({ restaurantId }) {
  const { t } = useTranslation();
  return (
    <DashboardCard title={t("components.topDishes.title")}>
      <TopDishCard restaurantId={restaurantId} />
    </DashboardCard>
  );
}