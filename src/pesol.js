/* La Colla de la Paella · 04A: primer esbirro con IA independiente.
   Toda la lógica es determinista y se puede probar sin Canvas ni DOM. */
(() => {
  'use strict';
  const ESTADOS=Object.freeze({
    IDLE:'IDLE',CHASE:'CHASE',PRE_ATTACK:'PRE_ATTACK',
    ATTACK:'ATTACK',RECOVER:'RECOVER',HURT:'HURT',KO:'KO'
  });
  const FILAS=Object.freeze({IDLE:0,CHASE:1,PRE_ATTACK:2,ATTACK:2,RECOVER:0,HURT:3,KO:4});
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function cambiar(e,estado){
    if(e.state===estado)return;
    e.state=estado;e.stateTime=0;e.animationTime=0;e.impactDone=false;
  }
  function crear(cfg){
    return {x:cfg.x,y:cfg.y,facing:-1,hp:cfg.vida,
      state:ESTADOS.IDLE,stateTime:0,animationTime:0,impactDone:false,flash:0};
  }
  function recibirGolpe(e,dano,direccion,retroceso,limites,cfg){
    if(e.hp<=0)return false;
    e.hp=Math.max(0,e.hp-dano);
    e.x=clamp(e.x+direccion*retroceso,
      limites.izquierda+cfg.semiancho,limites.derecha-cfg.semiancho);
    e.flash=0.20;
    cambiar(e,e.hp===0?ESTADOS.KO:ESTADOS.HURT);
    return true;
  }
  function avanzar(e,p,delta,cfg,limites){
    const resultado={golpeJugador:false};
    if(delta<=0)return resultado;
    e.flash=Math.max(0,e.flash-delta);
    e.stateTime+=delta;
    e.animationTime+=delta;
    if(e.state===ESTADOS.KO)return resultado;
    const dx=p.x-e.x,dy=p.y-e.y;
    const distancia=Math.hypot(dx,dy);
    switch(e.state){
      case ESTADOS.IDLE:
        if(distancia<=cfg.deteccion)cambiar(e,ESTADOS.CHASE);
        break;
      case ESTADOS.CHASE:{
        if(distancia>cfg.deteccion*1.28){cambiar(e,ESTADOS.IDLE);break;}
        if(Math.abs(dx)<=cfg.distanciaAtaque && Math.abs(dy)<=cfg.carrilAtaque){
          e.facing=dx>=0?1:-1;
          cambiar(e,ESTADOS.PRE_ATTACK);break;
        }
        if(Math.abs(dx)>5)e.facing=dx>0?1:-1;
        const mx=Math.abs(dx)>cfg.distanciaAtaque-5?dx:0;
        const my=Math.abs(dy)>cfg.carrilAtaque*.45?dy*.75:0;
        const longitud=Math.hypot(mx,my)||1;
        e.x=clamp(e.x+(mx/longitud)*cfg.velocidad*delta,
          limites.izquierda+cfg.semiancho,limites.derecha-cfg.semiancho);
        e.y=clamp(e.y+(my/longitud)*cfg.velocidad*.72*delta,
          limites.arriba,limites.abajo);
        break;
      }
      case ESTADOS.PRE_ATTACK:
        // La cabotada siempre se anuncia antes de salir disparado.
        if(Math.abs(dy)>cfg.carrilAtaque*1.8 || Math.abs(dx)>cfg.distanciaAtaque+75){
          cambiar(e,ESTADOS.CHASE);
        }else if(e.stateTime>=cfg.preparacion){
          cambiar(e,ESTADOS.ATTACK);
        }
        break;
      case ESTADOS.ATTACK:
        // Embestida en la dirección fijada durante PRE_ATTACK.
        if(e.stateTime<cfg.duracionAtaque*.73){
          e.x=clamp(e.x+e.facing*cfg.embestida*delta,
            limites.izquierda+cfg.semiancho,limites.derecha-cfg.semiancho);
        }
        if(!e.impactDone && e.stateTime>=cfg.instanteImpacto){
          e.impactDone=true;
          const frontal=(p.x-e.x)*e.facing;
          resultado.golpeJugador=frontal>=-17 && frontal<=cfg.alcance &&
            Math.abs(p.y-e.y)<=cfg.carrilAtaque;
        }
        if(e.stateTime>=cfg.duracionAtaque)cambiar(e,ESTADOS.RECOVER);
        break;
      case ESTADOS.RECOVER:
        if(e.stateTime>=cfg.recuperacion)cambiar(e,ESTADOS.CHASE);
        break;
      case ESTADOS.HURT:
        if(e.stateTime>=cfg.aturdimiento)cambiar(e,ESTADOS.CHASE);
        break;
    }
    return resultado;
  }
  function pose(e){
    const state=e.state;
    const fila=FILAS[state];
    const fps=state===ESTADOS.CHASE?11:state===ESTADOS.ATTACK?12:
      state===ESTADOS.KO?5:state===ESTADOS.HURT?8:4;
    const total=state===ESTADOS.CHASE?6:state===ESTADOS.ATTACK?4:
      state===ESTADOS.KO?3:state===ESTADOS.HURT?2:4;
    const frame=state===ESTADOS.PRE_ATTACK?0:
      state===ESTADOS.KO || state===ESTADOS.HURT || state===ESTADOS.ATTACK
        ?Math.min(total-1,Math.floor(e.animationTime*fps))
        :Math.floor(e.animationTime*fps)%total;
    return {fila,frame};
  }
  window.Pesol=Object.freeze({ESTADOS,crear,cambiar,recibirGolpe,avanzar,pose});
})();
