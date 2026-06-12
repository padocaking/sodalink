import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites, type Product } from '../api';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';

export default function Favorites() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites()
      .then(setProducts)
      .catch(() => setError('Não foi possível carregar os favoritos.'))
      .finally(() => setLoading(false));
  }, []);

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-full bg-gray-100 flex flex-col">
      {/* Top bar */}
      <Header title="Favoritos" showBack hideFavorites hideSearch />

      <div className="px-4 py-4 flex-1">
        <p className="text-base text-gray-900 mb-4">
          <span className="font-semibold">Favorito</span>
          {' - '}
          <span className="text-gray-500">{products.length} produtos favoritados</span>
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Carregando favoritos...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  favorited
                  showStepper={false}
                  onFavoriteChange={(fav) => { if (!fav) removeProduct(p.id); }}
                />
              ))}
            </div>
            {products.length === 0 && !error && (
              <p className="text-sm text-gray-400 py-6 text-center">
                Você ainda não favoritou nenhum produto.
              </p>
            )}
          </>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full bg-red-600 text-white text-xl font-semibold py-3.5 rounded-full shadow-sm active:scale-[0.98] transition mt-6 mb-6"
        >
          Descobrir
        </button>
      </div>
    </div>
  );
}
