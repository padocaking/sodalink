import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, type Category } from '../api';

const tileColors = [
  'bg-red-300', 'bg-green-300', 'bg-yellow-200', 'bg-blue-200', 'bg-orange-200', 'bg-purple-200',
];

function CategoryTile({
  label,
  to,
  onClick,
  children,
}: { label: string; to?: string; onClick?: () => void; children: React.ReactNode; }) {
  return (
    <Link to={to ?? '#'} onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer">
      <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
        {children}
      </div>
      <span className="text-[0.8rem] font-medium text-gray-800 text-center leading-tight">{label}</span>
    </Link>
  );
}

interface MenuProps {
  onClose: () => void;
}

export default function Menu({ onClose }: MenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="p-6 h-full overflow-y-auto relative">
      <button
        onClick={onClose}
        aria-label="Fechar menu"
        className="absolute top-6 right-6 p-2 -m-2 text-gray-500 cursor-pointer"
      >
        <span className="material-icons text-[64px]">close</span>
      </button>

      <h2 className="text-3xl font-extrabold text-red-600 tracking-wide mb-8 mt-1">Sodalink</h2>

      <div className="flex flex-col border-t border-gray-100">
        <Link to="/favoritos" onClick={onClose} className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="material-icons text-gray-700 text-[1.6rem]">favorite_border</span>
            <span className="text-lg font-medium text-gray-800">Favoritos</span>
          </div>
          <span className="text-gray-400 text-2xl">&rsaquo;</span>
        </Link>

        <Link to="/pedido" onClick={onClose} className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="material-icons text-gray-700 text-[1.6rem]">local_shipping</span>
            <span className="text-lg font-medium text-gray-800">Meus pedidos</span>
          </div>
          <span className="text-gray-400 text-2xl">&rsaquo;</span>
        </Link>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Categorias</h3>
        <div className="grid grid-cols-3 gap-4 pb-6">
          <CategoryTile label="Promoções" to="/categoria/promocoes" onClick={onClose}>
            <div className="w-full h-full bg-red-400 flex items-center justify-center">
              <span className="material-icons text-white text-4xl">sell</span>
            </div>
          </CategoryTile>
          <CategoryTile label="Novidades" to="/" onClick={onClose}>
            <div className="w-full h-full bg-red-600 flex items-center justify-center">
              <span className="material-icons text-white text-4xl">new_releases</span>
            </div>
          </CategoryTile>
          {categories.map((cat, i) => (
            <CategoryTile key={cat.id} label={cat.name} to={`/categoria/${cat.slug}`} onClick={onClose}>
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${tileColors[i % tileColors.length]}`} />
              )}
            </CategoryTile>
          ))}
        </div>
      </div>
    </div>
  );
}