import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BannerSlider from '../components/BannerSlider';
import ProductCard from '../components/ProductCard';
import { fetchCategories, fetchProducts, formatPrice, fetchFavorites, fetchCart, type Category, type Product, type CartItem } from '../api';

const tileColors = [
  'bg-red-300', 'bg-green-300', 'bg-yellow-200', 'bg-blue-200', 'bg-orange-200', 'bg-purple-200',
];

function CategoryTile({
  label,
  to,
  onClick,
  children,
  className = '',
  style,
}: { label: string; to?: string; onClick?: () => void; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const content = (
    <>
      <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
        {children}
      </div>
      <span className="text-sm font-medium text-gray-800 text-center">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={`flex flex-col items-center gap-2 cursor-pointer ${className}`} style={style}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to ?? '#'} className={`flex flex-col items-center gap-2 cursor-pointer ${className}`} style={style}>
      {content}
    </Link>
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [promos, setPromos] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [cartQty, setCartQty] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchProducts({ featured: true }),
      fetchProducts(),
      fetchFavorites().catch(() => [] as Product[]),
      fetchCart().catch(() => [] as CartItem[]),
    ])
      .then(([cats, featured, allProds, favs, cart]) => {
        setCategories(cats);
        setPromos(featured);
        // Shuffle all products to get random recommendations
        const shuffled = [...allProds].sort(() => 0.5 - Math.random());
        setRecommendations(shuffled.slice(0, 10));
        setFavoriteIds(new Set(favs.map((f) => f.id)));
        setCartQty(new Map(cart.map((c) => [c.productId, c.quantity])));
      })
      .catch(() => setError('Não foi possível carregar os dados. Verifique a API.'));
  }, []);

  const handleVejaMenos = () => {
    setIsClosing(true);
    const maxDelay = 300 + Math.max(0, categories.length - 3) * 50; // 300ms base animation + 50ms stagger
    setTimeout(() => {
      setShowAllCategories(false);
      setIsClosing(false);
    }, maxDelay);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes popOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.9); }
        }
        .animate-pop-in {
          animation: popIn 0.3s ease-out forwards;
          opacity: 0;
        }
        .animate-pop-out {
          animation: popOut 0.3s ease-in forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      {/* Promo strip */}
      <div className="bg-blue-500 text-white px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-icons text-[1.2rem]">auto_awesome</span>
          <div>
            <p className="text-sm font-semibold leading-tight">Promoções e descontos</p>
            <p className="text-xs text-blue-100 leading-tight">Descubra as últimas ofertas que temos para você.</p>
          </div>
        </div>
        <Link to="/categoria/promocoes" className="text-xs underline shrink-0">Veja mais</Link>
      </div>

      {/* Banner Slider Section */}
      <BannerSlider />

      {error && (
        <p className="mx-4 mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      {/* Categorias */}
      <section className="px-4 mt-5">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Categorias</h2>
        <div className="grid grid-cols-3 gap-4">
          <CategoryTile label="Promoções" to="/categoria/promocoes">
            <div className="w-full h-full bg-red-400 flex items-center justify-center">
              <span className="material-icons text-white text-4xl">sell</span>
            </div>
          </CategoryTile>
          <CategoryTile label="Novidades" to="/">
            <div className="w-full h-full bg-red-600 flex items-center justify-center">
              <span className="material-icons text-white text-4xl">new_releases</span>
            </div>
          </CategoryTile>
          {categories.slice(0, showAllCategories ? categories.length : 3).map((cat, i) => {
            const isExtra = i >= 3;
            const delay = isClosing 
              ? `${(categories.length - 1 - i) * 0.05}s` // reverse stagger out
              : `${(i - 3) * 0.05}s`; // stagger in
            return (
              <CategoryTile 
                key={cat.id} 
                label={cat.name} 
                to={`/categoria/${cat.slug}`}
                className={isExtra ? (isClosing ? 'animate-pop-out' : 'animate-pop-in') : ''}
                style={isExtra ? { animationDelay: delay } : undefined}
              >
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${tileColors[i % tileColors.length]}`} />
              )}
            </CategoryTile>
            );
          })}
          {!showAllCategories ? (
            <CategoryTile label="Veja mais" onClick={() => setShowAllCategories(true)}>
              <div className="w-full h-full bg-white flex items-center justify-center">
                <span className="material-icons text-green-500 text-4xl">add</span>
              </div>
            </CategoryTile>
          ) : (
            <CategoryTile 
              label="Veja menos" 
              onClick={isClosing ? undefined : handleVejaMenos}
              className={isClosing ? 'animate-pop-out' : 'animate-pop-in'}
              style={{ animationDelay: isClosing ? '0s' : `${Math.max(0, categories.length - 3) * 0.05}s` }}
            >
              <div className="w-full h-full bg-white flex items-center justify-center">
                <span className="material-icons text-red-500 text-4xl">remove</span>
              </div>
            </CategoryTile>
          )}
        </div>
      </section>

      {/* Promoções */}
      <section className="px-4 mt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Promoções</h2>
          <Link to="/categoria/promocoes" className="text-sm text-gray-500 underline">Ver todos &rsaquo;</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {promos.map((p) => (
            <div key={p.id} className="min-w-44 shrink-0">
              <ProductCard
                product={p}
                favorited={favoriteIds.has(p.id)}
                initialQty={cartQty.get(p.id) ?? 0}
                isPromo
              />
            </div>
          ))}
          {!error && promos.length === 0 && (
            <p className="text-sm text-gray-400 py-4">Nenhuma promoção no momento.</p>
          )}
        </div>
      </section>

      {/* Recomendações */}
      <section className="px-4 mt-2 pb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Recomendações</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {recommendations.map((p) => (
            <div key={p.id} className="min-w-44 shrink-0">
              <ProductCard
                product={p}
                favorited={favoriteIds.has(p.id)}
                initialQty={cartQty.get(p.id) ?? 0}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
