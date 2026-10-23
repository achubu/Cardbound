#!/usr/bin/env node
'use strict';
// Mechanical atlas packaging only: retain the image generator's artwork and alpha.
// Align the torso and planted foot without mirroring, recoloring or upscaling frames.
// Requires ImageMagick's convert and identify commands.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),cell=448,baseline=416;
const sourceDir=path.join(root,'assets/characters/hero-v2/source');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cardbound-hero-'));
const median=a=>a.sort((x,y)=>x-y)[Math.floor(a.length/2)];
const geometry=(x,y)=>(x>=0?'+':'')+x+(y>=0?'+':'')+y;
const all=[];
try{
 for(const direction of ['down','left','right','up']){
  const source=path.join(sourceDir,direction+'.png');
  const [w,h]=execFileSync('identify',['-format','%w %h',source],{encoding:'utf8'}).trim().split(' ').map(Number);
  if(w%3||h%3)throw Error(direction+': source must have an exact 3x3 grid');
  const fw=w/3,fh=h/3,frames=[];
  const sourceRGBA=execFileSync('convert',[source,'-depth','8','rgba:-'],{maxBuffer:32*1024*1024});
  // Generated rows can drift a few pixels. Find actual transparent gutters
  // per column rather than clipping hair or importing the next row's hair.
  const boundaries=[];
  for(let col=0;col<3;col++){
   const cuts=[0];
   for(let row=1;row<3;row++){
    const ideal=row*fh,radius=Math.round(fh*.12);let best=ideal,bestCount=Infinity;
    for(let y=ideal-radius;y<=ideal+radius;y++){
     let count=0;for(let x=col*fw;x<(col+1)*fw;x++)if(sourceRGBA[(y*w+x)*4+3]>8)count++;
     if(count<bestCount||count===bestCount&&Math.abs(y-ideal)<Math.abs(best-ideal)){best=y;bestCount=count}
    }
    if(bestCount)throw Error(direction+': no clear row gutter in column '+col);
    cuts.push(best);
   }
   boundaries.push([...cuts,h]);
  }
  for(let i=0;i<9;i++){
   const col=i%3,row=Math.floor(i/3),top=boundaries[col][row],height=boundaries[col][row+1]-top;
   const crop=fw+'x'+height+'+'+(col*fw)+'+'+top;
   const rgba=execFileSync('convert',[source,'-crop',crop,'+repage','-depth','8','rgba:-'],{maxBuffer:16*1024*1024});
   let minY=height,maxY=-1;const rows=[];
   for(let y=0;y<height;y++)for(let x=0;x<fw;x++)if(rgba[(y*fw+x)*4+3]>128){minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
   if(maxY<0)throw Error(direction+': empty frame '+i);
   for(let y=Math.round(minY+(maxY-minY)*.25);y<minY+(maxY-minY)*.48;y++){
    let lo=fw,hi=-1;
    for(let x=0;x<fw;x++){
     const at=(y*fw+x)*4,r=rgba[at],g=rgba[at+1],b=rgba[at+2],a=rgba[at+3];
     if(a>200&&r<100&&g<100&&b<155&&b>r+12&&b>g+5){lo=Math.min(lo,x);hi=Math.max(hi,x)}
    }
    if(hi-lo>fw*.12)rows.push((lo+hi)/2);
   }
   if(!rows.length)throw Error(direction+': could not locate torso '+i);
   const anchor=Math.round(median(rows)),x=Math.round(cell/2-anchor),y=baseline-maxY;
   const frame=path.join(temp,direction+'-'+i+'.png');
   execFileSync('convert',['-size',cell+'x'+cell,'xc:none','(',source,'-crop',crop,'+repage',')','-geometry',geometry(x,y),'-compose','Over','-composite',frame]);
   const packed=execFileSync('convert',[frame,'-depth','8','rgba:-'],{maxBuffer:16*1024*1024});
   const count=a=>{let n=0;for(let at=3;at<a.length;at+=4)if(a[at]>128)n++;return n};
   if(count(rgba)!==count(packed))throw Error(direction+': packaging clipped frame '+i);
   frames.push({index:i,source_crop:[col*fw,top,fw,height],source_anchor:[anchor,maxY],translation:[x,y],file:frame});
  }
  const output=path.join(root,'assets/characters/protagonist-'+direction+'-v2.webp');
  const args=['-size',cell*3+'x'+cell*3,'xc:none'];
  for(const f of frames)args.push(f.file,'-geometry','+'+(f.index%3*cell)+'+'+(Math.floor(f.index/3)*cell),'-compose','Over','-composite');
  const encoded=path.join(temp,direction+'.webp');
  args.push('-define','webp:lossless=true','-quality','100',encoded);execFileSync('convert',args);
  execFileSync('identify',[encoded]);fs.copyFileSync(encoded,output+'.tmp');fs.renameSync(output+'.tmp',output);
  all.push({direction,source:path.relative(root,source),output:path.relative(root,output),source_frame:[fw,fh],frames:frames.map(({file,...f})=>f)});
 }
 fs.writeFileSync(path.join(root,'assets/characters/hero-v2/atlas.json'),JSON.stringify({cell:[cell,cell],grid:[3,3],baseline,idle_frame:0,walk_frames:[1,2,3,4,5,6,7,8],aetherlink_arm:'anatomical left',sheets:all},null,2)+'\n');
 console.log('Packaged four lossless atlases; nine native-resolution frames each, 448px cells.');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
