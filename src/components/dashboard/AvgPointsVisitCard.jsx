import { TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';

export default function AvgPointsVisitCard({ value }) {
  return (
    <MetricCard
      icon={<TrendingUp size={20} />}
      value={value}
      label="Average Points / Visit"
      variant="visits"
    />
  );
}