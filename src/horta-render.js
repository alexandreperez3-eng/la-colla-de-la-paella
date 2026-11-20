/* Canvas 2D para los objetos, sus premios y sus efectos de contacto. */
window.HortaRender = (() => {
  'use strict';

  function elipse(ctx, x, y, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function simbolo(ctx, premio, x, y, tamano) {
    ctx.fillStyle = Horta.premios[premio].color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold ' + tamano + 'px system-ui';
    ctx.fillText(premio === 'vida' ? '♥' : '↻', x, y);
  }

  function objeto(ctx, o) {
    ctx.save();
    ctx.translate(o.x, o.y);
    elipse(ctx, 0, 0, o.semiancho + 4, 7, '#55433060');
    if (o.tipo === 'caixa') {
      elipse(ctx, -10, -31, 9, 8, '#ce6142');
      elipse(ctx, 3, -33, 10, 9, '#7b9a43');
      elipse(ctx, 13, -31, 8, 7, '#e39745');
      ctx.fillStyle = '#69442c';
      ctx.fillRect(-22, -29, 44, 28);
      ctx.fillStyle = '#b67e4d';
      for (const y of [-27, -18, -9]) ctx.fillRect(-20, y, 40, 6);
      ctx.fillStyle = '#dfad6e';
      for (const x of [-21, 17]) ctx.fillRect(x, -29, 4, 28);
    } else if (o.tipo === 'cabas') {
      ctx.strokeStyle = '#69472d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -21, 14, Math.PI, 2 * Math.PI);
      ctx.stroke();
      elipse(ctx, -7, -21, 7, 10, '#6b933d');
      elipse(ctx, 5, -22, 9, 6, '#dc8d36');
      elipse(ctx, 0, -11, 21, 12, '#a36c3c');
      elipse(ctx, 0, -14, 19, 7, '#d2a162');
      elipse(ctx, 0, -7, 15, 2, '#79502f');
    } else {
      elipse(ctx, 0, -19, 17, 19, '#81402f');
      elipse(ctx, -2, -20, 14, 17, '#b96645');
      elipse(ctx, 0, -38, 11, 4, '#e49b68');
      elipse(ctx, 0, -38, 7, 2, '#653728');
      elipse(ctx, 0, -12, 14, 2, '#e79b62');
    }
    if (o.estado === 'dañado') {
      ctx.strokeStyle = '#3c271e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, -28);
      ctx.lineTo(3, -21);
      ctx.lineTo(12, -15);
      ctx.lineTo(6, -8);
      ctx.stroke();
    }
    // El sello permite identificar el premio antes de decidir si romperlo.
    elipse(ctx, 0, -16, 9, 9, '#203b34');
    simbolo(ctx, o.premio, 0, -15, 14);
    ctx.restore();
  }

  function recompensa(ctx, r, ahora) {
    const altura = -19 + Math.sin(ahora * 6) * 3;
    ctx.save();
    ctx.translate(r.x, r.y);
    elipse(ctx, 0, 0, 15, 5, '#55433055');
    elipse(ctx, 0, altura, 15, 15, Horta.premios[r.premio].color);
    elipse(ctx, 0, altura, 12, 12, '#203b34');
    simbolo(ctx, r.premio, 0, altura + 1, 20);
    ctx.restore();
  }

  function efectos(ctx, lista, ahora) {
    for (const efecto of lista) {
      const avance = Math.min(1, (ahora - efecto.inicio) / efecto.duracion);
      ctx.save();
      ctx.translate(efecto.x, efecto.y);
      ctx.globalAlpha = 1 - avance;
      if (efecto.clase === 'recogida') {
        elipse(ctx, 0, -12, 10 + 21 * avance, 4 + 8 * avance, efecto.color);
        ctx.font = 'bold 17px system-ui';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#203b34';
        ctx.fillStyle = efecto.color;
        const y = -49 - 31 * avance;
        ctx.strokeText(efecto.texto, 0, y);
        ctx.fillText(efecto.texto, 0, y);
      } else {
        const rotura = efecto.clase === 'rotura';
        const color = efecto.tipo === 'gerra' ? '#bb6246' : '#b77a46';
        for (let i = 0; i < (rotura ? 9 : 5); i++) {
          const angulo = i * 2.4;
          const distancia = 10 + avance * (rotura ? 31 : 15);
          const x = Math.cos(angulo) * distancia;
          const y = -23 + Math.sin(angulo) * distancia * 0.65 + 22 * avance * avance;
          ctx.fillStyle = rotura && i % 2 ? color : '#fff0bc';
          ctx.fillRect(x, y, rotura ? 5 : 3, 3);
        }
      }
      ctx.restore();
    }
  }

  return Object.freeze({objeto, recompensa, efectos});
})();
