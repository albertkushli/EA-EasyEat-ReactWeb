import { Users } from 'lucide-react';
import MetricCard from '@/shared/components/ui/MetricCard';
import { useTranslation } from 'react-i18next';

export default function LoyalCustomersCard({ value }: { value: number }) {
  const { t } = useTranslation();
  return (
    <MetricCard
      icon={<Users size={20} />}
      value={value}
      label={t("components.metrics.loyalCustomers")}
      variant="customers"
    />
  );
}
