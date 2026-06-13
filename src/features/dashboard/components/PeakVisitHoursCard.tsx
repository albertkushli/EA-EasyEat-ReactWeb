import DashboardCard from '@/features/dashboard/components/DashboardCard';
import PeakVisitHoursChart from '@/features/dashboard/components/PeakVisitHoursChart';
import { IVisit } from '@/types';
import { useTranslation } from 'react-i18next';

export default function PeakVisitHoursCard({
  visits,
  restaurantId,
}: {
  visits: IVisit[];
  restaurantId: string;
}) {
  const { t } = useTranslation();
  return (
    <DashboardCard title={t('components.peakHours.title')}>
      <PeakVisitHoursChart visits={visits} restaurantId={restaurantId} />
    </DashboardCard>
  );
}
