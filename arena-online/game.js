
const cv=document.getElementById('c'),g=cv.getContext('2d'),D=Math.min(devicePixelRatio||1,2);let R=600;const MAPS=[{n:'Arena Circular',sq:0,S:0,vw:1260,vh:780,sp:230},{n:'Ruínas Vivas',sq:1,S:560,vw:1620,vh:980,sp:300,rift:{w:42,b:90}}];let MAP=MAPS[0],mapSel=0;
let W,H,k,cx,cy,st='menu',P,E,projs=[],traps=[],totems=[],mins=[],clones=[],sandstorms=[],bleeds=[],fxs=[],texts=[],laters=[],keys={},mouse={x:0,y:0,down:false},last=0;
function rs(){W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;k=Math.min(W/MAP.vw,H/MAP.vh);cx=W/2;cy=H/2+10*k}
addEventListener('resize',rs);rs();
const iso=(x,y)=>[cx+(x-y)*.7*k,cy+(x+y)*.35*k],toW=(mx,my)=>{const a=(mx-cx)/(.7*k),b=(my-cy)/(.35*k);return[(a+b)/2,(b-a)/2]};
const angd=(a,b)=>((a-b+3*Math.PI)%(2*Math.PI))-Math.PI,rnd=Math.random;
// ---------- helpers ----------
const T=s=>[s.foe,...mins.filter(m=>m.o===s.foe),...pls];
const later=(t,fn)=>laters.push({t,fn}),fx=(x,y,r,t,c,kd,a)=>fxs.push({x,y,r,t,m:t,c,k:kd,a}),tx=(x,y,s,c)=>texts.push({x,y,s,c,t:.8});
function dmg(t,n,s){if(t.inv>0||t.hp<=0)return 0;if(t.id==='mirage'&&sandstorms.some(q=>q.o===t&&q.t>0&&Math.hypot(t.x-q.x,t.y-q.y)<q.r)&&rnd()<.35){fx(t.x,t.y,38,.25,'#e8c989','ring');tx(t.x,t.y,'ESQUIVA','#f0d39b');return 0}if(NM.on&&!s.netApply&&(s===E||s.o===E)&&(t===P||t.foe===E))return 0;if(s.buff>0)n*=1.3;if(s.poi>0)n*=.75;if(s.amp>0)n*=1.35;if(t.gorFury>0)n*=.75;if(t.dr>0)n*=.6;if(t.pl){t.hp-=n;t.flash=.1;tx(t.x,t.y,Math.round(n),'#fff');if(t.hp<=0)brk(t,s);return 0}if(t.net){t.flash=.1;if(NM.on&&(s===P||s.o===P))qpush({e:'d',d:Math.round(n)});if(n>=60)bigHit(t,s,n);tx(t.x,t.y,Math.round(n),'#fff');return n}if(t.shield>0){const a=Math.min(t.shield,n);t.shield-=a;n-=a}t.hp-=n;t.rev=.8;t.flash=.1;if(n>=60)bigHit(t,s,n);if(n>=1)tx(t.x,t.y,Math.round(n),'#fff');return n}
function heal(u,n){if(u.poi>0)n*=.5;if(n<1)return;u.hp=Math.min(u.mhp,u.hp+n);tx(u.x,u.y,'+'+Math.round(n),'#6f6')}
function area(s,x,y,r,d,o={}){for(const t of T(s))if(Math.hypot(t.x-x,t.y-y)<r+t.r){const n=dmg(t,d,s);if(o.ls)heal(s,n*o.ls);if(t.id){if(o.st)t.stun=Math.max(t.stun,o.st);if(o.slow){t.slow=o.slow[1];t.slowF=o.slow[0]}}}}
function cone(m,rg,d){fx(m.x,m.y,rg,.15,'#fff','slash',m.face);for(const t of T(m)){const dx=t.x-m.x,dy=t.y-m.y;if(Math.hypot(dx,dy)<rg+t.r&&Math.abs(angd(Math.atan2(dy,dx),m.face))<1)dmg(t,d,m)}}
function proj(m,a,o){projs.push({x:m.x+Math.cos(a)*20,y:m.y+Math.sin(a)*20,a,o,s:o.s,r:o.r,d:o.d,own:m,life:o.life||1.4,hit:new Set()})}
function dash(m,a,s,t,o){m.dash={a,s,t,o,hit:new Set()};if(o.inv)m.inv=Math.max(m.inv,o.inv)}
function summon(m){mins.push({x:m.x+rnd()*60-30,y:m.y+rnd()*60-30,hp:70,r:12,o:m,foe:m.foe,t:10,cd:0,inv:0,dr:0,shield:0,buff:0,flash:0,sp:170})}
// ---------- personagens ----------
const CH={
war:{n:'Guerreiro',role:'Tanque corpo a corpo',c:'#4f8cff',w:'#cfd8e8',hp:1500,sp:150,pref:50,rng:0,
 b:{cd:.7,rg:90,t:'Golpe de espada (largo, dano baixo)',f:m=>cone(m,75,24)},
 ab:[{n:'Investida de Escudo',cd:6,ai:[60,300],t:'Avança e atordoa 0.9s',f:m=>dash(m,m.face,700,.25,{d:28,st:.9})},
 {n:'Muralha de Aço',cd:9,ai:[0,220],t:'Escudo de 180 + 40% menos dano (4s)',f:m=>{m.shield=180;m.shT=4;m.dr=4;fx(m.x,m.y,50,.4,'#6af','ring')}},
 {n:'Grito de Guerra',cd:7,ai:[0,140],t:'Dano em área e lentidão',f:m=>{fx(m.x,m.y,150,.4,'#fb4','ring');area(m,m.x,m.y,150,22,{slow:[.5,3]})}},
 {n:'TERREMOTO',cd:40,ai:[0,200],t:'Área enorme: 110 dano + stun 1.5s',f:m=>{m.lock=.7;fx(m.x,m.y,230,.7,'#f84','fill');later(.7,()=>{fx(m.x,m.y,230,.4,'#f84','ring');area(m,m.x,m.y,230,110,{st:1.5})})}}]},
gun:{n:'Atirador',role:'Dano à distância e controle',c:'#ffb84f',w:'#444',hp:850,sp:170,pref:380,rng:1,
 b:{cd:.33,rg:600,t:'Disparo rápido',f:m=>proj(m,m.face,{s:750,r:6,d:14,c:'#ffd'})},
 ab:[{n:'Salto Tático',cd:5,ai:[0,170],t:'Pula para trás, invulnerável brevemente',f:m=>dash(m,m.face+Math.PI,900,.22,{inv:.25})},
 {n:'Armadilha de Espinhos',cd:7,ai:[120,420],t:'Causa dano e lentidão ao pisar',f:(m,f,ax,ay)=>{const d=Math.min(220,Math.hypot(ax-m.x,ay-m.y));traps.push({x:m.x+Math.cos(m.face)*d,y:m.y+Math.sin(m.face)*d,o:m,t:25,arm:.5})}},
 {n:'Tiro Repulsor',cd:6,ai:[0,260],t:'Empurra o inimigo e deixa lento',f:m=>proj(m,m.face,{s:900,r:9,d:22,kb:190,slow:[.5,2],c:'#fd5'})},
 {n:'TIRO MORTAL',cd:35,ai:[150,700],t:'Projétil perfurante: 230 dano',f:m=>{m.lock=.55;const a=m.face;fx(m.x,m.y,40,.55,'#f55','ring');later(.55,()=>proj(m,a,{s:1700,r:15,d:230,pierce:1,life:.6,c:'#f55'}))}}]},
sam:{n:'Samurai',role:'Mobilidade e combos',c:'#e5484d',w:'#e8eef8',hp:1000,sp:215,pref:50,rng:0,
 b:{cd:.38,rg:95,t:'Corte rápido',f:m=>cone(m,80,18)},
 ab:[{n:'Investida Relâmpago',cd:4,ai:[80,350],t:'Avanço veloz que corta',f:m=>dash(m,m.face,1300,.2,{d:30})},
 {n:'Passo Fantasma',cd:5,ai:[150,500],t:'Teleporta até o mouse, invulnerável',f:(m,f,ax,ay)=>{const a=Math.atan2(ay-m.y,ax-m.x),d=Math.min(240,Math.hypot(ax-m.x,ay-m.y));fx(m.x,m.y,30,.4,'#fff','ring');m.x+=Math.cos(a)*d;m.y+=Math.sin(a)*d;m.inv=.4;fx(m.x,m.y,30,.4,'#fff','ring')}},
 {n:'Corte Giratório',cd:6,ai:[0,100],t:'Redemoinho de lâminas em volta',f:m=>{for(let i=0;i<6;i++)later(i*.1,()=>{fx(m.x,m.y,95,.15,'#fff','ring');area(m,m.x,m.y,95,12)})}},
 {n:'MIL CORTES',cd:35,ai:[0,350],t:'Teleporta no alvo: 8 golpes (224 dano)',f:m=>{const f=m.foe;m.x=f.x-Math.cos(m.face)*40;m.y=f.y-Math.sin(m.face)*40;m.lock=1.3;m.inv=1.4;f.stun=Math.max(f.stun,1.2);for(let i=0;i<8;i++)later(i*.15,()=>{area(m,m.x,m.y,130,28);fx(m.x,m.y,70,.2,'#f66','slash',rnd()*6.28)})}}]},
nec:{n:'Necromante',role:'Roubo de vida, totens e lacaios',c:'#a855f7',w:'#7a3',hp:900,sp:160,pref:280,rng:1,
 b:{cd:.55,rg:450,t:'Orbe sombrio (rouba 50% da vida)',f:m=>proj(m,m.face,{s:480,r:8,d:14,ls:.5,c:'#c6f'})},
 ab:[{n:'Lança Sanguínea',cd:5,ai:[0,550],t:'Dano alto e cura 100% do dano',f:m=>proj(m,m.face,{s:750,r:10,d:38,ls:1,c:'#e44'})},
 {n:'Totem Sombrio',cd:10,ai:[0,500],t:'8s: +30% dano e regeneração na área',f:(m,f,ax,ay)=>{const d=Math.min(160,Math.hypot(ax-m.x,ay-m.y));totems.push({x:m.x+Math.cos(m.face)*d,y:m.y+Math.sin(m.face)*d,o:m,t:8})}},
 {n:'Invocar Lacaios',cd:8,ai:[0,500],t:'2 lacaios atacam por 10s',f:m=>{summon(m);summon(m)}},
 {n:'CEIFA DE ALMAS',cd:40,ai:[0,260],t:'Drena 90 de vida em área e invoca 3 lacaios',f:m=>{fx(m.x,m.y,280,.6,'#a3f','ring');area(m,m.x,m.y,280,90,{ls:1});summon(m);summon(m);summon(m)}}]},
 cond:{n:'O Condutor',role:'Duelista da Tempestade · À distância / híbrido',c:'#70dfff',w:'#eaf7ff',hp:1050,sp:190,pref:80,rng:1,passive:'charge',
  b:{cd:.48,rg:105,t:'Golpe Condutor (corpo a corpo; à distância durante Sobrecarga)',f:m=>{const empowered=m.charges>0;if(empowered)m.charges--;const d=(m.over>0?30:22)+(empowered?16:0);if(m.over>0)proj(m,m.face,{s:1050,r:8,d:d+8,pierce:1,life:.55,c:'#7df'});else{cone(m,90,d);fx(m.x,m.y,82,.18,'#6df','slash',m.face)}if(empowered)fx(m.x,m.y,42,.2,'#9ef','ring')}},
  ab:[{n:'Raio Linear',cd:6,ai:[100,520],t:'Raio perfurante em linha reta: 54 dano',f:m=>{proj(m,m.face,{s:1350,r:10,d:54,pierce:1,life:.72,c:'#7df'});fx(m.x,m.y,34,.2,'#8ef','ring')}},
  {n:'Julgamento Celeste',cd:8,ai:[0,440],t:'Marca o chão; após 0.7s, causa 74 dano e atordoa brevemente',f:(m,f,ax,ay)=>{const a=Math.atan2(ay-m.y,ax-m.x),d=Math.min(440,Math.hypot(ax-m.x,ay-m.y)),x=m.x+Math.cos(a)*d,y=m.y+Math.sin(a)*d;fx(x,y,105,.7,'#6df','fill');fx(x,y,105,.7,'#aff','ring');later(.7,()=>{fx(x,y,112,.35,'#8ef','ring');area(m,x,y,105,74,{st:.35})})}},
  {n:'Carga Elétrica',cd:0,passive:true,ai:[Infinity,Infinity],t:'Cada habilidade fortalece os próximos 2 ataques básicos (+16 dano).',f:()=>{}},
  {n:'Sobrecarga',cd:34,ai:[100,620],t:'Por 8s, seus ataques básicos viram projéteis e causam dano extra.',f:m=>{m.over=8;fx(m.x,m.y,100,.5,'#6df','ring');tx(m.x,m.y,'SOBRECARGA','#8ef')}}]},
 mirage:{n:'O Miragem',role:'Assassino de Areia · Melee',c:'#d9b477',w:'#f2dfbc',hp:980,sp:225,pref:55,rng:0,
 b:{cd:.42,rg:100,t:'Lâminas da Miragem: cortes duplos; o 3º ataque gira e atinge uma pequena área.',f:m=>{m.combo=m.comboT>0?(m.combo||0)+1:1;m.comboT=1.35;if(m.combo>=3){m.combo=0;cone(m,112,36);fx(m.x,m.y,95,.2,'#d9b477','slash',m.face)}else{cone(m,82,19);fx(m.x,m.y,75,.16,'#e8c989','slash',m.face)}}},
 ab:[{n:'Passo de Areia',cd:6,ai:[0,350],t:'Avança até 220 unidades, fica intangível por um instante e fere quem atravessa.',f:(m,f,ax,ay)=>{const a=Math.atan2(ay-m.y,ax-m.x),dist=Math.min(220,Math.max(55,Math.hypot(ax-m.x,ay-m.y)));fx(m.x,m.y,36,.3,'#d9b477','ring');dash(m,a,900,dist/900,{d:34,inv:.32});fx(m.x+Math.cos(a)*dist,m.y+Math.sin(a)*dist,40,.3,'#e8c989','ring')}},
 {n:'Lâmina do Deserto',cd:7,ai:[0,400],t:'Cone de areia à frente causa dano e reduz a velocidade por 1.6s.',f:m=>{fx(m.x,m.y,160,.28,'#d9b477','slash',m.face);for(const t of T(m)){const dx=t.x-m.x,dy=t.y-m.y,d=Math.hypot(dx,dy);if(d<160+t.r&&Math.abs(angd(Math.atan2(dy,dx),m.face))<.82){dmg(t,42,m);if(t.id){t.slow=1.6;t.slowF=.52}}}}},
 {n:'Clone de Areia',cd:9,ai:[80,460],t:'Cria uma ilusão que corre na direção escolhida; ao tocar o inimigo, explode e causa dano leve.',f:(m,f,ax,ay)=>{const a=Math.atan2(ay-m.y,ax-m.x);clones.push({x:m.x,y:m.y,a,s:290,t:1.25,o:m});fx(m.x,m.y,28,.25,'#d9b477','ring')}},
 {n:'TEMPESTADE DAS MIL LÂMINAS',cd:38,ai:[0,500],t:'Cria uma tempestade por 4.5s; causa dano repetido e concede 35% de evasão ao Miragem dentro dela.',f:(m,f,ax,ay)=>{const a=Math.atan2(ay-m.y,ax-m.x),d=Math.min(420,Math.hypot(ax-m.x,ay-m.y)),x=m.x+Math.cos(a)*d,y=m.y+Math.sin(a)*d;sandstorms.push({x,y,r:175,t:4.5,tick:.1,o:m});fx(x,y,175,.5,'#d9b477','ring');tx(x,y,'TEMPESTADE','#f0d39b')}}]},
 wolf:{n:'O Predador',role:'Lobisomem · Perseguidor agressivo · Corpo a corpo',c:'#c84b4b',w:'#d0b7a2',hp:1080,sp:205,pref:50,rng:0,
 b:{cd:.48,rg:105,t:'Garras Selvagens: combo de 3 golpes; o terceiro causa dano extra.',f:m=>{m.wolfCombo=m.wolfComboT>0?(m.wolfCombo||0)+1:1;m.wolfComboT=1.25;const rage=m.rage>0?1.2:1;if(m.wolfCombo>=3){m.wolfCombo=0;cone(m,112,34*rage);fx(m.x,m.y,94,.2,'#d95656','slash',m.face)}else{cone(m,86,20*rage);fx(m.x,m.y,76,.16,'#b83b43','slash',m.face)}}},
 ab:[{n:'Investida Predatória',cd:6,ai:[60,420],t:'Avança rapidamente; ao colidir, rasga o inimigo. Alcance maior durante a Fúria do Alfa.',f:(m,f,ax,ay)=>{const a=Math.atan2(ay-m.y,ax-m.x),dist=m.rage>0?380:270;fx(m.x,m.y,34,.25,'#c84b4b','ring');dash(m,a,1200,dist/1200,{d:m.rage>0?44:34});}},
 {n:'Dilacerar',cd:7,ai:[0,150],t:'Dois golpes: o primeiro reduz velocidade; acertar ambos causa dano extra e sangramento.',f:m=>{const first=new Set;const hit=(second)=>{fx(m.x,m.y,132,.18,'#d95656','slash',m.face);for(const t of T(m)){const dx=t.x-m.x,dy=t.y-m.y;if(Math.hypot(dx,dy)<124+t.r&&Math.abs(angd(Math.atan2(dy,dx),m.face))<1){if(!second){first.add(t);dmg(t,24,m);if(t.id){t.slow=1.25;t.slowF=.55}}else{dmg(t,first.has(t)?39:23,m);if(first.has(t)&&t.id)bleeds.push({target:t,o:m,t:2,tick:.15})}}}};hit(false);later(.24,()=>hit(true))}},
 {n:'Rugido Intimidador',cd:9,ai:[0,130],t:'Onda de choque ao redor causa dano, lentidão e interrompe brevemente os inimigos próximos.',f:m=>{fx(m.x,m.y,170,.35,'#c84b4b','ring');for(const t of T(m))if(Math.hypot(t.x-m.x,t.y-m.y)<170+t.r){dmg(t,30,m);if(t.id){t.slow=2;t.slowF=.55;t.stun=Math.max(t.stun,.25)}}}},
 {n:'FÚRIA DO ALFA',cd:36,ai:[0,300],t:'Por 7s, aumenta o dano e a velocidade dos ataques; a Investida ganha alcance.',f:m=>{m.rage=7;fx(m.x,m.y,120,.55,'#e64b4b','ring');tx(m.x,m.y,'FÚRIA DO ALFA','#ff8b73')}}]},
 gor:{n:'Gorgrath, o Carniceiro',role:'Lutador / Iniciador · Corpo a corpo · Dificuldade média-alta',c:'#a94337',w:'#c0a995',hp:1300,sp:155,pref:48,rng:0,
 b:{cd:.7,rg:88,t:'Cutelo pesado: golpe corpo a corpo de alto dano.',f:m=>{for(const t of T(m)){const dx=t.x-m.x,dy=t.y-m.y;if(Math.hypot(dx,dy)<82+t.r&&Math.abs(angd(Math.atan2(dy,dx),m.face))<1){const dealt=dmg(t,32,m);if(m.gorFury>0&&dealt>0){const actual=Math.min(25,m.mhp-m.hp);if(actual>0){m.hp+=actual;tx(m.x,m.y,'+'+Math.round(actual),'#6f6')}}}}fx(m.x,m.y,76,.18,'#781e1b','slash',m.face)}},
 ab:[{n:'Gancho do Abatedouro',cd:7,ai:[80,650],t:'Arremessa o gancho em linha reta. Ao acertar, causa 100 de dano e puxa o inimigo até Gorgrath; também recolhe buffs.',f:m=>{const a=m.face;fx(m.x,m.y,34,.24,'#a94337','ring');proj(m,a,{s:780,r:11,d:0,life:1.15,c:'#a94337',hook:true})}},
 {n:'Talho Brutal',cd:4,ai:[0,130],t:'Cutelo horizontal: 138 de dano, 20% a mais contra alvos abaixo de 30% de vida; aplica 20% de lentidão por 1.5s.',f:m=>{fx(m.x,m.y,138,.2,'#9e302a','slash',m.face);for(const t of T(m)){const dx=t.x-m.x,dy=t.y-m.y;if(Math.hypot(dx,dy)<138+t.r&&Math.abs(angd(Math.atan2(dy,dx),m.face))<.9){const bonus=t.hp/t.mhp<.3?1.25:1;dmg(t,138*bonus,m);if(t.id){t.slow=1.5;t.slowF=.8}}}}},
 {n:'Fúria da Carne',cd:10,ai:[0,150],t:'Por 3s, recebe 25% menos dano; cada ataque básico que acerta recupera 25 de vida, até o máximo de vida.',f:m=>{m.gorFury=3;fx(m.x,m.y,90,.35,'#a94337','ring');tx(m.x,m.y,'FÚRIA DA CARNE','#e88b76')}},
 {n:'ABATE FINAL',cd:40,ai:[0,150],t:'Prepara o golpe por 0.8s; causa 205 + 8% da vida máxima perdida em cone, atordoa 0.75s e causa 50% a mais abaixo de 20% de vida.',f:m=>{m.lock=.8;tx(m.x,m.y,'ABATE FINAL','#ffb69c');fx(m.x,m.y,125,.8,'#a94337','ring');later(.8,()=>{fx(m.x,m.y,220,.3,'#a94337','slash',m.face);for(const t of T(m)){const dx=t.x-m.x,dy=t.y-m.y;if(Math.hypot(dx,dy)<220+t.r&&Math.abs(angd(Math.atan2(dy,dx),m.face))<.85){let amount=205+(t.mhp-t.hp)*.08;if(t.hp/t.mhp<.2)amount*=1.5;dmg(t,amount,m);if(t.id)t.stun=Math.max(t.stun,.75)}}})}}]}};
