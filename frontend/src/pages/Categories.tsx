import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, type Category } from '../api';

const tileColors = [
  'bg-red-300', 'bg-green-300', 'bg-yellow-200', 'bg-blue-200', 'bg-orange-200', 'bg-purple-200',
];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setError('Não foi possível carregar as categorias.'));
  }, []);

  return (
    <div className="min-h-full bg-gray-100 px-4 py-5">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Todas as categorias</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>
      )}

      <div className="grid grid-cols-3 gap-4 pb-6">
        {categories.map((cat, i) => (
          <Link key={cat.id} to={`/categoria/${cat.slug}`} className="flex flex-col items-center gap-2">
            <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm">
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${tileColors[i % tileColors.length]}`} />
              )}
            </div>
            <span className="text-sm font-medium text-gray-800 text-center">{cat.name}</span>
            <span className="text-xs text-gray-400 -mt-1.5">{cat.productCount} produtos</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
