import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Order from './pages/Order';
import User from './pages/User';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-gray-100 ">

      {/* Side Menu Drawer - Positioned on the left, under the main content */}
      <div className={`absolute top-0 left-0 w-[90vw] h-full bg-white z-0 `}>
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Menu</h2>
          {/* Add menu items here later */}
        </div>
      </div>

      {/* Main Content Wrapper - Pushed right when menu opens */}
      <div 
        className={`relative z-10 transition-transform duration-300 ease-in-out h-full bg-white shadow-[-20px_0_30px_rgba(0,0,0,0.2)] flex flex-col ${
          isMenuOpen ? 'translate-x-[90vw]' : 'translate-x-0'
        }`}
      >
        {/* Overlay to close menu when clicking on the pushed content, also darkens the page */}
        <div 
          className={`absolute inset-0 z-50 bg-black/60 cursor-pointer transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)} 
          aria-label="Close menu"
        />
        
        <Header />
        
        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pedido" element={<Order />} />
            <Route path="/conta" element={<User />} />
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
