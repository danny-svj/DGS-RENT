// Animaciones compartidas: reveal-on-scroll, navbar al hacer scroll, contadores.
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

  // ---------- 3D pointer tilt on cards (delegated so dynamically-added cards work too) ----------
  const tiltStrength = 10;
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest && e.target.closest('.tilt');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * tiltStrength}deg) rotateX(${-y * tiltStrength}deg) translateY(-6px)`;
  });
  document.addEventListener(
    'mouseout',
    (e) => {
      const card = e.target.closest && e.target.closest('.tilt');
      if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    },
    true
  );

  // ---------- Hero search widget (rental-style) ----------
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
      hsBtn.classList.add('pulse-once');
      setTimeout(() => hsBtn.classList.remove('pulse-once'), 600);
    });
  }

  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    let started = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          const duration = 1400;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - (1 - progress) * (1 - progress);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      });
    });
    io.observe(el);
  });
});
