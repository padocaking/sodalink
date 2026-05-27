import { Link, useLocation } from 'react-router-dom';
import heartIcon from '../icons/heart.svg';
import searchIcon from '../icons/search.svg';
import cartIcon from '../icons/cart.svg';

export default function Header() {
  const location = useLocation();
  const isOrderPage = location.pathname.startsWith('/pedido');

  return (
    <header className="flex items-center justify-between px-7 py-5 bg-white border-b border-gray-200">
      <div className="flex-1">
        {isOrderPage ? (
          <span className="text-4xl text-black tracking-wide">Pedidos</span>
        ) : (
          <Link to="/" className="text-4xl font-extrabold text-red-600 tracking-wide">
            Sodalink
          </Link>
        )}
      </div>
      <div className="flex items-center gap-5">
        {!isOrderPage && (
          <>
            <button aria-label="Favorites" className="w-6 h-6">
              <img src={heartIcon} alt="Favorites" className="w-full h-full" />
            </button>
            <button aria-label="Search" className="w-6 h-6">
              <img src={searchIcon} alt="Search" className="w-full h-full" />
            </button>
          </>
        )}
        <button aria-label="Cart" className="w-6 h-6">
          <img src={cartIcon} alt="Cart" className="w-full h-full" />
        </button>
      </div>
    </header>
  );
}
