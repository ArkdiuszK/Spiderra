import React, { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';

// --- KONFIGURACJA API ---
const isProduction = window.location.hostname !== 'localhost';
const API_URL = isProduction ? '/.netlify/functions' : 'http://localhost:4242';

// --- KONFIGURACJA DANYCH FIRMY ---
const COMPANY_DATA = {
  name: "Spiderra.pl - Arkadiusz Kołacki",
  address: "Rakowicka 22D/27",
  zip: "31-510",
  city: "Kraków",
  email: "spiderra.kontakt@outlook.com",
  phone: "+48 514 729 121",
  nip: "", 
  bankAccount: "00 0000 0000 0000 0000 0000 0000"
};

// --- KONFIGURACJA ZDJĘĆ ---
const LOGO_URL = "/zdjecia/logo.png"; 
const LOGO_URL2 = "/zdjecia/logo2.png"; 
const HERO_IMAGE_URL = "/zdjecia/tlo.jpg"; 

// --- DEFINICJA KATEGORII I GRUP FILTRÓW ---
const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'Wszystko' },
  { 
    id: 'spider', 
    label: 'Ptaszniki',
    filterGroups: [
      {
        label: "Płeć", 
        tags: [
          { id: 'female', label: 'Samica' },
          { id: 'male', label: 'Samiec' },
          { id: 'unsexed', label: 'Niesex' }
        ]
      },
      {
        label: "Dla kogo?",
        tags: [
          { id: 'beginner', label: 'Dla początkujących' },
          { id: 'intermediate', label: 'Dla średniozaawansowanych' },
          { id: 'advanced', label: 'Dla zaawansowanych' }
        ]
      },
      {
        label: "Typ / Cechy",
        tags: [
          { id: 'terrestrial', label: 'Naziemne' },
          { id: 'arboreal', label: 'Nadrzewne' },
          { id: 'fossorial', label: 'Podziemne' },
          { id: 'rare', label: 'Rzadkie' },
          { id: 'bestseller', label: 'Bestsellery' }
        ]
      }
    ]
  },
  { 
    id: 'gear', 
    label: 'Akcesoria',
    filterGroups: [
      {
        label: "Kategorie",
        tags: [
          { id: 'terrarium', label: 'Terraria' },
          { id: 'container', label: 'Pojemniki hodowlane' },
          { id: 'substrate', label: 'Podłoże' },
          { id: 'tools', label: 'Narzędzia' },
          { id: 'heating', label: 'Ogrzewanie' },
          { id: 'decor', label: 'Wystrój' }
        ]
      }
    ]
  }
];

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-[#44403c] p-4">
          <h1 className="text-3xl font-bold mb-4">Ups! Coś poszło nie tak.</h1>
          <p className="mb-6 text-[#78716c]">Wystąpił błąd krytyczny aplikacji. Spróbuj odświeżyć stronę.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-[#57534e] text-white rounded-xl hover:bg-[#44403c] transition-colors shadow-lg"
          >
            Odśwież stronę
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// --- POMOCNICY (SEO, Tailwind, Reveal) ---
const SEO = ({ title, description }) => {
  useEffect(() => {
    document.title = title ? `${title} | Spiderra` : "Spiderra - Sklep z Ptaszniki i Akcesoriami";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || "Sklep z ptasznikami i akcesoriami hodowlanymi.";
  }, [title, description]);
  return null;
};

const injectTailwind = () => {
  if (typeof document !== 'undefined' && !document.getElementById('tailwind-cdn')) {
    const script = document.createElement('script');
    script.id = 'tailwind-cdn';
    script.src = "https://cdn.tailwindcss.com";
    script.async = true;
    document.head.appendChild(script);
  }
};
injectTailwind();

const useReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
        setIsVisible(true);
        return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

const Reveal = memo(({ children, className = "", delay = 0 }) => {
  const [ref, isVisible] = useReveal();
  const transitionDelay = `${delay}ms`;
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ease-out transform will-change-transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay }}
    >
      {children}
    </div>
  );
});

