// Escenario lateral: los planos se componen antes de los actores del juego.
(() => {
  'use strict';

  function crear({ruta, laminas, recortes, capas, aceraY}) {
    const imagenes = {};
    for (const nombre of laminas) {
      const imagen = new Image();
      imagen.src = ruta + nombre + (nombre.includes('.') ? '' : '.png');
      imagenes[nombre] = imagen;
    }

    function dibujar(ctx, camara) {
      const ancho = ctx.canvas.width;
      const alto = ctx.canvas.height;
      ctx.imageSmoothingEnabled = false;

      // Las bases opacas mantienen la zona de lucha legible durante una carga parcial.
      ctx.fillStyle = '#82c8cc';
      ctx.fillRect(0, 0, ancho, aceraY);
      ctx.fillStyle = '#a48f81';
      ctx.fillRect(0, aceraY, ancho, alto - aceraY);

      for (const capa of capas) {
        const offset = Math.round(camara * capa.factor);
        for (const pieza of capa.piezas) {
          const [lamina, sx, sy, sw, sh] = recortes[pieza.tipo];
          const img = imagenes[lamina];
          if (!img.complete || !img.naturalWidth) continue;
          const w = pieza.ancho || sw;
          const h = pieza.alto || sh;
          let x = pieza.x - offset;
          if (pieza.repetir) x -= Math.ceil(x / w) * w;
          if (x + w <= 0 || x >= ancho) continue;
          do {
            ctx.drawImage(img, sx, sy, sw, sh, x, pieza.y, w, h);
            x += w;
          } while (pieza.repetir && x < ancho);
        }
      }
    }
    return Object.freeze({dibujar});
  }

  window.Escenario = Object.freeze({crear});
})();
