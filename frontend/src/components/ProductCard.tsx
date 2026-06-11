import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, setCartItem, type Product } from '../api';
import FavoriteButton from './FavoriteButton';

interface Props {
  product: Product;
  favorited: boolean;
  onFavoriteChange?: (favorited: boolean) => void;
  showStepper?: boolean;
  initialQty?: number;
}

export default function ProductCard({ product, favorited, onFavoriteChange, showStepper = true, initialQty = 0 }: Props) {
  const [qty, setQty] = useState(initialQty);

  const changeQty = (next: number) => {
    setQty(next);
    setCartItem(product.id, next).catch(() => setQty(qty));
  };

  const [reais, centavos] = Number(product.price).toFixed(2).split('.');

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-col">
      <div className="relative h-32 bg-gray-50 rounded-xl mb-2">
        <Link to={`/produto/${product.slug}`} className="h-full w-full flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
          ) : (
            <span className="material-icons text-gray-300 text-6xl">local_drink</span>
          )}
        </Link>
        <FavoriteButton
          productId={product.id}
          favorited={favorited}
          onChange={onFavoriteChange}
          className="absolute top-1 right-1"
        />
      </div>

      <Link to={`/produto/${product.slug}`}>
        <p className="text-sm font-medium text-gray-800 line-clamp-2 min-h-10">{product.name}</p>

        <p className="text-xl font-extrabold text-gray-900 leading-tight">
          R$ {reais}<sup className="text-xs">,{centavos}</sup>
        </p>
        <p className="text-[0.65rem] text-gray-500">
          ({formatPrice(product.price)} preço por unidade)
        </p>
        {product.comparePrice && (
          <p className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</p>
        )}
      </Link>

      <span className="self-start mt-2 text-[0.65rem] font-semibold text-blue-700 bg-blue-100 rounded-full px-2.5 py-0.5 uppercase">
        {product.unit === 'un' ? 'Unidade' : product.unit}
      </span>

      {/* Quantity stepper */}
      {showStepper && (
      <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-full px-1 py-1">
        <button
          aria-label="Diminuir"
          onClick={() => changeQty(Math.max(0, qty - 1))}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${qty > 0 ? 'bg-red-600' : 'bg-gray-300'}`}
        >
          <span className="material-icons text-[1.1rem]">remove</span>
        </button>
        <span className="text-sm font-semibold text-gray-800">{qty}</span>
        <button
          aria-label="Aumentar"
          onClick={() => changeQty(qty + 1)}
          className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white"
        >
          <span className="material-icons text-[1.1rem]">add</span>
        </button>
      </div>
      )}
    </div>
  );
}
