/* Cola de cuatro golpes: funciones puras para admitir pulsaciones rápidas. */
window.Combo = Object.freeze({
  encolar(paso, enCola, maximo) {
    return Math.min(Math.max(0,maximo-paso),enCola+1);
  },
  siguiente(paso, enCola, maximo) {
    return paso<maximo && enCola>0 ? {paso:paso+1, enCola:enCola-1} : null;
  }
});
