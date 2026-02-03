import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';

// ==========================================
// 1. ICONS (Internal SVG System)
// ==========================================
const IconBase = ({ children, className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className} {...props}
  >
    {children}
  </svg>
);

const Icons = {
  ShoppingCart: (p) => <IconBase {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></IconBase>,
  Menu: (p) => <IconBase {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></IconBase>,
  Store: (p) => <IconBase {...p}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></IconBase>,
  Video: (p) => <IconBase {...p}><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></IconBase>,
  Calendar: (p) => <IconBase {...p}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></IconBase>,
  MapPin: (p) => <IconBase {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></IconBase>,
  Star: (p) => <IconBase {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></IconBase>,
  X: (p) => <IconBase {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconBase>,
  Plus: (p) => <IconBase {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconBase>,
  Minus: (p) => <IconBase {...p}><path d="M5 12h14"/></IconBase>,
  Trash2: (p) => <IconBase {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconBase>,
  Check: (p) => <IconBase {...p}><polyline points="20 6 9 17 4 12"/></IconBase>,
  Bug: (p) => <IconBase {...p}><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></IconBase>,
  VideoOff: (p) => <IconBase {...p}><path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196a.5.5 0 0 1-.752.432L16 13.5V16a2 2 0 0 1-2 2h-4.267"/><path d="m2 2 20 20"/><path d="M2 6.27V16a2 2 0 0 0 2 2h1.73"/></IconBase>,
  Facebook: (p) => <IconBase {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></IconBase>,
  Instagram: (p) => <IconBase {...p}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></IconBase>,
  Youtube: (p) => <IconBase {...p}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></IconBase>,
  ArrowRight: (p) => <IconBase {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></IconBase>,
  Heart: (p) => <IconBase {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></IconBase>,
  Kick: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12.9 16.7l-4.2-4.2 4.2-4.2h-3.8L5.9 11.6v-3.3H2.5v7.5h3.4v-3.3l3.2 3.3h3.8zM16.5 7.4h-3.4v9.3h3.4V7.4zM21.5 7.4h-3.4v9.3h3.4V7.4z"/>
    </svg>
  )
};

// ==========================================
// 2. DATA CONSTANTS
// ==========================================
const PRODUCTS_DATA = [
  { id: 1, name: 'Chromatopelma cyaneopubescens', latin: 'Greenbottle Blue', type: 'spider', price: 120.00, image: 'https://placehold.co/400x300/e2e8f0/10b981?text=Chromatopelma', desc: 'L3/L4. Pięknie wybarwiony, szybki i żarłoczny.' },
  { id: 2, name: 'Caribena versicolor', latin: 'Antilles Pinktoe', type: 'spider', price: 85.00, image: 'https://placehold.co/400x300/e2e8f0/a78bfa?text=Versicolor', desc: 'L2. Klasyk wśród ptaszników nadrzewnych. Łagodny.' },
  { id: 3, name: 'Brachypelma hamorii', latin: 'Mexican Redknee', type: 'spider', price: 150.00, image: 'https://placehold.co/400x300/e2e8f0/f97316?text=Hamorii', desc: 'L5. Idealny dla początkujących. Spokojny i naziemny.' },
  { id: 4, name: 'Theraphosa stirmi', latin: 'Burgundy Goliath', type: 'spider', price: 450.00, image: 'https://placehold.co/400x300/e2e8f0/991b1b?text=Theraphosa', desc: 'L6. Gigant. Tylko dla doświadczonych hodowców.' },
  { id: 5, name: 'Terrarium Szklane', latin: '20x20x30 cm', type: 'gear', price: 90.00, image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Terrarium', desc: 'Gilotyna, podwójna wentylacja. Idealne dla nadrzewnych.' },
  { id: 6, name: 'Pęseta terrarystyczna', latin: 'Stal nierdzewna', type: 'gear', price: 25.00, image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Peseta', desc: 'Długa 30cm, prosta. Niezbędna do karmienia.' },
  { id: 7, name: 'Kabel grzewczy', latin: '15W', type: 'gear', price: 45.00, image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Ogrzewanie', desc: 'Silikonowy, wodoodporny. Zapewnia ciepło w zimne dni.' },
  { id: 8, name: 'Włókno kokosowe', latin: 'Podłoże prasowane', type: 'gear', price: 12.00, image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Podloze', desc: 'Brykiet 650g. Po namoczeniu daje 8-9L podłoża.' }
];

// ==========================================
// 3. CUSTOM HOOKS
// ==========================================
const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.qty), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  return { 
    cart, isCartOpen, setIsCartOpen, toastVisible, 
    addToCart, removeFromCart, updateQty, cartTotal, cartCount 
  };
};

// ==========================================
// 4. SUB-COMPONENTS (Memoized)
// ==========================================

const Navbar = memo(({ activeView, navigateTo, cartCount, setIsCartOpen, isMobileMenuOpen, setIsMobileMenuOpen }) => (
  <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center cursor-pointer" onClick={() => navigateTo('home')}>
          <span className="text-3xl font-bold text-gray-900 tracking-wider flex items-center gap-2">
            <Icons.Bug className="text-[#10b981] w-8 h-8" />
            SPIDERRA
          </span>
        </div>
        <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-8">
            {[
              { id: 'home', label: 'Start' },
              { id: 'stream', label: 'Streamy' },
              { id: 'shop', label: 'Sklep' },
              { id: 'about', label: 'O mnie' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeView === item.id 
                    ? 'text-[#10b981] bg-gray-50' 
                    : 'text-gray-600 hover:text-[#10b981] hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative p-2 text-gray-600 hover:text-[#10b981] transition"
            aria-label="Koszyk"
          >
            <Icons.ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#10b981] rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <Icons.Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
    
    {isMobileMenuOpen && (
      <div className="md:hidden bg-white border-b border-gray-100 pb-4 shadow-lg animate-fade-in">
        {[
          { id: 'home', label: 'Start' },
          { id: 'stream', label: 'Streamy' },
          { id: 'shop', label: 'Sklep' },
          { id: 'about', label: 'O mnie' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`block w-full text-left px-4 py-3 hover:bg-gray-50 ${
                activeView === item.id ? 'text-[#10b981] font-bold' : 'text-gray-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    )}
  </nav>
));

const CartSidebar = memo(({ isOpen, onClose, cart, cartTotal, updateQty, removeFromCart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      <div className="absolute top-0 right-0 max-w-md w-full h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Koszyk</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Zamknij koszyk"
          >
            <Icons.X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <Icons.ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
              <p>Twój koszyk jest pusty.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <img src={item.image} alt={item.name} loading="lazy" className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.price.toFixed(2)} zł / szt.</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => updateQty(item.id, -1)} 
                      className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-xs hover:border-gray-400 transition"
                      aria-label="Zmniejsz ilość"
                    >
                      <Icons.Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-mono text-gray-700 font-bold">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.id, 1)} 
                      className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-xs hover:border-gray-400 transition"
                      aria-label="Zwiększ ilość"
                    >
                      <Icons.Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="text-gray-400 hover:text-red-500 transition p-2"
                  aria-label="Usuń z koszyka"
                >
                  <Icons.Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
            <p>Razem</p>
            <p>{cartTotal.toFixed(2)} PLN</p>
          </div>
          <button 
            onClick={() => { if(cart.length > 0) alert('Przekierowanie do płatności...'); }}
            className={`w-full flex justify-center items-center px-6 py-4 rounded-xl text-base font-bold text-white transition shadow-lg ${
              cart.length > 0 
              ? 'bg-[#10b981] hover:bg-[#059669] shadow-emerald-200 cursor-pointer' 
              : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={cart.length === 0}
          >
            Przejdź do kasy
          </button>
        </div>
      </div>
    </div>
  );
});

const Toast = memo(({ visible }) => (
  <div 
    className={`fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 z-[70] flex items-center gap-3 ${
      visible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'
    }`}
  >
    <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-xs text-white">
      <Icons.Check className="w-4 h-4" />
    </div>
    <span className="font-medium">Dodano do koszyka!</span>
  </div>
));

const Footer = memo(({ navigateTo }) => (
  <footer className="bg-white border-t border-gray-200 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <span className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Icons.Bug className="text-[#10b981] w-6 h-6" />
            SPIDERRA
          </span>
          <p className="text-gray-500 text-sm leading-relaxed">
            Twoje centrum terrarystyki. Pasja, natura i edukacja w jednym miejscu. Dołącz do naszej społeczności!
          </p>
        </div>

        {/* Links 1 - Navigation */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Nawigacja</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><button onClick={() => navigateTo('home')} className="hover:text-[#10b981] transition text-left">Start</button></li>
            <li><button onClick={() => navigateTo('stream')} className="hover:text-[#10b981] transition text-left">Streamy</button></li>
            <li><button onClick={() => navigateTo('shop')} className="hover:text-[#10b981] transition text-left">Sklep</button></li>
            <li><button onClick={() => navigateTo('about')} className="hover:text-[#10b981] transition text-left">O mnie</button></li>
          </ul>
        </div>

        {/* Links 2 - Help */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Pomoc</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-[#10b981] transition">Regulamin sklepu</a></li>
            <li><a href="#" className="hover:text-[#10b981] transition">Polityka prywatności</a></li>
            <li><a href="#" className="hover:text-[#10b981] transition">Dostawa i płatności</a></li>
            <li><a href="#" className="hover:text-[#10b981] transition">Zwroty i reklamacje</a></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
           <h3 className="font-bold text-gray-900 mb-4">Znajdź nas</h3>
           <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#53FC18] hover:text-black transition">
                 <Icons.Kick />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white transition">
                 <Icons.Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition">
                 <Icons.Facebook className="w-5 h-5" />
              </a>
           </div>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm flex flex-col md:flex-row justify-between items-center">
        <span>&copy; {new Date().getFullYear()} Spiderra. Wszelkie prawa zastrzeżone.</span>
        <span className="mt-2 md:mt-0 flex items-center gap-1 text-xs">
          Stworzone z <Icons.Heart className="w-3 h-3 text-[#10b981]" /> dla pasjonatów.
        </span>
      </div>
    </div>
  </footer>
));

// --- VIEWS ---

const HomeView = memo(({ navigateTo }) => (
  <div className="bg-white rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden min-h-[80vh] flex items-center justify-center">
    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 transform -translate-x-1/4 translate-y-1/4"></div>

    <div className="relative z-10 text-center px-4 py-10 lg:py-20 max-w-4xl mx-auto">
      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-7xl mb-8">
        <span className="block">Egzotyka w Twoim Domu</span>
        <span className="block text-gradient mt-4">Podróże na Twoim Ekranie</span>
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed">
        Spiderra to nowoczesna przestrzeń dla fanów terrarystyki. Kupuj wyselekcjonowane gatunki, dobieraj akcesoria i oglądaj relacje z wypraw w najdziksze zakątki świata.
      </p>
      <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
        <button 
          onClick={() => navigateTo('shop')}
          className="flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-[#10b981] hover:bg-[#059669] transition shadow-lg shadow-emerald-200 hover:-translate-y-1"
        >
          <Icons.Store className="mr-2 w-6 h-6" /> Zobacz Sklep
        </button>
        <button 
          onClick={() => navigateTo('stream')}
          className="flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-lg font-bold rounded-2xl text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition hover:-translate-y-1"
        >
          <Icons.Video className="mr-2 w-6 h-6" /> Oglądaj LIVE
        </button>
      </div>
      
      {/* Quick Links Teaser */}
      <div className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
         <div onClick={() => navigateTo('stream')} className="cursor-pointer group hover:bg-gray-50 p-4 rounded-xl transition">
           <h3 className="font-bold text-gray-900 flex items-center gap-2 group-hover:text-[#10b981]">
             Streamy <Icons.ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
           </h3>
           <p className="text-sm text-gray-500 mt-1">Transmisje z wypraw i Q&A.</p>
         </div>
         <div onClick={() => navigateTo('shop')} className="cursor-pointer group hover:bg-gray-50 p-4 rounded-xl transition">
           <h3 className="font-bold text-gray-900 flex items-center gap-2 group-hover:text-[#10b981]">
             Sklep <Icons.ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
           </h3>
           <p className="text-sm text-gray-500 mt-1">Ptaszniki i akcesoria.</p>
         </div>
         <div onClick={() => navigateTo('about')} className="cursor-pointer group hover:bg-gray-50 p-4 rounded-xl transition">
           <h3 className="font-bold text-gray-900 flex items-center gap-2 group-hover:text-[#10b981]">
             O Mnie <Icons.ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
           </h3>
           <p className="text-sm text-gray-500 mt-1">Historia mojej pasji.</p>
         </div>
      </div>
    </div>
  </div>
));

const StreamView = memo(() => (
  <div className="bg-white rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-gray-100 animate-fade-in">
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-gray-100">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-3 h-3 bg-red-500 rounded-full live-pulse inline-block"></span>
          Centrum Transmisji
        </h2>
        <p className="text-gray-500 mt-2">Śledź wyprawy i Q&A na żywo na Kick.com</p>
      </div>
      <a 
        href="https://kick.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-4 md:mt-0 bg-black text-[#53FC18] font-bold py-2 px-6 rounded-lg hover:bg-gray-800 transition flex items-center gap-2 shadow-md"
      >
        <Icons.Kick /> Zaobserwuj
      </a>
    </div>

    <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl group">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-6">
          <Icons.VideoOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-semibold">Aktualnie Offline</h3>
          <p className="text-gray-400">Sprawdź harmonogram poniżej.</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white font-bold">Ostatni live: Wyprawa do Wenezueli</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Icons.Calendar className="text-[#10b981] w-5 h-5" /> Następny Stream
        </h4>
        <p className="text-gray-600 text-sm">Piątek, 20:00</p>
        <p className="text-gray-400 text-xs mt-1">Temat: Karmienie ptaszników</p>
      </div>
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Icons.MapPin className="text-purple-500 w-5 h-5" /> Ostatnia Wyprawa
        </h4>
        <p className="text-gray-600 text-sm">Wenezuela</p>
        <p className="text-gray-400 text-xs mt-1">Cel: Chromatopelma</p>
      </div>
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Icons.Star className="text-yellow-500 w-5 h-5" /> Subskrypcja
        </h4>
        <p className="text-gray-600 text-sm">Dołącz do grupy VIP.</p>
      </div>
    </div>
  </div>
));

const ShopView = memo(({ addToCart }) => {
  const [filter, setFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    return filter === 'all' ? PRODUCTS_DATA : PRODUCTS_DATA.filter(p => p.type === filter);
  }, [filter]);

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-gray-100 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Sklep Terrarystyczny</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Zdrowe osobniki z legalnych hodowli i sprawdzone akcesoria.</p>
        
        <div className="mt-8 inline-flex bg-gray-100 rounded-lg p-1">
          {[
            { id: 'all', label: 'Wszystko' },
            { id: 'spider', label: 'Ptaszniki' },
            { id: 'gear', label: 'Akcesoria' }
          ].map((f) => (
            <button 
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                filter === f.id 
                ? 'bg-[#10b981] text-white shadow-md' 
                : 'bg-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col group">
            <div className="relative overflow-hidden h-48 bg-gray-50">
              <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
              {product.type === 'spider' && (
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs text-gray-800 px-2 py-1 rounded-md font-bold shadow-sm">
                  Żywe zwierzę
                </span>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h3>
              <p className="text-xs font-semibold text-[#10b981] uppercase tracking-wide mb-2 mt-1">{product.latin}</p>
              <p className="text-gray-500 text-sm mb-4 flex-1 leading-relaxed">{product.desc}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <span className="text-xl font-bold text-gray-900">{product.price.toFixed(2)} zł</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-gray-900 hover:bg-[#10b981] text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg transform active:scale-95"
                  aria-label={`Dodaj ${product.name} do koszyka`}
                >
                  <Icons.Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const AboutView = memo(() => (
  <div className="bg-white rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-gray-100 animate-fade-in">
    <div className="flex flex-col md:flex-row gap-12 items-start">
      <div className="w-full md:w-1/3 flex flex-col items-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-gray-50 shadow-lg mb-6 group">
          <img 
            src="https://placehold.co/400x400/1f2937/10b981?text=Ja" 
            alt="Właściciel Spiderra" 
            loading="lazy"
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex space-x-4">
          <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#53FC18] hover:text-black transition shadow-sm transform hover:scale-110 hover:-translate-y-1">
            <Icons.Kick />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white transition shadow-sm transform hover:scale-110 hover:-translate-y-1">
            <Icons.Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition shadow-sm transform hover:scale-110 hover:-translate-y-1">
            <Icons.Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition shadow-sm transform hover:scale-110 hover:-translate-y-1">
            <Icons.Youtube className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="w-full md:w-2/3">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Icons.Bug className="text-[#10b981] w-8 h-8" /> 
          O Mnie
        </h2>
        <h3 className="text-xl text-[#10b981] font-medium mb-6">Pasjonat, Hodowca, Podróżnik</h3>
        
        <div className="prose prose-gray text-gray-600 leading-relaxed">
          <p className="mb-4">
            Cześć! Nazywam się <strong>Kacper</strong> i jestem twórcą projektu <strong>Spiderra</strong>. Wszystko zaczęło się od jednego małego pająka, który całkowicie zmienił moje spojrzenie na świat przyrody. To, co zaczęło się jako ciekawość, przerodziło się w życiową pasję.
          </p>
          <p className="mb-4">
            Dzisiaj moja działalność to nie tylko hodowla w domu. Regularnie pakuję plecak i wyruszam w najdalsze zakątki świata – od wilgotnych lasów Amazonii po pustynne tereny Afryki – aby obserwować ptaszniki w ich naturalnym środowisku. Te wyprawy możecie śledzić na moich streamach na Kicku!
          </p>
          <p>
            Stworzyłem to miejsce, aby dzielić się wiedzą, oferować Wam zdrowe, zadbane zwierzęta z legalnych źródeł oraz sprzęt, którego sam używam każdego dnia. Dzięki, że jesteście częścią tej dzikiej społeczności!
          </p>
        </div>
      </div>
    </div>
  </div>
));

// ==========================================
// 5. MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use Custom Hook for Cart Logic
  const { 
    cart, isCartOpen, setIsCartOpen, toastVisible, 
    addToCart, removeFromCart, updateQty, cartTotal, cartCount 
  } = useCart();

  const navigateTo = useCallback((view) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Inject Tailwind CSS for styling
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="bg-[#f3f4f6] text-[#1f2937] min-h-screen font-sans selection:bg-[#10b981] selection:text-white flex flex-col">
      {/* Global Styles */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #10b981; }
        
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .live-pulse { animation: pulse-red 2s infinite; }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .text-gradient {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-image: linear-gradient(to right, #1f2937, #10b981);
        }
      `}</style>

      <Navbar 
        activeView={activeView} 
        navigateTo={navigateTo} 
        cartCount={cartCount} 
        setIsCartOpen={setIsCartOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 w-full flex-grow">
        {activeView === 'home' && <HomeView navigateTo={navigateTo} />}
        {activeView === 'stream' && <StreamView />}
        {activeView === 'shop' && <ShopView addToCart={addToCart} />}
        {activeView === 'about' && <AboutView />}
      </div>

      <Footer navigateTo={navigateTo} />

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        cartTotal={cartTotal}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
      />

      <Toast visible={toastVisible} />
    </div>
  );
}