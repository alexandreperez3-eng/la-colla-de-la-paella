// Acto 1.1d · La cámara llega desde la fiesta de la paella hasta la salida a Sales.
(() => {
  'use strict';

  const recortes = {
    cel: ['horitzo', 0, 0, 1114, 277],
    cases: ['facanes', 0, 220, 650, 202],
    balcons: ['facanes', 0, 0, 650, 220],
    casesBaixes: ['facanes', 281, 220, 369, 202],
    casesBlaves: ['facanes', 317, 0, 192, 220],
    carrer: ['paviment', 0, 0, 652, 231],
    arbre: ['decorats', 0, 0, 146, 150],
    parada: ['decorats', 148, 0, 191, 163],
    fanal: ['decorats', 342, 0, 33, 165],
    banderins: ['decorats', 0, 172, 183, 44],
    placa: ['decorats', 190, 172, 173, 93],
    sales: ['decorats', 0, 221, 153, 97]
  };

  window.Avenida = Escenario.crear({
    ruta: 'assets/escenarios/mestre-serrano/',
    laminas: ['horitzo', 'facanes', 'paviment', 'decorats'],
    aceraY: 249,
    recortes,
    capas: [
      {factor: 0.11, piezas: [{tipo: 'cel', x: 0, y: -8}]},
      {factor: 0.76, piezas: [
        {tipo: 'cases', x: -73, y: 48},
        {tipo: 'balcons', x: 669, y: 30},
        {tipo: 'casesBaixes', x: 1352, y: 48},
        {tipo: 'casesBlaves', x: 1721, y: 30},
        {tipo: 'balcons', x: 2010, y: 30}
      ]},
      {factor: 1, piezas: [{tipo: 'carrer', x: 0, y: 249, repetir: true}]},
      {factor: 1, piezas: [
        {tipo: 'banderins', x: 49, y: 139, ancho: 304, alto: 51},
        {tipo: 'fanal', x: 32, y: 114},
        {tipo: 'fanal', x: 337, y: 114},
        {tipo: 'parada', x: 174, y: 119},
        {tipo: 'arbre', x: 597, y: 119, ancho: 151, alto: 155},
        {tipo: 'fanal', x: 871, y: 111},
        {tipo: 'arbre', x: 1040, y: 141, ancho: 128, alto: 132},
        {tipo: 'placa', x: 1280, y: 183},
        {tipo: 'fanal', x: 1512, y: 111},
        {tipo: 'arbre', x: 1702, y: 124},
        {tipo: 'fanal', x: 1946, y: 115},
        {tipo: 'arbre', x: 2090, y: 143, ancho: 126, alto: 130},
        {tipo: 'fanal', x: 2320, y: 112},
        {tipo: 'sales', x: 2468, y: 181}
      ]}
    ]
  });
})();
