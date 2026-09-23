const KNOWLEDGE = {
  el: {
    greeting: 'Καλώς ήρθες στο NOIR CLUB. Πώς μπορώ να σε βοηθήσω; Μπορείς να με ρωτήσεις για κρατήσεις, τραπέζια, VIP, φιάλες, ποτά, μουσική ή τη λειτουργία του club.',
    reservation: 'Για να κάνεις κράτηση, χρησιμοποίησε την ενότητα «Reserve a Table» στην ιστοσελίδα. Η κράτηση είναι δωρεάν και δεν απαιτείται προκαταβολή.',
    reservation_process: 'Η κράτηση γίνεται εύκολα από την ενότητα «Reserve a Table». Θα χρειαστεί να συμπληρώσεις ημερομηνία, αριθμό ατόμων, επιλογή ποτών ή φιάλης και τα στοιχεία επικοινωνίας σου.',
    reservation_free: 'Ναι, οι κρατήσεις στο NOIR CLUB είναι δωρεάν και δεν απαιτείται προκαταβολή.',
    reservation_details: 'Για την κράτηση ζητούνται ημερομηνία, αριθμός ατόμων, επιλογή Drinks ή Bottle, αριθμός φιαλών όπου χρειάζεται, τύπος τραπεζιού, ονοματεπώνυμο, τηλέφωνο και email.',
    arrival: 'Το NOIR CLUB ανοίγει στις 23:30. Για κάθε κράτηση, η άφιξη πρέπει να γίνει έως τις 23:50.',
    availability: 'Η διαθεσιμότητα τραπεζιών δεν εμφανίζεται μέσα από τον Assistant. Για να προχωρήσεις, χρησιμοποίησε τη φόρμα «Reserve a Table».',
    bottles: 'Οι standard φιάλες ξεκινούν από €90, ενώ οι premium φτάνουν έως €150.',
    drinks: 'Οι τιμές των ποτών είναι €12–€15.',
    vip: 'Τα VIP τραπέζια απαιτούν 3+ φιάλες. Μπορείς να επιλέξεις VIP στην ενότητα «Reserve a Table».',
    bottle_count: 'Μπορείς να επιλέξεις 1, 2, 3 ή 4+ φιάλες στη διαδικασία κράτησης.',
    payment: 'Η πληρωμή γίνεται στο club με μετρητά ή κάρτα. Δεν απαιτείται προκαταβολή για την κράτηση.',
    music: 'Στο NOIR CLUB θα βρεις House, R&B, Hip-Hop, ελληνική και διεθνή μουσική, με DJ κάθε βράδυ.',
    location: 'Το NOIR CLUB βρίσκεται στη Θεσσαλονίκη, Ελλάδα.',
    experience: 'Το NOIR CLUB είναι ένα nightlife concept με online κρατήσεις, επιλογές τραπεζιών, VIP επιλογή και digital Assistant για άμεσες πληροφορίες.',
    vip_explain: 'Για VIP τραπέζι απαιτούνται τουλάχιστον 3 φιάλες. Η επιλογή VIP γίνεται μέσα από τη φόρμα κράτησης.',
    drinks_vs_bottle: 'Μπορείς να επιλέξεις είτε Drinks είτε Bottle κατά την κράτηση. Αν επιλέξεις Bottle, στη συνέχεια επιλέγεις τον αριθμό των φιαλών.',
    contact: 'Για πληροφορίες που δεν εμφανίζονται στο demo, καλέστε στο 6900000000.',
    unknown: 'Για τη συγκεκριμένη πληροφορία δεν έχω διαθέσιμα στοιχεία στο demo. Για περισσότερες πληροφορίες, καλέστε στο 6900000000.'
  },
  en: {
    greeting: 'Welcome to NOIR CLUB. How can I help you? You can ask me about reservations, tables, VIP, bottles, drinks, music or the club.',
    reservation: 'To make a reservation, use the “Reserve a Table” section on the website. Reservations are free and no deposit is required.',
    reservation_process: 'Reservations are made through the “Reserve a Table” section. You will select the date, number of guests, drinks or bottles, and provide your contact details.',
    reservation_free: 'Yes. Reservations at NOIR CLUB are free and no deposit is required.',
    reservation_details: 'The reservation form collects the date, number of guests, Drinks or Bottle selection, bottle count when applicable, table type, full name, phone and email.',
    arrival: 'NOIR CLUB opens at 23:30. For every reservation, guests must arrive by 23:50.',
    availability: 'Live table availability is not shown through the Assistant. To proceed, use the “Reserve a Table” form.',
    bottles: 'Standard bottles start from €90, while premium bottles go up to €150.',
    drinks: 'Drink prices are €12–€15.',
    vip: 'VIP tables require 3+ bottles. You can select VIP in the “Reserve a Table” section.',
    bottle_count: 'You can select 1, 2, 3 or 4+ bottles during the reservation process.',
    payment: 'Guests can pay at the club by cash or card. No reservation deposit is required.',
    music: 'NOIR CLUB plays House, R&B, Hip-Hop, Greek and international music, with a DJ every night.',
    location: 'NOIR CLUB is located in Thessaloniki, Greece.',
    experience: 'NOIR CLUB is a nightlife concept featuring online reservations, table options, VIP selection and a digital Assistant for instant information.',
    vip_explain: 'VIP tables require at least 3 bottles. The VIP option is selected during the reservation process.',
    drinks_vs_bottle: 'You can choose either Drinks or Bottle when making a reservation. If you choose Bottle, you can then select the number of bottles.',
    contact: 'For information not covered by the demo, please call 6900000000.',
    unknown: 'I do not have that information available in this demo. For more information, please call 6900000000.'
  }
};

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ς/g, 'σ')
    .trim();
}