// ---------- menu ----------
const cards=document.getElementById('cards'),HERO_ORDER=['nec','gun','war','sam','cond','mirage','wolf','gor'],HERO_IMAGES={nec:'necromante.jpg',gun:'atirador.jpg',war:'guerreiro.jpg',sam:'samurai.jpg',cond:'condutor.jpg',mirage:'miragem.jpg',wolf:'lobisomem.jpg',gor:'gorgrath.jpg'};let selectedHero='nec',localPicks=['nec','gun'],localCursors=[0,1],localReady=[false,false],activePicker=0,menuPadPrev=[];
function chooseHero(id){if(!CH[id])return;selectedHero=id;mi=HERO_ORDER.indexOf(id);if(mode===2){pickLocalHero(activePicker,id);return}cards.querySelectorAll('.cd').forEach(c=>c.classList.toggle('selected',c.dataset.hero===id));const c=CH[id];document.getElementById('selectedName').textContent=c.n;document.getElementById('selectedStats').textContent=c.role+' · '+c.hp+' HP';document.getElementById('confirmPick').disabled=false}
function paintLocalPicks(){for(const card of cards.querySelectorAll('.cd')){const id=card.dataset.hero,p1=localPicks[0]===id,p2=localPicks[1]===id,tags=card.querySelector('.pick-tags');card.classList.toggle('p1-picked',p1);card.classList.toggle('p2-picked',p2);card.classList.toggle('selected',id===localPicks[activePicker]);tags.innerHTML=(p1?'<span class="p1">J1</span>':'')+(p2?'<span class="p2">J2</span>':'')}}
function pickLocalHero(player,id){if(!CH[id]||localReady[player])return;localPicks[player]=id;localCursors[player]=HERO_ORDER.indexOf(id);paintLocalPicks();updateLocalPickUI()}
function updateLocalPickUI(){const p1=CH[localPicks[0]],p2=CH[localPicks[1]];document.getElementById('localName1').textContent=p1.n;document.getElementById('localName2').textContent=p2.n;document.getElementById('editPlayer1').classList.toggle('active',activePicker===0);document.getElementById('editPlayer2').classList.toggle('active',activePicker===1);document.getElementById('editPlayer1').disabled=localReady[0];document.getElementById('editPlayer2').disabled=localReady[1];document.getElementById('readyPlayer1').textContent=localReady[0]?'J1 confirmado ✓':'Confirmar escolha do J1';document.getElementById('readyPlayer2').textContent=localReady[1]?'J2 confirmado ✓':'Confirmar escolha do J2';document.getElementById('readyPlayer1').classList.toggle('ready',localReady[0]);document.getElementById('readyPlayer2').classList.toggle('ready',localReady[1]);document.getElementById('localPickStatus').textContent=localReady[0]&&localReady[1]?'Escolhas confirmadas. Iniciando partida…':'Cada jogador escolhe e confirma seu campeão.';paintLocalPicks()}
function toggleLocalReady(player){localReady[player]=!localReady[player];updateLocalPickUI();if(localReady[0]&&localReady[1])start(localPicks[0],localPicks[1],mapSel)}
function selectLocalEditor(player){if(!localReady[player]){activePicker=player;updateLocalPickUI()}}
for(const id of HERO_ORDER){const c=CH[id],d=document.createElement('article');d.className='cd';d.dataset.hero=id;d.style.setProperty('--c',c.c);d.tabIndex=0;d.setAttribute('role','button');d.setAttribute('aria-label',`Selecionar ${c.n}, ${c.hp} pontos de vida`);
d.innerHTML=`<div class="hero-image"><img src="${HERO_IMAGES[id]}" alt="${c.n}" loading="eager"><div class="hero-title"><h2>${c.n}</h2><span>♥ ${c.hp} HP</span></div></div><div class="hero-role">${c.role}</div><ul><li><i>⌖</i><span><b>Ataque básico</b> · ${c.b.t}</span></li>${c.ab.map((a,i)=>`<li><i>${'QERF'[i]}</i><span><b>${a.n}${a.passive?' · Passiva':' · '+a.cd+'s'}</b> — ${a.t}</span></li>`).join('')}</ul><button class="card-select" type="button">Selecionar campeão</button>`;
d.querySelector('.hero-image').insertAdjacentHTML('afterbegin','<div class="pick-tags"></div>');d.onclick=()=>mode===2?pickLocalHero(activePicker,id):chooseHero(id);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();d.onclick()}};cards.appendChild(d)}
cards.firstElementChild.classList.add('selected');document.getElementById('selectedName').textContent=CH.nec.n;document.getElementById('selectedStats').textContent=CH.nec.role+' · '+CH.nec.hp+' HP';
document.getElementById('confirmPick').onclick=()=>start(selectedHero);document.getElementById('editPlayer1').onclick=()=>selectLocalEditor(0);document.getElementById('editPlayer2').onclick=()=>selectLocalEditor(1);document.getElementById('readyPlayer1').onclick=()=>toggleLocalReady(0);document.getElementById('readyPlayer2').onclick=()=>toggleLocalReady(1);
document.getElementById('openNotes').onclick=()=>document.getElementById('patches').style.display='flex';['closeNotes','notesBack'].forEach(id=>document.getElementById(id).onclick=()=>document.getElementById('patches').style.display='none');addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('patches').style.display='none'});
function menu(){mpLeave();st='menu';document.getElementById('pause').style.display='none';document.getElementById('pauseButton').style.display='none';document.getElementById('wait').style.display='none';document.getElementById('end').style.display='none';document.getElementById('patches').style.display='none';document.getElementById('menu').style.display='block'}
function togglePause(){if(mode!==0&&mode!==2)return;if(st==='play'){st='paused';document.getElementById('pause').style.display='flex';document.getElementById('pauseButton').style.display='none'}else if(st==='paused'){st='play';document.getElementById('pause').style.display='none';document.getElementById('pauseButton').style.display='block'}}
function pausePad(){if(mode!==0&&mode!==2)return;let pressed=false;for(const p of padsConnected()){const id=p.index,down=!!(p.buttons[9]&&p.buttons[9].pressed),was=startPrev[id]||false;if(down&&!was)pressed=true;startPrev[id]=down}if(pressed)togglePause()}
function mk(id,x,y,human){const c=CH[id];return{id,cl:c,x,y,hp:c.hp,mhp:c.hp,sp:c.sp,r:16,cd:[0,0,0,0],bcd:0,charges:0,over:0,rage:0,wolfCombo:0,wolfComboT:0,gorFury:0,furyHealed:0,pull:null,combo:0,comboT:0,stun:0,slow:0,slowF:1,lock:0,inv:0,dr:0,buff:0,flash:0,shield:0,shT:0,face:0,mx:0,my:0,human,think:1,sdir:1,kd:0,ka:0,dash:null,attackAt:0}}
function start(id,op,mp){if(mode==1&&!op){mpJoin(id);return}const local=mode===2;setupMap(!local&&op?(mp|0):mapSel);const o=Object.keys(CH).filter(x=>x!=id),h=local||!op||NM.host,sp=MAP.sp;P=mk(id,h?-sp:sp,h?sp:-sp,1);E=mk(local?op:(op||o[Math.floor(rnd()*o.length)]),h?sp:-sp,h?-sp:sp,local?1:0);if(op&&!local){E.net=1;NM.hid=0}P.foe=E;E.foe=P;hz=[];pks=[];evN=0;pkT=5;evT=7;banner=null;flash=0;initMap();projs=[];traps=[];totems=[];mins=[];clones=[];sandstorms=[];bleeds=[];fxs=[];texts=[];laters=[];
document.getElementById('menu').style.display='none';document.getElementById('pause').style.display='none';document.getElementById('pauseButton').style.display=(mode===0||mode===2)?'block':'none';st='play'}
// ---------- ações ----------
const can=u=>u.stun<=0&&u.lock<=0&&!u.dash&&u.hp>0;
function basic(u){if(u.bcd<=0&&can(u)){u.bcd=u.cl.b.cd*(u.id==='wolf'&&u.rage>0?.65:1);u.rev=1.2;u.attackAt=performance.now();if(NM.on&&u===P)qpush({e:'b',x:Math.round(u.x),y:Math.round(u.y),f:+u.face.toFixed(2)});u.cl.b.f(u)}}
function cast(u,i,ax,ay){const a=u.cl.ab[i];if(a.passive)return;if(u.cd[i]<=0&&can(u)){u.cd[i]=a.cd;u.rev=1.2;u.attackAt=performance.now();if(NM.on&&u===P)qpush({e:'c',i,x:Math.round(u.x),y:Math.round(u.y),f:+u.face.toFixed(2),ax:Math.round(ax),ay:Math.round(ay)});a.f(u,u.foe,ax,ay);if(u.cl.passive==='charge')u.charges=2}}
addEventListener('keydown',e=>{const q=e.key.toLowerCase();if(e.key==='Escape'){if(document.getElementById('patches').style.display==='flex')document.getElementById('patches').style.display='none';else togglePause();e.preventDefault();return}keys[q]=1;padMode=false;if(st=='play'&&mode!==2&&'qerf'.includes(q)&&q.length==1){const[ax,ay]=toW(mouse.x,mouse.y);cast(P,'qerf'.indexOf(q),ax,ay)}if(' wasd'.includes(q))e.preventDefault()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;padMode=false});
addEventListener('mousedown',()=>mouse.down=true);addEventListener('mouseup',()=>mouse.down=false);
function ai(u,dt){const f=u.foe,dx=f.x-u.x,dy=f.y-u.y,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx),pr=u.cl.pref;u.face=a;let mx=0,my=0;
 if(d>pr+40){mx=dx/d;my=dy/d}else if(d<pr-60&&u.cl.rng){mx=-dx/d;my=-dy/d}else if(u.cl.rng){mx=-dy/d*u.sdir;my=dx/d*u.sdir}
 if(rnd()<dt*.5)u.sdir*=-1;const pk=pks.filter(q=>Math.hypot(q.x-u.x,q.y-u.y)<380).sort((a,b)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(b.x-u.x,b.y-u.y))[0];if(pk&&d>120){const pd=Math.hypot(pk.x-u.x,pk.y-u.y)||1;mx=(pk.x-u.x)/pd;my=(pk.y-u.y)/pd}
 for(const h of hz)if((h.k=='met'||h.k=='bolt')&&Math.hypot(u.x-h.x,u.y-h.y)<h.r+25){const hd=Math.hypot(u.x-h.x,u.y-h.y)||1;mx=(u.x-h.x)/hd;my=(u.y-h.y)/hd}
 if(MAP.rift&&u.x*f.x<0&&d>pr+40){if(Math.abs(u.x)>MAP.rift.w+20){const bd=Math.hypot(u.x,u.y)||1;mx=-u.x/bd;my=-u.y/bd}else{mx=Math.sign(f.x-u.x);my=0}}for(const h of hz)if(h.k=='blk'&&(h.a||0)<1.7)for(const q of h.pos){const s=46/1.15+40,dx2=u.x-q[0],dy2=u.y-q[1];if(Math.abs(dx2)<s&&Math.abs(dy2)<s){const dd=Math.hypot(dx2,dy2)||1;mx=dx2/dd;my=dy2/dd}}u.mx=mx;u.my=my;u.think-=dt;
 if(u.think<=0&&!hid(f)){u.think=.2;for(let i=3;i>=0;i--){const b=u.cl.ab[i];if(!b.passive&&u.cd[i]<=0&&d>=b.ai[0]&&d<=b.ai[1]&&rnd()<(i==3?.5:.3)){cast(u,i,f.x,f.y);break}}}
 if(d<(u.id==='cond'&&u.over>0?390:u.cl.b.rg)&&!hid(f)&&rnd()<.1){u.face=a+(rnd()-.5)*.14;basic(u)}}
