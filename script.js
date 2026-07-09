// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile burger menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  burger.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('active'));
});

// Activer les animations seulement si JS tourne correctement
document.documentElement.classList.add('js-ready');

// Scroll reveal animation
const revealEls = document.querySelectorAll('[data-aos]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Portfolio filter
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      const show = filter === 'all' || item.dataset.cat === filter;
      item.classList.toggle('hide', !show);
    });
  });
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
  });
});
lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.classList.remove('active');
});

// Testimonial slider
const testiCards = document.querySelectorAll('.testi-card');
const testiDotsContainer = document.getElementById('testiDots');
let currentTesti = 0;

// Créer les points
testiCards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToTesti(i));
  testiDotsContainer.appendChild(dot);
});

function goToTesti(index) {
  testiCards[currentTesti].classList.remove('active');
  testiDotsContainer.querySelectorAll('.dot')[currentTesti].classList.remove('active');
  currentTesti = index;
  testiCards[currentTesti].classList.add('active');
  testiDotsContainer.querySelectorAll('.dot')[currentTesti].classList.add('active');
}

setInterval(() => {
  goToTesti((currentTesti + 1) % testiCards.length);
}, 5000);

// Contact form -> ouvre le client mail vers SHAMS STUDIO
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nom = contactForm.querySelector('input[type="text"]').value;
  const email = contactForm.querySelector('input[type="email"]').value;
  const sujetInput = contactForm.querySelectorAll('input[type="text"]')[1];
  const sujet = sujetInput ? sujetInput.value : '';
  const message = contactForm.querySelector('textarea').value;

  const destinataire = 'shamsvisue@gmail.com';
  const objet = encodeURIComponent(sujet ? sujet : `Demande de ${nom}`);
  const corps = encodeURIComponent(
    `Nom : ${nom}\nEmail : ${email}\n\n${message}`
  );

  window.location.href = `mailto:${destinataire}?subject=${objet}&body=${corps}`;
});
