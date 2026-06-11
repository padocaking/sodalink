import { useState } from 'react';
import { toggleFavorite } from '../api';

interface Props {
  productId: number;
  favorited: boolean;
  onChange?: (favorited: boolean) => void;
  className?: string;
  size?: string;
}

export default function FavoriteButton({ productId, favorited, onChange, className = '', size = 'text-[1.4rem]' }: Props) {
  const [fav, setFav] = useState(favorited);
  const [popping, setPopping] = useState(false);

  const handleClick = async () => {
    const next = !fav;
    setFav(next);
    setPopping(true);
    onChange?.(next);
    try {
      await toggleFavorite(productId);
    } catch {
      setFav(!next);
      onChange?.(!next);
    }
  };

  return (
    <button aria-label={fav ? 'Remover dos favoritos' : 'Favoritar'} onClick={handleClick} className={className}>
      <span
        onAnimationEnd={() => setPopping(false)}
        className={`material-icons inline-block ${size} ${fav ? 'text-red-600' : 'text-gray-400'} ${popping ? 'heart-pop' : ''}`}
      >
        {fav ? 'favorite' : 'favorite_border'}
      </span>
    </button>
  );
}
