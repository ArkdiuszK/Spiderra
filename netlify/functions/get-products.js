const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Nagłówki CORS oraz CACHE-CONTROL (Ważne: blokuje cache przeglądarki, żebyś widział zmiany od razu)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'no-cache, no-store, must-revalidate', // Wymuś odświeżanie danych
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 1. Pobieramy wszystkie aktywne ceny wraz z danymi produktu
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
      expand: ['data.product']
    });

    // 2. Grupowanie cen według Produktów
    const productsMap = {};

    prices.data.forEach(price => {
      const product = price.product;

      // Pomijamy produkty zarchiwizowane lub nieaktywne
      if (!product || !product.active) return;

      // Jeśli tego produktu jeszcze nie ma w mapie, dodajemy go
      if (!productsMap[product.id]) {
        productsMap[product.id] = {
          id: product.id,
          name: product.name,
          latin: product.metadata.latin || '',
          type: product.metadata.type || 'gear',
          tags: product.metadata.tags ? product.metadata.tags.split(',') : [],
          image: product.images[0] || '',
          desc: product.description,
          price: 0,
          variants: []
        };
      }

      // 3. Dodajemy tę cenę jako wariant
      // Pobieramy nazwę z pola 'nickname' (Economy/Business), a jeśli puste - tworzymy nazwę z ceny
      const variantName = price.nickname || `Opcja ${price.unit_amount / 100} PLN`;
      
      const variant = {
        id: price.id,
        name: variantName,
        price: price.unit_amount / 100,
        desc: price.metadata.desc || '', // Opis wariantu z metadanych ceny (np. "Pojemnik + Torf")
        stripeId: price.id
      };

      productsMap[product.id].variants.push(variant);
    });

    // 4. Konwersja mapy na tablicę i sortowanie wariantów
    const productsArray = Object.values(productsMap).map(product => {
      // Sortujemy warianty po cenie (od najtańszego)
      product.variants.sort((a, b) => a.price - b.price);
      
      // Ustawiamy główną cenę produktu jako cenę najtańszego wariantu
      if (product.variants.length > 0) {
        product.price = product.variants[0].price;
      }
      
      return product;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(productsArray),
    };

  } catch (error) {
    console.error("Błąd pobierania produktów:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Nie udało się pobrać produktów ze Stripe' }),
    };
  }
};