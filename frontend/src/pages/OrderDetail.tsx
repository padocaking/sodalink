import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchOrder, formatPrice, type Order } from '../api';

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_BALANCE: 'À vista',
  BOLETO: 'Boleto',
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
};

// Order status → step index in the delivery progress bar (0..3)
const STATUS_STEPS: { key: Order['status']; label: string }[] = [
  { key: 'CONFIRMED', label: 'Recebido' },
  { key: 'PREPARING', label: 'Em preparação' },
  { key: 'SHIPPED', label: 'A caminho' },
  { key: 'DELIVERED', label: 'Entregue' },
];

function statusStepIndex(status: Order['status']): number {
  switch (status) {
    case 'PENDING':
    case 'CONFIRMED':
      return 0;
    case 'PREPARING':
      return 1;
    case 'SHIPPED':
      return 2;
    case 'DELIVERED':
      return 3;
    default:
      return 0;
  }
}

function PriceParts({ value, large }: { value: string | number; large?: boolean }) {
  const [reais, centavos] = Number(value).toFixed(2).split('.');
  return (
    <span className={`font-extrabold text-gray-900 ${large ? 'text-3xl' : 'text-xl'}`}>
      R$ {reais}<sup className={`font-bold ${large ? 'text-xs' : 'text-[0.6rem]'}`}>,{centavos}</sup>
    </span>
  );
}

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber) return;
    fetchOrder(orderNumber)
      .then(setOrder)
      .catch(() => setError('Não foi possível carregar o pedido.'))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  let dateBadge = '';
  if (order) {
    const d = new Date(order.createdAt);
    const day = d.toLocaleDateString('pt-BR', { day: '2-digit' });
    const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    dateBadge = `${day} ${month}`;
  }

  const cancelled = order?.status === 'CANCELLED';
  const stepIndex = order ? statusStepIndex(order.status) : 0;
  const statusLabel = cancelled ? 'Cancelado' : STATUS_STEPS[stepIndex].label;

  const subtotal = order ? Number(order.subtotal) : 0;
  const total = order ? Number(order.total) : 0;
  const discount = Math.max(0, subtotal - total);
  const charges = Math.max(0, total - subtotal);

  return (
    <div className="min-h-full bg-white flex flex-col">
      {/* Top bar (modal-style) */}
      <header className="bg-white flex items-center justify-between h-20 px-5 sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-gray-900">Detalhe do pedido</h1>
        <button aria-label="Fechar" onClick={() => navigate(-1)} className="p-2 -m-2 cursor-pointer">
          <span className="material-icons text-gray-900 text-[30px]">close</span>
        </button>
      </header>

      {loading ? (
        <p className="text-sm text-gray-400 py-10 text-center">Carregando pedido...</p>
      ) : error || !order ? (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mx-4">{error || 'Pedido não encontrado.'}</p>
      ) : (
        <div className="flex-1 overflow-y-auto pb-8">
          {/* Status banner */}
          <div className={`px-5 py-4 flex items-center gap-4 ${cancelled ? 'bg-red-50' : 'bg-amber-100/70'}`}>
            <span className="bg-amber-400 text-white text-sm font-semibold px-3 py-2 rounded-md whitespace-nowrap">
              {dateBadge}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-700/80">Ordem</p>
              <p className="text-sm font-semibold text-amber-800 break-all leading-tight">{order.orderNumber}</p>
            </div>
            <div className="shrink-0">
              <p className="text-xs text-amber-700/80">Status</p>
              <p className="text-sm font-semibold text-amber-800">{statusLabel}</p>
              {!cancelled && (
                <div className="flex gap-1 mt-1">
                  {STATUS_STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 w-6 rounded-full ${i <= stepIndex ? 'bg-amber-500' : 'bg-amber-200'}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <span className="material-icons text-amber-600 text-[1.4rem]">info</span>
          </div>

          {/* Items */}
          <div className="px-5">
            {order.orderItems.map((item) => (
              <div key={item.id} className="py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{item.product.id}</p>
                  <p className="text-base text-gray-900 leading-tight">{item.product.name}</p>
                  <p className="text-sm font-semibold text-emerald-500 mt-1">{item.quantity} Peças</p>
                </div>
                <PriceParts value={item.totalPrice} />
              </div>
            ))}
          </div>

          {/* Forma de pagamento */}
          <div className="px-5 py-5 mt-2 border-y border-dashed border-gray-300">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Forma de pagamento</h2>
            <div className="flex items-center justify-between pl-2">
              <span className="text-base text-gray-700">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}:</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Resumo */}
          <div className="px-5 py-5">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Resumo</h2>
            <div className="pl-2">
              <div className="flex justify-between py-1 text-base">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-base">
                <span className="text-gray-700">Desconto:</span>
                <span className="text-red-500">{formatPrice(-discount)}</span>
              </div>
              <div className="flex justify-between py-1 text-base">
                <span className="text-gray-700">Encargos Financeiros:</span>
                <span className="text-gray-900">{formatPrice(charges)}</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">Total:</span>
            <PriceParts value={total} large />
          </div>
        </div>
      )}
    </div>
  );
}
