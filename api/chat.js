const KNOWLEDGE = {
  el: {
    greeting: 'Καλώς ήρθες στο NOIR CLUB. Πώς μπορώ να σε βοηθήσω; Μπορείς να με ρωτήσεις για κρατήσεις, τραπέζια, VIP, μπουκάλια ή ποτά.',
    reservation: 'Για κράτηση, χρησιμοποίησε την ενότητα «Reserve a Table» στην ιστοσελίδα. Η κράτηση είναι δωρεάν και δεν απαιτείται προκαταβολή.',
    bottles: 'Οι standard φιάλες ξεκινούν από €90, ενώ οι premium φτάνουν έως €150.',
    drinks: 'Οι τιμές των ποτών είναι €12–€15.',
    vip: 'Τα VIP τραπέζια απαιτούν 3+ φιάλες. Μπορείς να επιλέξεις VIP στην ενότητα «Reserve a Table».',
    hours: 'Το NOIR CLUB ανοίγει στις 23:30 και κάθε κράτηση πρέπει να έχει άφιξη έως τις 23:50.',
    payment: 'Η πληρωμή γίνεται στο club με μετρητά ή κάρτα.',
    music: 'Στο NOIR CLUB θα βρεις House, R&B, Hip-Hop, ελληνική και διεθνή μουσική, με DJ κάθε βράδυ.',
    unknown: 'Για τη συγκεκριμένη πληροφορία, καλέστε στο 6900000000.'
  },
  en: {
    greeting: 'Welcome to NOIR CLUB. How can I help you? You can ask me about reservations, tables, VIP, bottles or drinks.',
    reservation: 'To make a reservation, use the “Reserve a Table” section on the website. Reservations are free and no deposit is required.',
    bottles: 'Standard bottles start from €90, while premium bottles go up to €150.',
    drinks: 'Drink prices are €12–€15.',
    vip: 'VIP tables require 3+ bottles. You can select VIP in the “Reserve a Table” section.',
    hours: 'NOIR CLUB opens at 23:30 and every reservation must arrive by 23:50.',
    payment: 'Guests can pay at the club by cash or card.',
    music: 'NOIR CLUB plays House, R&B, Hip-Hop, Greek and international music, with a DJ every night.',
    unknown: 'For that information, please call 6900000000.'
  }
};

function replyFor(message, language) {
  const text = String(message || '').toLowerCase().trim();
  const k = KNOWLEDGE[language === 'el' ? 'el' : 'en'];

  if (!text) return k.greeting;
  if (text.includes('κράτ') || text.includes('κρατ') || text.includes('reservation') || text.includes('reserve') || text.includes('book') || text.includes('κλείσ')) return k.reservation;
  if (text.includes('vip') || text.includes('βιπ')) return k.vip;
  if (text.includes('φιάλ') || text.includes('μπουκ') || text.includes('bottle')) return k.bottles;
  if (text.includes('ποτό') || text.includes('ποτα') || text.includes('drink') || text.includes('price') || text.includes('τιμή') || text.includes('κοστ')) return k.drinks;
  if (text.includes('ώρα') || text.includes('ανοίγ') || text.includes('open') || text.includes('opening') || text.includes('23:30') || text.includes('23:50')) return k.hours;
  if (text.includes('πληρω') || text.includes('μετρητ') || text.includes('κάρτα') || text.includes('card') || text.includes('cash') || text.includes('pay')) return k.payment;
  if (text.includes('μουσικ') || text.includes('music') || text.includes('dj') || text.includes('genre')) return k.music;
  return k.unknown;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, language } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'Messages are required.' });

    const lastUserMessage = [...messages].reverse().find(m => m && m.role === 'user' && typeof m.content === 'string');
    const selectedLanguage = language === 'el' ? 'el' : 'en';

    return res.status(200).json({ message: replyFor(lastUserMessage?.content || '', selectedLanguage) });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
