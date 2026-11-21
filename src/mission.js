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
  function crear(){
    return {indice:0,fase:'avance',enemigos:[],turno:0,camara:0,
      camaraFija:0,completados:0};
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
        m.enemigos=siguiente.enemigos.map(([x,y])=>{
          const e=Pesol.crear(config.pesol);
          e.x=x;e.y=y;e.facing=-1;
          return e;
        });
        m.turno=0;
        m.camaraFija=m.camara;
        m.fase='combate';
      }else if(!siguiente && jugador.x>=anchoMundo-160){
        m.fase='final';
      }
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
  window.Mision=Object.freeze({crear,avanzar,separar,limiteX,encuentros,anchoMundo});
})();