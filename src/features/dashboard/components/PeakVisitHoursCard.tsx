import DashboardCard from '@/features/dashboard/components/DashboardCard';
import PeakVisitHoursChart from '@/features/dashboard/components/PeakVisitHoursChart';
import { useTranslation } from 'react-i18next';

export default function PeakVisitHoursCard({ visits, restaurantId }) {
  const { t } = useTranslation();
  return (
    <DashboardCard title={t("components.peakHours.title")}>
      <PeakVisitHoursChart
        visits={visits}
        restaurantId={restaurantId}
      />
    </DashboardCard>
  );
}
