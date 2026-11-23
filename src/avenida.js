// Acte 1.1k · Passeig de Mestre Serrano.
(() => {
  'use strict';

  const artLocals = 'locals-go-terrat-sense-arbres.png';
  const artArbre = 'arbre-alt-passeig.png';
  const recortes = {
    cel: ['horitzo', 0, 0, 1114, 277],
    cases: ['facanes', 0, 220, 650, 202],
    // Tall al límit del portal, abans de l'últim bloc de pisos de l'atles.
    balcons: ['facanes', 0, 0, 510, 220],
    passeig: ['passeig.svg', 0, 0, 600, 231],
    locals: [artLocals, 0, 0, 1020, 250],
    banc: ['banc.svg', 0, 0, 176, 90],
    arbre: [artArbre, 0, 0, 200, 400],
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

  // La copa queda per damunt del visor. Només entra la vora de les fulles.
  function arbre(centre, base, alto) {
    const [, , , ampleOriginal, altOriginal] = recortes.arbre;
    const ancho = Math.round(alto * ampleOriginal / altOriginal);
    return {tipo: 'arbre', x: centre - Math.round(ancho / 2), y: base - alto, ancho, alto};
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

  // Coordenades interiors de les dos portes en la il·lustració. Els
  // moviments es resolen dins de cada portal, amb la seua pròpia fase.
  const entrades = [
    {esquerra: 236, dreta: 286, sostre: 160, fase: 0, colors: ['#f65cfc', '#aa75ff'],
      grups: [[238, 13], [251, 17], [268, 17]]},
    {esquerra: 499, dreta: 567, sostre: 155, fase: 1.8, colors: ['#6798ff', '#d651fa'],
      grups: [[500, 20], [520, 20], [540, 26]]}
  ];

  // El moviment acaba a la cintura, per ancorar els peus i deixar les
  // cordes de seguretat, el sòcol i els rètols fora de l'animació.
  const gentDeFora = [
    {x: 126, y: 174, ample: 58, base: 214, pas: 3, ritme: 2.2, fase: 0.3},
    {x: 355, y: 173, ample: 34, base: 214, pas: 2, ritme: 2.6, fase: 1.3},
    {x: 389, y: 172, ample: 36, base: 214, pas: 3, ritme: 1.9, fase: 5.3},
    {x: 457, y: 164, ample: 35, base: 207, pas: 2, ritme: 1.5, fase: 3.2},
    {x: 591, y: 167, ample: 33, base: 208, pas: 2, ritme: 1.7, fase: 1.8},
    {x: 643, y: 173, ample: 26, base: 212, pas: 3, ritme: 2.3, fase: 0.2},
    {x: 669, y: 174, ample: 31, base: 212, pas: 2, ritme: 1.8, fase: 3.5}
  ];

  function animarLocals(ctx, imatge, x, y, temps, ancho) {
    for (const persona of gentDeFora) {
      const esquerra = x + persona.x;
      if (esquerra + persona.ample <= 0 || esquerra >= ancho) continue;

      const pas = Math.round(persona.pas * Math.sin(temps * persona.ritme + persona.fase));
      const alt = persona.base - persona.y;
      ctx.drawImage(imatge, persona.x, persona.y + pas, persona.ample, alt - pas,
        esquerra, y + persona.y, persona.ample, alt);
    }

    for (const {esquerra, dreta, sostre, fase, colors, grups} of entrades) {
      if (x + dreta <= 0 || x + esquerra >= ancho) continue;

      // Cada portal mou els balladors de la il·lustració amb la seua pròpia fase.
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
    laminas: ['horitzo', 'facanes', 'decorats', 'passeig.svg', artLocals, artArbre, 'banc.svg'],
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
        arbre(683, 274, 365),
        {tipo: 'fanal', x: 771, y: 111},
        {tipo: 'banc', x: 821, y: 209, ancho: 140, alto: 72},
        arbre(1043, 273, 380),
        {tipo: 'banc', x: 1140, y: 209, ancho: 144, alto: 74},
        {tipo: 'fanal', x: 1320, y: 111},
        {tipo: 'banc', x: 1400, y: 206, ancho: 142, alto: 72},
        {tipo: 'banc', x: 1570, y: 203, ancho: 140, alto: 73},
        {tipo: 'fanal', x: 1850, y: 115},
        {tipo: 'banc', x: 2010, y: 230, ancho: 140, alto: 71},
        arbre(2224, 273, 365),
        {tipo: 'banc', x: 2310, y: 228, ancho: 133, alto: 68},
        {tipo: 'fanal', x: 2470, y: 112},
        {tipo: 'sales', x: 2521, y: 181}
      ]}
    ]
  });
})();
