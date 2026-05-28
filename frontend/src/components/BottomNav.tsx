import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import HomeIcon from '../icons/home.svg?react';
import TruckIcon from '../icons/truck.svg?react';
import UserIcon from '../icons/user.svg?react';
import MenuIcon from '../icons/menu.svg?react';

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
  }, [location.pathname, isMenuOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full transition-colors ${
      isActive && !isMenuOpen ? 'text-red-600' : 'text-black hover:text-red-600'
    }`;

  return (
    <nav className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe md:hidden z-20">
      {/* Animated indicator line */}
      <div 
        className="absolute -top-px left-0 h-0.5 bg-red-600 transition-transform duration-300 ease-in-out"
        style={{ 
          width: '25%', 
          transform: `translateX(${activeIndex * 100}%)` 
        }}
      />

      <div className="flex justify-around items-center py-3">
        <NavLink to="/" className={linkClass}>
          <HomeIcon className="h-8 w-8" />
          <span className="text-[12px] font-medium tracking-wider">Início</span>
        </NavLink>
        <NavLink to="/pedido" className={linkClass}>
          <TruckIcon className="h-9 w-9" />
          <span className="text-[12px] font-medium tracking-wider">Pedidos</span>
        </NavLink>
        <NavLink to="/conta" className={linkClass}>
          <UserIcon className="h-8 w-8 mb-1" />
          <span className="text-[12px] font-medium tracking-wider">Conta</span>
        </NavLink>
        <button 
          onClick={onMenuClick}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isMenuOpen ? 'text-red-600' : 'text-black hover:text-red-600'
          }`}
        >
          <MenuIcon className="h-8 w-8 mb-1" />
          <span className="text-[12px] font-medium tracking-wider">Menu</span>
        </button>
      </div>
    </nav>
  );
}
