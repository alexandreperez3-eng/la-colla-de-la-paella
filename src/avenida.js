// Acte 1.1f · Passeig de Mestre Serrano: la GO! i El Terrat apareixen en avançar.
(() => {
  'use strict';

  const recortes = {
    cel: ['horitzo', 0, 0, 1114, 277],
    cases: ['facanes', 0, 220, 650, 202],
    balcons: ['facanes', 0, 0, 650, 220],
    casesBaixes: ['facanes', 281, 220, 369, 202],
    casesBlaves: ['facanes', 317, 0, 192, 220],
    passeig: ['passeig.svg', 0, 0, 600, 231],
    locals: ['locals-go-terrat-refinats.svg', 0, 0, 1020, 250],
    banc: ['banc.svg', 0, 0, 176, 90],
    arbre: ['decorats', 0, 0, 146, 150],
    parada: ['decorats', 148, 0, 191, 163],
    fanal: ['decorats', 342, 0, 33, 165],
    banderins: ['decorats', 0, 172, 183, 44],
    sales: ['decorats', 0, 221, 153, 97]
  };

  window.Avenida = Escenario.crear({
    ruta: 'assets/escenarios/mestre-serrano/',
    laminas: ['horitzo', 'facanes', 'decorats', 'passeig.svg',
      'locals-go-terrat-refinats.svg', 'banc.svg'],
    aceraY: 249,
    recortes,
    capas: [
      {factor: 0.11, piezas: [{tipo: 'cel', x: 0, y: -8}]},
      // Els locals es mantenen en un tram del món, no enganxats a la càmera.
      {factor: 0.76, piezas: [
        {tipo: 'cases', x: -73, y: 48},
        {tipo: 'balcons', x: 669, y: 30},
        {tipo: 'casesBaixes', x: 1352, y: 48},
        {tipo: 'casesBlaves', x: 1721, y: 30},
        {tipo: 'balcons', x: 2010, y: 30},
        {tipo: 'locals', x: 1450, y: 0, ancho: 1020, alto: 250}
      ]},
      // Rajola de passeig: sense calçada, vorada ni tall entre mòduls.
      // El SVG és periòdic cada 600 px, tant en colors com en juntes.
      {factor: 1, piezas: [{tipo: 'passeig', x: 0, y: 249, repetir: true}]},
      {factor: 1, piezas: [
        {tipo: 'banderins', x: 49, y: 139, ancho: 304, alto: 51},
        {tipo: 'fanal', x: 32, y: 114},
        {tipo: 'parada', x: 174, y: 119},
        {tipo: 'banc', x: 443, y: 204, ancho: 142, alto: 72},
        {tipo: 'arbre', x: 597, y: 119, ancho: 151, alto: 155},
        {tipo: 'fanal', x: 871, y: 111},
        {tipo: 'banc', x: 884, y: 209, ancho: 140, alto: 72},
        {tipo: 'arbre', x: 1040, y: 141, ancho: 128, alto: 132},
        {tipo: 'banc', x: 1220, y: 209, ancho: 144, alto: 74},
        {tipo: 'fanal', x: 1512, y: 111},
        {tipo: 'banc', x: 1572, y: 206, ancho: 142, alto: 72},
        {tipo: 'arbre', x: 1702, y: 124},
        {tipo: 'banc', x: 1854, y: 203, ancho: 140, alto: 73},
        {tipo: 'fanal', x: 1946, y: 115},
        {tipo: 'arbre', x: 2090, y: 143, ancho: 126, alto: 130},
        {tipo: 'banc', x: 2207, y: 207, ancho: 140, alto: 71},
        {tipo: 'fanal', x: 2320, y: 112},
        {tipo: 'banc', x: 2445, y: 206, ancho: 133, alto: 68},
        {tipo: 'sales', x: 2468, y: 181}
      ]}
    ]
  });
})();