function upd(u,dt){for(const p of['stun','slow','lock','inv','dr','buff','flash','shT','bcd','poi','spd','amp','rev','fire','over','rage','gorFury'])if(u[p]>0)u[p]-=dt;if(u.shT<=0)u.shield=0;if(u.pull){const q=u.pull,dx=q.o.x-u.x,dy=q.o.y-u.y,d=Math.hypot(dx,dy);if(d>32){const step=Math.min(d-32,820*dt);u.x+=dx/d*step;u.y+=dy/d*step}q.t-=dt;if(d<=40||q.t<=0){dmg(u,90,q.o);u.stun=Math.max(u.stun,.55);u.pull=null;fx(u.x,u.y,42,.25,'#a94337','ring')}}if(u.wolfComboT>0){u.wolfComboT=Math.max(0,u.wolfComboT-dt);if(!u.wolfComboT)u.wolfCombo=0}if(u.comboT>0){u.comboT=Math.max(0,u.comboT-dt);if(!u.comboT)u.combo=0}
 u.cd=u.cd.map(c=>Math.max(0,c-dt));
 if(u.kd>0){const s=Math.min(u.kd,700*dt);u.x+=Math.cos(u.ka)*s;u.y+=Math.sin(u.ka)*s;u.kd-=s}
 if(u.dash){const d=u.dash,s=d.s*dt;u.x+=Math.cos(d.a)*s;u.y+=Math.sin(d.a)*s;d.t-=dt;
  if(d.o.d)for(const t of T(u))if(!d.hit.has(t)&&Math.hypot(t.x-u.x,t.y-u.y)<u.r+t.r+14){d.hit.add(t);dmg(t,d.o.d,u);if(d.o.st&&t.id)t.stun=Math.max(t.stun,d.o.st)}
  if(d.t<=0)u.dash=null}
 else if(u.stun<=0&&u.lock<=0&&!u.pull){const s=u.sp*(u.slow>0?u.slowF:1)*(u.spd>0?1.4:1);u.x+=u.mx*s*dt;u.y+=u.my*s*dt}
 if(MAP.sq){const m=R-18;u.x=Math.max(-m,Math.min(m,u.x));u.y=Math.max(-m,Math.min(m,u.y))}else{const h=Math.hypot(u.x,u.y);if(h>R-18){u.x*=(R-18)/h;u.y*=(R-18)/h}}col(u)}
let padPrev={},padMode=false,mi=0,pb={},startPrev={};
let hz=[],evT=7,banner=null,flash=0,lastEv=-1,pks=[],evN=0,pkT=5,lastPos=-1,pls=[],plT=12,blkT=9;
// ---------- MULTIPLAYER (capability room: presença + eventos em fila) ----------
const $=id=>document.getElementById(id),NM={on:false,host:false,room:null,q:[],n:0,seen:0,hid:0,lb:null,rd:0,started:-1,t:0,last:0,my:'',gone:0,unsub:null,code:''};let mode=0;
const GST=()=>NM.on&&!NM.host;
$('code').value=Math.random().toString(36).slice(2,6);
function setMode(m){mode=m;$('mp').style.display=m===1?'block':'none';$('localPickPanel').style.display=m===2?'flex':'none';document.querySelector('.select-footer').style.display=m===2?'none':'';$('confirmPick').style.display=m===2?'none':'';const hint=$('controlHint');if(hint)hint.textContent=m===2?'J1 e J2 escolhem separadamente · analógicos movem/miram · A ataca · LB/RB/LT/RT habilidades':'WASD move · Mouse mira · Q/E/R/F habilidades';if(m===2){localReady=[false,false];updateLocalPickUI()}document.querySelectorAll('.m').forEach((b,i)=>b.classList.toggle('on',i==m))}
function qpush(e){e.n=++NM.n;NM.q.push(e);if(NM.q.length>10)NM.q.shift();netSend(1)}
function netSend(f){if(!NM.on||!NM.room)return;const n=performance.now();if(!f&&n-NM.last<50)return;NM.last=n;const r=Math.round,o={id:NM.my,rd:NM.rd,t:NM.t,rdy:1,mp:mapSel,q:NM.q};
 if((st=='play'||st=='over')&&P)Object.assign(o,{x:r(P.x),y:r(P.y),f:+P.face.toFixed(2),hp:r(P.hp),mh:P.mhp,amp:P.amp>0?1:0,poi:P.poi>0?1:0,bf:P.buff>0?1:0,dr:P.dr>0?1:0,gf:P.gorFury>0?P.gorFury:0,sh:r(P.shield),inv:P.inv>0?1:0,st:P.stun>0?1:0,sp:P.spd>0?1:0,ch:P.charges||0,ov:P.over>0?1:0});
 NM.room.presence(o).catch(()=>{})}
function netWorld(){if(!NM.on)return;for(const h of hz)if(!h.id){h.id=++NM.hid;if(NM.host&&h.k!='fire')qpush({e:'h',h:{...h}})}
 for(const p of pks)if(!p.id){p.id=++NM.hid;if(NM.host)qpush({e:'p',p:{...p}})}
 for(const p of pls)if(!p.id){p.id=++NM.hid;if(NM.host)qpush({e:'l',p:{x:Math.round(p.x),y:Math.round(p.y),ty:p.ty}})}
 if(banner&&banner!==NM.lb){NM.lb=banner;if(NM.host)qpush({e:'n',s:banner.s,c:banner.c||''})}
 if(NM.host){const now=performance.now();if(now-(NM.worldAt||0)>=200){NM.worldAt=now;qpush({e:'w',w:{hz:hz.map(h=>({...h})),pks:pks.map(p=>({...p})),pls:pls.map(p=>({...p})),obs:OBS.map(o=>({...o})),banner:banner?{...banner}:null}})}}}
function applyNetDamage(n){if(!P||P.inv>0||P.hp<=0)return;let d=Math.max(0,Number(n)||0);if(P.gorFury>0)d*=.75;if(P.shield>0){const a=Math.min(P.shield,d);P.shield-=a;d-=a}if(d<=0)return;P.hp-=d;P.rev=.8;P.flash=.1;if(d>=60)bigHit(P,E,d);tx(P.x,P.y,Math.round(d),'#fff')}
function netEv(e){if(e.e=='c'||e.e=='b'){E.rev=1.2;E.x=e.x;E.y=e.y;E.face=e.f;E.attackAt=performance.now();if(e.e=='c'&&E.cl.ab[e.i])E.cl.ab[e.i].f(E,P,e.ax,e.ay);else if(e.e=='b')E.cl.b.f(E)}
 else if(e.e=='d')applyNetDamage(e.d);else if(e.e=='w'&&e.w){hz=(e.w.hz||[]).map(h=>({...h}));pks=(e.w.pks||[]).map(p=>({...p}));pls=(e.w.pls||[]).map(p=>({...p}));(e.w.obs||[]).forEach((o,i)=>{if(OBS[i])Object.assign(OBS[i],o)});banner=e.w.banner?{...e.w.banner}:null}else if(e.e=='h')hz.push({...e.h});else if(e.e=='p')pks.push({...e.p});else if(e.e=='l')pls.push(mkPl(e.p.x,e.p.y,e.p.ty,1));else if(e.e=='n')banner={s:String(e.s).slice(0,80),t:3,c:e.c||undefined}}
function netStep(dt){const op=NM.room&&NM.room.peers().find(p=>!p.sameTab&&p.presence&&p.presence.id);
 if(!op){NM.gone+=dt;if(NM.gone>5)E.hp=0;return}NM.gone=0;const p=op.presence;if(p.rd!==NM.rd)return;
 E.flash=Math.max(0,E.flash-dt);E.rev=Math.max(0,(E.rev||0)-dt);
 if(Number.isFinite(p.mh)&&p.mh>0)E.mhp=p.mh;if(Number.isFinite(p.hp))E.hp=Math.max(0,Math.min(E.mhp,p.hp));if(p.x!=null){const oldX=E.x,oldY=E.y,a=Math.min(1,dt*16);E.x+=(p.x-E.x)*a;E.y+=(p.y-E.y)*a;E.mx=(E.x-oldX)/Math.max(dt,.001);E.my=(E.y-oldY)/Math.max(dt,.001);E.face=p.f;E.amp=p.amp?1:0;E.poi=p.poi?1:0;E.buff=p.bf?1:0;E.dr=p.dr?1:0;E.gorFury=Math.max(0,Number(p.gf)||0);E.shield=p.sh||0;E.inv=p.inv?1:0;E.stun=p.st?1:0;E.spd=p.sp?1:0;E.charges=Math.max(0,Number(p.ch)||0);E.over=p.ov>0?1:0}
 for(const e of p.q||[])if(e.n>NM.seen){NM.seen=e.n;netEv(e)}
 if(E.dash){const d=E.dash;d.t-=dt;if(d.o.d)for(const t of T(E))if(!d.hit.has(t)&&Math.hypot(t.x-E.x,t.y-E.y)<E.r+t.r+14){d.hit.add(t);dmg(t,d.o.d,E);if(d.o.st&&t.id)t.stun=Math.max(t.stun,d.o.st)}if(d.t<=0)E.dash=null}}
function mpPeers(){if(!NM.on||!NM.room||st=='play')return;const ps=NM.room.peers().filter(p=>p.presence&&p.presence.id).sort((a,b)=>(a.presence.t-b.presence.t)||(a.peer<b.peer?-1:1)),me=ps.find(p=>p.sameTab);if(!me)return;const top=ps.slice(0,2),op=top.find(p=>!p.sameTab);
 if(!top.includes(me)){$('wt').textContent='Sala cheia — volte ao menu e escolha outro código.';return}
 if(!op){$('wt').textContent='Aguardando oponente… peça para ele escolher Multiplayer, digitar o código '+NM.code.toUpperCase()+' e escolher um personagem.';return}
 const q=op.presence;if(q.rdy&&q.rd===NM.rd&&NM.started!==NM.rd&&CH[q.id]){NM.started=NM.rd;NM.host=top[0]===me;NM.seen=Math.max(0,...(q.q||[]).map(e=>e.n));$('wait').style.display='none';start(NM.my,q.id,(NM.host?me.presence:q).mp)}else $('wt').textContent='Oponente conectado — aguardando ele ficar pronto…'}
