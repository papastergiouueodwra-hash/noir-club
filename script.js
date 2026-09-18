const slides = [...document.querySelectorAll('.hero-slide')];
const dots = [...document.querySelectorAll('.dot')];
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');

let current = 0;
let timer;

function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === current);
    const video = slide.querySelector('video');
    if (video) {
      if (i === current) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  });
  dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
}

function getSlideDuration(index) {
  return index === 0 ? 4000 : 5000;
}

function restartTimer() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    showSlide(current + 1);
    restartTimer();
  }, getSlideDuration(current));
}

prev.addEventListener('click', () => {
  showSlide(current - 1);
  restartTimer();
});

next.addEventListener('click', () => {
  showSlide(current + 1);
  restartTimer();
});

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    showSlide(i);
    restartTimer();
  });
});

let touchStartX = 0;
document.querySelector('.hero').addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.querySelector('.hero').addEventListener('touchend', e => {
  const distance = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(distance) > 50) {
    showSlide(distance < 0 ? current + 1 : current - 1);
    restartTimer();
  }
}, { passive: true });

const reservationModal = document.querySelector('#reservationModal');
const startReservation = document.querySelector('#startReservation');
const reservationForm = document.querySelector('#reservationForm');
const reservationSuccess = document.querySelector('#reservationSuccess');
const reservationSuccessText = document.querySelector('#reservationSuccessText');
const reservationDate = reservationForm?.querySelector('input[name="date"]');
const drinkType = reservationForm?.querySelector('#drinkType');
const bottleCountField = reservationForm?.querySelector('#bottleCountField');
const bottleCount = reservationForm?.querySelector('#bottleCount');
const tableTypeField = reservationForm?.querySelector('#tableTypeField');
const tableType = reservationForm?.querySelector('#tableType');
const vipOption = reservationForm?.querySelector('#vipOption');
const vipNote = reservationForm?.querySelector('#vipNote');

function resetReservationView() {
  if (!reservationForm || !reservationSuccess) return;
  reservationForm.reset();
  reservationForm.hidden = false;
  reservationSuccess.hidden = true;
  updateBottleOptionsVisibility();
}

function updateBottleOptionsVisibility() {
  const bottleSelected = drinkType?.value === 'Bottle';
  const bottleValue = bottleCount?.value || '';
  const vipAllowed = ['3', '4+'].includes(bottleValue);

  if (bottleCountField) {
    bottleCountField.hidden = !bottleSelected;
    bottleCountField.style.display = bottleSelected ? '' : 'none';
    bottleCountField.setAttribute('aria-hidden', bottleSelected ? 'false' : 'true');
  }

  if (tableTypeField) {
    tableTypeField.hidden = !bottleSelected;
    tableTypeField.style.display = bottleSelected ? '' : 'none';
    tableTypeField.setAttribute('aria-hidden', bottleSelected ? 'false' : 'true');
  }

  if (bottleCount) {
    bottleCount.required = bottleSelected;
    if (!bottleSelected) bottleCount.value = '';
  }

  if (tableType) {
    tableType.required = bottleSelected;
    if (!bottleSelected) tableType.value = '';
  }

  if (vipOption) {
    vipOption.disabled = bottleSelected && !vipAllowed;
    if (vipAllowed) vipOption.disabled = false;
    if (!vipAllowed && tableType?.value === 'VIP') tableType.value = '';
  }

  if (vipNote) {
    vipNote.hidden = !bottleSelected || vipAllowed;
    vipNote.textContent = 'VIP tables require 3+ bottles.';
  }
}

drinkType?.addEventListener('change', updateBottleOptionsVisibility);
bottleCount?.addEventListener('change', updateBottleOptionsVisibility);

function openReservation() {
  resetReservationView();
  updateBottleOptionsVisibility();
  reservationModal.classList.add('open');
  reservationModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (reservationDate) {
    reservationDate.min = new Date().toISOString().split('T')[0];
  }
}

function closeReservation() {
  reservationModal.classList.remove('open');
  reservationModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  resetReservationView();
}

startReservation?.addEventListener('click', openReservation);

