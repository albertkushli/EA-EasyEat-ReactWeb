import { Star } from 'lucide-react';
import MetricCard from '@/shared/components/ui/MetricCard';

export default function AvgRatingCard({ value }) {
  return (
    <MetricCard
      icon={<Star size={20} />}
      value={value}
      label="Avg Rating"
      variant="rating"
    />
  );
}
