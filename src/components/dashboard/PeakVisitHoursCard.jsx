import DashboardCard from './DashboardCard';
import PeakVisitHoursChart from './PeakVisitHoursChart';

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