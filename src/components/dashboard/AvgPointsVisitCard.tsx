import { TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import { useTranslation } from 'react-i18next';

export default function AvgPointsVisitCard({ value }) {
  const { t } = useTranslation();
  return (
    <MetricCard
      icon={<TrendingUp size={20} />}
      value={value}
      label={t("components.metrics.avgPointsVisit")}
      variant="visits"
    />
  );
}