import DashboardCard from '@/features/dashboard/components/DashboardCard';
import PeakVisitHoursChart from '@/features/dashboard/components/PeakVisitHoursChart';

export default function PeakVisitHoursCard({ visits, restaurantId }) {
  return (
    <DashboardCard title="Peak Visit Hours">
      <PeakVisitHoursChart
        visits={visits}
        restaurantId={restaurantId}
      />
    </DashboardCard>
  );
}
