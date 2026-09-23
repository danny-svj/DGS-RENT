// Capa extra de animaciones "4D" con GSAP + ScrollTrigger: parallax cinematografico
// ligado al scroll, giros 3D continuos (no solo de una vez, como AOS) y entradas
// en flip para las tarjetas de la flota y las resenas.
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // ---------- Parallax cinematografico del video del hero ----------
  const stage = document.querySelector('.car-stage');
  if (stage) {
    gsap.to(stage, {
      rotateX: 10,
      scale: 0.93,
      y: 36,
      transformPerspective: 1000,
      transformOrigin: '50% 0%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  }

  // ---------- Logos de seccion: giro 3D continuo ligado al scroll ----------
  gsap.utils.toArray('.section-logo').forEach((el) => {
    gsap.fromTo(
      el,
      { rotateY: -65, opacity: 0.25, transformPerspective: 700 },
      {
        rotateY: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          end: 'top 55%',
          scrub: 0.5,
        },
      }
    );
  });

  // ---------- Tarjetas de la flota: flip 3D de entrada (incluye tarjetas cargadas por AJAX) ----------
  const seenMedia = new WeakSet();
  function wireFleetFlip(scope) {
    const medias = Array.from(scope.querySelectorAll('.car-media')).filter((m) => !seenMedia.has(m));
    if (!medias.length) return;
    medias.forEach((m) => seenMedia.add(m));
    gsap.set(medias, {
      transformPerspective: 900,
      transformOrigin: '50% 100%',
      rotateX: -70,
      opacity: 0,
      y: 26,
    });
    ScrollTrigger.batch(medias, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          rotateX: 0,
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        }),
    });
  }

  document.querySelectorAll('.fleet-grid').forEach((grid) => {
    wireFleetFlip(grid);
    const obs = new MutationObserver(() => wireFleetFlip(grid));
    obs.observe(grid, { childList: true });
  });

  // ---------- Avatares de resenas: efecto "moneda" al entrar ----------
  const avatars = gsap.utils.toArray('.testi-avatar');
  if (avatars.length) {
    gsap.set(avatars, { transformPerspective: 600, rotateY: 180, opacity: 0 });
    ScrollTrigger.batch(avatars, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          rotateY: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.6)',
        }),
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
});
