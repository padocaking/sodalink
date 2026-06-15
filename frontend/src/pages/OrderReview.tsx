import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, fetchCart, formatPrice, type CartItem } from '../api';

const DELIVERY_ADDRESS = 'R JACAREZINHO, 857, MERCES, 80710-150, Curitiba - PR';

function SectionCard({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm px-5 py-4">
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className="w-full flex items-center justify-between text-left disabled:cursor-default"
      >
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {onClick && (
          <span className="material-icons text-gray-400 text-[1.6rem]">chevron_right</span>
        )}
      </button>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function OrderReview() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart()
      .then((cart) => {
        if (cart.length === 0) {
          navigate('/carrinho', { replace: true });
          return;
        }
        setItems(cart);
      })
      .catch(() => setError('Não foi possível carregar o pedido.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const totalPieces = items.reduce((sum, i) => sum + i.quantity, 0);
  const discount = 0;
  const charges = 0;
  const total = subtotal - discount + charges;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const order = await createOrder();
      navigate('/pedido-concluido', { state: { orderNumber: order.orderNumber } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar pedido');
      setSubmitting(false);
    }
  };

  const [reais, centavos] = total.toFixed(2).split('.');

  return (
    <div className="min-h-full bg-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-white flex items-center justify-between border-b border-gray-200 h-20 px-5 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button aria-label="Voltar" onClick={() => navigate(-1)} className="p-2 -m-2 cursor-pointer">
            <span className="material-icons text-gray-800 text-[30px]">arrow_back_ios_new</span>
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Detalhe do pedido</h1>
        </div>
        <span className="material-icons text-gray-700 text-[28px]">help_outline</span>
      </header>

      {loading ? (
        <p className="text-sm text-gray-400 py-10 text-center">Carregando pedido...</p>
      ) : (
        <div className="px-4 py-4 flex-1 pb-28 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Endereço de entrega */}
          <SectionCard title="Endereço de entrega" onClick={() => {}}>
            <p className="text-sm text-gray-500 truncate">{DELIVERY_ADDRESS}</p>
          </SectionCard>

          {/* Forma de pagamento */}
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Forma de pagamento</h2>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-800">À vista</span>
                <span className="material-icons text-gray-400 text-[1.1rem]">help_outline</span>
              </div>
              <span className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </span>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Resumo</h2>
            <div className="flex justify-between py-0.5 text-sm text-gray-700">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-sm text-gray-700">
              <span>Descontos</span>
              <span>{formatPrice(discount)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                Encargos Financeiros
                <span className="material-icons text-gray-400 text-[1rem]">help_outline</span>
              </span>
              <span>{formatPrice(charges)}</span>
            </div>
            <div className="flex justify-between pt-2 mt-1 border-t border-gray-100 text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between z-30">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-extrabold text-gray-900 leading-tight">
            R$ {reais}<sup className="text-[0.7rem]">,{centavos}</sup>
          </p>
        </div>
        <button
          onClick={handleConfirm}
          disabled={submitting || loading || items.length === 0}
          className="bg-emerald-400 text-white text-lg font-semibold px-8 py-3.5 rounded-full shadow-sm active:scale-[0.98] transition disabled:opacity-50"
        >
          {submitting ? 'Finalizando...' : 'Finalizar pedido'}
        </button>
      </div>
    </div>
  );
}
