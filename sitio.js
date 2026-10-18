// Sincro: menu del celu, aparicion al scrollear, parallax suave y preguntas desplegables.
(function () {
  const raiz = document.documentElement;
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Menu del celu ----
  const boton = document.querySelector('.menu-btn');
  const panel = document.getElementById('menu-principal');
  if (boton && panel) {
    const velo = document.createElement('div');
    velo.className = 'menu-velo';
    document.body.appendChild(velo);
    const poner = (abrir) => {
      boton.setAttribute('aria-expanded', String(abrir));
      boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
      panel.classList.toggle('abierto', abrir);
      velo.classList.toggle('visible', abrir);
      raiz.classList.toggle('menu-abierto', abrir);
    };
    boton.addEventListener('click', () => poner(boton.getAttribute('aria-expanded') !== 'true'));
    velo.addEventListener('click', () => poner(false));
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) poner(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') { poner(false); boton.focus(); }
    });
    matchMedia('(min-width: 721px)').addEventListener('change', (e) => { if (e.matches) poner(false); });
  }

  // ---- Al scrollear: lo que entra en pantalla aparece (una sola vez), de a poquito ----
  const cosas = [...document.querySelectorAll('[data-aparece], [data-solo-marca]')];
  cosas.forEach((c) => {
    if (c.style.getPropertyValue('--orden') || !c.parentElement) return;
    const hermanos = [...c.parentElement.children].filter((h) => h.hasAttribute('data-aparece'));
    if (hermanos.length > 1) c.style.setProperty('--orden', Math.min(hermanos.indexOf(c), 5));
  });
  if (!('IntersectionObserver' in window)) {
    cosas.forEach((c) => c.classList.add('visto'));
  } else {
    const ojo = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); ojo.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    cosas.forEach((c) => ojo.observe(c));
  }

  // ---- Parallax suave en las ilustraciones ----
  const flotantes = [...document.querySelectorAll('[data-parallax]')];
  if (flotantes.length && !sinMovimiento) {
    let esperando = false;
    const mover = () => {
      esperando = false;
      const alto = innerHeight;
      flotantes.forEach((p) => {
        const r = p.getBoundingClientRect();
        if (r.bottom < -120 || r.top > alto + 120) return;
        const centro = (r.top + r.height / 2 - alto / 2) / alto;
        p.style.setProperty('--py', (centro * -34).toFixed(1) + 'px');
      });
    };
    addEventListener('scroll', () => { if (!esperando) { esperando = true; requestAnimationFrame(mover); } }, { passive: true });
    addEventListener('resize', mover);
    mover();
  }

  // ---- Preguntas: la respuesta se despliega en vez de aparecer de golpe ----
  document.querySelectorAll('.faq details').forEach((d) => {
    const caja = d.querySelector('.respuesta');
    if (!caja) return;
    d.querySelector('summary').addEventListener('click', (e) => {
      if (sinMovimiento) return;
      e.preventDefault();
      if (d.dataset.moviendo) return;
      d.dataset.moviendo = '1';
      const abrir = !d.open;
      if (abrir) d.open = true;
      const alto = caja.scrollHeight;
      const anim = caja.animate(
        abrir ? [{ height: '0px', opacity: 0 }, { height: alto + 'px', opacity: 1 }] : [{ height: alto + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
        { duration: abrir ? 420 : 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
      anim.onfinish = () => { if (!abrir) d.open = false; delete d.dataset.moviendo; };
    });
  });
})();
