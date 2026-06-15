import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchCart } from '../api';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  hideFavorites?: boolean;
  hideSearch?: boolean;
  hideCart?: boolean;
}

export default function Header({ title, showBack, hideFavorites, hideSearch, hideCart }: HeaderProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isOrderPage = location.pathname.startsWith('/pedido');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (hideCart) return;

    const updateCart = () => {
      fetchCart()
        .then((items) => {
          setCartCount(items.length);
        })
        .catch(() => {});
    };

    updateCart();
    window.addEventListener('cart-updated', updateCart);
    return () => window.removeEventListener('cart-updated', updateCart);
  }, [hideCart, location]);

  return (
    <header className={`bg-white flex items-center border-b border-gray-200 h-20 px-7 ${showBack ? 'gap-3 sticky top-0 z-20' : 'justify-between'}`}>
      {showBack && (
        <button aria-label="Voltar" onClick={() => navigate(-1)} className="p-2 -m-2 cursor-pointer">
          <span className="material-icons text-gray-800 text-[32px]">arrow_back_ios_new</span>
        </button>
      )}
      <div className="flex-1">
        {title ? (
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">{title}</h1>
        ) : isOrderPage ? (
          <span className="text-4xl text-black tracking-wide">Pedidos</span>
        ) : (
          <Link to="/" className="text-4xl font-extrabold text-red-600 tracking-wide">
            Sodalink
          </Link>
        )}
      </div>
      <div className="flex items-center gap-5">
        {!isOrderPage && !hideFavorites && (
          <Link to="/favoritos" aria-label="Favorites" className="p-2 -m-2 cursor-pointer">
            <span className="material-icons text-gray-800 text-[32px]">favorite_border</span>
          </Link>
        )}
        {!isOrderPage && !hideSearch && (
          <Link to="/pesquisa" aria-label="Search" className="p-2 -m-2 cursor-pointer">
            <span className="material-icons text-gray-800 text-[32px]">search</span>
          </Link>
        )}
        {!hideCart && (
          <Link to="/carrinho" aria-label="Cart" className="relative p-2 -m-2 cursor-pointer flex items-center justify-center">
            <span className="material-icons text-gray-800 text-[32px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-0 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