async function arenaJoin(roomName){
 const proto=location.protocol==='https:'?'wss:':'ws:';const ws=new WebSocket(proto+'//'+location.host+'/ws');
 const peers=new Map(),listeners=new Set();let selfId=null,joinedResolve,joinedReject;
 const joined=new Promise((resolve,reject)=>{joinedResolve=resolve;joinedReject=reject});
 ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch{return}if(m.type==='joined'){selfId=m.id;joinedResolve();return}if(m.type==='error'){joinedReject(new Error(m.message||'sala indisponível'));return}if(m.type==='peers'){peers.clear();for(const p of m.peers||[])peers.set(p.id,{peer:p.id,sameTab:p.id===selfId,presence:p.presence});for(const f of listeners)f()}};
 ws.onopen=()=>ws.send(JSON.stringify({type:'join',room:roomName}));ws.onerror=()=>joinedReject(new Error('não foi possível conectar ao servidor'));await joined;
 return {presence:o=>new Promise((resolve,reject)=>{if(ws.readyState!==WebSocket.OPEN)return reject(new Error('conexão encerrada'));ws.send(JSON.stringify({type:'presence',presence:o}));resolve()}),peers:()=>[...peers.values()],onPeers:f=>{listeners.add(f);return()=>listeners.delete(f)},leave:()=>{try{ws.send(JSON.stringify({type:'leave'}));ws.close()}catch{}}};
}
async function mpJoin(id){mpLeave();NM.code=($('code').value||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12)||'sala1';NM.my=id;NM.t=Date.now()+Math.random();NM.rd=0;NM.started=-1;NM.seen=0;NM.q=[];NM.n=0;NM.host=false;
 try{NM.room=await arenaJoin('arena-'+NM.code)}catch(e){alert('Não foi possível conectar ao servidor online: '+(e.message||'erro'));return}
 NM.on=true;$('menu').style.display='none';$('wc').textContent=NM.code.toUpperCase();$('wait').style.display='flex';$('wt').textContent='Conectando…';NM.unsub=NM.room.onPeers(mpPeers);NM.room.presence({id,rd:0,t:NM.t,rdy:1,mp:mapSel}).catch(()=>{});mpPeers()}function mpLeave(){try{if(NM.unsub)NM.unsub();if(NM.room)NM.room.leave()}catch(e){}NM.on=false;NM.room=null;NM.unsub=null}
function mpRematch(){NM.rd++;$('end').style.display='none';$('wait').style.display='flex';$('wt').textContent='Aguardando o oponente aceitar a revanche…';netSend(1);mpPeers()}
function again(){NM.on?mpRematch():menu()}
// ---------- MAPA 2: Ruínas Vivas ----------
function setMap(i){mapSel=i;document.querySelectorAll('.mb').forEach((b,j)=>b.classList.toggle('on',j==i))}
function setupMap(i){mapSel=i;MAP=MAPS[i];R=MAP.sq?MAP.S:600;rs();OBS.splice(0,OBS.length,...(i?OB2:OB1).map(o=>({...o})))}
function initMap(){pls=[];plT=12;blkT=9;for(const k in PV)PV[k]=0;$('log').innerHTML='';if(!MAP.sq)return;[[-250,-250],[250,250],[-160,120],[160,-120]].forEach(a=>hz.push({k:'bush',x:a[0],y:a[1],r:75,g:1,t:9999,id:-1}));[[-420,-380,1],[420,380,2],[-110,430,3],[110,-430,4]].forEach(a=>pls.push(mkPl(a[0],a[1],a[2],-1)))}
function apath(){g.beginPath();if(MAP.sq)g.rect(-MAP.S,-MAP.S,2*MAP.S,2*MAP.S);else g.arc(0,0,R,0,7)}
function drawSlab(){
 if(MAP.sq){g.fillStyle='#1a1d38';g.beginPath();const S=MAP.S;[[-S,-S],[S,-S],[S,S],[-S,S]].map(a=>iso(a[0],a[1])).forEach((q,i)=>i?g.lineTo(q[0],q[1]+28*k):g.moveTo(q[0],q[1]+28*k));g.fill();return}
 // Thick, layered stone dais visible beneath the circular play surface.
 g.fillStyle='#080b12';g.beginPath();g.ellipse(cx,cy+63*k,635*k,320*k,0,0,Math.PI*2);g.fill();
 g.fillStyle='#292a28';g.beginPath();g.ellipse(cx,cy+42*k,626*k,315*k,0,0,Math.PI*2);g.fill();
 g.strokeStyle='#766d58';g.lineWidth=11*k;g.beginPath();g.ellipse(cx,cy+30*k,617*k,308*k,0,0,Math.PI*2);g.stroke();
 g.strokeStyle='#b1a17c';g.lineWidth=3*k;g.beginPath();g.ellipse(cx,cy+26*k,608*k,303*k,0,0,Math.PI*2);g.stroke();
 g.strokeStyle='rgba(28,35,48,.9)';g.lineWidth=8*k;g.beginPath();g.ellipse(cx,cy+56*k,626*k,315*k,0,0,Math.PI*2);g.stroke();
 // Repeating key-like cuts across the visible front band of the platform.
 g.save();g.strokeStyle='rgba(36,39,34,.72)';g.lineWidth=2.2*k;g.lineCap='square';
 for(let i=0;i<56;i++){const a=.08+i*(Math.PI-.16)/55,px=cx+Math.cos(a)*617*k,py=cy+42*k+Math.sin(a)*309*k,ta=Math.atan2(309*Math.cos(a),-617*Math.sin(a));g.save();g.translate(px,py);g.rotate(ta);g.beginPath();g.moveTo(-7*k,-5*k);g.lineTo(6*k,-5*k);g.lineTo(6*k,0);g.lineTo(-2*k,0);g.lineTo(-2*k,5*k);g.lineTo(8*k,5*k);g.stroke();g.restore()}
 g.restore();
}
const outB=(x,y,m)=>MAP.sq?Math.max(Math.abs(x),Math.abs(y))>R+m:Math.hypot(x,y)>R+m;
function riftCol(u){const f=MAP.rift;if(!f)return;const w=f.w+u.r*.5;if(Math.abs(u.x)<w&&Math.abs(u.y)>f.b-u.r*.3)u.x=u.x<0?-w:w}
function drawRift(){if(!MAP.rift)return;const w=MAP.rift.w,b=MAP.rift.b,S=MAP.S;g.fillStyle='#05060c';g.fillRect(-w,-S,2*w,S-b);g.fillRect(-w,b,2*w,S-b);g.strokeStyle=`rgba(255,120,40,${.6+.2*Math.sin(performance.now()/300)})`;g.lineWidth=5;g.strokeRect(-w,-S,2*w,S-b);g.strokeRect(-w,b,2*w,S-b);g.fillStyle='#7a6544';g.fillRect(-w-6,-b,2*w+12,2*b);g.strokeStyle='#4a3a22';g.lineWidth=3;for(let y=-b+20;y<b;y+=26){g.beginPath();g.moveTo(-w-6,y);g.lineTo(w+6,y);g.stroke()}}
function rpt(m){for(let i=0;i<30;i++){const x=(rnd()*2-1)*m,y=(rnd()*2-1)*m;if(!MAP.rift||Math.abs(x)>MAP.rift.w+50)return[x,y]}return[200,200]}
function mkPl(x,y,ty,id){return{x,y,r:22,hp:60,mhp:60,ty,id,inv:0,dr:0,shield:0,flash:0,buff:0,pl:1,t:60}}
function spawnPl(){const[x,y]=rpt(MAP.S-100);pls.push(mkPl(x,y,Math.floor(rnd()*5),0))}
function brk(t,s){fx(t.x,t.y,50,.4,PK[t.ty].c,'ring');if(s===P||s===E){PK[t.ty].f(s);tx(s.x,s.y,PK[t.ty].n,PK[t.ty].c);if(s===P)pkLog(t.ty,1)}}
function bushOf(u){return hz.find(h=>h.k=='bush'&&h.g>.6&&Math.hypot(u.x-h.x,u.y-h.y)<h.r)}
const inBush=u=>!!bushOf(u);
function hid(u){const b=bushOf(u),v=u.foe;return !!b&&!(u.rev>0)&&bushOf(v)!==b&&Math.hypot(u.x-v.x,u.y-v.y)>130}
const ringR=h=>1000+(h.sr-1000)*Math.max(0,Math.min(1,(h.a-2)/8));
const PV={};
function logMsg(t,c){const l=$('log'),d=document.createElement('div');d.textContent=t;d.style.color=c||'#fff';l.appendChild(d);while(l.children.length>9)l.removeChild(l.firstChild);setTimeout(()=>{d.style.opacity='0'},9000);setTimeout(()=>d.remove(),10000)}
function pkLog(ty,fl){const m=['💚 Cura: +25% da vida','','','','⏱️ Recargas das habilidades reduzidas em 60%'];if(ty==0||ty==4)logMsg((fl?'🌸 Flor — ':'🎁 Item — ')+m[ty],PK[ty].c);else logMsg(fl?'🌸 Você destruiu uma flor: '+PK[ty].n:'🎁 Item coletado: '+PK[ty].n,PK[ty].c)}
function bigHit(t,s,n){const v=Math.round(n);if(t===P)logMsg('💥 Dano massivo sofrido: '+v+(s===E?' (inimigo)':s===ENV?' (ambiente)':''),'#f88');else if(s===P&&t.id)logMsg('⚔️ Dano massivo causado: '+v,'#8f8')}
function trackSt(){const u=P,c=(k,on,msg,col)=>{if(on&&!PV[k])logMsg(msg,col);PV[k]=on};
 c('stun',u.stun>0,'💫 Atordoado ('+u.stun.toFixed(1)+'s)','#fd6');
 c('slow',u.slow>0,'🐌 Lentidão -'+Math.round((1-u.slowF)*100)+'%'+(u.slow>.5?' ('+u.slow.toFixed(1)+'s)':' (enquanto na zona)'),'#f99');
 c('poi',u.poi>0,'☠️ Veneno: -25% de dano e -50% de cura (enquanto na nuvem)','#9f6');
 c('fire',u.fire>0,'🔥 Queimando! Saia do fogo ou vá para a zona segura','#f96');
 c('spd',u.spd>0,'👟 Velocidade +40% ('+Math.ceil(u.spd)+'s)','#6cf');
 c('amp',u.amp>0,u.amp>1?'⚔️ Dano +35% ('+Math.ceil(u.amp)+'s)':'⚔️ Dano +35% (enquanto no altar)','#fa4');
 c('sh',u.shield>0,'🛡️ Escudo '+Math.round(u.shield)+' ('+Math.ceil(u.shT)+'s)','#9af');
 c('dr',u.dr>0,'🛡️ Dano recebido -40% ('+Math.ceil(u.dr)+'s)','#9af');
 c('bf',u.buff>0,'💜 Totem sombrio: +30% de dano','#c8f')}
function crush(){for(const o of OBS){const s=o.r/1.15;fx(o.x,o.y,60,.4,'#ddd','ring');for(const t of[P,E,...mins,...pls]){if(t.net)continue;if(Math.abs(t.x-o.x)<s+t.r*.4&&Math.abs(t.y-o.y)<s+t.r*.4){if(t.id){if(t.inv>0)continue;t.hp=0;tx(t.x,t.y,'ESMAGADO!','#f55');if(t===P)logMsg('☠️ Você foi esmagado por um bloco!','#f55')}else t.hp=0}}}}
function newBlockPos2(){const out=[];for(let i=0;i<OBS.length;i++){let x=0,y=0;for(let j=0;j<40;j++){const t=i<2?[P,E][i]:null;if(t){x=t.x+(rnd()-.5)*90;y=t.y+(rnd()-.5)*90}else{x=(rnd()*2-1)*(MAP.S-90);y=(rnd()*2-1)*(MAP.S-90)}x=Math.max(-MAP.S+60,Math.min(MAP.S-60,x));y=Math.max(-MAP.S+60,Math.min(MAP.S-60,y));if(Math.abs(x)<90)continue;if(out.some(q=>Math.hypot(q[0]-x,q[1]-y)<120))continue;break}out.push([Math.round(x),Math.round(y)])}return out}
function dropBlocks(){banner={s:'🧱 BLOCOS VÃO CAIR — saia das marcações vermelhas!',t:3,c:'#f66'};hz.push({k:'blk',t:3.4,pos:newBlockPos2()})}
function map2Ev(){let e;do{e=Math.floor(rnd()*3)}while(e==lastEv);lastEv=e;const[sx,sy]=rpt(MAP.S-140);
 if(e==0){banner={s:'🔥 CÍRCULO DE FOGO — corra para a zona segura!',t:3.5,c:'#f96'};hz.push({k:'ring',sx:Math.round(sx),sy:Math.round(sy),sr:150,t:16,a:0,tick:.5})}
 else if(e==1){banner={s:'🌿 ARBUSTOS CRESCEM — esconda-se neles!',t:3,c:'#8f8'};for(let i=0;i<6;i++)later(i*.3,()=>{const[bx,by]=rpt(MAP.S-100);hz.push({k:'bush',x:Math.round(bx),y:Math.round(by),r:75,g:0,t:30})})}
 else{banner={s:'🌸 FLORES MÁGICAS — destrua-as para ganhar bônus!',t:3,c:'#f9c'};for(let i=0;i<4;i++)later(i*.3,spawnPl)}}
function dPl2(p){const[x,y]=iso(p.x,p.y),s=k,t=performance.now()/1000,ty=p.ty,c=PK[ty].c,fy=y-30*s+Math.sin(t*3+p.x)*2*s;
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y,14*s,7*s,0,0,7);g.fill();
 g.strokeStyle='#3c9a45';g.lineWidth=4*s;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-24*s);g.stroke();
 g.fillStyle='#3c9a45';g.beginPath();g.ellipse(x-8*s,y-10*s,7*s,3*s,-.5,0,7);g.fill();g.beginPath();g.ellipse(x+8*s,y-14*s,7*s,3*s,.5,0,7);g.fill();
 g.shadowColor=c;g.shadowBlur=14;g.fillStyle=p.flash>0?'#fff':c;g.strokeStyle=c;g.lineWidth=3*s;
 for(let i=0;i<6;i++){const a=i*Math.PI/3+t*(ty==1?2:.3),px=x+Math.cos(a)*10*s,py=fy+Math.sin(a)*10*s;g.beginPath();
  if(ty==0)g.arc(px,py,6*s,0,7);
  else if(ty==1)g.ellipse(px,py,9*s,3.5*s,a,0,7);
  else if(ty==2){g.moveTo(x+Math.cos(a)*18*s,fy+Math.sin(a)*18*s);g.lineTo(x+Math.cos(a-.4)*6*s,fy+Math.sin(a-.4)*6*s);g.lineTo(x+Math.cos(a+.4)*6*s,fy+Math.sin(a+.4)*6*s)}
  else if(ty==3)g.rect(px-5*s,py-5*s,10*s,10*s);
  else g.arc(px,py,6*s,0,7);
  if(ty==4)g.stroke();else g.fill()}
 g.shadowBlur=0;g.fillStyle='#fff7d0';g.beginPath();g.arc(x,fy,5*s,0,7);g.fill();
 g.font=`${17*s}px sans-serif`;g.textAlign='center';g.fillText(PK[ty].e,x,fy-20*s+Math.sin(t*4)*2*s);
 if(p.hp<p.mhp)bar(x-14*s,y-62*s,28*s,4*s,p.hp/p.mhp,'#fc4')}
