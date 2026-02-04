const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // 1. Obsługa CORS (bez zmian)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { items } = JSON.parse(event.body);
    
    if (!items || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Koszyk jest pusty' }) };
    }

    const origin = event.headers.origin || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik'],
      
      // Wymuszenie języka polskiego w interfejsie płatności
      locale: 'pl',

      // --- DANE DO WYSYŁKI ---
      shipping_address_collection: {
        allowed_countries: ['PL'], 
      },
      phone_number_collection: {
        enabled: true,
      },
      // Zbieranie adresu do faktury (required wymusza pełny adres billingowy)
      billing_address_collection: 'required',

      // Automatyczne fakturowanie
      invoice_creation: {
        enabled: true,
      },

      // --- OPCJE DOSTAWY ---
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 2999, currency: 'pln' },
            display_name: 'Kurier Pocztex (żywe zwierzeta)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 2399, currency: 'pln' }, 
            display_name: 'Kurier Inpost',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ],
      
      // --- KLUCZOWA ZMIANA: OBSŁUGA WARIANTÓW (PRICE ID) ---
      line_items: items.map(item => {
        // SPRAWDZENIE: Czy przedmiot ma nadane ID ceny ze Stripe (np. wariant)?
        if (item.stripeId && item.stripeId.startsWith('price_')) {
            return {
                price: item.stripeId,
                quantity: item.qty,
            };
        } 
        
        // FALLBACK: Jeśli nie ma ID (np. zwykły produkt), tworzymy cenę dynamicznie
        return {
            price_data: {
              currency: 'pln',
              product_data: {
                name: item.name,
                images: item.image ? [item.image] : [],
                metadata: {
                    latin_name: item.latin || ''
                }
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.qty,
        };
      }),

      mode: 'payment',
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (e) {
    console.error("Stripe Error:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message || 'Wystąpił błąd podczas tworzenia sesji płatności.' }),
    };
  }
};