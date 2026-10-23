'use strict';
process.env.HARNESS_ONLY='1';
const {run}=require('./expansion.test.cjs');
run(`{
 newGame();
 const sprite=document.createElement('span');$('player').querySelector=()=>sprite;
 heroWalkDistance=0;heroFacing=0;keys={ArrowLeft:true};
 const phases=[];
 for(let i=0;i<8;i++){animateHero(.06,true,{x:10.5,y:0,distance:10.5});phases.push(Number(sprite.dataset.frame))}
 assert.deepEqual(phases,[2,3,4,5,6,7,8,1],'all eight phases play in one stride');
 assert.equal(sprite.dataset.facing,'right','actual motion wins over stale keyboard direction');
 assert(sprite.style.backgroundImage.includes('protagonist-right-v2.webp'));
 heroWalkDistance=0;animateHero(.216,true,{x:37.8,y:0,distance:37.8});const one=sprite.dataset.frame;
 heroWalkDistance=0;for(let i=0;i<3;i++)animateHero(.072,true,{x:12.6,y:0,distance:12.6});
 assert.equal(sprite.dataset.frame,one,'gait phase is independent of frame rate');
 animateHero(.016,true,{x:0,y:-3,distance:3});assert.equal(sprite.dataset.facing,'up','wall sliding faces the displacement');
 const phase=heroWalkDistance;animateHero(0,false);assert.equal(heroWalkDistance,phase,'a room redraw does not restart the stride');
 animateHero(.016,false);assert.equal(sprite.dataset.frame,'0');assert.equal(sprite.dataset.facing,'up');assert.equal(heroWalkDistance,0,'a real stop returns to standing');
 assert.equal(heroDirection(2,2,0),0,'diagonal movement keeps a matching facing');
 assert.equal(heroDirection(-2,-2,0),1,'a changed diagonal direction turns the character');
 const originalMove=move,originalEnemy=animateEnemy,originalHero=animateHero;
 let largest=0;
 move=function(dt){largest=Math.max(largest,dt);state.pos.x+=175*dt};animateEnemy=()=>{};animateHero=()=>{};
 for(const fps of [20,30,60,120]){
  state.pos={x:0,y:0};last=0;for(let i=1;i<=fps;i++)loop(i*1000/fps);
  assert(Math.abs(state.pos.x-175)<1e-7,'same speed at '+fps+' fps');
 }
 assert(largest<=1/60+1e-10,'low frame rates keep small collision steps');
 state.pos={x:0,y:0};last=0;loop(5000);assert(Math.abs(state.pos.x-17.5)<1e-7,'a background tab cannot cause a large catch-up jump');
 move=originalMove;animateEnemy=originalEnemy;animateHero=originalHero;
}`);
console.log('PASS: eight-phase distance-based gait, actual facing, idle, diagonal stability and frame-rate-independent movement.');