function newBlockPos(){const out=[];for(let i=0;i<OBS.length;i++){let x=0,y=0;for(let j=0;j<40;j++){x=(rnd()*2-1)*(MAP.S-90);y=(rnd()*2-1)*(MAP.S-90);if(Math.abs(x)<90)continue;if([P,E].some(u=>Math.hypot(u.x-x,u.y-y)<140))continue;if(out.some(q=>Math.hypot(q[0]-x,q[1]-y)<130))continue;break}out.push([Math.round(x),Math.round(y)])}return out}
function poly(p){g.beginPath();p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1.5;g.stroke()}
function dCube(o){const s=o.r/1.15,hh=Math.max(o.h*k,3*k),A=iso(o.x-s,o.y-s),B=iso(o.x+s,o.y-s),C=iso(o.x+s,o.y+s),Dd=iso(o.x-s,o.y+s),zz=(o.z||0)*k,lo=q=>[q[0],q[1]-zz],up=q=>[q[0],q[1]-zz-hh];g.fillStyle='rgba(0,0,0,.3)';poly([A,B,C,Dd]);g.fillStyle='#7a7260';poly([lo(Dd),lo(C),up(C),up(Dd)]);g.fillStyle='#5a5446';poly([lo(C),lo(B),up(B),up(C)]);g.fillStyle='#a29b84';poly([up(A),up(B),up(C),up(Dd)])}
function dPl(p){const[x,y]=iso(p.x,p.y),s=k,b=Math.sin(performance.now()/300+p.x)*2*s;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y,14*s,7*s,0,0,7);g.fill();g.strokeStyle='#3c9a45';g.lineWidth=4*s;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-22*s);g.stroke();g.shadowColor=PK[p.ty].c;g.shadowBlur=14;g.fillStyle=p.flash>0?'#fff':PK[p.ty].c;g.beginPath();g.arc(x,y-28*s+b,10*s,0,7);g.fill();g.shadowBlur=0;g.fillStyle='#ffe';g.beginPath();g.arc(x,y-28*s+b,4*s,0,7);g.fill();if(p.hp<p.mhp)bar(x-14*s,y-48*s,28*s,4*s,p.hp/p.mhp,'#fc4')}
function dBush(h){const[x,y]=iso(h.x,h.y),s=k,gr=h.g;g.globalAlpha=.93;for(let i=0;i<9;i++){const a=i*.7+1,rr=h.r*(i%3?.55:.2)*gr;g.fillStyle=i%2?'#2c7a3c':'#3b9a4a';g.beginPath();g.ellipse(x+Math.cos(a)*rr*.99*s,y+Math.sin(a)*rr*.5*s-26*s*gr,30*s*gr,34*s*gr,0,0,7);g.fill()}g.globalAlpha=1}
const PK=[{e:'💚',n:'CURA',c:'#6f6',f:u=>heal(u,u.mhp*.25)},{e:'👟',n:'VELOCIDADE',c:'#6cf',f:u=>u.spd=7},{e:'⚔️',n:'DANO +35%',c:'#fa4',f:u=>u.amp=8},{e:'🛡️',n:'ARMADURA',c:'#9af',f:u=>{u.shield+=150;u.shT=Math.max(u.shT,8);u.dr=Math.max(u.dr,6)}},{e:'⏱️',n:'RECARGA',c:'#fd6',f:u=>{u.cd=u.cd.map(c=>c*.4);u.bcd=0}}];
function spawnPk(){const ty=Math.floor(rnd()*PK.length);for(let i=0;i<20;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*(R-90),x=Math.cos(a)*d,y=Math.sin(a)*d;if(!OBS.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+30)&&!(MAP.rift&&Math.abs(x)<MAP.rift.w+34)){pks.push({x,y,ty,t:25});return}}}
function posEv(){let e;do{e=Math.floor(rnd()*(MAP.sq?5:3))}while(e==lastPos);lastPos=e;const a=rnd()*6.28,d=rnd()*300,x=Math.cos(a)*d,y=Math.sin(a)*d;
 if(e==0){banner={s:'🌿 FONTE DE CURA — fique dentro do círculo verde',t:3,c:'#8f8'};hz.push({k:'zone',ty:'heal',x,y,r:100,t:11})}
 else if(e==1){banner={s:'✨ ALTAR DO PODER — +35% de dano dentro do círculo',t:3,c:'#fd6'};hz.push({k:'zone',ty:'amp',x,y,r:100,t:11})}
 else if(e==2){banner={s:'🎁 CHUVA DE SUPRIMENTOS — pegue os itens!',t:3,c:'#8cf'};for(let i=0;i<6;i++)later(i*.35,spawnPk)}
 else if(e==3){banner={s:'🌿 ARBUSTOS CRESCEM — esconda-se neles!',t:3,c:'#8f8'};for(let i=0;i<6;i++)later(i*.3,()=>{const[bx,by]=rpt(MAP.S-100);hz.push({k:'bush',x:Math.round(bx),y:Math.round(by),r:75,g:0,t:30})})}
 else{banner={s:'🌸 FLORES MÁGICAS — destrua-as para ganhar bônus!',t:3,c:'#f9c'};for(let i=0;i<4;i++)later(i*.3,spawnPl)}}
const OBS=[[0,0,55,160],[0,-420,38,112],[297,-297,38,112],[420,0,38,112],[297,297,38,112],[0,420,38,112],[-297,297,38,112],[-420,0,38,112],[-297,-297,38,112]].map(a=>({x:a[0],y:a[1],r:a[2],h:a[3]})),ENV={buff:0,poi:0};
const OB1=OBS.map(o=>({...o})),OB2=[[-230,-150],[230,150],[-130,340],[130,-340]].map(a=>({x:a[0],y:a[1],r:46,h:90,H:90,ht:90,sq:1}));function col(u){riftCol(u);for(const o of OBS){if(o.h<20||o.z>10)continue;const dx=u.x-o.x,dy=u.y-o.y,d=Math.hypot(dx,dy)||1,m=o.r+u.r;if(d<m){u.x=o.x+dx/d*m;u.y=o.y+dy/d*m}}}
const cl=(x,y)=>{const h=Math.hypot(x,y),m=R-70;return h>m?[x*m/h,y*m/h]:[x,y]};
function envHit(x,y,r,d,o){for(const t of[P,E,...mins])if(Math.hypot(t.x-x,t.y-y)<r+t.r){dmg(t,d,ENV);if(o.st&&t.id)t.stun=Math.max(t.stun,o.st)}}
function spawnEv(){if(MAP.sq){map2Ev();return}if(evN++%2==1){posEv();return}let e;do{e=Math.floor(rnd()*(MAP.sq?6:4))}while(e==lastEv);lastEv=e;
 const rp=()=>{const a=rnd()*6.28,d=Math.sqrt(rnd())*(R-80);return[Math.cos(a)*d,Math.sin(a)*d]};
 if(e==0){banner={s:'💨 RAJADA DE VENTO — a faixa deixa todos lentos',t:3};hz.push({k:'gust',ax:rnd()<.5?0:1,c:(rnd()-.5)*500,w:80,t:8.5,warn:1.5})}
 else if(e==1){banner={s:'☄️ CHUVA DE METEOROS — saia dos círculos!',t:3};for(let i=0;i<4;i++)later(i*.9,()=>{const u=[P,E][i%2],a=rnd()*6.28,d=rnd()*110,[x,y]=cl(u.x+Math.cos(a)*d,u.y+Math.sin(a)*d);hz.push({k:'met',x,y,r:90,warn:1.5,t:99})})}
 else if(e==2){banner={s:'☠ NUVEM DE VENENO — menos cura e menos dano',t:3};const[x,y]=rp();hz.push({k:'poi',x,y,vx:(rnd()-.5)*40,vy:(rnd()-.5)*40,r:150,t:12})}
 else if(e==3){banner={s:'⚡ TEMPESTADE DE RAIOS!',t:3};hz.push({k:'storm',t:8,next:.3})}
 else if(e==4){banner={s:'🔥 CÍRCULO DE FOGO — corra para a zona segura!',t:3.5,c:'#f96'};const[sx,sy]=rp();hz.push({k:'ring',sx:Math.round(sx),sy:Math.round(sy),sr:150,t:16,a:0,tick:.5})}
 else{banner={s:'🧱 OS BLOCOS SE MOVEM — cuidado!',t:3,c:'#fc8'};hz.push({k:'blk',t:3.4,pos:newBlockPos()})}}
function hazards(dt){if(MAP.sq){blkT-=dt;if(blkT<=0){blkT=15+rnd()*4;if(!GST())dropBlocks()}}plT-=dt;if(plT<=0){plT=14;if(MAP.sq&&pls.length<4&&!GST())spawnPl()}for(const o of OBS){if(o.z>0)o.z=Math.max(0,o.z-780*dt);if(o.ht!=null)o.h+=Math.sign(o.ht-o.h)*Math.min(Math.abs(o.ht-o.h),140*dt)}pls.forEach(p=>{p.t-=dt;p.flash-=dt});pls=pls.filter(p=>p.hp>0&&p.t>0);pkT-=dt;if(pkT<=0){pkT=9+rnd()*4;if(pks.length<4&&!GST())spawnPk()}for(const p of pks){p.t-=dt;for(const u of[P,E])if(p.t>0&&Math.hypot(u.x-p.x,u.y-p.y)<30){PK[p.ty].f(u);fx(p.x,p.y,50,.4,PK[p.ty].c,'ring');tx(u.x,u.y,PK[p.ty].n,PK[p.ty].c);if(u===P)pkLog(p.ty);p.t=0}}pks=pks.filter(p=>p.t>0);evT-=dt;flash-=dt;if(banner)banner.t-=dt;if(evT<=0){evT=10+rnd()*5;if(!GST())spawnEv()}
 const all=[P,E,...mins];
 for(const h of hz){h.t-=dt;
  if(h.k=='gust'){if(h.warn>0)h.warn-=dt;else for(const u of[P,E])if(Math.abs((h.ax?u.x:u.y)-h.c)<h.w){u.slowF=u.slow>0?Math.min(u.slowF,.5):.5;u.slow=Math.max(u.slow,.2)}}
  else if(h.k=='met'||h.k=='bolt'){h.warn-=dt;if(h.warn<=0){h.t=0;if(h.k=='met'){fx(h.x,h.y,h.r,.5,'#f84','fill');fx(h.x,h.y,h.r,.4,'#fc6','ring');envHit(h.x,h.y,h.r,70,{});hz.push({k:'fire',x:h.x,y:h.y,r:70,t:7,tick:.2})}else{fx(h.x,h.y,h.r,.25,'#fff','fill');envHit(h.x,h.y,h.r,45,{st:.4});flash=.2}}}
  else if(h.k=='ring'){h.a+=dt;h.tick-=dt;if(h.a>2&&h.tick<=0){h.tick=.5;const rc=ringR(h);for(const t of all)if(Math.hypot(t.x-h.sx,t.y-h.sy)>rc){dmg(t,6,ENV);if(t===P)P.fire=.7}}}
  else if(h.k=='blk'){h.a=(h.a||0)+dt;if(h.a<.6)OBS.forEach(o=>o.ht=0);else if(!h.m){h.m=1;OBS.forEach((o,i)=>{if(h.pos[i]){o.x=h.pos[i][0];o.y=h.pos[i][1]}o.h=o.H;o.ht=o.H;o.z=800})}if(h.a>=1.65&&!h.l){h.l=1;OBS.forEach(o=>{o.z=0});crush()}}
  else if(h.k=='bush'){h.g=h.t<2?Math.max(0,h.t/2):Math.min(1,h.g+dt*.5)}
  else if(h.k=='fire'){h.tick-=dt;if(h.tick<=0){h.tick=.5;for(const t of all)if(Math.hypot(t.x-h.x,t.y-h.y)<h.r+t.r){dmg(t,7,ENV);if(t===P)P.fire=.7}}}
  else if(h.k=='poi'){h.x+=h.vx*dt;h.y+=h.vy*dt;if(Math.hypot(h.x,h.y)>R-120){h.vx=-h.vx;h.vy=-h.vy}for(const u of[P,E])if(Math.hypot(u.x-h.x,u.y-h.y)<h.r)u.poi=1.5}
  else if(h.k=='zone'){for(const u of[P,E])if(Math.hypot(u.x-h.x,u.y-h.y)<h.r){if(h.ty=='heal')u.hp=Math.min(u.mhp,u.hp+30*dt*(u.poi>0?.5:1));else u.amp=Math.max(u.amp||0,.3)}}
  else if(h.k=='storm'){h.next-=dt;if(h.next<=0&&h.t>0&&!GST()){h.next=.6;let x,y;if(rnd()<.6){const u=rnd()<.5?P:E;[x,y]=cl(u.x+(rnd()-.5)*140,u.y+(rnd()-.5)*140)}else{const a=rnd()*6.28,d=Math.sqrt(rnd())*(R-70);x=Math.cos(a)*d;y=Math.sin(a)*d}hz.push({k:'bolt',x,y,r:55,warn:.9,t:99})}}}
 hz=hz.filter(h=>h.t>0);netWorld()}
