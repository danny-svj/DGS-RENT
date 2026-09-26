// Animaciones simples de la pagina: aparecer al hacer scroll, navbar con
// sombra al hacer scroll, y el buscador rapido del hero.
document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  const nav = document.querySelector('.navbar');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Buscador rapido del hero ----------
  const hsStart = document.getElementById('hs-start');
  const hsEnd = document.getElementById('hs-end');
  if (hsStart && hsEnd) {
    const today = new Date();
    const inThreeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().slice(0, 10);
    hsStart.value = fmt(today);
    hsEnd.value = fmt(inThreeDays);
    hsStart.min = fmt(today);
    hsEnd.min = fmt(today);
    hsStart.addEventListener('change', () => { hsEnd.min = hsStart.value; });
  }
  const hsBtn = document.getElementById('hs-search-btn');
  if (hsBtn) {
    hsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('flota');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});
