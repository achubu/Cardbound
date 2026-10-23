'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end()}
 res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
server.listen(0,async()=>{
 let browser;
 try{
  browser=await chromium.launch();const base='http://localhost:'+server.address().port;
  for(const [name,viewport,mobile] of [['desktop',{width:1280,height:820},false],['phone',{width:390,height:844},true]]){
   const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/index.html');await page.waitForFunction(()=>typeof cancelTouchRoute==='function');
   const poses=await page.evaluate(async()=>{
    newGame();
    const sheets=await Promise.all(['down','left','right','up'].map(direction=>new Promise((resolve,reject)=>{
     const image=new Image();image.onload=()=>resolve({direction,width:image.naturalWidth,height:image.naturalHeight});image.onerror=reject;image.src='assets/characters/protagonist-'+direction+'-v2.webp';
    })));
    const result=[];
    for(const [direction,x,y] of [['down',0,1],['left',-1,0],['right',1,0],['up',0,-1]]){
     for(let frame=0;frame<9;frame++){
      heroFacing=HERO_DIRECTIONS.indexOf(direction);heroWalkDistance=Math.max(0,frame-1)*HERO_STRIDE/8;
      animateHero(.016,frame>0,{x,y,distance:0});
      const sprite=document.querySelector('#player .hero-sprite'),style=getComputedStyle(sprite);
      result.push({direction,frame,actualFrame:Number(sprite.dataset.frame),actualFacing:sprite.dataset.facing,position:style.backgroundPosition,image:style.backgroundImage,sampling:style.imageRendering,animation:style.animationName});
     }
    }
    return {sheets,result};
   });
   assert(poses.sheets.every(s=>s.width===1344&&s.height===1344));
   for(const pose of poses.result){
    assert.equal(pose.actualFrame,pose.frame);assert.equal(pose.actualFacing,pose.direction);
    assert(pose.image.includes('protagonist-'+pose.direction+'-v2.webp'));
    assert.equal(pose.sampling,'auto');if(!pose.frame)assert.equal(pose.animation,'none','reduced motion disables breathing');
    assert.equal(pose.position,-(pose.frame%3)*84+'px '+-Math.floor(pose.frame/3)*84+'px');
   }
   const route=await page.evaluate(()=>{
    newGame();checkWorldInteractions=()=>{};
    const area=joinedArea(),start=touchWorldPoint(),grid=touchGrid(area);let path=null,target=null;
    for(let i=0;i<grid.valid.length;i++){
     if(!grid.valid[i])continue;const point={x:(i%grid.cols)*grid.step+grid.step/2,y:Math.floor(i/grid.cols)*grid.step+grid.step/2},d=Math.hypot(point.x-start.x,point.y-start.y);
     if(d<70||d>100)continue;const candidate=findTouchPath(area,start,point);
     if(candidate&&candidate.length>7&&candidate.length<30){path=candidate;target=point;break}
    }
    if(!path)throw Error('No test route found');
    if(!setTouchDestination(target))throw Error('Could not begin test route');
    let stopped=0,ticks=0,traveled=0,blocked=false;
    while(touchRoute&&ticks++<180){const before=touchWorldPoint();move(1/60);const now=touchWorldPoint(),distance=Math.hypot(now.x-before.x,now.y-before.y);traveled+=distance;if(touchRoute&&distance<.001)stopped++;if(!walkable(state.room,state.pos.x,state.pos.y))blocked=true}
    const end=touchWorldPoint();return {stopped,ticks,traveled,blocked,remaining:!!touchRoute,error:Math.hypot(end.x-target.x,end.y-target.y)};
   });
   assert.equal(route.stopped,0,name+': no idle frames at path waypoints');assert.equal(route.remaining,false);assert.equal(route.blocked,false);assert(route.traveled>60);assert(route.error<2,name+': reached the selected path spot');
   assert.deepEqual(errors,[],name+': no page errors');
   await page.goto(base+'/tools/hero-preview.html');await page.getByRole('button',{name:'Stand',exact:true}).click();
   await page.evaluate(async()=>{await Promise.all([...document.images].map(im=>im.decode()))});
   assert.equal(await page.locator('.sprite').count(),4);
   if(process.env.HERO_SCREENSHOT_DIR){fs.mkdirSync(process.env.HERO_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.HERO_SCREENSHOT_DIR,'hero-'+name+'.png'),fullPage:true})}
   console.log('PASS '+name+': all 36 poses, four loaded atlases, smooth sampling, reduced motion, and continuous collision-safe real-world tap route.');
   await context.close();
  }
 }catch(e){console.error(e);process.exitCode=1}
 finally{if(browser)await browser.close();server.close()}
});