function dO(o){if(o.sq){dCube(o);return}const[x,y]=iso(o.x,o.y),rx=o.r*.99*k,ry=o.r*.495*k,h=o.h*k;
 // Classical fluted column on a square stone plinth (no round footing).
 const pw=rx*1.28;
 g.fillStyle='rgba(0,0,0,.34)';g.beginPath();g.moveTo(x,y+15*k);g.lineTo(x+pw,y+2*k);g.lineTo(x,y-11*k);g.lineTo(x-pw,y+2*k);g.closePath();g.fill();
 g.fillStyle='#49483e';g.beginPath();g.moveTo(x-pw,y-5*k);g.lineTo(x,y-18*k);g.lineTo(x,y-7*k);g.lineTo(x-pw,y+6*k);g.closePath();g.fill();
 g.fillStyle='#5b594b';g.beginPath();g.moveTo(x+pw,y-5*k);g.lineTo(x,y-18*k);g.lineTo(x,y-7*k);g.lineTo(x+pw,y+6*k);g.closePath();g.fill();
 g.fillStyle='#898069';g.beginPath();g.moveTo(x,y-30*k);g.lineTo(x+pw,y-17*k);g.lineTo(x,y-4*k);g.lineTo(x-pw,y-17*k);g.closePath();g.fill();g.strokeStyle='#b0a17c';g.lineWidth=1.5*k;g.stroke();
 g.fillStyle='#625e4e';g.fillRect(x-rx*.74,y-h+15*k,rx*1.48,h-8*k);
 g.fillStyle='#777363';g.fillRect(x-rx*.74,y-h+15*k,rx*1.48,9*k);
 const shaftW=rx*1.05,shaftTop=y-h+24*k,shaftBottom=y-20*k,grad=g.createLinearGradient(x-shaftW/2,0,x+shaftW/2,0);
 grad.addColorStop(0,'#454b43');grad.addColorStop(.22,'#85816a');grad.addColorStop(.5,'#aaa184');grad.addColorStop(.76,'#77745f');grad.addColorStop(1,'#41473f');
 g.fillStyle=grad;g.fillRect(x-shaftW/2,shaftTop,shaftW,shaftBottom-shaftTop);
 // Narrow grooves make the shaft read as a carved Greek column.
 g.strokeStyle='rgba(35,41,37,.68)';g.lineWidth=2*k;for(let i=-2;i<=2;i++){const xx=x+i*shaftW*.17;g.beginPath();g.moveTo(xx,shaftTop+4*k);g.lineTo(xx,shaftBottom-3*k);g.stroke()}
 g.strokeStyle='rgba(218,207,170,.42)';g.lineWidth=1.5*k;for(const side of[-1,1]){const xx=x+side*shaftW*.43;g.beginPath();g.moveTo(xx,shaftTop+5*k);g.lineTo(xx,shaftBottom-4*k);g.stroke()}
 // Capital and a carved collar immediately above the square plinth.
 g.fillStyle='#706d5a';g.fillRect(x-rx*.68,y-h+11*k,rx*1.36,8*k);g.beginPath();g.ellipse(x,y-h+11*k,rx*.68,ry*.82,0,0,Math.PI*2);g.fill();
 g.fillStyle='#9a9071';g.beginPath();g.ellipse(x,y-h+3*k,rx*1.13,ry*1.05,0,0,Math.PI*2);g.fill();g.strokeStyle='#c0b38f';g.lineWidth=2*k;g.stroke();
 g.fillStyle='#514f43';g.fillRect(x-rx*.79,y-19*k,rx*1.58,8*k);
 g.fillStyle='#877e65';g.fillRect(x-rx*.79,y-12*k,rx*1.58,3*k);g.strokeStyle='#aaa082';g.lineWidth=1.5*k;g.strokeRect(x-rx*.79,y-12*k,rx*1.58,3*k);
 // Chipped stone specks, positioned deterministically so both clients match.
 for(let i=0;i<5;i++){const px=x+Math.sin(o.x*13+i*19+o.y)*rx*.42,py=shaftTop+(((i*37+o.y*2)%Math.max(1,shaftBottom-shaftTop))||0);g.fillStyle=i%2?'rgba(30,38,33,.45)':'rgba(210,196,155,.32)';g.fillRect(px,py,2.5*k,3*k)}
}
function ovl(){if(hz.some(h=>h.k=='storm')){g.fillStyle='rgba(15,15,50,.28)';g.fillRect(0,0,W,H)}if(st==='play'&&mode===2&&padsConnected().length<2){g.fillStyle='rgba(0,0,0,.68)';g.fillRect(W/2-190,70,380,38);g.fillStyle='#ffe1a2';g.textAlign='center';g.font='bold 15px system-ui';g.fillText('Conecte dois controles · o controle 2 joga com '+(E?E.cl.n:'Jogador 2'),W/2,95)}
 if(flash>0){g.fillStyle=`rgba(255,255,255,${Math.min(.5,flash*2.5)})`;g.fillRect(0,0,W,H)}
 if(banner&&banner.t>0){g.globalAlpha=Math.min(1,banner.t);g.fillStyle=banner.c||'#fff';g.font='bold 24px system-ui';g.textAlign='center';g.shadowColor='#000';g.shadowBlur=8;g.fillText(banner.s,W/2,100);g.shadowBlur=0;g.globalAlpha=1}}
function readPad(p,key){if(!p)return{on:false,lx:0,ly:0,rx:0,ry:0,x:false,ed:[false,false,false,false],ar:false};
const rd=(a,b)=>Math.hypot(a,b)>.25?[a,b]:[0,0],b=i=>!!(p.buttons[i]&&p.buttons[i].value>.5),[lx,ly]=rd(p.axes[0],p.axes[1]),[rx,ry]=rd(p.axes[2],p.axes[3]);
const prev=padPrev[key]||(padPrev[key]=[false,false,false,false]),cur=[b(5),b(4),b(6),b(7)],ed=cur.map((v,i)=>v&&!prev[i]);cur.forEach((v,i)=>prev[i]=v);const x=b(2),active=!!(lx||ly||rx||ry||x||cur.some(Boolean));if(active)padMode=true;return{on:true,lx,ly,rx,ry,x,ed,ar:!!(rx||ry),active}}
function padsConnected(){return[...(navigator.getGamepads?navigator.getGamepads():[])].filter(p=>p&&p.connected)}
function pad(){return readPad(padsConnected()[0],'p1')}
function menuPad(){const connected=padsConnected();if(st==='menu'&&mode===2){for(let player=0;player<2;player++){const p=connected[player];if(!p)continue;const prev=menuPadPrev[player]||(menuPadPrev[player]={l:false,r:false,a:false}),left=!!(p.buttons[14]?.pressed||p.axes[0]<-.6),right=!!(p.buttons[15]?.pressed||p.axes[0]>.6),confirm=!!(p.buttons[0]?.pressed);if(!localReady[player]&&(left&&!prev.l||right&&!prev.r)){const n=HERO_ORDER.length;localCursors[player]=(localCursors[player]+(left?-1:1)+n)%n;pickLocalHero(player,HERO_ORDER[localCursors[player]])}if(confirm&&!prev.a&&!localReady[player])toggleLocalReady(player);prev.l=left;prev.r=right;prev.a=confirm}return}const p=connected[0];if(!p)return;const bt=i=>p.buttons[i]&&p.buttons[i].pressed,e=(n,v)=>{const r=v&&!pb[n];pb[n]=v;return r};const l=e('l',bt(14)||p.axes[0]<-.6),r=e('r',bt(15)||p.axes[0]>.6),a=e('a',bt(0));if(st=='menu'){const n=HERO_ORDER.length;if(l)mi=(mi+n-1)%n;if(r)mi=(mi+1)%n;chooseHero(HERO_ORDER[mi]);if(a){padMode=true;start(selectedHero)}}else if(st=='over'&&a)menu()}
function step(dt){
 const pads=padsConnected(),local=mode===2,gp=local?readPad(pads[0],'p1'):pad(),gp2=local?readPad(pads[1],'p2'):null;
 const control=(u,padState,keyboard=false)=>{let sx=keyboard?((keys.d?1:0)-(keys.a?1:0)):0,sy=keyboard?((keys.s?1:0)-(keys.w?1:0)):0;if(padState&&padState.on){sx=padState.lx;sy=padState.ly}if(sx||sy){const a=sx/.7,b=sy/.35,wx=(a+b)/2,wy=(b-a)/2,l=Math.hypot(wx,wy);u.mx=wx/l;u.my=wy/l}else u.mx=u.my=0;
 let ax,ay;if(padState&&padState.on){if(padState.ar){const a=padState.rx/.7,b=padState.ry/.35,wx=(a+b)/2,wy=(b-a)/2,l=Math.hypot(wx,wy);ax=u.x+wx/l*300;ay=u.y+wy/l*300}else{ax=u.foe.x;ay=u.foe.y}}else [ax,ay]=toW(mouse.x,mouse.y);if(u.lock<=0&&!u.dash)u.face=Math.atan2(ay-u.y,ax-u.x);if(padState&&padState.on)padState.ed.forEach((e,i)=>e&&cast(u,i,ax,ay));if((keyboard&&mouse.down&&!(padState&&padState.on))||(padState&&padState.on&&padState.x))basic(u)};
 control(P,gp,!local);if(local)control(E,gp2,false);
 if(E.net)netStep(dt);else if(local){}else ai(E,dt);upd(P,dt);if(!E.net)upd(E,dt);hazards(dt);trackSt();if(E.net)netSend();
 for(const t of totems){t.t-=dt;if(Math.hypot(t.o.x-t.x,t.o.y-t.y)<120){t.o.buff=.3;t.o.hp=Math.min(t.o.mhp,t.o.hp+12*dt*(t.o.poi>0?.5:1))}}totems=totems.filter(t=>t.t>0);
 for(const m of mins){m.t-=dt;m.cd-=dt;m.flash-=dt;const f=m.foe,dx=f.x-m.x,dy=f.y-m.y,d=Math.hypot(dx,dy);if(d>26){m.x+=dx/d*m.sp*dt;m.y+=dy/d*m.sp*dt}else if(m.cd<=0){m.cd=.7;dmg(f,9,m.o)}col(m)}mins=mins.filter(m=>m.t>0&&m.hp>0);
 for(const p of projs){p.x+=Math.cos(p.a)*p.s*dt;p.y+=Math.sin(p.a)*p.s*dt;p.life-=dt;if(p.o.hook){const buff=pks.find(q=>q.t>0&&Math.hypot(q.x-p.x,q.y-p.y)<p.r+18);if(buff){buff.t=0;PK[buff.ty].f(p.own);fx(buff.x,buff.y,48,.3,PK[buff.ty].c,'ring');tx(p.own.x,p.own.y,PK[buff.ty].n,PK[buff.ty].c);if(p.own===P)pkLog(buff.ty);p.life=0}}
  for(const t of T(p.own))if(!p.hit.has(t)&&Math.hypot(t.x-p.x,t.y-p.y)<p.r+t.r){p.hit.add(t);if(p.o.hook&&t.id){t.pull={o:p.own,t:.55};p.life=0;fx(t.x,t.y,40,.22,'#a94337','ring');tx(t.x,t.y,'PUXÃO','#e3b5a1');break}const n=dmg(t,p.d,p.own);if(p.o.ls)heal(p.own,n*p.o.ls);if(t.id){if(p.o.kb){t.ka=p.a;t.kd=p.o.kb}if(p.o.slow){t.slow=p.o.slow[1];t.slowF=p.o.slow[0]}}if(!p.o.pierce)p.life=0}
  if(outB(p.x,p.y,40)||(!p.o.pierce&&OBS.some(o=>o.h>=20&&!(o.z>10)&&Math.hypot(p.x-o.x,p.y-o.y)<o.r)))p.life=0}projs=projs.filter(p=>p.life>0);
 for(const r of traps){r.t-=dt;r.arm-=dt;const f=r.o.foe;if(r.arm<=0&&Math.hypot(f.x-r.x,f.y-r.y)<32){dmg(f,30,r.o);f.slow=2.5;f.slowF=.4;fx(r.x,r.y,50,.3,'#fd5','ring');r.t=0}}traps=traps.filter(r=>r.t>0);
 for(const c of clones){c.t-=dt;c.x+=Math.cos(c.a)*c.s*dt;c.y+=Math.sin(c.a)*c.s*dt;const f=c.o.foe;if(Math.hypot(f.x-c.x,f.y-c.y)<f.r+14){dmg(f,28,c.o);fx(c.x,c.y,48,.3,'#d9b477','fill');tx(c.x,c.y,'AREIA','#e8c989');c.t=0}}clones=clones.filter(c=>c.t>0);for(const z of sandstorms){z.t-=dt;z.tick-=dt;if(z.tick<=0&&z.t>0){z.tick=.58;area(z.o,z.x,z.y,z.r,21);fx(z.x,z.y,z.r,.22,'#d9b477','ring')}}sandstorms=sandstorms.filter(z=>z.t>0);
 for(const b of bleeds){b.t-=dt;b.tick-=dt;if(b.tick<=0&&b.t>0){b.tick=.5;dmg(b.target,7,b.o);fx(b.target.x,b.target.y,18,.15,'#b33','ring')}}bleeds=bleeds.filter(b=>b.t>0&&b.target.hp>0);
 for(const l of laters)l.t-=dt;const rd=laters.filter(l=>l.t<=0);laters=laters.filter(l=>l.t>0);rd.forEach(l=>l.fn());
 fxs.forEach(f=>f.t-=dt);fxs=fxs.filter(f=>f.t>0);texts.forEach(t=>t.t-=dt);texts=texts.filter(t=>t.t>0);
 if(P.hp<=0||E.hp<=0){st='over';document.getElementById('pauseButton').style.display='none';if(NM.on)netSend(1);const w=E.hp<=0&&P.hp>0;document.getElementById('res').textContent=w?'🏆 VITÓRIA!':'💀 DERROTA';document.getElementById('end').style.display='flex'}}
