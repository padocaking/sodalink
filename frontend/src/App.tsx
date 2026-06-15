import { useState, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Category from './pages/Category';
import Categories from './pages/Categories';
import Product from './pages/Product';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';
import Home from './pages/Home';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Menu from './components/Menu';
import Order from './pages/Order';
import User from './pages/User';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { getStoredUser, logout, type AuthUser } from './auth';

function App() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const location = useLocation();
  const isCategoryPage = location.pathname.startsWith('/categoria')
    || location.pathname.startsWith('/favoritos')
    || location.pathname.startsWith('/carrinho')
    || location.pathname.startsWith('/admin');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const directionRef = useRef<'h' | 'v' | 'ignore' | null>(null);
  const mouseDownRef = useRef(false);

  const handlePointerStart = (clientX: number, clientY: number) => {
    startXRef.current = clientX;
    startYRef.current = clientY;
    directionRef.current = null;
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const dx = clientX - startXRef.current;
    const dy = clientY - startYRef.current;

    if (!directionRef.current) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        if (!isMenuOpen && startXRef.current > 40) {
          directionRef.current = 'ignore';
          return;
        }
        directionRef.current = 'h';
      } else if (Math.abs(dy) >= Math.abs(dx) && Math.abs(dy) > 10) {
        directionRef.current = 'v';
        return;
      } else {
        return;
      }
    }

    if (directionRef.current === 'v' || directionRef.current === 'ignore') return;

    const menuW = window.innerWidth * 0.9;
    const base = isMenuOpen ? menuW : 0;
    const x = Math.max(0, Math.min(menuW, base + dx));

    setIsDragging(true);
    setDragX(x);
  };

  const handlePointerEnd = () => {
    if (!isDragging) return;
    const menuW = window.innerWidth * 0.9;
    setIsMenuOpen(dragX > menuW * 0.3);
    setIsDragging(false);
    setDragX(0);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsMenuOpen(false);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const menuW = typeof window !== 'undefined' ? window.innerWidth * 0.9 : 360;
  const overlayOpacity = isDragging
    ? (dragX / menuW) * 0.6
    : isMenuOpen ? 0.6 : 0;

  return (
    <div
      className="relative w-full h-dvh overflow-hidden bg-gray-100"
      onTouchStart={(e) => handlePointerStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handlePointerEnd}
      onMouseDown={(e) => { mouseDownRef.current = true; handlePointerStart(e.clientX, e.clientY); }}
      onMouseMove={(e) => { if (mouseDownRef.current) handlePointerMove(e.clientX, e.clientY); }}
      onMouseUp={() => { mouseDownRef.current = false; handlePointerEnd(); }}
      onMouseLeave={() => { if (mouseDownRef.current) { mouseDownRef.current = false; handlePointerEnd(); } }}
    >

      {/* Side Menu Drawer */}
      <div className="absolute top-0 left-0 w-[90vw] h-full bg-white z-0">
        <Menu onClose={() => setIsMenuOpen(false)} />
      </div>

      {/* Main Content Wrapper */}
      <div
        className={`relative z-10 h-full bg-white flex flex-col ${
          isDragging ? '' : 'transition-transform duration-300 ease-in-out'
        } ${!isDragging ? (isMenuOpen ? 'translate-x-[90vw]' : 'translate-x-0') : ''}`}
        style={isDragging ? { transform: `translateX(${dragX}px)` } : undefined}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 z-50 bg-black cursor-pointer ${
            !isDragging ? 'transition-opacity duration-300' : ''
          }`}
          style={{
            opacity: overlayOpacity,
            pointerEvents: overlayOpacity > 0 ? 'auto' : 'none',
          }}
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu"
        />

        {!isCategoryPage && <Header />}

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pedido" element={<Order />} />
            <Route path="/categoria/:slug" element={<Category />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/produto/:slug" element={<Product />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/pedido-concluido" element={<OrderSuccess />} />
            <Route path="/conta" element={<User user={user} onLogout={handleLogout} />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>

        <BottomNav
          onMenuClick={() => setIsMenuOpen(true)}
          isMenuOpen={isMenuOpen}
        />
      </div>
    </div>
  );
}

export default App;