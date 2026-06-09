import { OrderStatus } from '@/types';

const styles: Record<OrderStatus, string> = {
  PENDING:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED:  'bg-green-50 text-green-700 border-green-200',
  REJECTED:  'bg-red-50 text-red-600 border-red-200',
  SHIPPED:   'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const labels: Record<OrderStatus, string> = {
  PENDING:   'Na čekanju',
  APPROVED:  'Odobrano',
  REJECTED:  'Odbijeno',
  SHIPPED:   'U isporuci',
  DELIVERED: 'Isporučeno',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
