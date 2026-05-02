import { Users } from 'lucide-react';
import MetricCard from './MetricCard';
import { useTranslation } from 'react-i18next';

export default function LoyalCustomersCard({ value }) {
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