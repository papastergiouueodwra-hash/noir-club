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

function restartTimer() {
  clearInterval(timer);
  timer = setInterval(() => showSlide(current + 1), 5000);
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
  const touchEndX = e.changedTouches[0].screenX;
  const distance = touchEndX - touchStartX;

  if (Math.abs(distance) > 50) {
    showSlide(distance < 0 ? current + 1 : current - 1);
    restartTimer();
  }
}, { passive: true });

showSlide(0);
restartTimer();
