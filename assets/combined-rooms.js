'use strict';
// Rooms retain their map coordinates and artwork; selected cells share one camera area.
const JOINED_AREAS={
 city:[
  {name:'Burnout Avenue · West Service Road',cells:['-1,1','0,1']},
  {name:'Promenade Market',cells:['1,0','2,0']},
  {name:'Foundry Quarter',cells:['2,2','3,2','2,3','3,3']},
  {name:'Crown Mainframe District',cells:['4,1','5,1','4,2','5,2']}
 ],
 elaris:[
  {name:'Sunpetal Wilds',cells:['1,0','2,0']},
  {name:'Emerald Expanse',cells:['1,1','2,1','1,2','2,2']}
 ]
};
function joinedArea(key=state.room){
 const group=JOINED_AREAS[activeRegion].find(g=>g.cells.includes(key))||{name:rooms[key].name,cells:[key]};
 const xs=group.cells.map(k=>Number(k.split(',')[0])),ys=group.cells.map(k=>Number(k.split(',')[1]));
 const left=Math.min(...xs),top=Math.min(...ys);
 return {...group,left,top,width:(Math.max(...xs)-left+1)*800,height:(Math.max(...ys)-top+1)*500};
}
function cellOffset(key,area=joinedArea()){const [x,y]=key.split(',').map(Number);return{x:(x-area.left)*800,y:(y-area.top)*500}}
function joinedExit(dir,key=state.room){const raw=rooms[key].exits[dir];return typeof raw==='string'&&joinedArea(key).cells.includes(raw)?raw:null}
function areaPatrolCount(key){const area=joinedArea(key);return area.cells.length===2&&key===area.cells[0]?2:1}
function cameraPosition(area,pos,viewportWidth=800,viewportHeight=500){return{x:Math.max(0,Math.min(area.width-viewportWidth,pos.x-viewportWidth/2)),y:Math.max(0,Math.min(area.height-viewportHeight,pos.y-viewportHeight/2))}}
function updateAreaCamera(){
 if(!state)return;const area=joinedArea(),offset=cellOffset(state.room,area),scale=Math.min(innerWidth/800,innerHeight/500),camera=cameraPosition(area,{x:offset.x+state.pos.x,y:offset.y+state.pos.y});
 const world=$('world');world.style.width=area.width+'px';world.style.height=area.height+'px';world.style.left=(innerWidth-800*scale)/2+'px';world.style.top=(innerHeight-500*scale)/2+'px';world.style.transformOrigin='0 0';world.style.transform='scale('+scale+') translate('+(-camera.x)+'px,'+(-camera.y)+'px)';
 const player=$('player');if(player){player.style.left=(offset.x+state.pos.x)+'px';player.style.top=(offset.y+state.pos.y)+'px'}
}
const singleRenderWorld=renderWorld;
function appendPatrols(container,key){
 for(const spawn of roomSpawns(key)){if(!spawnAvailable(spawn))continue;const p=patrolFor(spawn),node=document.createElement('div');node.className='enemy-node monster-'+spawn.type+(spawn.boss?' boss':'')+(spawn.elite?' elite':'');node.dataset.spawn=spawn.uid;node.dataset.name=(spawn.elite?'★ ELITE · ':'')+(spawn.element?ELEMENT_ICONS[spawn.element]+' ':'')+enemies[spawn.type].name;node.style.left=p.x+'px';node.style.top=p.y+'px';node.innerHTML=monsterArt(spawn.type);container.append(node)}
}
renderWorld=function(){
 if(!state)return;singleRenderWorld();const world=$('world'),area=joinedArea(),current=document.createElement('div');
 // The original renderer's children remain in their own 800×500 art cell.
 while(world.firstChild)current.append(world.firstChild);
 for(const key of area.cells){
  const cell=key===state.room?current:document.createElement('div'),offset=cellOffset(key,area);cell.classList.add('area-cell');cell.style.left=offset.x+'px';cell.style.top=offset.y+'px';cell.dataset.room=key;
  if(key!==state.room){NeonCity.render(cell,key,rooms[key]);appendPatrols(cell,key);const q=rooms[key].relic;if(q&&!hasRelic(q[0])&&q[0]!=='material'){const relic=document.createElement('div');relic.className='relic';relic.textContent=q[2];relic.dataset.name=q[1];relic.style.left=q[3]+'px';relic.style.top=q[4]+'px';cell.append(relic)}const cache=chestFor(key);if(cache&&!state.chests.includes(cache.id)){const chest=document.createElement('div');chest.className='secret-chest';chest.textContent='▣';chest.style.left=cache.x+'px';chest.style.top=cache.y+'px';cell.append(chest)}}
  for(const dir of ['n','s','e','w'])if(joinedExit(dir,key))cell.querySelector('.city-exit.'+dir)?.remove();
  world.append(cell);
 }
 // The hero belongs to the full area so its sprite cannot be clipped at a join.
 const hero=current.querySelector('#player');if(hero)world.append(hero);
 updateAreaCamera();
 const title=document.createElement('div');title.className='joined-area-title';title.textContent=area.name+(area.cells.length>1?' · '+area.cells.length+' connected blocks':'');$('hud').append(title);
};
fitWorld=function(){if(state)updateAreaCamera();else $('world').style.setProperty('--world-scale',Math.min(innerWidth/800,innerHeight/500))};
const singleTransition=transition;
transition=function(dir){
 const target=joinedExit(dir);if(!target)return singleTransition(dir);
 state.room=target;if(!state.visited.includes(target))state.visited.push(target);
 if(dir==='e')state.pos.x-=800;if(dir==='w')state.pos.x+=800;if(dir==='n')state.pos.y+=500;if(dir==='s')state.pos.y-=500;
 save();renderWorld();return true;
};
move=function(dt){
 if(!state||state.battle||!$('menuOverlay').classList.contains('hidden'))return;
 const dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);if(!dx&&!dy)return;
 const len=Math.hypot(dx,dy),nx=state.pos.x+dx/len*175*dt,ny=state.pos.y+dy/len*175*dt;
 if(!collides(nx,state.pos.y))state.pos.x=nx;if(!collides(state.pos.x,ny))state.pos.y=ny;
 const v=state.pos.y>180&&state.pos.y<320,h=state.pos.x>330&&state.pos.x<470;
 const dir=state.pos.x<(joinedExit('w')?0:10)&&v?'w':state.pos.x>(joinedExit('e')?800:790)&&v?'e':state.pos.y<(joinedExit('n')?0:10)&&h?'n':state.pos.y>(joinedExit('s')?500:490)&&h?'s':null;
 if(dir&&transition(dir))return;
 state.pos.x=Math.max(joinedExit('w')?-24:12,Math.min(joinedExit('e')?824:788,state.pos.x));state.pos.y=Math.max(joinedExit('n')?-24:12,Math.min(joinedExit('s')?524:488,state.pos.y));
 const player=$('player');player.style.left=state.pos.x+'px';player.style.top=state.pos.y+'px';checkWorldInteractions();updateAreaCamera();
};
animateEnemy=function(dt){
 if(!state||state.battle||!$('menuOverlay').classList.contains('hidden'))return;
 // All patrols continue moving across the visible area. Each home sector stays clear.
 for(const key of joinedArea().cells)for(const spawn of roomSpawns(key)){
  if(!spawnAvailable(spawn))continue;const p=patrolFor(spawn);p.turn-=dt;if(p.turn<0){p.angle+=.8;p.turn=3}
  const nx=p.x+Math.cos(p.angle)*(spawn.boss?8:14)*dt,ny=p.y+Math.sin(p.angle)*(spawn.boss?8:14)*dt;
  if(walkable(key,nx,ny,26)&&Math.hypot(nx-spawn.x,ny-spawn.y)<55){p.x=nx;p.y=ny}else p.angle+=1.8;
  const node=document.querySelector('[data-spawn="'+spawn.uid+'"]');if(node){node.style.left=p.x+'px';node.style.top=p.y+'px';node.querySelector('.monster-sprite')?.style.setProperty('--enemy-facing',Math.cos(p.angle)<0?-1:1)}
  if(key===state.room&&Math.hypot(state.pos.x-p.x,state.pos.y-p.y)<(spawn.boss?58:43)){startBattle(spawn.uid);if(state.battle)return}
 }
};
const baseAreaMap=showMap;
showMap=function(){baseAreaMap();for(const node of document.querySelectorAll('.region-map .panel')){const key=Object.keys(rooms).find(k=>state.visited.includes(k)&&node.textContent.startsWith(rooms[k].name));if(!key)continue;const area=joinedArea(key);if(area.cells.length>1){const label=document.createElement('small');label.textContent=area.name+' · joined area';node.append(label);node.style.borderColor='#71babd'}}};
$('mapBtn').onclick=showMap;
const areaStyles=document.createElement('style');areaStyles.textContent='#game{overflow:hidden}#world{border:0}.area-cell{position:absolute;width:800px;height:500px;overflow:hidden}.joined-area-title{font:10px system-ui;color:#a5d7e0;margin-top:5px}';document.head.append(areaStyles);
