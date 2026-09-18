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
const tableTypeField = reservationForm?.querySelector('#tableTypeField');
const tableType = reservationForm?.querySelector('#tableType');

function resetReservationView() {
  if (!reservationForm || !reservationSuccess) return;
  reservationForm.reset();
  reservationForm.hidden = false;
  reservationSuccess.hidden = true;
  updateTableTypeVisibility();
}

function updateTableTypeVisibility() {
  const bottleSelected = drinkType?.value === 'Bottle';

  if (tableTypeField) {
    tableTypeField.hidden = !bottleSelected;
    tableTypeField.style.display = bottleSelected ? '' : 'none';
    tableTypeField.setAttribute('aria-hidden', bottleSelected ? 'false' : 'true');
  }

  if (tableType) {
    tableType.required = bottleSelected;
    if (!bottleSelected) tableType.value = '';
  }
}

drinkType?.addEventListener('change', updateTableTypeVisibility);

function openReservation() {
  resetReservationView();
  updateTableTypeVisibility();
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
  if (e.key === 'Escape' && reservationModal.classList.contains('open')) {
    closeReservation();
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

showSlide(0);
restartTimer();
