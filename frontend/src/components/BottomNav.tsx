import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface BottomNavProps {
  onMenuClick: () => void;
  isMenuOpen: boolean;
}

export default function BottomNav({ onMenuClick, isMenuOpen }: BottomNavProps) {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isMenuOpen) setActiveIndex(3);
    else if (location.pathname === '/') setActiveIndex(0);
    else if (location.pathname.startsWith('/pedido')) setActiveIndex(1);
    else if (location.pathname.startsWith('/conta')) setActiveIndex(2);
    else setActiveIndex(-1);
  }, [location.pathname, isMenuOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full transition-colors ${
      isActive && !isMenuOpen ? 'text-red-600' : 'text-black hover:text-red-600'
    }`;

  return (
    <nav className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe md:hidden z-20">
      {/* Animated indicator line */}
      <div
        className={`absolute -top-px left-0 h-0.5 bg-red-600 transition-all duration-300 ease-in-out ${activeIndex < 0 ? 'opacity-0' : ''}`}
        style={{
          width: '25%',
          transform: `translateX(${activeIndex * 100}%)`
        }}
      />

      <div className="flex justify-around items-center py-3">
        <NavLink to="/" className={linkClass}>
          <span className="material-icons text-[28px]">home</span>
          <span className="text-[12px] font-medium tracking-wider">Início</span>
        </NavLink>
        <NavLink to="/pedido" className={linkClass}>
          <span className="material-icons text-[28px]">local_shipping</span>
          <span className="text-[12px] font-medium tracking-wider">Pedidos</span>
        </NavLink>
        <NavLink to="/conta" className={linkClass}>
          <span className="material-icons text-[28px]">person</span>
          <span className="text-[12px] font-medium tracking-wider">Conta</span>
        </NavLink>
        <button
          onClick={onMenuClick}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isMenuOpen ? 'text-red-600' : 'text-black hover:text-red-600'
          }`}
        >
          <span className="material-icons text-[28px]">menu</span>
          <span className="text-[12px] font-medium tracking-wider">Menu</span>
        </button>
      </div>
    </nav>
  );
}
