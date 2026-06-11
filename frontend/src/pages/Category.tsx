import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchCart, fetchFavorites, fetchProducts, type CartItem, type Product } from '../api';
import ProductCard from '../components/ProductCard';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [cartQty, setCartQty] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      fetchProducts({ categorySlug: slug }),
      fetchFavorites().catch(() => [] as Product[]),
      fetchCart().catch(() => [] as CartItem[]),
    ])
      .then(([prods, favs, cart]) => {
        setProducts(prods);
        setFavoriteIds(new Set(favs.map((f) => f.id)));
        setCartQty(new Map(cart.map((c) => [c.productId, c.quantity])));
      })
      .catch(() => setError('Não foi possível carregar os produtos.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const categoryName = products[0]?.category.name
    ?? (slug ?? '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="min-h-full bg-gray-100">
      {/* Top bar */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-200 sticky top-0 z-20">
        <button aria-label="Voltar" onClick={() => navigate(-1)}>
          <span className="material-icons text-gray-800">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-2xl font-semibold text-gray-900 capitalize">{categoryName}</h1>
        <button aria-label="Buscar">
          <span className="material-icons text-gray-800">search</span>
        </button>
        <Link to="/carrinho" aria-label="Carrinho">
          <span className="material-icons text-gray-800">shopping_cart</span>
        </Link>
      </header>

      {/* Filter chips */}
      <div className="bg-white px-4 py-2.5 flex items-center gap-2 overflow-x-auto border-b border-gray-100">
        <button aria-label="Filtros" className="shrink-0">
          <span className="material-icons text-gray-600 text-[1.3rem]">tune</span>
        </button>
        {['Marca', 'Preço', 'Tamanho', 'Embalagem'].map((f) => (
          <button key={f} className="shrink-0 text-xs text-gray-600 border border-gray-200 rounded-full px-4 py-1.5">
            {f}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {/* Banner */}
        <div className="bg-emerald-400 rounded-2xl px-5 py-6 mb-4">
          <p className="text-white font-semibold">Banner</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Carregando produtos...</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">São {products.length} produtos</p>
            <div className="grid grid-cols-2 gap-3 pb-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  favorited={favoriteIds.has(p.id)}
                  initialQty={cartQty.get(p.id) ?? 0}
                />
              ))}
            </div>
            {products.length === 0 && !error && (
              <p className="text-sm text-gray-400 py-6 text-center">Nenhum produto nesta categoria.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