document.querySelectorAll('[data-close-reservation]').forEach(button => {
  button.addEventListener('click', closeReservation);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (reservationModal?.classList.contains('open')) closeReservation();
    if (assistantModal?.classList.contains('open')) closeAssistant();
  }
});

reservationForm?.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(reservationForm);
  const reservation = Object.fromEntries(formData.entries());
  reservation.createdAt = new Date().toISOString();

  const savedReservations = JSON.parse(localStorage.getItem('noirReservations') || '[]');
  savedReservations.push(reservation);
  localStorage.setItem('noirReservations', JSON.stringify(savedReservations));

  const formattedDate = new Date(reservation.date + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  reservationSuccessText.innerHTML =
    'Your table is reserved for ' + formattedDate + '.<br>' +
    'We look forward to welcoming you at <strong>23:30</strong>.<br>' +
    '<span>NOIR CLUB • 25 Mitropoleos Street, Thessaloniki</span>';

  reservationForm.hidden = true;
  reservationSuccess.hidden = false;
});

/* AI ASSISTANT */
const assistantModal = document.querySelector('#assistantModal');
const assistantChat = document.querySelector('#assistantChat');
const assistantForm = document.querySelector('#assistantForm');
const assistantMessage = document.querySelector('#assistantMessage');
const assistantTyping = document.querySelector('#assistantTyping');
const languageButtons = [...document.querySelectorAll('[data-language]')];

let assistantLanguage = null;
let assistantMessages = [];

function addChatMessage(role, content) {
  const row = document.createElement('div');
  row.className = `chat-row ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';

  const label = document.createElement('div');
  label.className = 'chat-label';
  label.textContent = role === 'user' ? 'YOU' : 'NOIR ASSISTANT';

  const text = document.createElement('div');
  text.textContent = content;

  bubble.append(label, text);
  row.appendChild(bubble);
  assistantChat.appendChild(row);
  assistantChat.scrollTop = assistantChat.scrollHeight;
}

function openAssistant(language) {
  assistantLanguage = language;
  assistantMessages = [];
  assistantChat.innerHTML = '';

  const greeting = language === 'el'
    ? 'Καλώς ήρθες στο NOIR CLUB. Πώς μπορώ να σε βοηθήσω; Μπορείς να με ρωτήσεις για κρατήσεις, τραπέζια, VIP, μπουκάλια ή οτιδήποτε άλλο σχετικά με το club.'
    : 'Welcome to NOIR CLUB. How can I help you? Ask me about reservations, tables, VIP, bottles or anything else about the club.';

  assistantMessages.push({ role: 'assistant', content: greeting });
  addChatMessage('assistant', greeting);

  assistantModal.classList.add('open');
  assistantModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => assistantMessage?.focus(), 100);
}

function closeAssistant() {
  assistantModal.classList.remove('open');
  assistantModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

languageButtons.forEach(button => {
  button.addEventListener('click', () => openAssistant(button.dataset.language));
});

document.querySelectorAll('[data-close-assistant]').forEach(button => {
  button.addEventListener('click', closeAssistant);
});

assistantForm?.addEventListener('submit', async e => {
  e.preventDefault();

  const message = assistantMessage.value.trim();
  if (!message || !assistantLanguage) return;

  addChatMessage('user', message);
  assistantMessages.push({ role: 'user', content: message });
  assistantMessage.value = '';
  assistantMessage.disabled = true;
  assistantTyping.hidden = false;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: assistantLanguage,
        messages: assistantMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Assistant request failed.');
    }

    const reply = data.message || (assistantLanguage === 'el'
      ? 'Συγγνώμη, δεν μπόρεσα να απαντήσω αυτή τη στιγμή.'
      : 'Sorry, I could not answer right now.');

    assistantMessages.push({ role: 'assistant', content: reply });
    addChatMessage('assistant', reply);
  } catch (error) {
    const errorMessage = assistantLanguage === 'el'
      ? 'Υπήρξε ένα προσωρινό πρόβλημα. Παρακαλώ δοκίμασε ξανά.'
      : 'There was a temporary problem. Please try again.';

    addChatMessage('assistant', errorMessage);
  } finally {
    assistantTyping.hidden = true;
    assistantMessage.disabled = false;
    assistantMessage.focus();
  }
});

showSlide(0);
restartTimer();
