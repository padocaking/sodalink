import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchCart,
  fetchCategories,
  fetchFavorites,
  fetchProducts,
  type Category,
  type CartItem,
  type Product,
} from '../api';
import ProductCard from '../components/ProductCard';

const RECENT_KEY = 'sodalink:recent-products';
const RECENT_LIMIT = 12;

function loadRecent(): Product[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function pushRecent(product: Product): Product[] {
  const next = [product, ...loadRecent().filter((p) => p.id !== product.id)].slice(0, RECENT_LIMIT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
  return next;
}

const tileColors = ['bg-red-300', 'bg-green-300', 'bg-yellow-200', 'bg-blue-200', 'bg-orange-200', 'bg-purple-200'];

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loadedQuery, setLoadedQuery] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [recent, setRecent] = useState<Product[]>(loadRecent);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [cartQty, setCartQty] = useState<Map<number, number>>(new Map());
  const [error, setError] = useState('');

  // Initial data for the empty state
  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchFavorites().catch(() => [] as Product[]),
      fetchCart().catch(() => [] as CartItem[]),
      loadRecent().length === 0 ? fetchProducts({ featured: true }) : Promise.resolve([] as Product[]),
    ])
      .then(([cats, favs, cart, fallback]) => {
        setCategories(cats);
        setFavoriteIds(new Set(favs.map((f) => f.id)));
        setCartQty(new Map(cart.map((c) => [c.productId, c.quantity])));
        if (fallback.length > 0) setRecent(fallback);
      })
      .catch(() => setError('Não foi possível carregar os dados.'));

    inputRef.current?.focus();
  }, []);

  // Debounce the query
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Run the search. State is only updated from the async callbacks, and the
  // "searching" flag is derived below from which query the results belong to.
  useEffect(() => {
    if (debounced.length < 2) return;
    let ignore = false;
    fetchProducts({ search: debounced })
      .then((r) => { if (!ignore) { setResults(r); setLoadedQuery(debounced); } })
      .catch(() => { if (!ignore) { setError('Não foi possível buscar produtos.'); setLoadedQuery(debounced); } });
    return () => { ignore = true; };
  }, [debounced]);

  const handleOpenProduct = (product: Product) => {
    setRecent(pushRecent(product));
  };

  const isSearchActive = debounced.length >= 2;
  const searching = isSearchActive && loadedQuery !== debounced;
  const recentToShow = showAllRecent ? recent : recent.slice(0, 6);

  return (
    <div className="min-h-full bg-gray-100 flex flex-col">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top bar */}
      <header className="bg-white flex items-center gap-3 h-20 px-5 sticky top-0 z-20">
        <button aria-label="Voltar" onClick={() => navigate(-1)} className="p-1 -ml-1 cursor-pointer">
          <span className="material-icons text-gray-800 text-[30px]">arrow_back</span>
        </button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar em Sodalink"
            className="w-full border border-gray-300 rounded-full pl-5 pr-10 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
          />
          {query && (
            <button
              aria-label="Limpar"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <span className="material-icons text-[1.3rem]">close</span>
            </button>
          )}
        </div>
        <Link to="/carrinho" aria-label="Carrinho" className="p-1 -mr-1 cursor-pointer">
          <span className="material-icons text-gray-800 text-[30px]">shopping_cart</span>
        </Link>
      </header>

      {error && (
        <p className="mx-4 mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      {isSearchActive ? (
        /* ---------- Search results ---------- */
        <div className="px-4 py-4">
          {searching ? (
            <p className="text-sm text-gray-400 py-6 text-center">Buscando...</p>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-icons text-gray-300 text-6xl mb-3">search_off</span>
              <p className="text-gray-600">Nenhum produto encontrado para “{debounced}”.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">
                {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para “{debounced}”
              </p>
              <div className="grid grid-cols-2 gap-3 pb-6">
                {results.map((p) => (
                  <div key={p.id} onClickCapture={() => handleOpenProduct(p)}>
                    <ProductCard
                      product={p}
                      favorited={favoriteIds.has(p.id)}
                      initialQty={cartQty.get(p.id) ?? 0}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ---------- Empty state: últimas pesquisas + categorias ---------- */
        <div className="py-4">
          {recent.length > 0 && (
            <section className="mb-2">
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-xl font-bold text-gray-900">Últimas pesquisas</h2>
                {recent.length > 6 && (
                  <button onClick={() => setShowAllRecent((v) => !v)} className="text-sm text-gray-600 underline">
                    {showAllRecent ? 'Ver menos' : 'Ver todos'} &rsaquo;
                  </button>
                )}
              </div>

              {showAllRecent ? (
                <div className="grid grid-cols-2 gap-3 px-4 pb-2">
                  {recentToShow.map((p) => (
                    <div key={p.id} onClickCapture={() => handleOpenProduct(p)}>
                      <ProductCard product={p} favorited={favoriteIds.has(p.id)} initialQty={cartQty.get(p.id) ?? 0} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 px-4 no-scrollbar">
                  {recentToShow.map((p) => (
                    <div key={p.id} className="min-w-44 shrink-0" onClickCapture={() => handleOpenProduct(p)}>
                      <ProductCard product={p} favorited={favoriteIds.has(p.id)} initialQty={cartQty.get(p.id) ?? 0} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Categorias */}
          <section className="px-4 mt-4 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Categorias</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/categoria/promocoes" className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm bg-orange-400 flex items-center justify-center">
                  <span className="material-icons text-white text-6xl">sell</span>
                </div>
                <span className="text-base font-medium text-gray-800">Promoções</span>
              </Link>
              <Link to="/" className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm bg-red-600 flex items-center justify-center">
                  <span className="material-icons text-white text-6xl">new_releases</span>
                </div>
                <span className="text-base font-medium text-gray-800">Novidades</span>
              </Link>
              {categories.map((cat, i) => (
                <Link key={cat.id} to={`/categoria/${cat.slug}`} className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full ${tileColors[i % tileColors.length]}`} />
                    )}
                  </div>
                  <span className="text-base font-medium text-gray-800 text-center">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
