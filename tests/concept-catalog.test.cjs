const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');const data=JSON.parse(read('assets/concepts/cards.json'));
test('catalog is complete, sourced and excluded from gameplay',()=>{
 assert.equal(data.cards.length,16);assert.equal(new Set(data.cards.map(c=>c.id)).size,16);assert.equal(data.mechanics.length,8);
 for(const c of data.cards){assert.equal(c.status,'review-only');assert.equal(c.art,null);assert.deepEqual(c.tiers.map(t=>t.level),[0,1,2,3]);assert(data.mechanics.some(m=>m.id===c.mechanic));}
 for(const m of data.mechanics)for(const id of m.sources)assert.match(data.sources[id].url,/^https:\/\//);
 for(const file of ['index.html',...fs.readdirSync(path.join(root,'assets')).filter(x=>x.endsWith('.js')).map(x=>'assets/'+x)]){const source=read(file).replace(/^\s*\/\/.*$/gm,'');assert(!source.includes('assets/concepts/'));for(const c of data.cards)assert(!source.includes(c.id));}
});
test('presentation supports search, filtering, upgrades and no graphics',async()=>{
 const nodes={};for(const id of ['concept-search','concept-mechanic','concept-level','concept-count','concept-grid'])nodes['#'+id]={value:id==='concept-level'?'0':'',addEventListener(type,fn){this[type]=fn;},innerHTML:'',textContent:''};
 const host={innerHTML:'',querySelector:s=>nodes[s]};const context={document:{getElementById:id=>id==='concept-lab'?host:null},fetch:async()=>({ok:true,json:async()=>data}),console};
 vm.runInNewContext(read('assets/concepts/compendium.js'),context);await new Promise(setImmediate);
 const count=()=> (nodes['#concept-grid'].innerHTML.match(/class="card concept-card"/g)||[]).length;
 assert.equal(count(),16);assert(!/<img|<svg|<canvas/.test(host.innerHTML+nodes['#concept-grid'].innerHTML));
 nodes['#concept-mechanic'].value='reprise';nodes['#concept-mechanic'].change();assert.equal(count(),2);
 nodes['#concept-level'].value='3';nodes['#concept-level'].change();assert(nodes['#concept-grid'].innerHTML.includes('Deal 12 damage'));
 nodes['#concept-mechanic'].value='';nodes['#concept-search'].value='patient';nodes['#concept-search'].input();assert.equal(count(),1);assert(nodes['#concept-grid'].innerHTML.includes('Retain talent'));
 nodes['#concept-search'].value='no-match-ever';nodes['#concept-search'].input();assert.equal(count(),0);
});