function hasAny(text, terms) {
  return terms.some(term => text.includes(term));
}

function replyFor(message, language) {
  const text = normalize(message);
  const k = KNOWLEDGE[language === 'el' ? 'el' : 'en'];

  if (!text) return k.greeting;

  // 1. Greeting / small talk
  if (hasAny(text, ['γεια', 'καλησπερα', 'καλημερα', 'καληνυχτα', 'hello', 'hi', 'hey', 'good evening', 'good morning'])) {
    return k.greeting;
  }

  // 2. How to reserve / booking
  if (hasAny(text, ['πως κανω κρατηση', 'πως μπορω να κανω κρατηση', 'πως κλεινω', 'θελω να κλεισω', 'how do i book', 'how can i reserve', 'make a reservation', 'book a table'])) {
    return k.reservation_process;
  }

  // 3. Reservation cost / deposit
  if (hasAny(text, ['δωρεαν', 'κοστιζει η κρατηση', 'κοστος κρατηση', 'προκαταβολ', 'deposit', 'reservation fee', 'booking fee', 'free reservation'])) {
    return k.reservation_free;
  }

  // 4. Reservation form / required details
  if (hasAny(text, ['τι στοιχεια', 'τι χρειαζεται', 'τι χρειαζομαι', 'στοιχεια κρατηση', 'required details', 'what information', 'what do i need'])) {
    return k.reservation_details;
  }

  // 5. Availability / tonight
  if (hasAny(text, ['διαθεσιμο', 'διαθεσιμοτητα', 'ελευθερο τραπεζι', 'υπαρχει τραπεζι', 'available', 'availability', 'free table', 'available tonight', 'available today'])) {
    return k.availability;
  }

  // 6. Arrival / opening
  if (hasAny(text, ['τι ωρα ανοιγετε', 'ποτε ανοιγετε', 'ωραριο', 'τι ωρα πρεπει να ερθω', 'αφιξη', '23:30', '23:50', 'what time do you open', 'opening time', 'what time should i arrive', 'arrival time'])) {
    return k.arrival;
  }

  // 7. Bottle pricing — checked before generic price questions
  if (hasAny(text, ['φιαλη', 'φιαλεσ', 'μπουκαλι', 'μπουκαλια', 'bottle', 'bottles'])) {
    return k.bottles;
  }

  // 8. Drink pricing
  if (hasAny(text, ['ποτο', 'ποτα', 'drink', 'drinks'])) {
    return k.drinks;
  }

  // 9. Generic price / cost
  if (hasAny(text, ['τιμη', 'τιμεσ', 'ποσο κοστιζει', 'ποσο εχει', 'price', 'prices', 'how much', 'cost'])) {
    return k.drinks;
  }

  // 10. VIP
  if (hasAny(text, ['vip', 'βιπ'])) {
    return k.vip;
  }

  // 11. Bottle quantity
  if (hasAny(text, ['ποσεσ φιαλεσ', 'ποσα μπουκαλια', 'αριθμο φιαλων', 'number of bottles', 'how many bottles', '1 bottle', '2 bottles', '3 bottles', '4 bottles'])) {
    return k.bottle_count;
  }

  // 12. Drinks or bottle choice
  if (hasAny(text, ['drinks η bottle', 'drinks or bottle', 'ποτα η φιαλη', 'ποτο η φιαλη', 'τι να επιλεξω', 'what should i choose'])) {
    return k.drinks_vs_bottle;
  }

  // 13. Payment
  if (hasAny(text, ['πληρωμη', 'πληρωσω', 'μετρητα', 'καρτα', 'πληρωνω', 'payment', 'pay', 'cash', 'card'])) {
    return k.payment;
  }

  // 14. Music / genres / DJ
  if (hasAny(text, ['μουσικη', 'τι μουσικη', 'ειδος μουσικης', 'dj', 'house', 'r&b', 'hip hop', 'music', 'genre'])) {
    return k.music;
  }

  // 15. Location
  if (hasAny(text, ['που ειστε', 'που βρισκεστε', 'τοποθεσια', 'διευθυνση', 'που ειναι', 'where are you', 'location', 'address', 'where is the club'])) {
    return k.location;
  }

  // 16. What is the club / experience
  if (hasAny(text, ['τι ειναι το noir', 'τι ειναι το noιr', 'τι προσφερετε', 'τι εχει το club', 'what is noir', 'what do you offer', 'what is the club'])) {
    return k.experience;
  }

  // 17. Contact
  if (hasAny(text, ['τηλεφωνο', 'επικοινωνια', 'contact', 'phone', 'call'])) {
    return k.contact;
  }

  // 18. Reservation intent in natural language
  if (hasAny(text, ['κρατηση', 'κρατησω', 'κραταω', 'reservation', 'reserve', 'booking', 'book'])) {
    return k.reservation;
  }

  return k.unknown;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, language } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required.' });
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find(m => m && m.role === 'user' && typeof m.content === 'string');

    const selectedLanguage = language === 'el' ? 'el' : 'en';

    return res.status(200).json({
      message: replyFor(lastUserMessage?.content || '', selectedLanguage)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
