import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

// ==========================================
// KONFIGURACJA
// ==========================================
// Wklej tutaj swój TAJNY KLUCZ (Secret Key) ze Stripe Dashboard (zaczyna się od sk_test_...)
const stripe = new Stripe('sk_test_sk_live_51SwMqODfONfuRrFZ3JNvsgH63BU5qvxz9zJSWQxFCLLxspvB1W6vnuYpad3T5fdaUBgIHmI8SZ58w0S1GTS6iATp00L7fGgeLD');

const app = express();

// Konfiguracja CORS i JSON
app.use(cors());
app.use(express.json());

// --- ENDPOINT 1: POBIERANIE PRODUKTÓW ZE STRIPE ---
app.get('/products', async (req, res) => {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    const formattedProducts = products.data.map(p => ({
      id: p.id,
      name: p.name,
      price: p.default_price ? p.default_price.unit_amount / 100 : 0,
      image: p.images[0] || 'https://placehold.co/400x300',
      latin: p.metadata.latin || '',
      desc: p.description
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("Błąd pobierania produktów:", error);
    // W razie błędu zwracamy pustą tablicę lub błąd, frontend sobie z tym poradzi (pokaże mock data)
    res.status(500).json({ error: 'Nie udało się pobrać produktów' });
  }
});

// --- ENDPOINT 2: TWORZENIE SESJI PŁATNOŚCI ---
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik'],
      line_items: req.body.items.map(item => ({
        price_data: {
          currency: 'pln',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      mode: 'payment',
      // Adres przekierowania po płatności (musi pasować do portu twojego Frontendu, np. 5173 lub 5176)
      success_url: 'http://localhost:5173/?success=true',
      cancel_url: 'http://localhost:5173/?canceled=true',
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("Błąd tworzenia sesji:", e);
    res.status(500).json({ error: e.message });
  }
});

// Uruchomienie serwera
app.listen(4242, () => console.log('✅ Serwer działa na porcie 4242! (Tryb ES Modules)'));