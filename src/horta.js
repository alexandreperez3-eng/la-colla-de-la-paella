/* Estado de los objetos de l'Horta, independiente del dibujo y de la entrada. */
window.Horta = (() => {
  'use strict';

  const tipos = Object.freeze({
    caixa: {resistencia:2, semiancho:22, semiprofundidad:10},
    cabas: {resistencia:1, semiancho:20, semiprofundidad:10},
    gerra: {resistencia:2, semiancho:17, semiprofundidad:10}
  });
  const premios = Object.freeze({
    vida: {cantidad:2, color:'#ff9b84'},
    remoli: {cantidad:3, color:'#94f3e9'}
  });
  const radioRecogida = 25;

  function crear(disposicion) {
    return {
      objetos:disposicion.map(objeto => ({
        ...objeto, ...tipos[objeto.tipo],
        hp:tipos[objeto.tipo].resistencia, estado:'intacto'
      })),
      recompensas:[],
      efectos:[]
    };
  }

  function golpear(horta, acierta, dano, ahora) {
    const impactos = [];
    for (const objeto of horta.objetos) {
      if (objeto.estado === 'roto' || !acierta(objeto)) continue;
      objeto.hp = Math.max(0, objeto.hp - dano);
      const roto = objeto.hp === 0;
      objeto.estado = roto ? 'roto' : 'dañado';
      const {x, y, tipo, premio} = objeto;
      horta.efectos.push({x, y, tipo, clase:roto ? 'rotura' : 'golpe', inicio:ahora,
        duracion:roto ? 0.48 : 0.2});
      if (roto) horta.recompensas.push({x, y, premio});
      impactos.push(objeto);
    }
    return impactos;
  }

  function recoger(horta, jugador, maxVida, ahora) {
    let mensaje = '';
    horta.recompensas = horta.recompensas.filter(({x, y, premio}) => {
      if (Math.hypot(x - jugador.x, y - jugador.y) > radioRecogida) return true;
      const {cantidad, color} = premios[premio];
      if (premio === 'vida') {
        const curacion = Math.min(cantidad, maxVida - jugador.hp);
        if (curacion <= 0) return true;
        jugador.hp += curacion;
        mensaje = '+' + curacion + ' PV';
      } else {
        const reduccion = Math.min(cantidad, jugador.specialCooldown);
        if (reduccion <= 0) return true;
        jugador.specialCooldown -= reduccion;
        mensaje = jugador.specialCooldown === 0 ? 'REMOLÍ PREPARAT' : '−' + reduccion + ' s REMOLÍ';
      }
      horta.efectos.push({x, y, clase:'recogida', color, texto:mensaje, inicio:ahora,
        duracion:1.15});
      return false;
    });
    return mensaje;
  }

  function limpiarEfectos(horta, ahora) {
    horta.efectos = horta.efectos.filter(efecto => ahora - efecto.inicio < efecto.duracion);
  }

  return Object.freeze({crear, golpear, recoger, limpiarEfectos, premios});
})();