// --- IKONY ---
const IconBase = ({ children, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
);

const Icons = {
  ShoppingCart: (p) => <IconBase {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></IconBase>,
  Menu: (p) => <IconBase {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></IconBase>,
  Store: (p) => <IconBase {...p}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></IconBase>,
  X: (p) => <IconBase {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconBase>,
  Plus: (p) => <IconBase {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconBase>,
  Minus: (p) => <IconBase {...p}><path d="M5 12h14"/></IconBase>,
  Trash2: (p) => <IconBase {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconBase>,
  Bug: (p) => <IconBase {...p}><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/></IconBase>,
  Check: (p) => <IconBase {...p}><polyline points="20 6 9 17 4 12"/></IconBase>,
  Instagram: (p) => <IconBase {...p}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></IconBase>,
  Video: (p) => <IconBase {...p}><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></IconBase>,
  FileText: (p) => <IconBase {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></IconBase>,
  Lock: (p) => <IconBase {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>,
  ArrowLeft: (p) => <IconBase {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 5"/></IconBase>,
  ArrowRight: (p) => <IconBase {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></IconBase>,
  ChevronLeft: (p) => <IconBase {...p}><polyline points="15 18 9 12 15 6" /></IconBase>,
  ChevronRight: (p) => <IconBase {...p}><polyline points="9 18 15 12 9 6" /></IconBase>,
  Filter: (p) => <IconBase {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></IconBase>,
  MessageCircle: (p) => <IconBase {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></IconBase>,
  Truck: (p) => <IconBase {...p}><rect width="16" height="13" x="2" y="5" rx="2" /><path d="M2 9h13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" /><path d="M5 9V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" /><circle cx="7" cy="15" r="2" /><circle cx="17" cy="15" r="2" /></IconBase>,
  Box: (p) => <IconBase {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></IconBase>,
  Camera: (p) => <IconBase {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></IconBase>,
  Kick: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className} width="24" height="24">
      <path d="M12.9 16.7l-4.2-4.2 4.2-4.2h-3.8L5.9 11.6v-3.3H2.5v7.5h3.4v-3.3l3.2 3.3h3.8zM16.5 7.4h-3.4v9.3h3.4V7.4zM21.5 7.4h-3.4v9.3h3.4V7.4z"/>
    </svg>
  ),
  TikTok: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className} width="24" height="24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
  Loader: (p) => <IconBase {...p} className={`animate-spin ${p.className}`}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></IconBase>,
  ArrowUp: (p) => <IconBase {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></IconBase>
};

// --- DANE PRODUKTÓW (MOCK - ładują się błyskawicznie przed zapytaniem API) ---
const MOCK_PRODUCTS_DATA = [
  { 
    id: 'spider1', 
    name: 'Grammostola rosea', 
    latin: 'Grammostola rosea', 
    type: 'spider', 
    tags: ['terrestrial', 'beginner', 'bestseller', 'female'], 
    price: 150.00, 
    image: '/zdjecia/ptaszniki/grammostola_rosea.jpg', 
    desc: 'Ptasznik z Chile, znany ze swojego spokojnego usposobienia i łatwości hodowli. Gatunek naziemny, idealny dla początkujących.' 
  },
  { 
    id: 'spider2', 
    name: 'Caribena versicolor', 
    latin: 'Caribena versicolor', 
    type: 'spider', 
    tags: ['arboreal', 'beginner', 'bestseller', 'unsexed'], 
    price: 85.00, 
    image: 'https://placehold.co/400x300/e2e8f0/10b981?text=Versicolor', 
    desc: 'Jeden z najpiękniejszych ptaszników nadrzewnych. Dzięki łagodnemu usposobieniu nadaje się na pierwszego pająka nadrzewnego.' 
  },
  { 
    id: 'spider3', 
    name: 'Theraphosa stirmi', 
    latin: 'Theraphosa stirmi', 
    type: 'spider', 
    tags: ['terrestrial', 'advanced', 'rare', 'sold_out', 'female'], 
    price: 450.00, 
    image: 'https://placehold.co/400x300/e2e8f0/991b1b?text=Stirmi', 
    desc: 'Jeden z największych pająków świata. Wymaga doświadczenia w utrzymaniu odpowiedniej wilgotności.' 
  },
  { 
    id: 'kit_s', 
    name: 'Zestaw S "Plecak" | Dla małych ptaszników', 
    latin: 'Dla L1-L3', 
    type: 'gear', 
    tags: ['container', 'bestseller'], 
    price: 11.99, 
    image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Zestaw+S', 
    desc: 'Najlepszy start dla malucha (L1-L3). W skład zestawu wchodzi profesjonalny pojemnik hodowlany typu Breeding Box (5x5x7cm) z bezpieczną klapką "feeding hatch", która ułatwia karmienie bez ryzyka ucieczki pająka. Krystalicznie przejrzyste ścianki pozwalają na doskonałą obserwację, a precyzyjna boczna wentylacja zapewnia zdrowy przepływ powietrza. To nie jest zwykłe pudełko – to bezpieczny azyl dla Twojego nowego podopiecznego.',
    variants: [
      { id: 'eco', name: 'Economy', price: 11.99, desc: 'Pojemnik + Torf', stripeId: 'price_PLACEHOLDER_ECO_S' }, 
      { id: 'biz', name: 'Business', price: 14.99, desc: 'Pojemnik + Torf + Kora', stripeId: 'price_PLACEHOLDER_BIZ_S' },
      { id: 'first', name: 'First Class', price: 17.99, desc: 'Premium + Mech + Ozdoby', stripeId: 'price_PLACEHOLDER_FIRST_S' }
    ]
  },
  { 
    id: 'kit_m', 
    name: 'Zestaw "Walizka podręczna" | Dla średnich ptaszników', 
    latin: 'Dla L4-L7', 
    type: 'gear', 
    tags: ['container'], 
    price: 39.99,
    image: 'https://placehold.co/400x300/f1f5f9/a8a29e?text=Zestaw+M', 
    desc: 'Komfortowa przesiadka do klasy biznes dla podrostków (L4-L7). Sercem zestawu jest przestronny box hodowlany (wymiary ok. 19x12,5x7,5 cm), który zapewnia idealną przestrzeń życiową na etapie dynamicznego wzrostu. Pojemnik wyposażony jest w wygodną klapkę inspekcyjną ("feeding hatch") do bezpiecznego podawania karmy oraz fabryczny system wentylacji bocznej i górnej. Krystalicznie czyste ścianki pozwalają cieszyć się widokiem pupila, a solidne zamknięcie gwarantuje, że pająk zostanie w środku.',
    variants: [
      { id: 'eco', name: 'Economy', price: 39.99, desc: 'Moczbox + Torf', stripeId: 'price_PLACEHOLDER_ECO_M' },
      { id: 'biz', name: 'Business', price: 49.00, desc: 'Braplast + Tuba', stripeId: 'price_PLACEHOLDER_BIZ_M' },
      { id: 'first', name: 'First Class', price: 65.00, desc: 'Braplast + Tuba + Wystrój + Miska', stripeId: 'price_PLACEHOLDER_FIRST_M' }
    ]
  },
  { 
    id: 'kit_l', 
    name: 'Zestaw "Bagaż rejestrowany" | Dla dużych ptaszników', 
    latin: 'Dla Dorosłych', 
    type: 'gear', 
    tags: ['container'], 
    price: 72.99,
    image: 'https://placehold.co/400x300/f1f5f9/78716c?text=Zestaw+L', 
    desc: 'Luksusowa rezydencja dla dorosłych gigantów. Zestaw "Bagaż Rejestrowany" opiera się na masywnym pojemniku hodowlanym o wymiarach 32x22x15 cm, zapewniającym ogromną przestrzeń życiową nawet dla największych ptaszników. Box posiada zintegrowaną miskę na wodę (koniec z przewracaniem!), bezpieczny "feeding hatch" w pokrywie oraz system wentylacji krzyżowej. To docelowy apartament, w którym Twój pająk poczuje się jak król dżungli.',
    variants: [
      { id: 'eco', name: 'Economy', price: 72.99, desc: 'Box + Torf', stripeId: 'price_PLACEHOLDER_ECO_L' },
      { id: 'biz', name: 'Business', price: 89.00, desc: 'Duży Braplast + Duża Tuba', stripeId: 'price_PLACEHOLDER_BIZ_L' },
      { id: 'first', name: 'First Class', price: 129.00, desc: 'Terrarium/Box + Ścianka + Full Opcja', stripeId: 'price_PLACEHOLDER_FIRST_L' }
    ]
  },
  { id: 'gear2', name: 'Włókno kokosowe', latin: 'Substrat prasowany', type: 'gear', tags: ['substrate', 'bestseller'], price: 15.00, image: 'https://placehold.co/400x300/f1f5f9/a8a29e?text=Włókno', desc: 'Podstawowe podłoże do terrariów. Dobrze trzyma wilgoć, bezpieczne dla zwierząt.' },
  { id: 'gear3', name: 'Pęseta długa', latin: '30 cm', type: 'gear', tags: ['tools'], price: 25.00, image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Pęseta', desc: 'Niezbędne narzędzie do karmienia i sprzątania w terrarium. Stal nierdzewna.' },
];

const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    // Zabezpieczenie przed błędami renderowania obiektów w toście
    const msgString = (typeof message === 'string') ? message : 'Wystąpił błąd operacji.';
    setToast({ visible: true, message: msgString, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }, []);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} dodany do koszyka!`);
  }, [showToast]);

  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(item => item.id !== id)), []);
   
  const updateQty = useCallback((id, delta) => {
    setCart(prev => prev.map(item => (item.id === id && item.qty + delta > 0) ? { ...item, qty: item.qty + delta } : item));
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.qty), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  
  // --- SPRAWDZANIE CZY W KOSZYKU SĄ ZWIERZĘTA ---
  const hasLiveAnimals = useMemo(() => cart.some(item => item.type === 'spider'), [cart]);

  return { cart, setCart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast, hasLiveAnimals };
};

// --- KOMPONENT: SCROLL TO TOP ---
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) setVisible(true);
      else setVisible(false);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 right-6 z-[90] p-3 bg-white border border-[#e7e5e4] rounded-full shadow-lg text-[#57534e] hover:bg-[#f5f5f4] transition-all duration-300 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
    >
      <Icons.ArrowUp className="w-5 h-5" />
    </button>
  );
};

// --- WIDOKI (TERAZ DEFINIOWANE PRZED APPCONTENT) ---

const SuccessView = memo(({ lastOrder }) => {
  if (!lastOrder) return null;
  const total = lastOrder.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="bg-white rounded-3xl border border-[#e5e5e0] p-8 md:p-16 animate-fade-in shadow-sm max-w-3xl mx-auto text-center">
      <div className="w-20 h-20 bg-[#f5f5f0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#5c6b50]">
        <Icons.Check className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold text-[#44403c] mb-2">Dziękujemy za zamówienie!</h2>
      <p className="text-[#78716c] mb-8">Płatność została przyjęta. Na Twój adres e-mail wysłaliśmy potwierdzenie.</p>

      <div className="bg-[#fafaf9] rounded-2xl p-6 mb-8 text-left border border-[#e7e5e4]">
        <h3 className="font-bold text-[#44403c] mb-4 border-b border-[#e7e5e4] pb-2">Podsumowanie zakupów</h3>
        <div className="space-y-4">
          {lastOrder.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-[#e5e5e0]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async"/>
                </div>
                <div>
                  <p className="font-bold text-[#44403c]">{item.name}</p>
                  <p className="text-[#78716c] text-xs">{item.qty} x {item.price.toFixed(2)} zł</p>
                </div>
              </div>
              <span className="font-bold text-[#44403c]">{(item.price * item.qty).toFixed(2)} zł</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-[#e7e5e4] flex justify-between items-center text-lg">
          <span className="font-bold text-[#78716c]">Razem (produkty):</span>
          <span className="font-bold text-[#5c6b50]">{total.toFixed(2)} zł</span>
        </div>
        <p className="text-xs text-[#a8a29e] mt-2 text-right">* Do kwoty zostanie doliczony wybrany koszt dostawy.</p>
      </div>

      <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-[#57534e] text-white rounded-xl font-medium hover:bg-[#44403c] transition-all shadow-md">
        Wróć do sklepu
      </button>
    </div>
  );
});

const BestsellerSlider = memo(({ products, onProductClick, addToCart }) => {
  const scrollRef = useRef(null);
   
  const bestsellers = useMemo(() => {
    const tagged = products.filter(p => p.tags && Array.isArray(p.tags) && p.tags.includes('bestseller'));
    return tagged.length > 0 ? tagged : products.slice(0, 5); 
  }, [products]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 320; 
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (bestsellers.length === 0) return null;

  return (
    <div className="relative group/slider">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-2xl font-bold text-[#44403c]">Bestsellery</h3>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 rounded-full border border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#44403c] transition-colors"><Icons.ChevronLeft className="w-5 h-5"/></button>
          <button onClick={() => scroll('right')} className="p-2 rounded-full border border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#44403c] transition-colors"><Icons.ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>
       
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 snap-x scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {bestsellers.map(product => (
          <div 
            key={product.id} 
            className="flex-shrink-0 w-72 bg-white rounded-2xl border border-[#e5e5e0] snap-start hover:shadow-xl transition-all duration-300 group/card cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            <div className="h-48 overflow-hidden rounded-t-2xl bg-[#fafaf9] relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="eager" />
              <div className="absolute top-3 left-3 bg-[#5c6b50] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                Top
              </div>
            </div>
            <div className="p-5">
              <p className="text-[#5c6b50] text-[10px] font-bold uppercase tracking-widest mb-1">{product.latin}</p>
              <h4 className="font-bold text-lg text-[#44403c] mb-2 line-clamp-1">{product.name}</h4>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xl font-bold text-[#44403c]">{product.price.toFixed(2)} zł</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    addToCart(product);
                  }}
                  className="w-8 h-8 rounded-full bg-[#f5f5f4] flex items-center justify-center text-[#44403c] group-hover/card:bg-[#57534e] group-hover/card:text-white transition-colors"
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

// --- KOMPONENT: TRAVEL GALLERY (DWA RZĘDY, UNIKALNE, DELTA TIME ANIMATION) ---
const TravelGallery = memo(({ navigateTo }) => {
  const [isHovered, setIsHovered] = useState(false);
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const pos1 = useRef(0);
  const pos2 = useRef(0);

  // Pełna lista zdjęć
  const allPhotos = [
    { id: 1, src: "/zdjecia/cypr.jpg", location: "Cypr", desc: "Tarantula w naturze", width: "w-72" },
    { id: 2, src: "/zdjecia/madera.jpg", location: "Madera", desc: "Madera", width: "w-96" },
    { id: 3, src: "/zdjecia/hiszpania.JPG", location: "Hiszpania", desc: "Barcelona", width: "w-64" },
    { id: 4, src: "/zdjecia/maroko.jpg", location: "Maroko", desc: "Marrakesz", width: "w-80" },
    { id: 5, src: "/zdjecia/rzym.jpg", location: "Włochy", desc: "Sycylia", width: "w-[400px]" },
    { id: 6, src: "/zdjecia/saloniki.jpg", location: "Grecja", desc: "Saloniki", width: "w-72" },
    { id: 7, src: "/zdjecia/malta.jpg", location: "Malta", desc: "Malta", width: "w-72" },
    { id: 8, src: "/zdjecia/ochryd.jpg", location: "Macedonia", desc: "Ochryd", width: "w-96" },
    { id: 9, src: "/zdjecia/szwecja.jpg", location: "Szwecja", desc: "Karlskrona", width: "w-64" },
    { id: 10, src: "/zdjecia/watykan.jpg", location: "Watykan", desc: "Watykan", width: "w-80" },
    { id: 11, src: "/zdjecia/nicea.jpg", location: "Francja", desc: "Nicea", width: "w-[400px]" },
    { id: 12, src: "/zdjecia/monako.jpg", location: "Monako", desc: "Monako", width: "w-72" },
    { id: 13, src: "/zdjecia/zadar.jpg", location: "Chorwacja", desc: "Zadar", width: "w-96" },
    { id: 14, src: "/zdjecia/austria.jpg", location: "Austria", desc: "Villach", width: "w-64" },
    { id: 15, src: "/zdjecia/jordania.jpg", location: "Jordania", desc: "Wadi Musa", width: "w-[400px]" },
  ];

  // Dzielimy na dwie unikalne grupy
  const half = Math.ceil(allPhotos.length / 2);
  const group1 = allPhotos.slice(0, half);
  const group2 = allPhotos.slice(half);

  // Powielamy grupy x4, aby stworzyć długi, płynny pasek (pętla)
  const row1 = [...group1, ...group1, ...group1, ...group1];
  const row2 = [...group2, ...group2, ...group2, ...group2];

  useEffect(() => {
    let rAFId;
    let lastTime = performance.now();
    
    const animate = (time) => {
        const dt = time - lastTime;
        lastTime = time;

        // Prędkość w pikselach na milisekundę. 
        // 0.012 px/ms to około 0.2px na klatkę (płynny powolny ruch)
        // 0.003 px/ms to slow motion na hover
        const speed1 = isHovered ? 0.02 : 0.03; 
        const speed2 = speed1 * 0.8;

        if (row1Ref.current) {
            pos1.current += dt * speed1;
            // Resetujemy gdy przesuniemy się o długość jednego zestawu (1/4 całości bo powieliliśmy 4 razy)
            const max1 = row1Ref.current.scrollWidth / 4;
            if (pos1.current >= max1) pos1.current %= max1; // Używamy modulo żeby pętla była bezstratna
            row1Ref.current.style.transform = `translateX(-${pos1.current}px)`;
        }

        if (row2Ref.current) {
            pos2.current += dt * speed2; 
            const max2 = row2Ref.current.scrollWidth / 4;
            if (pos2.current >= max2) pos2.current %= max2;
            row2Ref.current.style.transform = `translateX(-${pos2.current}px)`;
        }

        rAFId = requestAnimationFrame(animate);
    };

    rAFId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rAFId);
  }, [isHovered]);

  return (
    <section className="py-16 overflow-hidden bg-[#faf9f6]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onTouchStart={() => setIsHovered(true)}>
      <div className="max-w-7xl mx-auto px-6 mb-10">
         <div className="flex items-center gap-2 mb-2 text-[#5c6b50]">
            <Icons.Camera className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Ekspedycje</span>
         </div>
         <h3 className="text-3xl md:text-4xl font-bold text-[#44403c]">Z Dziennika Podróży</h3>
         <p className="text-[#78716c] text-sm mt-2">A oto kraje, które już odwiedziłem</p>
      </div>

      <div className="space-y-8">
        {/* RZĄD 1 - Unikalne zdjęcia (grupa 1) */}
        <div className="w-full overflow-hidden">
           <div ref={row1Ref} className="flex gap-6 w-max will-change-transform">
              {row1.map((item, i) => (
                 <div key={`r1-${i}`} className={`relative h-80 rounded-3xl overflow-hidden shrink-0 border border-[#e5e5e0] shadow-sm cursor-pointer ${item.width}`}>
                   <img src={item.src} alt={item.location} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" loading="lazy" />
                   <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#44403c] shadow-sm">
                      {item.location}
                   </div>
                 </div>
              ))}
           </div>
        </div>

        {/* RZĄD 2 - Unikalne zdjęcia (grupa 2) */}
        <div className="w-full overflow-hidden">
           <div ref={row2Ref} className="flex gap-6 w-max will-change-transform">
              {row2.map((item, i) => (
                 <div key={`r2-${i}`} className={`relative h-80 rounded-3xl overflow-hidden shrink-0 border border-[#e5e5e0] shadow-sm cursor-pointer ${item.width}`}>
                   <img src={item.src} alt={item.location} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" loading="lazy" />
                   <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#44403c] shadow-sm">
                      {item.location}
                   </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </section>
  );
});

const ProductDetailsView = memo(({ product, onBack, onAddToCart, allProducts }) => {
  const isSoldOut = product.tags && product.tags.includes('sold_out');

  const [selectedVariant, setSelectedVariant] = useState(
    (product.variants && product.variants.length > 0) ? product.variants[0] : null
  );

  useEffect(() => {
    if(product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
    } else {
        setSelectedVariant(null);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (isSoldOut) return;

    if (selectedVariant) {
      const variantProduct = {
        id: `${product.id}-${selectedVariant.id}`, 
        name: `${product.name} - ${selectedVariant.name}`,
        price: selectedVariant.price,
        image: product.image,
        latin: product.latin,
        stripeId: selectedVariant.stripeId,
        originalId: product.id,
        // PRZEKAZUJEMY TYP PRODUKTU!
        type: product.type 
      };
      onAddToCart(variantProduct);
    } else {
      const cleanProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        latin: product.latin,
        // PRZEKAZUJEMY TYP PRODUKTU!
        type: product.type
      };
      onAddToCart(cleanProduct);
    }
  };

  const relatedProducts = useMemo(() => {
    if (!allProducts) return [];
    if (product.type === 'spider') {
      return allProducts.filter(p => p.type === 'gear').slice(0, 3);
    } else {
      return allProducts.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    }
  }, [product, allProducts]);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const showVariantSelector = product.variants && product.variants.length > 1;

  return (
    <div className="animate-fade-in space-y-12">
      <div className="bg-white rounded-3xl border border-[#e5e5e0] p-6 md:p-12 shadow-sm max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-[#78716c] hover:text-[#44403c] mb-8 font-medium transition-colors">
          <Icons.ArrowLeft className="w-5 h-5" /> Wróć do sklepu
        </button>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <div className="aspect-square rounded-3xl overflow-hidden bg-[#fafaf9] shadow-sm border border-[#e7e5e4] relative">
              <img src={product.image} alt={product.name} className={`w-full h-full object-cover ${isSoldOut ? 'grayscale opacity-70' : ''}`} loading="eager" />
              
              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="bg-[#44403c] text-white px-6 py-2 rounded-xl font-bold text-lg shadow-lg rotate-[-5deg] border-2 border-white">
                        WYPRZEDANE
                    </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col">
            <div>
              <p className="text-[#5c6b50] font-bold uppercase tracking-widest text-xs mb-2">{product.latin}</p>
              <h2 className="text-4xl font-bold text-[#44403c] mb-4 leading-tight">{product.name}</h2>
              <p className="text-2xl font-semibold text-[#57534e] mb-6 animate-fade-in" key={currentPrice}>
                {currentPrice.toFixed(2)} PLN
              </p>
               
              <div className="prose prose-stone text-[#78716c] mb-8 leading-relaxed">
                <p>{product.desc || "Brak szczegółowego opisu dla tego produktu."}</p>
              </div>

              {showVariantSelector && (
                <div className={`mb-8 p-4 bg-[#fafaf9] rounded-2xl border border-[#e7e5e4] ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#a8a29e] mb-3">Wybierz wersję:</p>
                  <div className="space-y-3">
                    {product.variants.map((variant) => (
                      <div 
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex justify-between items-center p-4 rounded-xl cursor-pointer border-2 transition-all ${
                          selectedVariant && selectedVariant.id === variant.id 
                            ? 'border-[#5c6b50] bg-white shadow-md' 
                            : 'border-transparent bg-white hover:border-[#e7e5e4]'
                        }`}
                      >
                        <div>
                          <p className={`font-bold text-sm ${selectedVariant && selectedVariant.id === variant.id ? 'text-[#5c6b50]' : 'text-[#44403c]'}`}>
                            {variant.name}
                          </p>
                          <p className="text-xs text-[#78716c]">{variant.desc}</p>
                        </div>
                        <span className="font-bold text-[#44403c]">{variant.price.toFixed(2)} zł</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2 text-sm text-[#78716c]">
                 <p>
                    <span className="font-semibold text-[#44403c]">Dostępność:</span>{' '}
                    {isSoldOut ? <span className="text-red-600 font-bold">Wyprzedane</span> : <span className="text-emerald-600">W magazynie</span>}
                 </p>
                 <p><span className="font-semibold text-[#44403c]">Wysyłka:</span> 24h (Dni robocze)</p>
              </div>
            </div>
             
            <div className="mt-auto pt-8 border-t border-[#e5e5e0]">
              <button 
                onClick={handleAddToCart} 
                disabled={isSoldOut}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.98] ${
                    isSoldOut 
                    ? 'bg-[#e7e5e4] text-[#a8a29e] cursor-not-allowed shadow-none' 
                    : 'bg-[#57534e] text-white hover:bg-[#44403c]'
                }`}
              >
                {isSoldOut ? (
                    'Produkt niedostępny'
                ) : (
                    <>
                        <Icons.Plus className="w-6 h-6" /> 
                        {showVariantSelector ? `Dodaj wariant ${selectedVariant ? selectedVariant.name : ''}` : 'Dodaj do koszyka'}
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto">
           <h3 className="text-2xl font-bold text-[#44403c] mb-6 px-2">Warto dokupić</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map(rp => (
                <div key={rp.id} className="bg-white rounded-2xl border border-[#e5e5e0] p-4 flex flex-col hover:border-[#d6d3d1] transition-all shadow-sm hover:shadow-md">
                   <div className="h-40 bg-[#fafaf9] rounded-xl overflow-hidden mb-4 relative">
                      <img src={rp.image} alt={rp.name} className="w-full h-full object-cover" loading="lazy" decoding="async"/>
                      <button onClick={() => onAddToCart(rp)} className="absolute bottom-2 right-2 bg-white p-2 rounded-lg shadow-sm text-[#44403c] hover:bg-[#57534e] hover:text-white transition-colors">
                        <Icons.Plus className="w-5 h-5" />
                      </button>
                   </div>
                   <h4 className="font-bold text-[#44403c] text-sm mb-1">{rp.name}</h4>
                   <p className="text-[#a8a29e] text-xs line-clamp-1 mb-2">{rp.desc}</p>
                   <p className="text-[#5c6b50] font-bold text-sm mt-auto">{rp.price.toFixed(2)} PLN</p>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
});

// --- HomeView ---
const HomeView = memo(({ navigateTo, products, onProductClick, addToCart }) => (
  <div className="animate-fade-in space-y-16 pb-12">
    <div className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl border border-[#e7e5e4] ${HERO_IMAGE_URL ? '' : 'bg-[#fafaf9]'}`}>
      {HERO_IMAGE_URL ? (
        <>
          <img src={HERO_IMAGE_URL} alt="Background" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-[#faf9f6]/50 backdrop-blur-s"></div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5f5f4] via-[#faf9f6] to-[#e6e5d8]/30"></div>
      )}

      <div className="text-center px-4 max-w-4xl mx-auto relative z-10">
        <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[#f0f0eb] rounded-full border border-[#e6e5e4] shadow-sm">
          Nowości już dostępne!
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-[#44403c] mb-8 leading-[1.1] tracking-tight">
          Terrarystyka i podróże <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5c6b50] to-[#4a5740]">w jednym</span>
        </h1>
        <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed font-bold"> Spiderra to Twoje okno na świat terrarystyki. Wyselekcjonowane gatunki i profesjonalny sprzęt w zasięgu ręki. </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigateTo('shop')} className="px-10 py-4 bg-[#57534e] text-white rounded-xl font-semibold hover:bg-[#44403c] transition-all shadow-lg active:scale-95"> Przejdź do Sklepu </button>
          <button onClick={() => navigateTo('stream')} className="px-10 py-4 bg-white border border-[#d6d3d1] text-[#57534e] rounded-xl font-semibold hover:border-[#a8a29e] hover:text-[#292524] transition-all shadow-sm hover:shadow-md"> Oglądaj Live </button>
        </div>
      </div>
    </div>

    {/* Sekcja Bestsellerów */}
    <section className="max-w-7xl mx-auto px-2">
       <BestsellerSlider products={products} onProductClick={onProductClick} addToCart={addToCart} />
    </section>

    {/* Sekcja Podróży */}
    <TravelGallery navigateTo={navigateTo} />
  </div>
));

// --- ShopView ---
const ShopView = memo(({ addToCart, products, loading, onProductClick }) => {
  const [category, setCategory] = useState('spider'); // Domyślnie ptaszniki
  const [selectedTags, setSelectedTags] = useState([]); 
  const [minPrice, setMinPrice] = useState(0); 
  const [maxPrice, setMaxPrice] = useState(1000); 
  const [sortOrder, setSortOrder] = useState('az'); // Domyślnie alfabetycznie
  const [currentPage, setCurrentPage] = useState(1); 
  
  const [localMinPrice, setLocalMinPrice] = useState(0);
  const [localMaxPrice, setLocalMaxPrice] = useState(1000);

  const ITEMS_PER_PAGE = 9;

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSelectedTags([]);
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev => {
        if (tagId === 'all') return [];
        if (prev.includes(tagId)) {
            return prev.filter(t => t !== tagId);
        } else {
            return [...prev, tagId];
        }
    });
  };

  const productsMaxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  useEffect(() => {
    if (products.length > 0) {
        setMaxPrice(productsMaxPrice);
        setLocalMaxPrice(productsMaxPrice);
    }
  }, [productsMaxPrice, products]);

  useEffect(() => {
    const handler = setTimeout(() => {
        setMinPrice(localMinPrice);
        setMaxPrice(localMaxPrice);
    }, 300);

    return () => clearTimeout(handler);
  }, [localMinPrice, localMaxPrice]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, selectedTags, minPrice, maxPrice, sortOrder]);

  const filtered = useMemo(() => {
    let result = products;

    if (category !== 'all') {
      result = result.filter(p => p.type === category);
    }

    if (selectedTags.length > 0) {
       const categoryDef = PRODUCT_CATEGORIES.find(c => c.id === category);
       if (categoryDef && categoryDef.filterGroups) {
         result = result.filter(p => {
            return categoryDef.filterGroups.every(group => {
                const selectedInGroup = group.tags
                  .map(t => t.id)
                  .filter(id => selectedTags.includes(id));
                 
                if (selectedInGroup.length === 0) return true;
                return p.tags && Array.isArray(p.tags) && selectedInGroup.some(tag => p.tags.includes(tag));
            });
         });
       }
    }

    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    if (sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'az') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'za') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [category, selectedTags, minPrice, maxPrice, sortOrder, products]);

  const currentFilterGroups = useMemo(() => {
    const selectedCat = PRODUCT_CATEGORIES.find(c => c.id === category);
    return selectedCat ? (selectedCat.filterGroups || []) : [];
  }, [category]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="animate-fade-in">
       
      <style>{`
        .range-slider-container { position: relative; width: 100%; height: 24px; }
        .range-slider-input {
            position: absolute; pointer-events: none; -webkit-appearance: none;
            z-index: 20; height: 100%; width: 100%; opacity: 0; cursor: pointer;
        }
        .range-slider-input::-webkit-slider-thumb {
            pointer-events: all; width: 24px; height: 24px; -webkit-appearance: none; cursor: pointer;
        }
        .range-thumb {
            position: absolute; top: 50%; transform: translate(-50%, -50%);
            width: 16px; height: 16px; border-radius: 50%; background: #57534e;
            pointer-events: none; z-index: 30; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .range-track {
            position: absolute; top: 50%; transform: translateY(-50%);
            width: 100%; height: 4px; background: #e7e5e4; border-radius: 99px; z-index: 10;
        }
        .range-track-active {
            position: absolute; top: 50%; transform: translateY(-50%);
            height: 4px; background: #5c6b50; z-index: 15;
        }
      `}</style>

      {/* Panel Filtrów */}
      <div className="mb-10 bg-white p-6 rounded-2xl border border-[#e5e5e0] shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
            <div className="flex flex-wrap gap-3">
              {PRODUCT_CATEGORIES.map(f => (
                <button 
                  key={f.id} 
                  onClick={() => handleCategoryChange(f.id)} 
                  className={`px-6 py-2 rounded-xl font-medium text-sm transition-all border ${category === f.id ? 'bg-[#57534e] text-white border-[#57534e] shadow-md' : 'bg-[#fafaf9] text-[#78716c] border-[#e7e5e4] hover:bg-[#e7e5e4] hover:text-[#44403c]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto items-center">
              <div className="flex flex-col gap-2 min-w-[240px] w-full sm:w-auto">
                <div className="flex justify-between text-xs text-[#78716c] font-medium font-mono">
                    <span>{localMinPrice} zł</span>
                    <span>{localMaxPrice} zł</span>
                </div>
                <div className="range-slider-container">
                    <div className="range-track"></div>
                    <div 
                      className="range-track-active"
                      style={{
                          left: `${(localMinPrice / productsMaxPrice) * 100}%`,
                          width: `${((localMaxPrice - localMinPrice) / productsMaxPrice) * 100}%`
                      }}
                    ></div>
                    <div className="range-thumb" style={{ left: `${(localMinPrice / productsMaxPrice) * 100}%` }}></div>
                    <div className="range-thumb" style={{ left: `${(localMaxPrice / productsMaxPrice) * 100}%` }}></div>
                    <input 
                      type="range" min="0" max={productsMaxPrice} step="1"
                      value={localMinPrice} 
                      onChange={(e) => { const val = Math.min(Number(e.target.value), localMaxPrice - 10); setLocalMinPrice(val); }}
                      className="range-slider-input"
                    />
                    <input 
                      type="range" min="0" max={productsMaxPrice} step="1"
                      value={localMaxPrice} 
                      onChange={(e) => { const val = Math.max(Number(e.target.value), localMinPrice + 10); setLocalMaxPrice(val); }}
                      className="range-slider-input"
                    />
                </div>
              </div>

              <div className="relative min-w-[160px] w-full sm:w-auto">
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-2.5 pr-8 rounded-xl border border-[#e7e5e4] text-sm focus:outline-none focus:ring-1 focus:ring-[#5c6b50] bg-[#fafaf9] text-[#44403c] appearance-none cursor-pointer"
                >
                  <option value="default">Domyślnie</option>
                  <option value="asc">Cena: Rosnąco</option>
                  <option value="desc">Cena: Malejąco</option>
                  <option value="az">Nazwa: A-Z</option>
                  <option value="za">Nazwa: Z-A</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#78716c]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {currentFilterGroups.length > 0 && (
              <div className="pt-6 border-t border-[#e5e5e0] grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {currentFilterGroups.map((group, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#a8a29e] mb-1">{group.label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map(tag => (
                        <button 
                          key={tag.id} 
                          onClick={() => toggleTag(tag.id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border ${selectedTags.includes(tag.id) ? 'bg-[#5c6b50] text-white border-[#5c6b50] shadow-md' : 'bg-[#f5f5f4] text-[#78716c] border-[#e7e5e4] hover:bg-[#e7e5e4] hover:text-[#44403c]'}`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative min-h-[300px]">
        {loading && products.length === MOCK_PRODUCTS_DATA.length ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-2xl">
            <Icons.Loader className="w-10 h-10 text-[#5c6b50] opacity-80" />
            <p className="mt-4 text-[#78716c] font-medium text-sm tracking-wide uppercase">Odświeżanie oferty...</p>
          </div>
        ) : null}

        {paginatedProducts.length === 0 ? (
          <div className="col-span-full text-center py-20 text-[#a8a29e]">
            <p className="text-lg">Nie znaleziono produktów spełniających kryteria.</p>
            <button onClick={() => { setCategory('all'); setSelectedTags([]); }} className="mt-4 text-[#5c6b50] font-bold hover:underline">Wyczyść filtry</button>
          </div>
        ) : (
          paginatedProducts.map(p => {
            const isSoldOutList = p.tags && p.tags.includes('sold_out');
            
            return (
                <div key={p.id} className="bg-white rounded-2xl border border-[#e5e5e0] hover:border-[#d6d3d1] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                  <div 
                    className="overflow-hidden h-64 cursor-pointer bg-[#fafaf9] relative" 
                    onClick={() => onProductClick(p)}
                  >
                    <img src={p.image} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out ${isSoldOutList ? 'grayscale opacity-70' : ''}`} alt={p.name} loading="lazy" decoding="async"/>
                    
                    {isSoldOutList && (
                        <div className="absolute top-3 right-3 bg-[#44403c] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm border border-white">
                            Wyprzedane
                        </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                      <p className="text-[#5c6b50] text-[10px] font-bold uppercase tracking-widest mb-1">{p.latin}</p>
                      <h3 className="font-bold text-lg text-[#44403c] cursor-pointer hover:text-[#5c6b50] transition-colors mb-2" onClick={() => onProductClick(p)}>{p.name}</h3>
                      <p className="text-[#78716c] text-sm mb-6 line-clamp-2 leading-relaxed">{p.desc}</p>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#e5e5e0]">
                      <span className="text-xl font-bold text-[#44403c]">{p.price.toFixed(2)} <span className="text-sm font-normal text-[#a8a29e]">PLN</span></span>
                      
                      <button 
                        onClick={(e) => { if(!isSoldOutList) addToCart(p); }} 
                        disabled={isSoldOutList}
                        className={`p-3 rounded-xl transition-colors active:scale-95 ${isSoldOutList ? 'bg-[#e7e5e4] text-[#a8a29e] cursor-not-allowed' : 'bg-[#f5f5f4] text-[#44403c] hover:bg-[#57534e] hover:text-white'}`}
                      >
                        <Icons.Plus/>
                      </button>
                      </div>
                  </div>
                </div>
            );
          })
        )}
      </div>

      {/* Kontrolki paginacji */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
            <button
                onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#44403c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <Icons.ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${currentPage === page ? 'bg-[#57534e] text-white shadow-md' : 'bg-white border border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#44403c]'}`}
                  >
                    {page}
                  </button>
            ))}

            <button
                onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#44403c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <Icons.ChevronRight className="w-5 h-5" />
            </button>
        </div>
      )}
    </div>
  );
});

// --- AboutView ---
const AboutView = memo(() => (
  <div className="animate-fade-in space-y-12">
    {/* Sekcja 1: Hero / Wstęp */}
    <div className="bg-white rounded-3xl border border-[#e5e5e0] overflow-hidden shadow-sm">
       <div className="flex flex-col md:flex-row">
          {/* Zdjęcie */}
          <div className="w-full md:w-1/2 relative bg-[#f5f5f4] min-h-[400px]">
             <img src="/zdjecia/arek.png" alt="Arkadiusz Kołacki" className="absolute inset-0 w-full h-full object-cover" />
             {/* Gradient dla lepszej czytelności na mobile */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
          </div>
          {/* Tekst */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
             <span className="text-[#5c6b50] font-bold tracking-widest uppercase text-xs mb-4">O mnie</span>
             <h2 className="text-4xl font-bold text-[#44403c] mb-6 leading-tight">Cześć, jestem Arek.</h2>
             <p className="text-[#78716c] leading-relaxed mb-6">
                Moja przygoda z terrarystyką zaczęła się w 2020 roku od małej Chromki. To właśnie od niej wszystko się zaczęło. Z czasem, gdy gatunków przybywało narodziła się myśl: „Ciekawe, jak one żyją w naturze?”.
                To właśnie ta myśl sprawiła, że spakowałem plecak i ruszyłem w świat. Moje podróże szybko stały się czymś więcej niż tylko szukaniem pająków – to była droga do odkrywania najdalszych zakątków globu i przeżywania przygód, których nie da się zapomnieć.
             </p>
             <p className="text-[#78716c] leading-relaxed">
                Spiderra to połączenie moich hobby a jednocześnie iskra do tego, aby dzielić się z Wami energią, którą przywożę z każdej wyprawy. Dzięki, że jesteś częścią tej podróży!
             </p>
          </div>
       </div>
    </div>

    {/* Sekcja 2: Wartości (Grid) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {/* Karta 1 */}
       <div className="bg-[#fff] p-8 rounded-3xl border border-[#e5e5e0] shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-[#f0fdf4] rounded-xl flex items-center justify-center text-[#5c6b50] mb-4 group-hover:scale-110 transition-transform">
             <Icons.Bug className="w-6 h-6"/>
          </div>
          <h3 className="font-bold text-[#44403c] text-lg mb-2">Najciekawsze gatunki</h3>
          <p className="text-sm text-[#78716c] leading-relaxed">Spośród tysięcy gatunków wybrałem te, które wzbudzają zachywyt pod względem wyglądu, zachowania i wielu innych czynników</p>
       </div>
       {/* Karta 2 */}
       <div className="bg-[#fff] p-8 rounded-3xl border border-[#e5e5e0] shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-[#fff7ed] rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
             <Icons.Video className="w-6 h-6"/>
          </div>
          <h3 className="font-bold text-[#44403c] text-lg mb-2">Edukacja i Live</h3>
          <p className="text-sm text-[#78716c] leading-relaxed">Transmisje z wypraw i karmienia to nie tylko show, to dowód na to, jak fascynująca jest natura.</p>
       </div>
       {/* Karta 3 */}
       <div className="bg-[#fff] p-8 rounded-3xl border border-[#e5e5e0] shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-[#f0f9ff] rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
             <Icons.MessageCircle className="w-6 h-6"/>
          </div>
          <h3 className="font-bold text-[#44403c] text-lg mb-2">Wsparcie na Start</h3>
          <p className="text-sm text-[#78716c] leading-relaxed">Boisz się postawić pierwszy krok? Jestem tu, żeby pomóc. Dobierzemy gatunek idealny dla Ciebie.</p>
       </div>
    </div>

    {/* Sekcja 3: CTA / Kontakt */}
    <div className="bg-[#44403c] rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-lg">
       <div className="relative z-10 max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-4">Masz pytania?</h3>
          <p className="text-[#d6d3d1] mb-8 leading-relaxed">
             Niezależnie czy szukasz pierwszego pająka, potrzebujesz porady w doborze pojemnika hodowlanego, czy chcesz zapytać o dostępność – napisz śmiało.
          </p>
          <a href={`mailto:${COMPANY_DATA.email}`} className="inline-block bg-[#5c6b50] hover:bg-[#4a5740] text-white px-10 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-md">
             Napisz do mnie
          </a>
       </div>
       {/* Ozdobne kółka w tle */}
       <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
       <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#5c6b50]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </div>
  </div>
));

const StreamView = memo(() => (
  <div className="animate-fade-in">
    <div className="bg-[#292524] rounded-[2rem] overflow-hidden shadow-2xl border border-[#1c1917] max-w-5xl mx-auto text-[#d6d3d1]">
      <div className="p-6 md:p-10 flex flex-col gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-white text-xl font-bold tracking-wide uppercase">Spiderra Live</h2>
            </div>
          </div>
           
          <div className="aspect-video bg-black rounded-2xl relative flex items-center justify-center border border-[#44403c] group cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548858881-80590a5525bc?auto=format&fit=crop&w=1200&q=40')] bg-cover bg-center opacity-30 blur-sm group-hover:scale-105 transition-transform duration-700"></div>
            <div className="relative z-10 text-center">
               <div className="w-16 h-16 bg-[#5c6b50]/80 text-[#f5f5f0] rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto backdrop-blur-sm border border-[#4a5740]">
                  <Icons.Video className="w-8 h-8 fill-current ml-0.5" />
               </div>
               <p className="text-[#a8a29e] text-xs font-medium mt-2 tracking-widest uppercase">Łączenie z kamerą...</p>
            </div>
          </div>
           
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#44403c] p-0.5 border border-[#57534e]">
                <div className="w-full h-full rounded-[0.5rem] flex items-center justify-center overflow-hidden">
                   <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain opacity-80" />
                </div>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Następna transmisja...</p>
                <p className="text-[#a8a29e] text-xs">Jordania 08/02</p>
              </div>
            </div>
            <a href="https://kick.com/spiderra" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#44403c] text-[#e7e5e4] border border-[#57534e] px-6 py-3 rounded-xl font-bold text-xs hover:bg-[#57534e] transition-colors uppercase tracking-wider">
               <Icons.Kick className="w-4 h-4" /> Obserwuj na Kick
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const ShippingReturnsView = memo(() => (
  <div className="bg-white rounded-3xl border border-[#e5e5e0] p-8 md:p-16 animate-fade-in shadow-sm max-w-4xl mx-auto">
    <div className="flex items-center gap-4 mb-8 border-b border-[#e5e5e0] pb-6">
      <div className="p-3 bg-[#f5f5f0] rounded-xl text-[#5c6b50]"><Icons.Truck className="w-6 h-6" /></div>
      <h2 className="text-2xl font-bold text-[#44403c]">Wysyłka i Zwroty</h2>
    </div>
     
    <div className="prose prose-stone max-w-none text-[#78716c] leading-relaxed space-y-10 text-sm font-light">
      
      {/* --- SEKCJA 1: WYSYŁKA --- */}
      <section>
        <h3 className="font-bold text-[#44403c] text-lg mb-4">Wysyłka i Bezpieczeństwo</h3>
        <p>Dbam o to, aby każdy ptasznik dotarł do Ciebie w idealnej kondycji. Pakowanie zwierząt to moja specjalność.</p>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#fafaf9] p-4 rounded-xl border border-[#e7e5e4]">
                <h4 className="font-bold text-[#44403c] mb-1">Żywe Zwierzęta</h4>
                <p>Wysyłane wyłącznie <strong>od poniedziałku do środy</strong>. Dzięki temu mamy pewność, że paczka nie utknie w magazynie kurierskim przez weekend.</p>
            </div>
            <div className="bg-[#fafaf9] p-4 rounded-xl border border-[#e7e5e4]">
                <h4 className="font-bold text-[#44403c] mb-1">Akcesoria</h4>
                <p>Wysyłane od poniedziałku do piątku. Czas realizacji to zazwyczaj 24h.</p>
            </div>
        </div>

        <h4 className="font-bold text-[#44403c] mt-6 mb-2">Bezpieczne Pakowanie (Zima/Lato)</h4>
        <ul className="list-disc pl-5 space-y-1 marker:text-[#5c6b50]">
            <li><strong>Styrobox:</strong> Każde zwierzę pakowane jest w termiczne pudełko chroniące przed zmianami temperatury.</li>
            <li><strong>Heatpack (Ogrzewacz):</strong> W okresie jesienno-zimowym (gdy temp. spada poniżej 15°C) dokładam go do każdej paczki z pająkiem. Gwarantuje ciepło przez 40h-72h.</li>
        </ul>
      </section>

      {/* --- SEKCJA 2: LAG --- */}
      <section className="bg-[#f0fdf4] p-6 rounded-2xl border border-green-100">
        <h3 className="font-bold text-green-800 text-lg mb-2">Gwarancja LAG (Live Arrival Guarantee)</h3>
        <p className="text-green-700 mb-4">Biorę pełną odpowiedzialność za transport. Jeśli pająk dotrze martwy – zwracam pieniądze lub wysyłam nową sztukę na mój koszt.</p>
        
        <p className="font-bold text-green-800 text-xs uppercase tracking-wide mb-2">WARUNKI UZNANIA GWARANCJI:</p>
        <ol className="list-decimal pl-5 space-y-2 marker:text-green-600 text-green-800">
            <li>Odbiór paczki w dniu doręczenia.</li>
            <li><strong>Obowiązkowy film z otwierania paczki (Unboxing):</strong> Film musi być ciągły, bez cięć i pokazywać moment otwierania pudełka z pająkiem.</li>
            <li>Zgłoszenie reklamacji mailowo w ciągu 2 godzin od odbioru paczki.</li>
        </ol>
      </section>

      {/* --- SEKCJA 3: ZWROTY --- */}
      <section>
        <h3 className="font-bold text-[#44403c] text-lg mb-4">Zwroty (Odstąpienie od umowy)</h3>
        <ul className="list-disc pl-5 space-y-2 marker:text-[#5c6b50]">
            <li><strong>Akcesoria:</strong> Masz 14 dni na zwrot nieużywanego towaru bez podania przyczyny. Koszt odesłania ponosi Kupujący.</li>
            <li><strong>Żywe zwierzęta:</strong> Ze względu na specyfikę towaru (rzecz ulegająca szybkiemu zepsuciu) oraz ryzyko dla zdrowia zwierzęcia, <strong>nie przyjmuję zwrotów żywych pająków bez podania przyczyny</strong> (zgodnie z art. 38 pkt 4 ustawy o prawach konsumenta). Proszę o przemyślane zakupy!</li>
        </ul>
        <p className="mt-4 text-xs text-[#a8a29e]">Adres do zwrotów: {COMPANY_DATA.name}, ul. {COMPANY_DATA.address}, {COMPANY_DATA.zip} {COMPANY_DATA.city}</p>
      </section>

    </div>
  </div>
));

const TermsView = memo(() => (
  <div className="bg-white rounded-3xl border border-[#e5e5e0] p-8 md:p-16 animate-fade-in shadow-sm max-w-4xl mx-auto">
    <div className="flex items-center gap-4 mb-8 border-b border-[#e5e5e0] pb-6">
      <div className="p-3 bg-[#f5f5f0] rounded-xl text-[#5c6b50]"><Icons.FileText className="w-6 h-6" /></div>
      <h2 className="text-2xl font-bold text-[#44403c]">Regulamin Sklepu</h2>
    </div>
    <div className="prose prose-stone max-w-none text-[#78716c] leading-relaxed space-y-8 text-sm font-light">
      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">§ 1. Postanowienia ogólne</h3>
        <p>1. Sklep internetowy dostępny pod adresem internetowym www.spiderra.pl prowadzony jest przez Arkadiusza Kołackiego, prowadzącego działalność nierejestrowaną (zgodnie z art. 5 ust. 1 ustawy z dnia 6 marca 2018 r. – Prawo przedsiębiorców), z siedzibą: {COMPANY_DATA.address}, {COMPANY_DATA.zip} {COMPANY_DATA.city}.</p>
        <p>2. Kontakt ze Sprzedawcą możliwy jest pod adresem e-mail: {COMPANY_DATA.email}.</p>
        <p>3. Regulamin określa zasady zawierania umów sprzedaży za pośrednictwem sklepu, zasady wykonywania tych umów oraz prawa i obowiązki Sprzedawcy i Klienta.</p>
      </section>
       
      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">§ 2. Produkty i Ceny</h3>
        <ul className="list-disc pl-5 mt-1 space-y-1 marker:text-[#5c6b50]">
           <li>Produkty dostępne w sklepie są nowe (akcesoria) lub są żywymi zwierzętami (ptaszniki) pochodzącymi z legalnej hodowli.</li>
           <li>Sprzedawca oświadcza, że oferowane gatunki zwierząt są dopuszczone do obrotu na terenie Polski. W przypadku gatunków z listy CITES, do zakupu dołączany jest odpowiedni dokument potwierdzający urodzenie w niewoli.</li>
           <li>Ceny podane w sklepie są cenami brutto (zawierają wszystkie podatki). Sprzedawca korzysta ze zwolnienia z podatku VAT.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">§ 3. Płatności i Dostawa</h3>
        <p>1. Klient może wybrać następujące formy płatności: szybkie płatności online (BLIK, karta) obsługiwane przez operatora Stripe.</p>
        <p>2. Wysyłka towarów realizowana jest na terenie Polski.</p>
        <p>3. Wysyłka <strong>żywych zwierząt</strong> odbywa się wyłącznie od poniedziałku do środy.</p>
        <p>4. W przypadku skrajnych warunków atmosferycznych, Sprzedawca zastrzega sobie prawo do wstrzymania wysyłki.</p>
      </section>

      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">§ 4. Prawo odstąpienia od umowy (Zwroty)</h3>
        <p>1. Konsumentowi przysługuje prawo do odstąpienia od umowy w terminie 14 dni bez podania przyczyny, z zastrzeżeniem ust. 2.</p>
        <p>2. <strong>Wyłączenie prawa zwrotu:</strong> Zgodnie z art. 38 pkt 4 ustawy o prawach konsumenta, prawo odstąpienia od umowy zawartej na odległość <strong>nie przysługuje</strong> Konsumentowi w odniesieniu do umów, w której przedmiotem świadczenia jest rzecz ulegająca szybkiemu zepsuciu lub mająca krótki termin przydatności do użycia. Zapis ten dotyczy żywych zwierząt (ptaszników).</p>
      </section>

      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">§ 5. Reklamacje</h3>
        <p>Sprzedawca odpowiada wobec Klienta, jeżeli sprzedany produkt ma wadę fizyczną lub prawną. W przypadku żywych zwierząt stosuje się zasady LAG opisane w zakładce "Wysyłka i Zwroty".</p>
      </section>

    </div>
  </div>
));

const PrivacyView = memo(() => (
  <div className="bg-white rounded-3xl border border-[#e5e5e0] p-8 md:p-16 animate-fade-in shadow-sm max-w-4xl mx-auto">
    <div className="flex items-center gap-4 mb-8 border-b border-[#e5e5e0] pb-6">
      <div className="p-3 bg-[#f5f5f0] rounded-xl text-[#5c6b50]"><Icons.Lock className="w-6 h-6" /></div>
      <h2 className="text-2xl font-bold text-[#44403c]">Polityka Prywatności</h2>
    </div>
    <div className="prose prose-stone max-w-none text-[#78716c] leading-relaxed space-y-8 text-sm font-light">
      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">1. Administrator Danych</h3>
        <p>Administratorem Twoich danych osobowych jest {COMPANY_DATA.name}, z siedzibą w {COMPANY_DATA.city}, przy ul. {COMPANY_DATA.address}. Kontakt: {COMPANY_DATA.email}.</p>
      </section>

      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">2. Cel przetwarzania</h3>
        <p>Przetwarzamy Twoje dane (imię, nazwisko, adres, e-mail, telefon) wyłącznie w celu:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1 marker:text-[#5c6b50]">
           <li>Realizacji zamówienia i wysyłki towaru (art. 6 ust. 1 lit. b RODO).</li>
           <li>Obsługi płatności i ewentualnych reklamacji.</li>
           <li>Kontaktu w sprawie zamówienia.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">3. Odbiorcy danych</h3>
        <p>Twoje dane przekazujemy tylko podmiotom niezbędnym do realizacji zamówienia: operatorowi płatności (Stripe) oraz firmom kurierskim (Poczta Polska, InPost) w celu dostarczenia paczki.</p>
      </section>

      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">4. Pliki Cookies (Ciasteczka)</h3>
        <p>Nasza strona używa plików cookies w minimalnym zakresie. Nie stosujemy cookies śledzących ani marketingowych.</p>
        <p>Używamy wyłącznie <strong>niezbędnych plików cookies</strong>, które są wymagane do:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1 marker:text-[#5c6b50]">
           <li>Prawidłowego działania koszyka zakupowego.</li>
           <li>Bezpiecznej realizacji płatności przez Stripe.</li>
        </ul>
        <p className="mt-2">Zgodnie z Prawem Telekomunikacyjnym, korzystanie z niezbędnych plików cookies nie wymaga odrębnej zgody (banera), a jedynie tej informacji.</p>
      </section>

      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">5. Twoje prawa</h3>
        <p>Masz prawo do wglądu w swoje dane, ich poprawiania oraz żądania ich usunięcia (o ile nie kłóci się to z obowiązkiem przechowywania dokumentacji sprzedażowej).</p>
      </section>
    </div>
  </div>
));

// --- GŁÓWNA APLIKACJA ---
function AppContent() {
  const [activeView, setActiveView] = useState('home');
  // ZMIANA 1: Inicjalizujemy stan produktami z MOCK_PRODUCTS_DATA dla natychmiastowego renderu
  const [products, setProducts] = useState(MOCK_PRODUCTS_DATA);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTailwindReady, setIsTailwindReady] = useState(false);
  const [lastOrder, setLastOrder] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null);
   
  const { cart, setCart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast, hasLiveAnimals } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      const savedCart = localStorage.getItem('pendingCart');
      if (savedCart) {
        setLastOrder(JSON.parse(savedCart));
        localStorage.removeItem('pendingCart'); 
        setCart([]); 
        setActiveView('success'); 
        window.history.replaceState({}, document.title, window.location.pathname); 
      }
    } else if (params.get('canceled')) {
      showToast("Płatność została anulowana.", "error");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setCart, showToast]);

  useEffect(() => {
    const checkTailwind = () => {
      if (window.tailwind) {
        setIsTailwindReady(true);
      } else {
        const timeout = setTimeout(checkTailwind, 50);
        return () => clearTimeout(timeout);
      }
    };
     
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      script.onload = checkTailwind;
      document.head.appendChild(script);
    } else {
      checkTailwind();
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = isProduction ? `${API_URL}/get-products` : `${API_URL}/products`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error();
        let data = await res.json();
         
        // NORMALIZACJA DANYCH ZE STRIPE
        data = data.map(product => ({
            ...product,
            tags: typeof product.tags === 'string' ? product.tags.split(',').map(t => t.trim()) : (product.tags || []),
            type: product.type || 'spider', 
            latin: product.latin || '',
        }));

        // ZMIANA 2: Jeśli przyszły dane, nadpisujemy mocka
        if (data && data.length > 0) {
            setProducts(data);
        }
      } catch (e) {
        console.log("Ładowanie produktów ze Stripe nie powiodło się, używam danych testowych.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
     
    localStorage.setItem('pendingCart', JSON.stringify(cart));
     
    setCheckoutLoading(true);
    try {
      const endpoint = `${API_URL}/create-checkout-session`;
      console.log("Wysyłanie żądania do:", endpoint);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); 
        throw new Error(errorData.error || `Błąd serwera: ${res.status}`);
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Brak linku do płatności w odpowiedzi serwera.");
      }
    } catch (err) {
      console.error("Błąd płatności:", err);
      showToast(err.message || "Błąd płatności", "error");
      localStorage.removeItem('pendingCart'); 
    } finally {
      setCheckoutLoading(false);
    }
  };

  const navigate = useCallback((view) => {
    setActiveView(view);
    setSelectedProduct(null);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  if (!isTailwindReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#faf9f6' }}>
        <img src={LOGO_URL} alt="Spiderra" style={{ height: '80px', width: 'auto' }} />
        <div style={{ marginTop: '12px', color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>Ładowanie stylów...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f6] min-h-screen text-[#44403c] font-sans antialiased">
      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
       
      <nav className="fixed top-0 w-full bg-[#faf9f6]/90 backdrop-blur-md z-[80] border-b border-[#e7e5e4] h-20 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          <div className="cursor-pointer flex items-center" onClick={() => navigate('home')}>
            <img src={LOGO_URL} alt="Spiderra" className="h-14 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8 text-sm font-medium text-[#78716c]">
              <button onClick={() => navigate('home')} className={`transition-colors hover:text-[#44403c] ${activeView === 'home' ? 'text-[#44403c]' : ''}`}>Start</button>
              <button onClick={() => navigate('shop')} className={`transition-colors hover:text-[#44403c] ${activeView === 'shop' ? 'text-[#44403c]' : ''}`}>Sklep</button>
              <button onClick={() => navigate('stream')} className={`transition-colors hover:text-[#44403c] ${activeView === 'stream' ? 'text-[#44403c]' : ''}`}>Transmisja</button>
              <button onClick={() => navigate('about')} className={`transition-colors hover:text-[#44403c] ${activeView === 'about' ? 'text-[#44403c]' : ''}`}>O mnie</button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 rounded-full hover:bg-[#e7e5e4] transition-colors text-[#57534e]">
                <Icons.ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute top-0 right-0 bg-[#5c6b50] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white font-bold">{cartCount}</span>}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2.5 rounded-full hover:bg-[#e7e5e4] text-[#57534e]">
                <Icons.Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-[#faf9f6] pt-24 px-6 md:hidden animate-fade-in">
          <div className="flex flex-col gap-6 text-xl font-bold text-[#44403c]">
            <button onClick={() => navigate('home')} className="text-left">Start</button>
            <button onClick={() => navigate('shop')} className="text-left">Sklep</button>
            <button onClick={() => navigate('stream')} className="text-left">Transmisja</button>
            <button onClick={() => navigate('about')} className="text-left">O mnie</button>
            <div className="h-px bg-[#e7e5e4] w-full my-2"></div>
            <button onClick={() => navigate('shipping')} className="text-[#78716c] text-base text-left font-medium">Wysyłka i Zwroty</button>
            <button onClick={() => navigate('terms')} className="text-[#78716c] text-base text-left font-medium">Regulamin</button>
            <button onClick={() => navigate('privacy')} className="text-[#78716c] text-base text-left font-medium">Polityka Prywatności</button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 min-h-[85vh]">
        {activeView === 'home' && (
          <HomeView 
            navigateTo={navigate} 
            products={products} 
            onProductClick={openProductDetails} 
            addToCart={addToCart} 
          />
        )}
        {activeView === 'about' && <AboutView />}
        {activeView === 'stream' && <StreamView />}
        {activeView === 'terms' && <TermsView />}
        {activeView === 'privacy' && <PrivacyView />}
        {activeView === 'shipping' && <ShippingReturnsView />}
        {activeView === 'success' && <SuccessView lastOrder={lastOrder} />}
         
        {activeView === 'shop' && (
          selectedProduct ? (
            <ProductDetailsView 
              product={selectedProduct} 
              onBack={closeProductDetails} 
              onAddToCart={(p) => { addToCart(p); }} 
              allProducts={products}
            />
          ) : (
            <ShopView 
              addToCart={addToCart} 
              products={products} 
              loading={loading} 
              onProductClick={openProductDetails} 
            />
          )
        )}
      </main>

      {/* --- PRZYCISK SCROLL TO TOP --- */}
      <ScrollToTop />

      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#292524]/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-8 animate-fade-in no-scrollbar border-l border-[#e7e5e4]">
            <div className="flex justify-between items-center mb-8 border-b border-[#e7e5e4] pb-6">
              <h2 className="text-2xl font-bold text-[#44403c]">Twój Koszyk</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-[#f5f5f4] rounded-full hover:bg-[#e7e5e4] transition-colors text-[#78716c] hover:text-[#44403c]"><Icons.X/></button>
            </div>
            <div className="flex-1 overflow-auto no-scrollbar">
              {cart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Icons.ShoppingCart className="w-16 h-16 mb-4 text-[#d6d3d1]" />
                    <p className="font-medium uppercase tracking-widest text-xs text-[#a8a29e]">Twój koszyk jest pusty</p>
                 </div>
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-4 mb-6 bg-[#fafaf9] p-4 rounded-2xl border border-[#e7e5e4] hover:border-[#d6d3d1] transition-all">
                  <div className="w-20 h-20 bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0">
                     <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <p className="text-[#5c6b50] text-[10px] font-bold uppercase tracking-wide mb-1">{item.latin}</p>
                        <h4 className="font-bold text-[#44403c] text-sm leading-tight">{item.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-white border border-[#e7e5e4] rounded-lg flex items-center justify-center text-[#78716c] hover:text-[#44403c] hover:border-[#d6d3d1] transition-colors">-</button>
                      <span className="font-semibold text-sm text-[#44403c] w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-white border border-[#e7e5e4] rounded-lg flex items-center justify-center text-[#78716c] hover:text-[#44403c] hover:border-[#d6d3d1] transition-colors">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <button onClick={() => removeFromCart(item.id)} className="text-[#d6d3d1] hover:text-red-500 transition-colors p-1"><Icons.Trash2 className="w-4 h-4"/></button>
                    <span className="font-bold text-[#44403c] text-sm">{(item.price * item.qty).toFixed(2)} zł</span>
                  </div>
                </div>
              ))}
            </div>

            {/* --- SEKCJA PŁATNOŚCI W KOSZYKU --- */}
            <div className="pt-6 border-t border-[#e7e5e4] bg-white">
              {/* Informacja o wymuszonej wysyłce (tylko wizualna, backend blokuje resztę) */}
              {hasLiveAnimals && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mb-4 flex items-start gap-2">
                      <Icons.Bug className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                          <p className="font-bold">Twój koszyk zawiera żywe zwierzęta.</p>
                          <p>Dostępna będzie tylko bezpieczna wysyłka (Pocztex/Heatpack).</p>
                      </div>
                  </div>
              )}

              <div className="flex justify-between items-end mb-8">
                <span className="text-[#78716c] font-medium">Razem</span>
                <span className="text-2xl font-bold text-[#44403c]">{cartTotal.toFixed(2)} <span className="text-sm font-normal text-[#a8a29e]">PLN</span></span>
              </div>
              <button onClick={handleCheckout} disabled={checkoutLoading || cart.length === 0} className="w-full py-4 bg-[#57534e] text-white rounded-xl font-bold hover:bg-[#44403c] transition-all shadow-lg shadow-[#e7e5e4] disabled:opacity-50 disabled:shadow-none flex items-center justify-center">
                {checkoutLoading ? <Icons.Loader className="w-6 h-6" /> : "PRZEJDŹ DO PŁATNOŚCI"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stopka */}
      <footer className="bg-white border-t border-[#e7e5e4] pt-20 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="mb-6 flex items-center">
                <img src={LOGO_URL2} alt="Spiderra" className="h-40 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
              </div>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/sp_iderra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#f5f5f4] rounded-full flex items-center justify-center text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#44403c] transition-all"><Icons.Instagram className="w-5 h-5"/></a>
                <a href="https://www.tiktok.com/@spiderra26" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#f5f5f4] rounded-full flex items-center justify-center text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#44403c] transition-all"><Icons.TikTok className="w-5 h-5"/></a>
                <a href="https://kick.com/spiderra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#f5f5f4] rounded-full flex items-center justify-center text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#44403c] transition-all"><Icons.Kick className="w-5 h-5"/></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#44403c] uppercase tracking-widest text-xs mb-6">Sklep</h4>
              <ul className="space-y-4 text-sm font-medium text-[#78716c]">
                <li><button onClick={() => navigate('shop')} className="hover:text-[#44403c] text-left transition-colors">Ptaszniki</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-[#44403c] text-left transition-colors">Akcesoria</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-[#44403c] text-left transition-colors">Nowości</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#44403c] uppercase tracking-widest text-xs mb-6">Pomoc</h4>
              <ul className="space-y-4 text-sm font-medium text-[#78716c]">
                <li><button onClick={() => navigate('terms')} className="hover:text-[#44403c] text-left transition-colors">Regulamin</button></li>
                <li><button onClick={() => navigate('privacy')} className="hover:text-[#44403c] text-left transition-colors">Polityka Prywatności</button></li>
                <li><button onClick={() => navigate('shipping')} className="hover:text-[#44403c] text-left transition-colors">Wysyłka i Zwroty</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#44403c] uppercase tracking-widest text-xs mb-6">Kontakt</h4>
              <p className="text-sm font-medium text-[#78716c] mb-2">{COMPANY_DATA.email}</p>
              <p className="text-sm font-medium text-[#78716c] mb-6">{COMPANY_DATA.phone}</p>
              <div className="text-xs text-[#a8a29e] font-light leading-relaxed">
                  <p>{COMPANY_DATA.name}</p>
                  <p>ul. {COMPANY_DATA.address}</p>
                  <p>{COMPANY_DATA.zip} {COMPANY_DATA.city}</p>
              </div>
            </div>
          </div>
           
          <div className="pt-8 border-t border-[#e7e5e4] flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-[#d6d3d1] tracking-widest uppercase">
            <p>&copy; {new Date().getFullYear()} Spiderra ©. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>

      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#292524] text-white shadow-2xl'} rounded-full transition-all duration-500 flex items-center gap-3 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        {toast.type === 'success' ? <Icons.Check className="text-emerald-400 w-4 h-4" /> : <Icons.X className="w-4 h-4" />}
        <span className="font-medium text-sm tracking-wide">{toast.message}</span>
      </div>
    </div>
  );
}

// --- GŁÓWNY PUNKT WEJŚCIA (APP) ---
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}