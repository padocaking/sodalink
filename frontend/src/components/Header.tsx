import { Link, useLocation, useNavigate } from 'react-router-dom';

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
          <button aria-label="Search" className="p-2 -m-2 cursor-pointer">
            <span className="material-icons text-gray-800 text-[32px]">search</span>
          </button>
        )}
        {!hideCart && (
          <Link to="/carrinho" aria-label="Cart" className="p-2 -m-2 cursor-pointer">
            <span className="material-icons text-gray-800 text-[32px]">shopping_cart</span>
          </Link>
        )}
      </div>
    </header>
  );
}
