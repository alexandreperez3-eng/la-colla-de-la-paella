/* Acto 1 · 1.1 Avinguda Mestre Serrano.
   Los encuentros dependen del avance horizontal, NUNCA de un temporizador. */
(() => {
  'use strict';
  const anchoMundo=2680;
  const anchoVista=900;
  const encuentros=Object.freeze([
    {id:'robatori',x:640,barrera:1040,enemigos:[[790,348],[882,405]]},
    {id:'fugida',x:1580,barrera:2010,enemigos:[[1730,334],[1810,410],[1890,369]]}
  ]);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function crear(cfg=window.CONFIG){
    // Los Pèsols ya existen desde el inicio del tramo, como actores en el mundo.
    // Solo se activa su IA cuando el jugador alcanza el encuentro.
    const grupos=encuentros.map(encuentro=>encuentro.enemigos.map(([x,y])=>{
      const e=Pesol.crear(cfg.pesol);
      e.x=x;e.y=y;e.facing=-1;
      return e;
    }));
    return {indice:0,fase:'avance',enemigos:[],grupos,turno:0,camara:0,
      camaraFija:0,completados:0};
  }
  function visibles(m){
    // Pintar también los siguientes grupos antes de que empiece su combate.
    // Los anteriores, ya derrotados, desaparecen al continuar.
    return m.grupos.slice(Math.max(0,m.indice-(m.fase==='tira-li'?1:0))).flat();
  }
  function limiteX(m){
    return m.fase==='combate' ? encuentros[m.indice].barrera : anchoMundo-45;
  }
  function avanzar(m,jugador,delta,config){
    if(m.fase==='combate'){
      if(m.enemigos.length && m.enemigos.every(e=>e.hp<=0)){
        m.indice++;
        m.completados++;
        m.fase='tira-li';
      }
    }else if(m.fase==='tira-li'){
      if(jugador.x>=encuentros[m.indice-1].barrera+65)m.fase='avance';
    }else if(m.fase==='avance'){
      const siguiente=encuentros[m.indice];
      if(siguiente && jugador.x>=siguiente.x){
        // Activamos los personajes ya dibujados: ninguna creación ni teletransporte.
        m.enemigos=m.grupos[m.indice];
        m.turno=0;
        m.camaraFija=m.camara;
        m.fase='combate';
      }else if(!siguiente && jugador.x>=anchoMundo-160){
        m.fase='final';
      }
    }
    // Los enemigos futuros respiran en IDLE, sin desplazarse ni atacar.
    for(let i=m.indice;i<m.grupos.length;i++){
      if(i===m.indice && m.fase==='combate')continue;
      for(const e of m.grupos[i])if(e.hp>0)e.animationTime+=Math.max(0,delta);
    }
    const objetivo=m.fase==='combate' ? m.camaraFija :
      clamp(jugador.x-340,0,anchoMundo-anchoVista);
    m.camara+= (objetivo-m.camara)*Math.min(1,Math.max(0,delta)*9);
    m.camara=clamp(m.camara,0,anchoMundo-anchoVista);
  }
  // Los pies no se apilan y cada Pèsol sigue conservando su máquina de estados.
  function separar(enemigos,delta,config){
    const vivos=enemigos.filter(e=>e.hp>0);
    for(let i=0;i<vivos.length;i++)for(let j=i+1;j<vivos.length;j++){
      const a=vivos[i],b=vivos[j];
      const dx=b.x-a.x,dy=(b.y-a.y)*1.65,d=Math.hypot(dx,dy);
      if(d>=63)continue;
      const paso=Math.min((63-d)/2,115*delta);
      const mx=d?dx/d*paso:0, my=d?dy/d*paso/1.65:paso/1.65;
      const l=config.limites,radio=config.pesol.semiancho;
      a.x=clamp(a.x-mx,l.izquierda+radio,l.derecha-radio);
      b.x=clamp(b.x+mx,l.izquierda+radio,l.derecha-radio);
      a.y=clamp(a.y-my,l.arriba,l.abajo);
      b.y=clamp(b.y+my,l.arriba,l.abajo);
    }
  }
  window.Mision=Object.freeze({crear,avanzar,separar,visibles,limiteX,encuentros,anchoMundo});
})();