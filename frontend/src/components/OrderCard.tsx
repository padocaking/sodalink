import { useNavigate } from 'react-router-dom';

export type OrderStatus = 'andamento' | 'entregue' | 'cancelado';

export interface OrderData {
  orderNumber: string;
  status: OrderStatus;
  dateLabel: string;
  createdAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  total: string;
}

const statusConfig: Record<OrderStatus, {
  label: string;
  color: string;
  headerBg: string;
  icon: string;
  iconColor: string;
}> = {
  andamento: {
    label: 'Em andamento',
    color: '#9e9d2e',
    headerBg: 'bg-yellow-50',
    icon: 'check_circle',
    iconColor: 'text-green-500',
  },
  entregue: {
    label: 'Entregue',
    color: '#22c55e',
    headerBg: 'bg-green-50',
    icon: 'check_circle',
    iconColor: 'text-teal-500',
  },
  cancelado: {
    label: 'Cancelado',
    color: '#ef4444',
    headerBg: 'bg-red-50',
    icon: 'cancel',
    iconColor: 'text-red-500',
  },
};

export default function OrderCard({ order }: { order: OrderData }) {
  const config = statusConfig[order.status];
  const navigate = useNavigate();
  const goToDetail = () => navigate(`/pedido/${order.orderNumber}`);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className={`${config.headerBg} px-4 py-3 flex items-center justify-between`}>
        <span
          style={{ backgroundColor: config.color }}
          className="text-white text-xs font-semibold px-3 py-1.5 rounded-md"
        >
          {order.dateLabel}
        </span>
        <div className="text-xs text-gray-600 text-center">
          <span className="text-gray-400">Ordem:</span>
          <br />
          <span className="font-semibold">{order.orderNumber}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="text-right">
            <span className="text-gray-400">Status:</span>
            <br />
            <span className="font-semibold">{config.label}</span>
          </div>
          <span className={`material-icons text-base ${config.iconColor}`}>{config.icon}</span>
        </div>
      </div>

      {/* Colored divider */}
      <div style={{ backgroundColor: config.color }} className="h-0.5" />

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500">
          Realizado: {order.createdAt}
        </p>
        {order.deliveredAt && (
          <p className="text-xs text-gray-500">
            Entregue: {order.deliveredAt}
          </p>
        )}
        {order.cancelledAt && (
          <p className="text-xs text-gray-500">
            Cancelado: {order.cancelledAt}
          </p>
        )}

        {/* Placeholder for future order items */}
        <div className="min-h-[60px]" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Total:</span>
          <span className="text-lg font-bold">R$ {order.total}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-3">
          {order.status === 'entregue' ? (
            <button className="text-xs font-semibold text-green-600 border border-green-600 rounded-full px-4 py-1.5 hover:bg-green-50 transition-colors">
              Refazer o pedido
            </button>
          ) : (
            <div />
          )}
          <button onClick={goToDetail} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
