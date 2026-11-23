// Acte 1.1j · Passeig de Mestre Serrano.
(() => {
  'use strict';

  const recortes = {
    cel: ['horitzo', 0, 0, 1114, 277],
    cases: ['facanes', 0, 220, 650, 202],
    // Tall al límit del portal, abans de l'últim bloc de pisos de l'atles.
    balcons: ['facanes', 0, 0, 510, 220],
    passeig: ['passeig.svg', 0, 0, 600, 231],
    locals: ['locals-go-terrat-escala-1.1h.jpg', 0, 0, 1020, 250],
    banc: ['banc.svg', 0, 0, 176, 90],
    arbre: ['decorats', 0, 0, 146, 150],
    parada: ['decorats', 148, 0, 191, 163],
    fanal: ['decorats', 342, 0, 33, 165],
    banderins: ['decorats', 0, 172, 183, 44],
    sales: ['decorats', 0, 221, 153, 97]
  };

  // Mateixa escala residencial i línia de planta baixa que en 1.1i.
  const escalaCases = 1.35;
  const plantaBaixaY = 250;
  function casa(tipo, x) {
    const [, , , originalW, originalH] = recortes[tipo];
    const ancho = Math.round(originalW * escalaCases);
    const alto = Math.round(originalH * escalaCases);
    return {tipo, x, y: plantaBaixaY - alto, ancho, alto};
  }

  const darreraCasa = casa('balcons', 675);
  const travesseraX = darreraCasa.x + darreraCasa.ancho;
  const localsX = 1450;

  function pintarTravessera(ctx, offset, ancho) {
    const esquerra = travesseraX - offset;
    const dreta = localsX - offset;
    if (dreta <= 0 || esquerra >= ancho) return;

    const fons = esquerra + 46;
    ctx.fillStyle = '#625c65';
    ctx.beginPath();
    ctx.moveTo(fons - 9, 223);
    ctx.lineTo(fons + 9, 223);
    ctx.lineTo(dreta, plantaBaixaY);
    ctx.lineTo(esquerra, plantaBaixaY);
    ctx.fill();

    ctx.fillStyle = '#a08e86';
    ctx.beginPath();
    ctx.moveTo(fons - 9, 223);
    ctx.lineTo(fons - 6, 223);
    ctx.lineTo(esquerra + 13, plantaBaixaY);
    ctx.lineTo(esquerra, plantaBaixaY);
    ctx.moveTo(fons + 6, 223);
    ctx.lineTo(fons + 9, 223);
    ctx.lineTo(dreta, plantaBaixaY);
    ctx.lineTo(dreta - 11, plantaBaixaY);
    ctx.fill();

    ctx.fillStyle = '#827478';
    ctx.fillRect(fons - 3, 229, 6, 1);
    ctx.fillRect(fons - 7, 236, 14, 1);
    ctx.fillRect(fons - 14, 245, 28, 1);
  }

  // Coordenades interiors de les dos portes en el JPEG aprovat. Els
  // moviments es resolen dins de cada portal, amb la seua pròpia fase.
  const entrades = [
    {esquerra: 236, dreta: 286, sostre: 160, fase: 0, colors: ['#f65cfc', '#aa75ff'],
      grups: [[238, 13], [251, 17], [268, 17]]},
    {esquerra: 499, dreta: 567, sostre: 155, fase: 1.8, colors: ['#6798ff', '#d651fa'],
      grups: [[500, 20], [520, 20], [540, 26]]}
  ];

  function animarLocals(ctx, imatge, x, y, temps, ancho) {
    for (const {esquerra, dreta, sostre, fase, colors, grups} of entrades) {
      if (x + dreta <= 0 || x + esquerra >= ancho) continue;

      // Reenquadrem els mateixos balladors del JPEG per moure'ls sense duplicar-los.
      const cap = 184;
      const alt = 48;
      for (let i = 0; i < grups.length; i++) {
        const [posicio, ample] = grups[i];
        const pas = Math.round(2 * Math.sin(temps * (4.6 + i * 0.5) + fase + i * 2));
        ctx.drawImage(imatge, posicio, cap + pas, ample, alt - pas,
          x + posicio, y + cap, ample, alt);
      }

      ctx.save();
      for (let i = 0; i < colors.length; i++) {
        const batec = Math.sin(temps * (2.1 + i * 0.5) + fase + i * 2.4);
        const focus = i === 0 ? esquerra + 5 : dreta - 5;
        const centre = (esquerra + dreta) / 2 + batec * (dreta - esquerra) / 4;
        ctx.fillStyle = colors[i];
        ctx.globalAlpha = 0.13 + batec * 0.055;
        ctx.beginPath();
        ctx.moveTo(x + focus, y + sostre + 3);
        ctx.lineTo(x + Math.round(centre) - 7, y + 224);
        ctx.lineTo(x + Math.round(centre) + 7, y + 224);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  window.Avenida = Escenario.crear({
    ruta: 'assets/escenarios/mestre-serrano/',
    laminas: ['horitzo', 'facanes', 'decorats', 'passeig.svg',
      'locals-go-terrat-escala-1.1h.jpg', 'banc.svg'],
    aceraY: 249,
    recortes,
    capas: [
      {factor: 0.11, piezas: [{tipo: 'cel', x: 0, y: -8}]},
      {factor: 0.76, fondo: pintarTravessera, piezas: [
        casa('cases', -265),
        darreraCasa,
        {tipo: 'locals', x: localsX, y: 0, animar: animarLocals}
      ]},
      // Rajola de passeig: sense calçada, vorada ni tall entre mòduls.
      // El SVG és periòdic cada 600 px, tant en colors com en juntes.
      {factor: 1, piezas: [{tipo: 'passeig', x: 0, y: 249, repetir: true}]},
      {factor: 1, piezas: [
        {tipo: 'banderins', x: 49, y: 139, ancho: 304, alto: 51},
        {tipo: 'fanal', x: 32, y: 114},
        {tipo: 'parada', x: 174, y: 119},
        {tipo: 'banc', x: 443, y: 204, ancho: 142, alto: 72},
        {tipo: 'arbre', x: 603, y: 119, ancho: 151, alto: 155},
        {tipo: 'fanal', x: 771, y: 111},
        {tipo: 'banc', x: 821, y: 209, ancho: 140, alto: 72},
        {tipo: 'arbre', x: 977, y: 141, ancho: 128, alto: 132},
        {tipo: 'banc', x: 1140, y: 209, ancho: 144, alto: 74},
        {tipo: 'fanal', x: 1320, y: 111},
        {tipo: 'banc', x: 1400, y: 206, ancho: 142, alto: 72},
        {tipo: 'banc', x: 1570, y: 203, ancho: 140, alto: 73},
        {tipo: 'fanal', x: 1850, y: 115},
        {tipo: 'banc', x: 2010, y: 230, ancho: 140, alto: 71},
        {tipo: 'arbre', x: 2168, y: 143, ancho: 126, alto: 130},
        {tipo: 'banc', x: 2310, y: 228, ancho: 133, alto: 68},
        {tipo: 'fanal', x: 2470, y: 112},
        {tipo: 'sales', x: 2521, y: 181}
      ]}
    ]
  });
})();
