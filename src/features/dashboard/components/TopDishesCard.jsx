import DashboardCard from '@/features/dashboard/components/DashboardCard';
import TopDishCard from '@/features/dashboard/components/TopDishCard';

export default function TopDishesCard({ restaurantId }) {
  return (
    <DashboardCard title="Top Dishes">
      <TopDishCard restaurantId={restaurantId} />
    </DashboardCard>
  );
}
