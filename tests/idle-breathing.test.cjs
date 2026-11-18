const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('src/animation.js','utf8'),sandbox);
const respirar=sandbox.window.Animacion.respiracionIdle;
const a=respirar(0),inhalar=respirar(.6),exhalar=respirar(1.8),ciclo=respirar(2.4);
assert.equal(a.escalaX,1);
assert.equal(a.escalaY,1);
assert(inhalar.escalaY>1.015,'el pecho se eleva al inspirar');
assert(exhalar.escalaY<.985,'el cuerpo baja al espirar');
assert(Math.abs(ciclo.escalaY-1)<1e-12,'la animación se repite sin salto');
assert(Math.abs(respirar(0).escalaY-respirar(-5).escalaY)<1e-12);
for(let t=0;t<=4.8;t+=.1){
 const p=respirar(t);
 assert(p.escalaX>=.996-1e-8&&p.escalaX<=1.004+1e-8,'ancho casi fijo');
 assert(p.escalaY>=.982-1e-8&&p.escalaY<=1.018+1e-8,'sin cambios bruscos de altura');
}
const game=fs.readFileSync('src/game.js','utf8');
assert(game.includes('if(usingPackIdle){'),'solo se anima el reposo del pack');
assert(game.includes('Animacion.respiracionIdle(p.animationTime)'),'respira según reloj de animación');
assert(game.includes('const sueloLocal=destY+destHeight;'),'pies anclados al suelo');
assert(game.includes('ctx.translate(0,sueloLocal);'));
assert(game.includes('ctx.translate(0,-sueloLocal);'));
assert(game.includes('p.stateTime,COMBO_MARCAS[p.attackStep-1]'),'ataques sin cambios');
console.log('IDLE: respiración periódica, suave, anclada al suelo y sin alterar combo.');
