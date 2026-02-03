import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';

const API_URL = "http://localhost:4242"; 

// --- IKONY (Inline SVG dla pełnej kontroli) ---
const IconBase = ({ children, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
);

const Icons = {
  ShoppingCart: (p) => <IconBase {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></IconBase>,
  Menu: (p) => <IconBase {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></IconBase>,
  Store: (p) => <IconBase {...p}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></IconBase>,
  Video: (p) => <IconBase {...p}><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></IconBase>,
  VideoOff: (p) => <IconBase {...p}><path d="M10.66 6H14a2 2 0 0 1 2 2v2.34"/><path d="m22 8-6 4 6 4V8Z"/><path d="M2 2l20 20"/><path d="M2 6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></IconBase>,
  Loader: (p) => <IconBase {...p} className={`animate-spin ${p.className}`}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></IconBase>,
  X: (p) => <IconBase {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconBase>,
  Plus: (p) => <IconBase {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconBase>,
  Minus: (p) => <IconBase {...p}><path d="M5 12h14"/></IconBase>,
  Trash2: (p) => <IconBase {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconBase>,
  Bug: (p) => <IconBase {...p}><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/></IconBase>,
  Check: (p) => <IconBase {...p}><polyline points="20 6 9 17 4 12"/></IconBase>,
  Mail: (p) => <IconBase {...p}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></IconBase>,
  Phone: (p) => <IconBase {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></IconBase>,
  MapPin: (p) => <IconBase {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></IconBase>,
  Instagram: (p) => <IconBase {...p}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></IconBase>,
  Facebook: (p) => <IconBase {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></IconBase>,
};

// --- DANE TESTOWE ---
const MOCK_PRODUCTS_DATA = [
  { id: 1, name: 'Chromatopelma cyaneopubescens', latin: 'Greenbottle Blue', type: 'spider', price: 120.00, image: 'https://images.unsplash.com/photo-1548858881-80590a5525bc?auto=format&fit=crop&w=400&q=80', desc: 'L3/L4. Pięknie wybarwiony, idealny na start.' },
  { id: 2, name: 'Caribena versicolor', latin: 'Antilles Pinktoe', type: 'spider', price: 85.00, image: 'https://images.unsplash.com/photo-1542646274-9549925206f5?auto=format&fit=crop&w=400&q=80', desc: 'Nadrzewny klejnot. L2. Bardzo łagodny.' },
  { id: 5, name: 'Terrarium Szklane 20x20x30', latin: 'Akcesoria', type: 'gear', price: 145.00, image: 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=400&q=80', desc: 'Gilotyna, wentylacja góra-dół. Idealne dla nadrzewnych.' }
];

// --- HOOK KOSZYKA ---
const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} dodany do koszyka!`);
  }, []);

  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(item => item.id !== id)), []);
  
  const updateQty = useCallback((id, delta) => {
    setCart(prev => prev.map(item => (item.id === id && item.qty + delta > 0) ? { ...item, qty: item.qty + delta } : item));
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.qty), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  return { cart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast };
};

// --- KOMPONENTY WIDOKÓW ---
const HomeView = memo(({ navigateTo }) => (
  <div className="relative min-h-[70vh] flex items-center justify-center animate-fade-in overflow-hidden rounded-3xl">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 -z-10"></div>
    <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
    
    <div className="text-center px-4 max-w-4xl mx-auto relative">
      <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-emerald-700 uppercase bg-emerald-100 rounded-full">
        Nowa dostawa ptaszników!
      </div>
      <h1 className="text-5xl md:text-8xl font-black text-gray-900 mb-8 leading-[1.1]">
        Egzotyka na <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Wyciągnięcie Ręki</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
        Spiderra to pasja zamknięta w szkle. Oferujemy wyselekcjonowane gatunki, 
        profesjonalny sprzęt i wiedzę, która pomoże Ci stworzyć własny kawałek dżungli.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={() => navigateTo('shop')} className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200/20 active:scale-95 flex items-center justify-center gap-2">
          <Icons.Store className="w-5 h-5" /> Przejdź do Sklepu
        </button>
        <button onClick={() => navigateTo('about')} className="px-10 py-5 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95">
          Poznaj naszą pasję
        </button>
      </div>
    </div>
  </div>
));

const ShopView = memo(({ addToCart, products, loading }) => {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => filter === 'all' ? products : products.filter(p => p.type === filter), [filter, products]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Icons.Loader className="w-12 h-12 text-emerald-500" />
      <p className="mt-4 text-gray-500 font-medium">Ładowanie asortymentu...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {[{ id: 'all', label: 'Wszystko' }, { id: 'spider', label: 'Ptaszniki' }, { id: 'gear', label: 'Akcesoria' }].map(f => (
          <button 
            key={f.id} 
            onClick={() => setFilter(f.id)} 
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${filter === f.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map(p => (
          <div key={p.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500">
            <div className="relative h-64 overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
                {p.type === 'spider' ? 'Gatunek' : 'Sprzęt'}
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{p.name}</h3>
                <p className="text-emerald-600 text-xs font-bold italic uppercase tracking-wider">{p.latin}</p>
              </div>
              <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10">{p.desc}</p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="text-2xl font-black text-gray-900">{p.price.toFixed(2)} <span className="text-sm font-normal text-gray-400">PLN</span></span>
                <button 
                  onClick={() => addToCart(p)} 
                  className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-emerald-500 transition-colors shadow-lg active:scale-90"
                >
                  <Icons.Plus className="w-6 h-6"/>
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
  <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-16 animate-fade-in shadow-sm">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
      <div className="w-full md:w-1/2">
        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <img 
            src="https://images.unsplash.com/photo-1548858881-80590a5525bc?auto=format&fit=crop&w=800&q=80" 
            alt="Spiderra Team" 
            className="relative rounded-3xl shadow-xl w-full aspect-square object-cover" 
          />
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-4xl font-black mb-6 text-gray-900">Pasja, która <br /><span className="text-emerald-500">buduje zaufanie</span></h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>Witaj w Spiderra. Moja przygoda z ptasznikami zaczęła się ponad 10 lat temu od jednego małego terrarium. Dziś to nie tylko hodowla, ale cała filozofia obcowania z naturą.</p>
          <p>Każde zwierzę w naszej ofercie pochodzi ze sprawdzonych źródeł, a sprzęt testujemy osobiście w naszej hodowli. Nie jesteśmy tylko sklepem – jesteśmy hobbystami dla hobbystów.</p>
          <div className="pt-6 flex gap-6">
            <div>
              <p className="text-3xl font-black text-gray-900">50+</p>
              <p className="text-xs font-bold text-emerald-600 uppercase">Gatunków</p>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div>
              <p className="text-3xl font-black text-gray-900">100%</p>
              <p className="text-xs font-bold text-emerald-600 uppercase">Pasji</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// --- GŁÓWNA APLIKACJA ---
export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { cart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast } = useCart();

  // Obsługa URL po powrocie ze Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      showToast("Płatność powiodła się! Dziękujemy za zakupy.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get('canceled')) {
      showToast("Płatność została anulowana.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProducts(data.length > 0 ? data : MOCK_PRODUCTS_DATA);
      } catch {
        setProducts(MOCK_PRODUCTS_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Błąd połączenia z serwerem płatności. Upewnij się, że server.js jest uruchomiony.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const navigate = (view) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-[80] border-b border-gray-100 h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          <div className="text-2xl font-black flex items-center gap-2 cursor-pointer group" onClick={() => navigate('home')}>
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Icons.Bug className="w-6 h-6" />
            </div>
            <span className="tracking-tighter">SPIDERRA</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 font-bold text-sm text-gray-500">
            {['home', 'shop', 'stream', 'about'].map(v => (
              <button 
                key={v} 
                onClick={() => navigate(v)} 
                className={`transition-colors hover:text-emerald-500 ${activeView === v ? 'text-emerald-600' : ''}`}
              >
                {v === 'home' ? 'Start' : v === 'shop' ? 'Sklep' : v === 'stream' ? 'Wyprawy' : 'O nas'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-3 bg-gray-50 rounded-2xl text-gray-700 hover:bg-emerald-500 hover:text-white transition-all group"
            >
              <Icons.ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white group-hover:bg-gray-900 transition-colors">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              className="md:hidden p-3 bg-gray-50 rounded-2xl text-gray-700" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-white pt-24 px-6 animate-fade-in md:hidden">
          <div className="flex flex-col gap-8">
            {['home', 'shop', 'stream', 'about'].map(v => (
              <button 
                key={v} 
                onClick={() => navigate(v)} 
                className={`text-4xl font-black text-left ${activeView === v ? 'text-emerald-500' : 'text-gray-900'}`}
              >
                {v === 'home' ? 'Start' : v === 'shop' ? 'Sklep' : v === 'stream' ? 'Wyprawy' : 'O nas'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {activeView === 'home' && <HomeView navigateTo={navigate} />}
        {activeView === 'shop' && <ShopView addToCart={addToCart} products={products} loading={loading} />}
        {activeView === 'about' && <AboutView />}
        {activeView === 'stream' && (
          <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white min-h-[50vh] flex flex-col items-center justify-center animate-fade-in shadow-2xl">
            <div className="inline-flex items-center gap-2 bg-red-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span> Live
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tight">EKSPEDYCJA <span className="text-emerald-400">BRAZYLIA</span></h2>
            <p className="text-gray-400 text-xl max-w-xl mb-10">Bądź z nami na żywo podczas poszukiwań rzadkich gatunków ptaszników w ich naturalnym środowisku.</p>
            <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 w-full max-w-2xl">
              <Icons.VideoOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Transmisja zakończona. Wracamy wkrótce!</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Column 1: Brand */}
            <div>
              <div className="text-2xl font-black mb-6 tracking-tighter flex items-center gap-2">
                <div className="bg-emerald-500 text-white p-1 rounded-md">
                  <Icons.Bug className="w-5 h-5" />
                </div>
                SPIDERRA
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Największa w Polsce pasja do ptaszników. Dostarczamy nie tylko zwierzęta, ale i pełne wsparcie w ich hodowli. Dołącz do tysięcy zadowolonych hobbystów.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all">
                  <Icons.Facebook className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all">
                  <Icons.Instagram className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Column 2: Shop Links */}
            <div>
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Sklep</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><button onClick={() => navigate('shop')} className="hover:text-emerald-500 transition-colors">Wszystkie produkty</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-emerald-500 transition-colors">Ptaszniki</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-emerald-500 transition-colors">Terraria i akcesoria</button></li>
                <li><button className="hover:text-emerald-500 transition-colors">Nowości</button></li>
              </ul>
            </div>

            {/* Column 3: Legal/Information */}
            <div>
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Informacje</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><button className="hover:text-emerald-500 transition-colors">Regulamin sklepu</button></li>
                <li><button className="hover:text-emerald-500 transition-colors">Polityka prywatności</button></li>
                <li><button className="hover:text-emerald-500 transition-colors">Wysyłka i zwroty</button></li>
                <li><button className="hover:text-emerald-500 transition-colors">Metody płatności</button></li>
                <li><button className="hover:text-emerald-500 transition-colors">FAQ</button></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Kontakt</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Icons.Mail className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Email</p>
                    <p className="text-gray-900 font-bold">kontakt@spiderra.pl</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.Phone className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Infolinia</p>
                    <p className="text-gray-900 font-bold">+48 123 456 789</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Adres</p>
                    <p className="text-gray-900 font-bold">ul. Egzotyczna 12, Warszawa</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
            <p>&copy; {new Date().getFullYear()} Spiderra Lab. Wszystkie prawa zastrzeżone.</p>
            <div className="flex gap-6">
              <button className="hover:text-emerald-500 transition-colors">Realizacja: Creative Studio</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right transition-transform">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tight">Twoje Zamówienie</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"><Icons.X/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-50 p-8 rounded-full mb-6">
                    <Icons.ShoppingCart className="w-12 h-12 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Koszyk jest pusty</p>
                  <button onClick={() => {setIsCartOpen(false); navigate('shop');}} className="mt-6 text-emerald-600 font-bold underline">Znajdź coś dla siebie</button>
                </div>
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-5 mb-6 group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm">
                    <img src={item.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                    <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-3">{item.latin}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-50 rounded-xl px-2 py-1">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 text-gray-400 hover:text-gray-900"><Icons.Minus className="w-4 h-4"/></button>
                        <span className="w-8 text-center font-black text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 text-gray-400 hover:text-gray-900"><Icons.Plus className="w-4 h-4"/></button>
                      </div>
                      <span className="font-black text-gray-900">{(item.price * item.qty).toFixed(2)} zł</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-200 hover:text-red-500 transition-colors self-start"><Icons.Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Do zapłaty</p>
                  <p className="text-3xl font-black text-gray-900">{cartTotal.toFixed(2)} <span className="text-sm font-normal">PLN</span></p>
                </div>
                <p className="text-emerald-600 text-xs font-bold">Darmowa wysyłka od 300 zł</p>
              </div>
              <button 
                onClick={handleCheckout} 
                disabled={cart.length === 0 || checkoutLoading}
                className={`w-full py-5 rounded-2xl font-black text-white transition-all shadow-xl flex items-center justify-center gap-3 ${cart.length > 0 ? 'bg-gray-900 hover:bg-emerald-600 shadow-emerald-200/20 active:scale-[0.98]' : 'bg-gray-200 cursor-not-allowed'}`}
              >
                {checkoutLoading ? (
                  <Icons.Loader className="w-6 h-6" />
                ) : (
                  <>
                    <Icons.Check className="w-6 h-6" />
                    PRZEJDŹ DO PŁATNOŚCI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-gray-900 text-white rounded-2xl shadow-2xl transition-all duration-500 flex items-center gap-3 pointer-events-none ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        <div className="bg-emerald-500 p-1 rounded-md"><Icons.Check className="w-4 h-4" /></div>
        <span className="font-bold text-sm tracking-tight">{toast.message}</span>
      </div>
    </div>
  );
}