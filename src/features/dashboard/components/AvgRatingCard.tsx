import { Star } from 'lucide-react';
import MetricCard from '@/shared/components/ui/MetricCard';
import { useTranslation } from 'react-i18next';

export default function AvgRatingCard({ value }: { value: number }) {
  const { t } = useTranslation();
  return (
    <MetricCard
      icon={<Star size={20} />}
      value={value}
      label={t('components.metrics.avgRating')}
      variant="rating"
    />
  );
}
