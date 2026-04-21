import { Users } from 'lucide-react';
import MetricCard from './MetricCard';

export default function LoyalCustomersCard({ value }) {
  return (
    <MetricCard
      icon={<Users size={20} />}
      value={value}
      label="Loyal Customers"
      variant="customers"
    />
  );
}