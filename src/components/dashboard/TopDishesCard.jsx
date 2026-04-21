import DashboardCard from './DashboardCard';
import TopDishCard from './TopDishCard';

export default function TopDishesCard({ restaurantId }) {
  return (
    <DashboardCard title="Top Dishes">
      <TopDishCard restaurantId={restaurantId} />
    </DashboardCard>
  );
}