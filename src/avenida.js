// Acte 1.1l · Passeig de Mestre Serrano.
(() => {
  'use strict';

  const artPasseig = 'passeig.svg?v=m01';
  const artLocals = 'locals-go-terrat-sense-arbres.png';
  const artArbre = 'arbre-alt-passeig.png';
  const recortes = {
    cel: ['horitzo', 0, 0, 1114, 277],
    cases: ['facanes', 0, 220, 650, 202],
    // Tall al límit del portal, abans de l'últim bloc de pisos de l'atles.
    balcons: ['facanes', 0, 0, 510, 220],
    passeig: [artPasseig, 0, 0, 600, 231],
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
  // Entre els últims balcons i els locals deixem el fons real a la vista.
  // Sense cap carrer artificial: la separació ja suggereix la travessera.
  const localsX = 1450;

  // Coordenades interiors de les dos portes en la il·lustració. Els
  // moviments es resolen dins de cada portal, amb la seua pròpia fase.
  const entrades = [
    {esquerra: 236, dreta: 286, sostre: 160, fase: 0, colors: ['#f65cfc', '#aa75ff'],
      grups: [[238, 13], [251, 17], [268, 17]]},
    {esquerra: 499, dreta: 567, sostre: 155, fase: 1.8, colors: ['#6798ff', '#d651fa'],
      grups: [[500, 20], [520, 20], [540, 26]]}
  ];

  // No fem oscil·lar franges senceres de paret. L'art original ja
  // conté el públic i el mantenim intacte: animem només el cap i alguns
  // gestos del tors, amb els peus i les vores del fons sempre estables.
  // Cada figurant té un ritme i una pausa independents.
  const figurants = [
    {x: 132, y: 179, ample: 21, base: 214, fase: 0.1, periode: 5.8, gest: 'conversa'},
    {x: 160, y: 180, ample: 23, base: 214, fase: 0.7, periode: 6.4, gest: 'conversa'},
    {x: 359, y: 177, ample: 18, base: 214, fase: 0.3, periode: 5.6, gest: 'conversa'},
    {x: 378, y: 177, ample: 18, base: 214, fase: 0.9, periode: 6.6, gest: 'conversa'},
    {x: 398, y: 175, ample: 24, base: 214, fase: 0.4, periode: 7.2, gest: 'espera'},
    {x: 465, y: 164, ample: 25, base: 207, fase: 0.8, periode: 8.0, gest: 'porter'},
    {x: 597, y: 168, ample: 25, base: 208, fase: 0.2, periode: 8.7, gest: 'porter'},
    {x: 646, y: 176, ample: 20, base: 212, fase: 0.6, periode: 5.2, gest: 'conversa'},
    {x: 669, y: 174, ample: 13, base: 212, fase: 0.1, periode: 6.1, gest: 'espera'},
    {x: 682, y: 175, ample: 17, base: 212, fase: 0.9, periode: 5.9, gest: 'conversa'}
  ];

  // Una conversa consta de pauses llargues i un gest curt i arrodonit.
  // Les fases diferents impedeixen que tot el públic es moga a l'uníson.
  function gestPausat(temps, figurant) {
    const cicle = ((temps / figurant.periode + figurant.fase) % 1 + 1) % 1;
    if (cicle < 0.63) return 0;
    const progres = (cicle - 0.63) / 0.37;
    return Math.sin(Math.PI * progres) ** 2;
  }

  function animarFigurants(ctx, imatge, x, y, temps, ancho) {
    for (const figurant of figurants) {
      const esquerra = x + figurant.x;
      if (esquerra + figurant.ample <= 0 || esquerra >= ancho) continue;
      const alt = figurant.base - figurant.y;
      const capAlt = figurant.gest === 'porter' ? 13 : 12;
      const gest = gestPausat(temps, figurant);
      const respirar = Math.sin(temps * 0.85 + figurant.fase * 6.28);
      const mirada = Math.sin(temps * 0.47 + figurant.fase * 11);
      const moureCap = Math.round(
        (figurant.gest === 'porter' ? 1.1 : 1.45) * mirada + gest * 0.8);
      const assentir = Math.round(gest * (figurant.gest === 'porter' ? 1 : 2));
      const moureCos = Math.round(
        (figurant.gest === 'conversa' ? 1.4 : 0.65) * gest + respirar * 0.35);

      // Retalls localitzats i retallats a les seues pròpies caixes:
      // la façana, les portes i el paviment no es desplacen mai.
      ctx.save();
      ctx.beginPath();
      ctx.rect(esquerra + 1, y + figurant.y, figurant.ample - 2, capAlt);
      ctx.clip();
      ctx.drawImage(imatge, figurant.x, figurant.y,
        figurant.ample, capAlt, esquerra + moureCap,
        y + figurant.y + assentir, figurant.ample, capAlt);
      ctx.restore();

      // Un moviment ocasional de braços i espatles; cames i peus fixos.
      // Els porters es limiten a mirar de costat i respirar.
      if (figurant.gest === 'conversa') {
        const torsY = figurant.y + capAlt;
        const torsAlt = Math.min(12, alt - capAlt - 8);
        ctx.save();
        ctx.beginPath();
        ctx.rect(esquerra + 2, y + torsY, figurant.ample - 4, torsAlt);
        ctx.clip();
        ctx.drawImage(imatge, figurant.x, torsY, figurant.ample, torsAlt,
          esquerra + moureCos, y + torsY, figurant.ample, torsAlt);
        ctx.restore();
      }
    }
  }

  function animarLocals(ctx, imatge, x, y, temps, ancho) {
    animarFigurants(ctx, imatge, x, y, temps, ancho);

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
    laminas: ['horitzo', 'facanes', 'decorats', artPasseig, artLocals, artArbre, 'banc.svg'],
    aceraY: 249,
    recortes,
    capas: [
      {factor: 0.11, piezas: [{tipo: 'cel', x: 0, y: -8}]},
      {factor: 0.76, piezas: [
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
