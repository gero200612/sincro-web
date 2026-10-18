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

  // ---- Desplegables del menu: hover, foco y toque; Escape los cierra ----
  const grupos = [...document.querySelectorAll('.nav-grupo')];
  const sincronizar = (g) => {
    const abierto = !g.classList.contains('cerrado') && (g.matches(':hover') || g.matches(':focus-within') || g.classList.contains('abierto'));
    g.querySelector('.nav-flecha').setAttribute('aria-expanded', String(abierto));
  };
  grupos.forEach((g) => {
    g.addEventListener('mouseleave', () => { g.classList.remove('cerrado'); setTimeout(() => sincronizar(g), 0); });
    g.addEventListener('mouseenter', () => setTimeout(() => sincronizar(g), 0));
    g.addEventListener('focusin', () => { g.classList.remove('cerrado'); sincronizar(g); });
    g.addEventListener('focusout', () => setTimeout(() => sincronizar(g), 0));
    g.querySelector('.nav-flecha').addEventListener('click', () => { g.classList.remove('cerrado'); g.classList.toggle('abierto'); sincronizar(g); });
  });
  document.addEventListener('click', (e) => {
    grupos.forEach((g) => { if (!g.contains(e.target) && g.classList.contains('abierto')) { g.classList.remove('abierto'); sincronizar(g); } });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    grupos.forEach((g) => {
      if (!g.matches(':hover') && !g.matches(':focus-within') && !g.classList.contains('abierto')) return;
      g.classList.remove('abierto');
      g.classList.add('cerrado');
      if (g.contains(document.activeElement)) g.querySelector('.nav-link').focus();
      sincronizar(g);
    });
  });

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

  // Formulario: va al bot de WhatsApp de Sincro (que se lo pasa a Homero). Si
  // el bot no contesta, se arma el mail con lo mismo para no perder la consulta.
  const FORMULARIO = 'https://wa.apps.punchi.dev/formulario';
  const formulario = document.getElementById('form-contacto');
  if (formulario) formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const nota = f.querySelector('.nota');
    const boton = f.querySelector('.enviar');
    if (!f.nombre.value.trim() || (!f.whatsapp.value.trim() && !f.mail.value.trim())) {
      nota.dataset.estado = '';
      nota.textContent = 'Falta tu nombre y un WhatsApp o mail para poder responderte.';
      return;
    }
    const datos = {
      nombre: f.nombre.value,
      negocio: f.negocio.value,
      whatsapp: f.whatsapp.value,
      mail: f.mail.value,
      tema: f.tema.value,
      mensaje: f.mensaje.value,
      acepta_whatsapp: f.acepta_whatsapp.checked,
      sitio: f.sitio.value,
    };
    boton.disabled = true;
    nota.dataset.estado = '';
    nota.textContent = 'Enviando…';
    try {
      const r = await fetch(FORMULARIO, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(datos),
        signal: AbortSignal.timeout(15000),
      });
      if (r.ok) {
        f.reset();
        nota.dataset.estado = 'ok';
        nota.textContent = datos.acepta_whatsapp
          ? '¡Listo! Te escribimos por WhatsApp en unos minutos.'
          : '¡Listo! Te respondemos en el día hábil.';
        return;
      }
      const { code } = await r.json().catch(() => ({}));
      if (code === 'demasiados_envios') {
        nota.textContent = 'Ya recibimos varias consultas desde acá. Probá en unos minutos o escribinos por WhatsApp.';
        return;
      }
      if (code === 'falta_contacto') {
        nota.textContent = 'Revisá el WhatsApp o el mail: no parecen válidos.';
        return;
      }
      throw new Error(code || String(r.status));
    } catch {
      const cuerpo = [
        'Nombre: ' + datos.nombre,
        'Negocio: ' + datos.negocio,
        'WhatsApp: ' + datos.whatsapp + (datos.acepta_whatsapp ? ' (acepta que le escriban por WhatsApp)' : ''),
        'Mail: ' + datos.mail,
        'Quiere resolver: ' + datos.tema,
        '',
        datos.mensaje,
      ].join('\n');
      location.href = 'mailto:sincroar.contacto@gmail.com?subject=' + encodeURIComponent('Consulta de ' + datos.nombre) + '&body=' + encodeURIComponent(cuerpo);
      nota.dataset.estado = 'ok';
      nota.textContent = 'No pudimos enviarla desde acá: se abrió tu mail con la consulta armada, solo falta tocar Enviar.';
    } finally {
      boton.disabled = false;
    }
  });
})();
