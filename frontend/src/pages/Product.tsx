import { useEffect, useState } from 'react';
import { fetchCart, fetchFavorites, formatPrice, setCartItem, type CartItem, type Product as ProductType } from '../api';
import FavoriteButton from '../components/FavoriteButton';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface ProductProps {
  slug: string;
  onClose: () => void;
}

export default function Product({ slug, onClose }: ProductProps) {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState('');
  const [fav, setFav] = useState<boolean | null>(null);
  const [qty, setQty] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    document.body.style.overflow = 'hidden';
    setIsMounted(true);

    Promise.all([
      fetch(`${API_URL}/api/products/${slug}`).then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<ProductType>;
      }),
      fetchFavorites().catch(() => [] as ProductType[]),
      fetchCart().catch(() => [] as CartItem[]),
    ])
      .then(([prod, favs, cart]) => {
        setProduct(prod);
        setFav(favs.some((f) => f.id === prod.id));
        setQty(cart.find((c) => c.productId === prod.id)?.quantity ?? 0);
      })
      .catch(() => setError('Não foi possível carregar o produto.'));

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [slug]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const changeQty = (delta: number) => {
    if (!product) return;
    const next = Math.max(0, qty + delta);
    setQty(next);
    setCartItem(product.id, next)
      .then(() => window.dispatchEvent(new Event('cart-updated')))
      .catch(() => setQty(qty)); // Revert on error
  };

  const [reais, centavos] = product
    ? Number(product.price).toFixed(2).split('.')
    : ['0', '00'];

  const pricePerUnit = product ? Number(product.price) / (product.unitCount || 1) : 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end bg-black/40 transition-opacity duration-300 ${isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-t-3xl h-[90vh] max-h-[700px] flex flex-col transform transition-transform duration-300 ease-out ${isMounted && !isClosing ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle bar and Close button */}
        <div className="w-full flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          <button
            aria-label="Fechar"
            onClick={handleClose}
            className="absolute top-3 right-4 p-2"
          >
            <span className="material-icons text-gray-700 text-[1.8rem]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-28 relative">
          {/* Image */}
          <div className="h-60 flex items-center justify-center bg-white pt-4">
            {product?.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full object-contain" />
            ) : (
              <span className="material-icons text-gray-200 text-[9rem]">local_drink</span>
            )}
          </div>

          {/* Favorite */}
          <div className="absolute top-4 right-14 z-10">
            {product && fav !== null && (
              <FavoriteButton productId={product.id} favorited={fav} onChange={setFav} size="text-[1.8rem]" className="bg-white rounded-full p-2 shadow-md" />
            )}
          </div>

          {error && (
            <p className="mx-6 mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          {product ? (
            <div className="px-6 mt-4">
              <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>

              <div className="flex items-center gap-3 mt-2">
                <span className="text-center text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-3 py-1 uppercase">
                  {product.packageType || (product.unit === 'un' ? 'Unidade' : product.unit)}
                </span>
                <p className="text-sm text-gray-500">{product.category.name}</p>
              </div>

              <p className="mt-4 text-sm text-gray-700">
                <span className="text-green-600 font-bold">Caixa</span> - <span className="font-bold">{product.unitCount || 1} unid</span>
                {product.volume ? (
                  <> x {product.volume >= 1000 ? `${(product.volume / 1000).toString().replace('.', ',')} L` : `${product.volume} ml`}</>
                ) : ''}
              </p>

              {product.description && (
                <p className="mt-4 text-sm text-gray-600">{product.description}</p>
              )}

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-extrabold text-gray-900 leading-tight">
                    R$ {reais}<sup className="text-xl">,{centavos}</sup>
                  </p>
                  {product.comparePrice ? (
                    <p className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      ({formatPrice(pricePerUnit)} por unidade)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : !error ? (
            <div className="px-6 mt-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/4 mt-4"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-1/2 mt-4"></div>
            </div>
          ) : null}
        </div>

        {/* Bottom quantity stepper */}
        {product && (
          <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
            <button
              aria-label="Diminuir"
              onClick={() => changeQty(-1)}
              disabled={qty === 0}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0 transition ${qty > 0 ? 'bg-red-600' : 'bg-gray-300'}`}
            >
              <span className="material-icons text-2xl">remove</span>
            </button>
            <div className="flex-1 bg-gray-100 rounded-xl py-4 text-center text-lg font-semibold text-gray-800">
              {qty}
            </div>
            <button
              aria-label="Aumentar"
              onClick={() => changeQty(1)}
              className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0"
            >
              <span className="material-icons text-2xl">add</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
