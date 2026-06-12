import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearCart, createOrder, fetchCart, formatPrice, setCartItem, type CartItem } from '../api';
import Header from '../components/Header';

function CartRow({ item, onQtyChange }: { item: CartItem; onQtyChange: (qty: number) => void }) {
  const { product, quantity } = item;
  const [reais, centavos] = Number(product.price).toFixed(2).split('.');

  return (
    <div className="flex items-start gap-3 py-4 border-b border-gray-100 last:border-0">
      <Link to={`/produto/${product.slug}`} className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <span className="material-icons text-gray-300 text-4xl">local_drink</span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{product.name}</p>
        <p className="text-xs text-gray-500">
          <span className="text-emerald-600">{product.unit === 'un' ? 'Unidade' : product.unit}</span>
          {' '}- {product.category.name}
        </p>
        <span className="inline-block mt-1 text-[0.6rem] font-semibold text-blue-700 bg-blue-100 rounded-full px-2.5 py-0.5 uppercase">
          {product.unit === 'un' ? 'Unidade' : product.unit}
        </span>

        {/* Stepper */}
        <div className="mt-2 flex items-center gap-2">
          <button
            aria-label={quantity === 1 ? 'Remover item' : 'Diminuir'}
            onClick={() => onQtyChange(quantity - 1)}
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              quantity === 1 ? 'text-gray-500' : 'bg-red-600 text-white'
            }`}
          >
            <span className="material-icons text-[1.1rem]">{quantity === 1 ? 'delete_outline' : 'remove'}</span>
          </button>
          <span className="w-10 text-center text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg py-0.5">
            {quantity}
          </span>
          <button
            aria-label="Aumentar"
            onClick={() => onQtyChange(quantity + 1)}
            className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white"
          >
            <span className="material-icons text-[1.1rem]">add</span>
          </button>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-lg font-extrabold text-gray-900 leading-tight">
          R$ {reais}<sup className="text-[0.6rem]">,{centavos}</sup>
        </p>
        <p className="text-[0.6rem] text-gray-500">({formatPrice(product.price)} preço por unidade)</p>
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart()
      .then(setItems)
      .catch(() => setError('Não foi possível carregar o carrinho.'))
      .finally(() => setLoading(false));
  }, []);

  const handleQtyChange = (item: CartItem, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== item.id)
        : prev.map((i) => (i.id === item.id ? { ...i, quantity: qty } : i))
    );
    setCartItem(item.productId, Math.max(0, qty)).catch(() => {
      setError('Não foi possível atualizar o item.');
    });
  };

  const handleClear = () => {
    setItems([]);
    clearCart().catch(() => setError('Não foi possível esvaziar o carrinho.'));
  };

  const handleCheckout = async () => {
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

  const total = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

  return (
    <div className="min-h-full bg-gray-100 flex flex-col">
      {/* Top bar */}
      <Header title="Carrinho" showBack hideSearch hideCart />

      <div className="px-4 py-4 flex-1 pb-28">
        <p className="text-base text-gray-900 mb-4">
          <span className="font-semibold">Carrinho</span>
          {' - '}
          <span className="text-gray-500">Você tem {items.length} produtos</span>
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Carregando carrinho...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Seu carrinho está vazio.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm px-4">
            {items.map((item) => (
              <CartRow key={item.id} item={item} onQtyChange={(q) => handleQtyChange(item, q)} />
            ))}

            <div className="flex items-center justify-between py-4">
              <button onClick={handleClear} className="flex items-center gap-1 text-xs text-gray-600 underline">
                <span className="material-icons text-[1.1rem]">delete_outline</span>
                Esvaziar carrinho
              </button>
              <p className="text-lg font-bold text-gray-900">Total: {formatPrice(total)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between z-30">
        <div>
          <p className="text-xs text-gray-500">Subtotal:</p>
          <p className="text-lg font-bold text-gray-900">{formatPrice(total)}</p>
        </div>
        <button
          onClick={handleCheckout}
          disabled={submitting || items.length === 0}
          className="bg-emerald-400 text-white text-lg font-semibold px-8 py-3 rounded-full shadow-sm active:scale-[0.98] transition disabled:opacity-50"
        >
          {submitting ? 'Finalizando...' : 'Finalizar pedido'}
        </button>
      </div>
    </div>
  );
}
