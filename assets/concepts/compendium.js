/* Review-only presentation. Never import into the playable game. */
(() => {
'use strict';
const host=document.getElementById('concept-lab'); if(!host)return;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
fetch('assets/concepts/cards.json?v=concepts-20261018').then(r=>{if(!r.ok)throw Error('Concept data unavailable');return r.json();}).then(data=>{
 const mechanics=new Map(data.mechanics.map(m=>[m.id,m]));
 const links=m=>m.sources.map(id=>{const s=data.sources[id];return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></li>`;}).join('');
 host.innerHTML=`<p class="concept-notice">${esc(data.summary)}</p><p>${esc(data.selection)}</p>
 <details><summary>Design baseline and scope</summary><p>${esc(data.baseline)}</p><ul>${data.boundaries.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>
 <div class="concept-controls"><label>Find a concept<input id="concept-search" type="search" placeholder="Name, rule or world"></label><label>Mechanic<select id="concept-mechanic"><option value="">All mechanics</option>${data.mechanics.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></label><label>Preview level<select id="concept-level">${[0,1,2,3].map(n=>`<option value="${n}">Level ${n}</option>`).join('')}</select></label></div>
 <p id="concept-count" role="status" aria-live="polite"></p><div id="concept-grid" class="grid concept-grid"></div>
 <details><summary>Research and recommendations</summary><p>Original Cardbound adaptations informed by the sources below. Proposed rules and balance judgments are ours.</p>${data.mechanics.map(m=>`<section><h3>${esc(m.name)} · ${esc(m.priority)}</h3><p>${esc(m.inspiration)}</p><p>${esc(m.fit)}</p><p><b>Rule:</b> ${esc(m.rule)}</p><p><b>Limit:</b> ${esc(m.risk)}</p><ul>${links(m)}</ul></section>`).join('')}</details>`;
 const search=host.querySelector('#concept-search'),filter=host.querySelector('#concept-mechanic'),level=host.querySelector('#concept-level');
 function render(){
 const term=search.value.trim().toLowerCase();const cards=data.cards.filter(c=>(!filter.value||c.mechanic===filter.value)&&[c.name,c.region,c.kind,mechanics.get(c.mechanic).name,...c.tiers.map(t=>t.rules)].join(' ').toLowerCase().includes(term));
 host.querySelector('#concept-count').textContent=`${cards.length} of ${data.cards.length} concepts · Level ${level.value} · review only`;
 host.querySelector('#concept-grid').innerHTML=cards.map(c=>{const m=mechanics.get(c.mechanic),t=c.tiers[Number(level.value)];return `<article class="card concept-card" id="${c.id}"><div class="card-content"><p class="concept-status">CONCEPT · NOT PLAYABLE</p><div class="card-type">${esc(c.kind)} · ${esc(c.region)}</div><h3 class="card-title">${esc(c.name)}</h3><div class="concept-meta"><b>${c.cost} Energy</b><span>${esc(m.name)}</span><span>Level ${t.level}</span></div><p class="concept-rules">${esc(t.rules)}</p><p>${esc(m.priority)}</p><details><summary>Decision, limits and upgrades</summary><p><b>Your decision:</b> ${esc(c.decision)}</p><p><b>Tradeoff:</b> ${esc(c.tradeoff)}</p><p><b>Mechanic rule:</b> ${esc(m.rule)}</p><p><b>Interaction limit:</b> ${esc(m.risk)}</p><ul>${c.tiers.map(t=>`<li><b>Level ${t.level}:</b> ${esc(t.rules)}</li>`).join('')}</ul><p>${esc(m.inspiration)}</p><ul>${links(m)}</ul></details></div></article>`;}).join('')||'<p>No matching concepts. Try another name or mechanic.</p>';
 }
 search.addEventListener('input',render);filter.addEventListener('change',render);level.addEventListener('change',render);render();
}).catch(e=>{host.innerHTML='<p role="alert">Concept cards could not load. Reload from the hosted game to try again.</p>';console.warn('Concept compendium:',e);});
})();
