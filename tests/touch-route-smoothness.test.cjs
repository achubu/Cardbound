'use strict';
process.env.HARNESS_ONLY='1';
const fs=require('node:fs'),path=require('node:path');
const {run}=require('./expansion.test.cjs');
run(`
newGame();
joinedArea=()=>({cells:['0,5'],left:0,top:5,width:800,height:500});
cellOffset=()=>({x:0,y:0});
let routeWall=Infinity,routeHalt=Infinity;
move=function(dt){
 const dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0),dy=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);
 const nx=state.pos.x+dx*175*dt,ny=state.pos.y+dy*175*dt;
 if(nx<=routeWall)state.pos={x:nx,y:ny};
 if(state.pos.x>=routeHalt)$('menuOverlay').classList.remove('hidden');
};`);
run(fs.readFileSync(path.join(__dirname,'../assets/touch-controls.js'),'utf8'));
run(`{
 const begin=()=>{state.battle=null;state.pos={x:0,y:0};keys={};routeWall=routeHalt=Infinity;$('menuOverlay').classList.add('hidden');$('startOverlay').classList.add('hidden');touchRoute={points:[{x:0,y:0},{x:8,y:0},{x:16,y:0},{x:24,y:0},{x:32,y:0}],target:{x:32,y:0},area:activeRegion+':0,5',exit:null}};
 begin();move(.1);assert(Math.abs(state.pos.x-17.5)<1e-8,'unused frame time carries through waypoints');
 begin();state.pos.x=209.77499999999995;touchRoute.points=[{x:204,y:0},{x:196,y:0}];touchRoute.target={x:196,y:0};move(.033);assert(touchRoute,'floating-point time residue is not treated as a collision');assert(Math.abs(state.pos.x-204)<1e-8);
 begin();let previous=0;for(let i=0;i<10;i++){move(1/60);assert(state.pos.x>previous,'no pause at waypoint '+i);previous=state.pos.x}
 assert(Math.abs(state.pos.x-175/6)<1e-8,'continuous route keeps keyboard travel speed');
 begin();routeWall=12;move(.1);assert(state.pos.x<=12,'the follower still obeys collision checks');assert.equal(touchRoute,null,'blocked route is cancelled');
 begin();routeHalt=8;move(.1);assert.equal(state.pos.x,8,'opening an interaction stops remaining movement immediately');assert.equal(touchRoute,null);assert.deepEqual(keys,{},'temporary route keys are restored');
 begin();keys={ArrowLeft:true};move(.01);assert(state.pos.x<0,'keyboard input cancels a tap route');assert.equal(touchRoute,null);
}`);
console.log('PASS: tap paths have no waypoint pauses, preserve speed and collisions, stop at interactions, and yield to keyboard input.');
