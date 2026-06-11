import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCart, fetchFavorites, formatPrice, setCartItem, type CartItem, type Product as ProductType } from '../api';
import FavoriteButton from '../components/FavoriteButton';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState('');
  const [fav, setFav] = useState<boolean | null>(null);
  const [qty, setQty] = useState(0);

  useEffect(() => {
    if (!slug) return;
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
  }, [slug]);

  const changeQty = (next: number) => {
    if (!product) return;
    setQty(next);
    setCartItem(product.id, next).catch(() => setQty(qty));
  };

  const [reais, centavos] = product
    ? Number(product.price).toFixed(2).split('.')
    : ['0', '00'];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Close */}
      <button
        aria-label="Fechar"
        onClick={() => navigate(-1)}
        className="absolute top-5 right-5 z-10"
      >
        <span className="material-icons text-gray-900 text-[1.8rem]">close</span>
      </button>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Image */}
        <div className="h-72 flex items-center justify-center bg-white pt-10">
          {product?.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full object-contain" />
          ) : (
            <span className="material-icons text-gray-200 text-[9rem]">local_drink</span>
          )}
        </div>

        {/* Favorite */}
        <div className="px-6 flex justify-end">
          {product && fav !== null && (
            <FavoriteButton productId={product.id} favorited={fav} size="text-[1.6rem]" />
          )}
        </div>

        {error && (
          <p className="mx-6 mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        {product && (
          <div className="px-6 mt-2">
            <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>

            <p className="mt-3 text-5xl font-extrabold text-gray-900 leading-tight">
              R$ {reais}<sup className="text-xl">,{centavos}</sup>
            </p>
            <p className="mt-1 text-sm text-gray-500">
              ({formatPrice(product.price)} preço por unidade)
            </p>
            {product.comparePrice && (
              <p className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</p>
            )}

            <p className="mt-4 text-sm text-gray-800">
              <span className="text-blue-600 font-medium capitalize">
                {product.unit === 'un' ? 'Unidade' : product.unit}
              </span>
              {' '}- {product.category.name}
            </p>

            <span className="inline-block mt-3 text-[0.65rem] font-semibold text-blue-700 bg-blue-100 rounded-lg px-4 py-2 uppercase">
              {product.unit === 'un' ? 'Unidade' : product.unit}
            </span>

            {product.description && (
              <p className="mt-5 text-sm text-gray-600">{product.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom quantity stepper */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          aria-label="Diminuir"
          onClick={() => changeQty(Math.max(0, qty - 1))}
          className={`w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 ${qty > 0 ? 'bg-red-600' : 'bg-gray-300'}`}
        >
          <span className="material-icons">remove</span>
        </button>
        <div className="flex-1 border border-gray-200 rounded-xl py-2.5 text-center text-sm font-semibold text-gray-500">
          {qty}
        </div>
        <button
          aria-label="Aumentar"
          onClick={() => changeQty(qty + 1)}
          className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0"
        >
          <span className="material-icons">add</span>
        </button>
      </div>
    </div>
  );
}