// ---------- desenho ----------
function bar(x,y,w,h,p,c){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x,y,w,h);g.fillStyle=c;g.fillRect(x,y,w*Math.max(0,p),h)}
function dU(u){if(u!==P&&hid(u))return;
 const [x,y]=iso(u.x,u.y),s=k,now=performance.now()/1000,walking=Math.hypot(u.mx||0,u.my||0)>.08||!!u.dash;
 const gait=walking?Math.sin(now*12+(u===E?1:0)):Math.sin(now*2)*.08;
 const bob=walking?Math.abs(Math.sin(now*12))*.9:Math.sin(now*2)*.35;
 const attack=Math.max(0,1-(performance.now()-(u.attackAt||0))/300);
 const facing=Number.isFinite(u.face)?u.face:0,cs=Math.cos(facing),sn=Math.sin(facing);
 const project=(side,depth,height)=>{
  const wx=-sn*side+cs*depth,wy=cs*side+sn*depth;
  return [x+(wx-wy)*.7*s,y+(wx+wy)*.35*s-height*s];
 };
 const poly=(pts,color)=>{g.fillStyle=color;g.beginPath();pts.forEach((p,i)=>{const q=project(p[0],p[1],p[2]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});g.closePath();g.fill()};
 const line=(a,b,color,width)=>{const p=project(...a),q=project(...b);g.strokeStyle=color;g.lineWidth=width*s;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(...p);g.lineTo(...q);g.stroke()};
 const ball=(side,depth,height,rx,ry,color)=>{const p=project(side,depth,height);g.fillStyle=color;g.beginPath();g.ellipse(p[0],p[1],rx*s,ry*s,0,0,Math.PI*2);g.fill()};
 const box=(side,depth,bottom,w,d,h,base)=>{
  const a=w/2,b=d/2;
  // Faceted low-poly torso: visible front, side and top planes.
  poly([[side-a,depth+b,bottom],[side+a,depth+b,bottom],[side+a,depth+b,bottom+h],[side-a,depth+b,bottom+h]],base);
  poly([[side+a,depth-b,bottom],[side+a,depth+b,bottom],[side+a,depth+b,bottom+h],[side+a,depth-b,bottom+h]],'rgba(0,0,0,.24)');
  poly([[side-a,depth-b,bottom+h],[side+a,depth-b,bottom+h],[side+a,depth+b,bottom+h],[side-a,depth+b,bottom+h]],'rgba(255,255,255,.20)');
 };
 const tint=u.flash>0?'#fff':u.cl.c;
 if(mode===2){const ring=u===P?'#39d7ff':'#ffb64c';g.save();g.globalAlpha=.82;g.fillStyle=u===P?'rgba(40,190,235,.18)':'rgba(240,160,55,.18)';g.strokeStyle=ring;g.lineWidth=2.5*s;g.beginPath();g.ellipse(x,y+2*s,25*s,11*s,0,0,Math.PI*2);g.fill();g.stroke();g.restore()}g.fillStyle='rgba(0,0,0,.36)';g.beginPath();g.ellipse(x,y,19*s,8*s,0,0,Math.PI*2);g.fill();
 g.save();g.globalAlpha=u.inv>0?.48:(u===P&&inBush(u)?.62:1);
 if(u.buff>0||u.amp>0){g.shadowColor=u.buff>0?'#c6f':'#fa4';g.shadowBlur=18*s}if(u.pull){const[ox,oy]=iso(u.pull.o.x,u.pull.o.y);g.strokeStyle='#76584f';g.lineWidth=3*s;g.beginPath();g.moveTo(ox,oy-15*s);g.lineTo(x,y-12*s);g.stroke()}
 // Cape/back silhouette and swinging legs.
 if(u.id==='nec'||u.id==='sam')poly([[-11,-5,28],[11,-5,28],[14,-8,6],[7,-7,3],[0,-9,6],[-8,-7,3]],u.id==='nec'?'#18241f':'#27202a');
 const swing=gait*5;
 line([-5,2,15],[-6+swing*.35,2,4],u.id==='war'?'#7e8089':'#292a31',5);
 line([5,2,15],[6-swing*.35,2,4],u.id==='war'?'#a4a8b2':'#30313a',5);
 ball(-6+swing*.35,2,4,4,3,'#151820');ball(6-swing*.35,2,4,4,3,'#151820');
 // Character-specific clothing and armor.
 const base=u.id==='nec'?'#27322d':u.id==='gun'?'#586453':u.id==='war'?'#9ba4b2':u.id==='cond'?'#394b5d':u.id==='wolf'?'#29252b':u.id==='gor'?'#68615c':'#202632';
 box(0,0,15-bob,18,11,20, tint==='#fff'?'#fff':base);
 if(u.id==='war'){
  poly([[-8,3,33],[8,3,33],[7,4,18],[-7,4,18]],'#d8dce5');
  poly([[0,4,32],[2,4,29],[0,4,26],[-2,4,29]],'#ddb84b');
 } else if(u.id==='gun'){
  poly([[-8,3,30],[-1,4,30],[0,4,17],[-7,4,15]],'#727665');
  poly([[1,4,29],[8,3,30],[7,4,15],[1,4,16]],'#485348');
 } else if(u.id==='nec'){
  poly([[-8,3,30],[8,3,30],[11,3,11],[0,4,14],[-11,3,11]],'#18221e');
  ball(0,6,25,2.2,2.5,'#d2bf87');
 } else if(u.id==='wolf'){
  poly([[-8,3,31],[0,5,25],[8,3,31],[6,4,15],[0,3,18],[-7,4,15]],'#403039');
  line([-7,4,28],[7,4,28],'#95654f',1.5);ball(0,6,23,2.4,2.4,'#c9a66e');
 } else if(u.id==='gor'){
  poly([[-10,3,32],[10,3,32],[12,4,14],[0,5,17],[-12,4,14]],'#4b3933');line([-8,5,29],[8,5,29],'#9a8873',2);ball(0,6,23,3,3,'#792e25');
 } else {
  poly([[-8,3,30],[8,3,30],[7,4,15],[0,5,18],[-7,4,15]],'#303443');
  line([-7,4,29],[7,4,29],'#a69b83',1.4);
 }
 // Arms swing while moving and reach forward on attacks.
 const armReach=attack*7;
 line([-8,1,29],[-11+swing*.35,-1,18],u.id==='war'?'#c6cad2':u.id==='nec'?'#4d5148':'#b49a82',5);
 line([8,1,29],[10+armReach,-2+attack*4,20+attack*3],u.id==='war'?'#c6cad2':u.id==='gun'?'#8a826d':'#b49a82',5);
 ball(-11+swing*.35,-1,18,2.8,2.8,'#d3b697');ball(10+armReach,-2+attack*4,20+attack*3,2.8,2.8,'#d3b697');
 // Heads, helmets and hoods.
 ball(0,0,39-bob,7.4,8,u.id==='war'?'#c1c5cc':u.id==='gun'?'#d5b99d':'#d8b99f');
 if(u.id==='nec'){
  poly([[-8,1,41],[0,2,51],[8,1,41],[7,-2,34],[0,-2,32],[-7,-2,34]],'#202622');
  ball(0,1,43,6,6,'#30352f');
  line([-13,-3,32],[-13,-3,50],'#5a4631',2.4);line([-13,-3,50],[-13,-3,53],'#b9a579',2.2);ball(-13,-3,53,2,2,'#62e59a');
 } else if(u.id==='gun'){
  ball(0,0,45,8,4,'#594737');poly([[-7,1,45],[7,1,45],[6,0,49],[-6,0,49]],'#70593e');
 } else if(u.id==='war'){
  ball(0,0,41,8,8,'#aeb6c4');poly([[-7,2,44],[7,2,44],[6,1,49],[-6,1,49]],'#d8dce3');
 } else if(u.id==='wolf'){
  ball(0,0,39-bob,7.4,8,'#343039');
  poly([[-7,0,43],[-10,-1,51],[-3,1,46]],'#29252d');poly([[7,0,43],[10,-1,51],[3,1,46]],'#29252d');
  ball(0,3,39,6,5,'#51434a');poly([[-5,4,39],[0,7,35],[5,4,39],[3,6,37],[-3,6,37]],'#c5b29b');
  ball(-3,6,42,1.4,1,'#ff3434');ball(3,6,42,1.4,1,'#ff3434');line([-2,8,37],[2,8,37],'#18151a',1.2);
 } else if(u.id==='gor'){
  ball(0,0,39-bob,8,8,'#a99b8b');poly([[-8,2,45],[8,2,45],[7,1,36],[-7,1,36]],'#704b3b');
  poly([[-7,1,45],[-6,2,51],[6,2,51],[7,1,45]],'#81796e');line([0,1,45],[0,1,51],'#4b433c',1.3);
  ball(-3,3,42,1.5,1,'#ffb33d');ball(3,3,42,1.5,1,'#ffb33d');line([-3,5,36],[0,7,34],'#ece0cc',1.7);line([0,7,34],[3,5,36],'#ece0cc',1.7);
 } else {
  poly([[-7,1,44],[0,2,51],[7,1,44],[6,-1,43],[-6,-1,43]],'#17202b');
  line([0,0,48],[0,0,53],'#171c26',2.5);
 }
 // Signature equipment: shield and sword, rifle, staff, or paired blades.
 if(u.id==='war'){
  poly([[-15,2,31],[-8,3,33],[-7,3,22],[-12,3,18],[-16,2,22]],'#707a8b');
  poly([[-13,3,29],[-9,3,30],[-9,3,23],[-12,3,21]],'#d7b84b');
  line([13,0,27],[17,8+attack*4,35],'#82734f',2.6);line([17,8+attack*4,35],[18,10+attack*4,43],'#d8dce8',2.2);
 } else if(u.id==='gun'){
  line([0,7,24],[0,20,25],'#62482c',3.4);line([0,11,25],[0,24,25],'#c5b8a1',1.5);line([0,4,24],[0,9,24],'#33302a',3);
 } else if(u.id==='nec'){
  line([-14,-2,8],[-14,-2,50],'#57432d',3);line([-14,-2,50],[-14,-2,55],'#a89976',2);ball(-14,-2,55,3,3,'#54dd8c');
 } else if(u.id==='wolf'){
  line([11,2,24],[14,12+attack*4,29],'#403139',3);line([14,12+attack*4,29],[18,21+attack*4,33],'#e6dfd6',2.4);line([18,21+attack*4,33],[20,27+attack*4,38],'#f0ece7',1.8);
  line([-10,2,23],[-13,11,27],'#403139',3);line([-13,11,27],[-18,20,31],'#e6dfd6',2.4);line([-18,20,31],[-20,26,36],'#f0ece7',1.8);
 } else if(u.id==='gor'){
  line([10,1,26],[14,7,21],'#564538',4);line([14,7,21],[20,13,18],'#564538',4);
  line([20,13,18],[27,13,39],'#9d968b',4);line([27,13,39],[34,14,40],'#9d968b',5);line([34,14,40],[39,14,34],'#9d968b',4);line([39,14,34],[33,14,31],'#9d968b',4);
  line([-10,1,25],[-14,9,21],'#5f5146',4);line([-14,9,21],[-17,16,17],'#5f5146',4);line([-17,16,17],[-20,23+attack*4,25],'#7e382e',3);line([-20,23+attack*4,25],[-30,28+attack*4,39],'#c1b8a8',5);line([-30,28+attack*4,39],[-39,30+attack*4,36],'#c1b8a8',5);
 } else {
  line([11,2,24],[14,16+attack*4,32],'#30251d',2.4);line([14,16+attack*4,32],[16,24+attack*5,40],'#d7dce7',1.8);
  line([-10,2,23],[-12,12,30],'#30251d',2);line([-12,12,30],[-13,20,37],'#e8e5df',1.6);
 }
 if(u.id==='cond'){const p1=project(-14,0,30),p2=project(14,0,30);g.shadowColor='#68dfff';g.shadowBlur=13*s;g.strokeStyle='rgba(104,223,255,.9)';g.lineWidth=2*s;g.beginPath();g.moveTo(p1[0],p1[1]);g.lineTo(p2[0],p2[1]);g.stroke();ball(-14,0,30,3,3,'#9ef');ball(14,0,30,3,3,'#9ef');g.shadowBlur=0}if(u.shield>0){g.shadowBlur=0;g.strokeStyle='#7cf';g.lineWidth=2.5*s;g.beginPath();g.ellipse(x,y-24*s,24*s,31*s,0,0,Math.PI*2);g.stroke()}
 g.restore();g.shadowBlur=0;g.globalAlpha=1;
 if(u.spd>0){g.font=`${12*k}px sans-serif`;g.textAlign='center';g.fillText('👟',x-16*k,y-55*k)}if(u.poi>0){g.fillStyle='#8f5';g.font=`${14*k}px sans-serif`;g.textAlign='center';g.fillText('☠',x+16*k,y-55*k)}if(u.stun>0){g.fillStyle='#ff0';g.font=`${16*s}px sans-serif`;g.textAlign='center';g.fillText('✦ ✦',x,y-61*s)}
 if(u.id==='cond'&&u.charges>0){g.fillStyle='#8ef';g.font=`bold ${12*s}px system-ui`;g.textAlign='center';g.fillText('⚡ '+u.charges,x,y-88*s)}bar(x-22*s,y-74*s-bob*s,44*s,5*s,u.hp/u.mhp,u.human?'#4d4':'#e44')}
function dM(m){const[x,y]=iso(m.x,m.y),s=k;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y,10*s,5*s,0,0,7);g.fill();g.fillStyle=m.flash>0?'#fff':'#7b3fa8';g.beginPath();g.arc(x,y-12*s,10*s,0,7);g.fill();g.fillStyle='#cf8';g.fillRect(x-4*s,y-15*s,3*s,3*s);g.fillRect(x+2*s,y-15*s,3*s,3*s)}
function drawAbilityRow(u,x0,y0,sw,label,controller){g.textAlign='center';g.font='bold 11px system-ui';g.fillStyle=u.cl.c;g.fillText(label,x0+sw*2.5,y0-5);for(let i=0;i<5;i++){const x=x0+i*sw,b=i===0,cdv=b?u.bcd:u.cd[i-1],mx=b?u.cl.b.cd:u.cl.ab[i-1].cd,ult=i===4;g.fillStyle=ult?'#3a2a12':'#1a1d36';g.fillRect(x+2,y0,sw-4,sw-4);g.strokeStyle=ult?'#ffb84f':u.cl.c;g.lineWidth=2;g.strokeRect(x+2,y0,sw-4,sw-4);if(cdv>0&&mx>0){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(x+2,y0,sw-4,(sw-4)*cdv/mx)}g.fillStyle='#fff';g.font='bold '+Math.max(9,Math.min(18,sw*.28))+'px system-ui';g.fillText(b?(controller?'A':'M1'):(u.cl.ab[i-1].passive?'PAS.':(controller?['RB','LB','LT','RT'][i-1]:'QERF'[i-1])),x+sw/2,y0+Math.min(23,sw*.38));g.font=Math.max(7,Math.min(9,sw*.14))+'px system-ui';g.fillText((b?'Ataque':u.cl.ab[i-1].n).slice(0,10),x+sw/2,y0+sw-8);if(cdv>0){g.font='bold 11px system-ui';g.fillStyle='#ffd';g.fillText(cdv.toFixed(1),x+sw/2,y0+Math.min(39,sw*.65))}}}
function hud(){const bw=Math.min(340,W*.4);g.font='bold 13px system-ui';g.textAlign='left';bar(16,34,bw,16,P.hp/P.mhp,'#4d4');g.fillStyle='#fff';g.fillText(P.cl.n+(mode===2?' (Jogador 1)':' (você)')+'  '+Math.ceil(P.hp),16,28);bar(W-16-bw,34,bw,16,Math.max(0,Math.min(1,E.hp/E.mhp)),'#e44');g.textAlign='right';g.fillText(E.cl.n+(E.net?' (online)  ':mode===2?' (Jogador 2)  ':' (CPU)  ')+Math.ceil(E.hp),W-16,28);if(mode===2){const sw=Math.min(64,(W-36)/10),y=H-sw-18;drawAbilityRow(P,12,y,sw,'JOGADOR 1 · '+P.cl.n,true);drawAbilityRow(E,W-12-sw*5,y,sw,'JOGADOR 2 · '+E.cl.n,true)}else{const sw=Math.min(74,W/6),x=W/2-sw*2.5,y=H-sw-14;drawAbilityRow(P,x,y,sw,'',false)}}
function draw(){g.setTransform(D,0,0,D,0,0);const bg=g.createRadialGradient(W*.5,H*.44,20,W*.5,H*.48,Math.max(W,H)*.78);bg.addColorStop(0,MAP.sq?'#19201e':'#252720');bg.addColorStop(.58,'#11161a');bg.addColorStop(1,'#070a10');g.fillStyle=bg;g.fillRect(0,0,W,H);if(!P)return;
 drawSlab();
 g.setTransform(D*.7*k,D*.35*k,-D*.7*k,D*.35*k,D*cx,D*cy);
 g.fillStyle=MAP.sq?'#303b34':'#292b26';apath();g.fill();g.save();g.clip();
 if(MAP.sq){g.strokeStyle='rgba(235,220,178,.12)';g.lineWidth=2;for(let i=-700;i<=700;i+=100){g.beginPath();g.moveTo(i,-700);g.lineTo(i,700);g.moveTo(-700,i);g.lineTo(700,i);g.stroke()}}
 else {
  // Uneven slate tiles with restrained moss and cracks, generated locally.
  const stones=['#282b27','#30312b','#34332b','#292d2b','#37352d'];
  for(let ix=-6;ix<=6;ix++)for(let iy=-6;iy<=6;iy++){
   const tx=ix*92,ty=iy*92,n=Math.abs(Math.sin(ix*127.1+iy*311.7)*43758.5453)%1;
   g.fillStyle=stones[Math.floor(n*stones.length)];g.fillRect(tx-44,ty-44,88,88);
   g.strokeStyle='rgba(10,13,14,.58)';g.lineWidth=3;g.strokeRect(tx-44,ty-44,88,88);
   if(n>.48){g.strokeStyle='rgba(12,15,14,.68)';g.lineWidth=1.5;g.beginPath();g.moveTo(tx-25,ty-24);g.lineTo(tx-8,ty-7);g.lineTo(tx-12,ty+7);g.lineTo(tx+5,ty+22);g.stroke()}
   if(n<.16){g.fillStyle='rgba(106,119,73,.18)';g.beginPath();g.ellipse(tx+18,ty-17,18,9,.4,0,Math.PI*2);g.fill()}
  }
  [[-390,-230,92],[355,-260,70],[180,365,85],[-310,340,65],[45,-420,75]].forEach(([mx,my,mr])=>{g.fillStyle='rgba(98,117,70,.12)';g.beginPath();g.ellipse(mx,my,mr,mr*.62,.25,0,Math.PI*2);g.fill()});
 }
 g.strokeStyle=MAP.sq?'rgba(201,178,122,.25)':'rgba(205,190,151,.27)';g.lineWidth=3;
 for(const radius of(MAP.sq?[150]:[145,270,355])){g.beginPath();g.arc(0,0,radius,0,Math.PI*2);g.stroke()}
 g.restore();
 if(!MAP.sq){
  // Broad carved rim and a subtle blue inlay like the reference arena.
  g.strokeStyle='#6e6855';g.lineWidth=53;apath();g.stroke();
  g.strokeStyle='rgba(190,174,132,.72)';g.lineWidth=3;g.beginPath();g.arc(0,0,R-18,0,Math.PI*2);g.stroke();
  g.strokeStyle='rgba(126,174,255,.72)';g.lineWidth=3;g.beginPath();g.arc(0,0,R-48,0,Math.PI*2);g.stroke();
  g.strokeStyle='rgba(29,34,38,.8)';g.lineWidth=2;
  for(let i=0;i<72;i++){const a=i*Math.PI*2/72,ca=Math.cos(a),sa=Math.sin(a);g.beginPath();g.moveTo(ca*(R-47),sa*(R-47));g.lineTo(ca*(R-8),sa*(R-8));g.stroke()}
 }
 g.strokeStyle=MAP.sq?'#c9b27a':'rgba(189,177,141,.9)';g.lineWidth=MAP.sq?6:3;apath();g.stroke();drawRift();
 for(const z of sandstorms){const pulse=.08+.035*Math.sin(performance.now()/110);g.fillStyle=`rgba(198,157,91,${pulse})`;g.beginPath();g.arc(z.x,z.y,z.r,0,7);g.fill();g.strokeStyle='rgba(225,190,125,.68)';g.lineWidth=5;g.setLineDash([12,10]);g.beginPath();g.arc(z.x,z.y,z.r*(.92+.04*Math.sin(performance.now()/170)),0,7);g.stroke();g.setLineDash([])}
 for(const r of traps){g.strokeStyle=r.arm>0?'rgba(255,220,100,.3)':'#fd5';g.lineWidth=4;g.beginPath();g.arc(r.x,r.y,24,0,7);g.stroke();g.beginPath();g.arc(r.x,r.y,10,0,7);g.stroke()}
 for(const t of totems){g.fillStyle='rgba(170,80,255,.12)';g.beginPath();g.arc(t.x,t.y,120,0,7);g.fill();g.strokeStyle='rgba(190,120,255,.5)';g.lineWidth=3;g.stroke()}
 for(const h of hz){const now=performance.now()/1000;
  if(h.k=='gust'){g.save();apath();g.clip();const on=h.warn<=0;g.fillStyle=on?'rgba(160,220,255,.2)':'rgba(160,220,255,.07)';if(h.ax)g.fillRect(h.c-h.w,-R,h.w*2,2*R);else g.fillRect(-R,h.c-h.w,2*R,h.w*2);
   g.strokeStyle=on?'rgba(230,250,255,.7)':'rgba(230,250,255,.2)';g.lineWidth=5;for(let i=0;i<6;i++){const s=((now*(on?500:0)+i*230)%(2*R+200))-R-100,o=h.c+((i%3)-1)*h.w*.55;g.beginPath();if(h.ax){g.moveTo(o,s);g.lineTo(o,s+130)}else{g.moveTo(s,o);g.lineTo(s+130,o)}g.stroke()}g.restore()}
  else if(h.k=='met'||h.k=='bolt'){const p=1-h.warn/(h.k=='met'?1.5:.9),c=h.k=='met'?'255,90,30':'255,255,120';g.fillStyle=`rgba(${c},${.1+.2*p})`;g.beginPath();g.arc(h.x,h.y,h.r,0,7);g.fill();g.strokeStyle=`rgba(${c},.9)`;g.lineWidth=5;g.beginPath();g.arc(h.x,h.y,h.r*Math.max(0,p),0,7);g.stroke();g.beginPath();g.arc(h.x,h.y,h.r,0,7);g.stroke()}
  else if(h.k=='fire'){const fl=.5+.2*Math.sin(now*14+h.x);g.fillStyle=`rgba(255,${100+80*fl|0},20,${.35+.2*fl})`;g.beginPath();g.arc(h.x,h.y,h.r,0,7);g.fill()}
  else if(h.k=='zone'){const c=h.ty=='heal'?'90,255,140':'255,210,90';g.fillStyle=`rgba(${c},${.12+.06*Math.sin(now*3)})`;g.beginPath();g.arc(h.x,h.y,h.r,0,7);g.fill();g.strokeStyle=`rgba(${c},.8)`;g.lineWidth=5;g.beginPath();g.arc(h.x,h.y,h.r*(.6+.4*((now*.8)%1)),0,7);g.stroke();g.beginPath();g.arc(h.x,h.y,h.r,0,7);g.stroke()}
  else if(h.k=='ring'){const rc=ringR(h);g.save();apath();g.clip();g.fillStyle=`rgba(255,80,20,${.16+.06*Math.sin(now*6)})`;g.beginPath();g.rect(-1200,-1200,2400,2400);g.moveTo(h.sx+rc,h.sy);g.arc(h.sx,h.sy,rc,0,7);g.fill('evenodd');g.strokeStyle='rgba(255,170,60,.95)';g.lineWidth=10;g.beginPath();g.arc(h.sx,h.sy,rc,0,7);g.stroke();g.restore();g.strokeStyle='rgba(120,255,140,.9)';g.lineWidth=6;g.setLineDash([24,16]);g.beginPath();g.arc(h.sx,h.sy,h.sr,0,7);g.stroke();g.setLineDash([])}
  else if(h.k=='blk'){if((h.a||0)<1.65){const pr=Math.min(1,(h.a||0)/1.6)*(.6+.4*Math.abs(Math.sin(now*10)));g.fillStyle=`rgba(255,40,40,${.1+.3*pr})`;g.strokeStyle='rgba(255,70,70,.95)';g.lineWidth=6;OBS.forEach((o,i)=>{const s=o.r/1.15,q=h.pos[i];if(q){g.fillRect(q[0]-s,q[1]-s,2*s,2*s);g.strokeRect(q[0]-s,q[1]-s,2*s,2*s)}})}}
  else if(h.k=='poi'){for(let i=0;i<5;i++){const a=i*1.26+now*.3;g.fillStyle='rgba(120,220,80,.14)';g.beginPath();g.arc(h.x+Math.cos(a)*h.r*.45,h.y+Math.sin(a)*h.r*.45,h.r*.65,0,7);g.fill()}g.strokeStyle='rgba(150,255,100,.4)';g.lineWidth=4;g.beginPath();g.arc(h.x,h.y,h.r,0,7);g.stroke()}}
 for(const f of fxs){const p=f.t/f.m;g.globalAlpha=Math.min(1,p*1.5);g.strokeStyle=g.fillStyle=f.c;
  if(f.k=='ring'){g.lineWidth=8;g.beginPath();g.arc(f.x,f.y,f.r*(1.05-.4*p),0,7);g.stroke()}
  else if(f.k=='fill'){g.globalAlpha=.25;g.beginPath();g.arc(f.x,f.y,f.r,0,7);g.fill();g.globalAlpha=.8;g.lineWidth=5;g.stroke()}
  else{g.lineWidth=14;g.beginPath();g.arc(f.x,f.y,f.r,f.a-1,f.a+1);g.stroke()}}g.globalAlpha=1;
 g.setTransform(D,0,0,D,0,0);
 const L=[[P.x+P.y,()=>dU(P)],[E.x+E.y,()=>dU(E)]];
 clones.forEach(c=>L.push([c.x+c.y,()=>{const[x,y]=iso(c.x,c.y);g.globalAlpha=.48;g.fillStyle='#d9b477';g.beginPath();g.ellipse(x,y-14*k,9*k,13*k,0,0,7);g.fill();g.fillStyle='#f2dfbc';g.beginPath();g.arc(x,y-28*k,7*k,0,7);g.fill();g.globalAlpha=1}]));
 mins.forEach(m=>L.push([m.x+m.y,()=>dM(m)]));OBS.forEach(o=>L.push([o.x+o.y,()=>dO(o)]));
 pls.forEach(p=>L.push([p.x+p.y,()=>dPl2(p)]));
 hz.filter(h=>h.k=='bush'&&h.g>0).forEach(h=>L.push([h.x+h.y+20,()=>dBush(h)]));
 hz.filter(h=>h.k=='ring'&&h.a>2).forEach(h=>{const rc=ringR(h);for(let i=0;i<28;i++){const a=i/28*6.283,x=h.sx+Math.cos(a)*rc,y=h.sy+Math.sin(a)*rc;if(Math.abs(x)<R&&Math.abs(y)<R&&(MAP.sq||Math.hypot(x,y)<R))L.push([x+y,()=>{const[sx,sy]=iso(x,y);g.textAlign='center';g.font=`${28*k}px sans-serif`;g.fillText('🔥',sx,sy)}])}});
 pks.forEach(p=>L.push([p.x+p.y,()=>{if(p.t<5&&Math.floor(p.t*5)%2)return;const[x,y]=iso(p.x,p.y),b=Math.sin(performance.now()/250+p.x)*4*k;g.fillStyle=PK[p.ty].c;g.globalAlpha=.35;g.beginPath();g.ellipse(x,y,18*k,9*k,0,0,7);g.fill();g.globalAlpha=1;g.textAlign='center';g.font=`${24*k}px sans-serif`;g.fillText(PK[p.ty].e,x,y-12*k+b)}]));
 hz.filter(h=>h.k=='fire').forEach(h=>L.push([h.x+h.y+30,()=>{g.textAlign='center';g.font=`${30*k}px sans-serif`;for(const[dx,dy]of[[-30,0],[30,0],[0,-30],[0,30]]){const[x,y]=iso(h.x+dx,h.y+dy);g.fillText('🔥',x,y)}}]));
 totems.forEach(t=>L.push([t.x+t.y,()=>{const[x,y]=iso(t.x,t.y);g.fillStyle='#4a2a6a';g.fillRect(x-7*k,y-38*k,14*k,38*k);g.fillStyle='#d9f';g.beginPath();g.arc(x,y-42*k,8*k,0,7);g.fill()}]));
 projs.forEach(p=>L.push([p.x+p.y,()=>{const[x,y]=iso(p.x,p.y);g.fillStyle=p.o.c;g.shadowColor=p.o.c;g.shadowBlur=12;if(p.o.hook){const[ox,oy]=iso(p.own.x,p.own.y);g.strokeStyle='#69453d';g.lineWidth=3*k;g.beginPath();g.moveTo(ox,oy-15*k);g.lineTo(x,y-16*k);g.stroke();g.strokeStyle='#c7a994';g.lineWidth=2*k;g.beginPath();g.arc(x,y-16*k,9*k,p.a+1,p.a+4.7);g.stroke()}else{g.beginPath();g.ellipse(x,y-16*k,p.r*k*(p.o.pierce?2.4:1),p.r*k,0,0,7);g.fill()}g.shadowBlur=0}]));
 L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
 g.textAlign='center';g.font=`bold ${16*k+2}px system-ui`;for(const t of texts){const[x,y]=iso(t.x,t.y);g.globalAlpha=Math.min(1,t.t*3);g.fillStyle=t.c;g.fillText(t.s,x,y-70*k-(.8-t.t)*40*k)}g.globalAlpha=1;
 ovl();hud()}
function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;pausePad();if(st=='play')step(dt);else if(st==='menu'||st==='over')menuPad();draw();requestAnimationFrame(loop)}
requestAnimationFrame(loop);
