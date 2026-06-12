import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BannerSlider from '../components/BannerSlider';
import { fetchCategories, fetchProducts, formatPrice, type Category, type Product } from '../api';

const tileColors = [
  'bg-red-300', 'bg-green-300', 'bg-yellow-200', 'bg-blue-200', 'bg-orange-200', 'bg-purple-200',
];

function CategoryTile({ label, to, onClick, children }: { label: string; to?: string; onClick?: () => void; children: React.ReactNode }) {
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
      <button onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer">
        {content}
      </button>
    );
  }

  return (
    <Link to={to ?? '#'} className="flex flex-col items-center gap-2 cursor-pointer">
      {content}
    </Link>
  );
}

function PromoCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/produto/${product.slug}`}
      className="min-w-44 bg-white rounded-2xl shadow-sm overflow-hidden shrink-0"
    >
      <div className="relative h-28 bg-gray-100 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="material-icons text-gray-300 text-5xl">local_drink</span>
        )}
        <span className="absolute top-2 left-0 bg-red-600 text-white text-xs font-bold px-3 py-0.5 rounded-r-full">
          Promoção
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
        {product.comparePrice && (
          <p className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</p>
        )}
        <p className="text-base font-bold text-gray-900">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [promos, setPromos] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts({ featured: true })])
      .then(([cats, featured]) => {
        setCategories(cats);
        setPromos(featured);
      })
      .catch(() => setError('Não foi possível carregar os dados. Verifique a API.'));
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      {/* Promo strip */}
      <div className="bg-blue-500 text-white px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-icons text-[1.2rem]">auto_awesome</span>
          <div>
            <p className="text-sm font-semibold leading-tight">Promoções e descontos</p>
            <p className="text-xs text-blue-100 leading-tight">Descubra as últimas ofertas que temos para você.</p>
          </div>
        </div>
        <button className="text-xs underline shrink-0">Veja mais</button>
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
          <CategoryTile label="Promoções" to="/">
            <div className="w-full h-full bg-red-400 flex items-center justify-center">
              <span className="material-icons text-white text-4xl">sell</span>
            </div>
          </CategoryTile>
          <CategoryTile label="Novidades" to="/">
            <div className="w-full h-full bg-red-600 flex items-center justify-center">
              <span className="material-icons text-white text-4xl">new_releases</span>
            </div>
          </CategoryTile>
          {categories.slice(0, showAllCategories ? categories.length : 3).map((cat, i) => (
            <CategoryTile key={cat.id} label={cat.name} to={`/categoria/${cat.slug}`}>
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${tileColors[i % tileColors.length]}`} />
              )}
            </CategoryTile>
          ))}
          {!showAllCategories ? (
            <CategoryTile label="Veja mais" onClick={() => setShowAllCategories(true)}>
              <div className="w-full h-full bg-white flex items-center justify-center">
                <span className="material-icons text-green-500 text-4xl">add</span>
              </div>
            </CategoryTile>
          ) : (
            <CategoryTile label="Veja menos" onClick={() => setShowAllCategories(false)}>
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
          <button className="text-sm text-gray-500 underline">Ver todos &rsaquo;</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {promos.map((p) => <PromoCard key={p.id} product={p} />)}
          {!error && promos.length === 0 && (
            <p className="text-sm text-gray-400 py-4">Nenhuma promoção no momento.</p>
          )}
        </div>
      </section>
    </div>
  );
}
