// Cada entrada indica borde preferido, carril y segundos desde la entrada anterior.
(() => {
  'use strict';
  const oleadas = [
    [[1, 346, 0], [1, 405, 0.85]],
    [[1, 316, 0], [-1, 409, 0.55], [1, 372, 2.8]],
    [[-1, 316, 0], [1, 411, 0.48], [1, 352, 0.8], [-1, 392, 2.2]]
  ];
  const total = oleadas.length;
  function crear() {
    return {oleada:1, fase:'combate', enemigos:[], entradas:0, espera:0, turno:0};
  }
  function pendientes(m) {
    return oleadas[m.oleada-1].length - m.entradas;
  }
  function avanzar(m, jugador, delta, config) {
    m.espera -= delta;
    if (m.fase === 'descanso' && m.espera <= 0) {
      m.fase = 'combate';
      m.oleada++;
      m.entradas = 0;
      m.enemigos = [];
      m.turno = 0;
    }
    if (m.fase !== 'combate') return;
    const vivos = m.enemigos.filter(e => e.hp > 0);
    if (pendientes(m) && vivos.length < 3 && m.espera <= 0) {
      const entradas = oleadas[m.oleada-1];
      const [lado, y] = entradas[m.entradas++];
      const {izquierda, derecha} = config.limites;
      const margen = config.pesol.semiancho;
      let x = lado > 0 ? derecha-margen : izquierda+margen;
      if (m.oleada === 1 && m.entradas === 1) x = config.pesol.x;
      if (Math.abs(jugador.x-x) < 190) x = izquierda+derecha-x;
      const enemigo = Pesol.crear(config.pesol);
      Object.assign(enemigo, {x, y, facing: Math.sign(jugador.x-x)});
      m.enemigos.push(enemigo);
      m.espera = pendientes(m) ? entradas[m.entradas][2] : 0;
    } else if (!pendientes(m) && !vivos.length) {
      m.fase = m.oleada === total ? 'arroz' : 'descanso';
      m.espera = 2.4;
    }
  }
  // Repulsión suave entre pies; el eje vertical representa profundidad.
  function separar(enemigos, delta, cfg) {
    const vivos = enemigos.filter(e => e.hp > 0);
    for (let i=0; i<vivos.length; i++) {
      for (const b of vivos.slice(i+1)) {
        const a = vivos[i];
        const dx = b.x-a.x, dy = (b.y-a.y)*1.65;
        const d = Math.hypot(dx, dy);
        if (d >= 63) continue;
        const paso = Math.min((63-d)/2, 115*delta);
        const mx = d ? dx/d*paso : 0;
        const my = d ? dy/d*paso/1.65 : paso/1.65;
        for (const [e, signo] of [[a,-1],[b,1]]) {
          const l = cfg.limites, radio = cfg.pesol.semiancho;
          e.x = Math.max(l.izquierda+radio, Math.min(l.derecha-radio, e.x+mx*signo));
          e.y = Math.max(l.arriba, Math.min(l.abajo, e.y+my*signo));
        }
      }
    }
  }
  window.Mision = Object.freeze({crear, avanzar, separar, pendientes, total});
})();
