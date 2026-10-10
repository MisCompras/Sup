/* ============================================================
   games.js v9.0 - 23 juegos con dificultad / modos / power-ups
   Vanilla JS + Canvas. Sin dependencias.
   ============================================================ */
const GamesHub = (() => {
  'use strict';
  const el = (t,c,h)=>{const e=document.createElement(t); if(c)e.className=c; if(h!==undefined)e.innerHTML=h; return e;};
  const btn = (t,c,on)=>{const b=el('button',c||'btn small-btn',t); if(on)b.addEventListener('click',on); return b;};
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const rnd=n=>Math.floor(Math.random()*n);
  const makeCanvas=(w,h)=>{const c=el('canvas','game-canvas');c.width=w;c.height=h;return c;};
  const titleBar=(name,onRestart)=>{const tb=el('div','game-title-bar');tb.appendChild(el('h3','',name));const a=el('div','page-actions');if(onRestart)a.appendChild(btn('🔄 Reiniciar','btn secondary',onRestart));tb.appendChild(a);return tb;};
  const infoEl=t=>el('div','game-info',t);
  const diffBar=(def='Medio')=>{
    const d=el('div','game-controls');let cur=def;
    ['Fácil','Medio','Difícil'].forEach(l=>{const b=btn(l,'btn small-btn'+(l===def?'':' secondary'),()=>{cur=l;d.querySelectorAll('button').forEach(x=>x.classList.add('secondary'));b.classList.remove('secondary');});d.appendChild(b);});
    return {el:d,get:()=>cur};
  };
  const speedMs=(d,base)=> d==='Fácil'?base*2 : d==='Medio'?Math.round(base*1.5) : base;
  const modeBar=(modes,def)=>{
    const d=el('div','game-controls');let cur=def;
    modes.forEach(([id,label])=>{const b=btn(label,'btn small-btn'+(id===def?'':' secondary'),()=>{cur=id;d.querySelectorAll('button').forEach(x=>x.classList.add('secondary'));b.classList.remove('secondary');});d.appendChild(b);});
    return {el:d,get:()=>cur};
  };

  /* ---------- 1. TA-TE-TI (2J / vs CPU) ---------- */
  function playTTT(stage){
    let board,turn,over,mode;
    const info=infoEl('');const grid=el('div','ttt-grid');const cells=[];
    const W=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const win=b=>{for(const[a,c,d]of W)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return b.every(x=>x)?'E':null;};
    const minimax=(b,p)=>{const w=win(b);if(w==='O')return{score:10};if(w==='X')return{score:-10};if(w==='E')return{score:0};const mv=[];b.forEach((v,i)=>{if(!v){const nb=b.slice();nb[i]=p;const r=minimax(nb,p==='O'?'X':'O');mv.push({i,score:r.score});}});let best=mv[0];for(const m of mv)if((p==='O'&&m.score>best.score)||(p==='X'&&m.score<best.score))best=m;return best;};
    const render=()=>{cells.forEach((c,i)=>{c.textContent=board[i];c.className='ttt-cell '+(board[i]==='X'?'x':board[i]==='O'?'o':'');});const w=win(board);if(w){over=true;info.textContent=w==='E'?'🤝 Empate':(w==='X'?'❌ Gana X':'⭕ Gana O');return;}info.textContent=(mode.get()==='CPU'?(turn==='X'?'Tu turno (X)':'CPU piensa…'):'Turno: '+turn);};
    const cpu=()=>{if(over||mode.get()!=='CPU')return;const best=minimax(board,'O');if(best&&best.i!==undefined){board[best.i]='O';turn='X';render();}};
    const click=i=>{if(over||board[i])return;if(mode.get()==='CPU'&&turn!=='X')return;board[i]=turn;turn=turn==='X'?'O':'X';render();if(mode.get()==='CPU'&&!over)setTimeout(cpu,350);};
    const start=()=>{board=Array(9).fill('');turn='X';over=false;render();};
    for(let i=0;i<9;i++){const c=el('div','ttt-cell');c.addEventListener('click',()=>click(i));cells.push(c);grid.appendChild(c);}
    mode=modeBar([['CPU','🤖 vs CPU'],['2P','👥 2 Jugadores']],'CPU');
    mode.el.addEventListener('click',start);
    stage.innerHTML='';stage.appendChild(titleBar('⭕ Ta-Te-Ti',start));stage.appendChild(mode.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(grid);start();
    return null;
  }

  /* ---------- 2. AJEDREZ (2J / vs CPU) ---------- */
  function playChess(stage){
    const P={wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'};
    const VAL={P:1,N:3,B:3,R:5,Q:9,K:0};
    let board,turn,sel,over,mode;
    const reset=()=>{board=[['bR','bN','bB','bQ','bK','bB','bN','bR'],Array(8).fill('bP'),Array(8).fill(''),Array(8).fill(''),Array(8).fill(''),Array(8).fill(''),Array(8).fill('wP'),['wR','wN','wB','wQ','wK','wB','wN','wR']];turn='w';sel=null;over=false;};
    reset();
    const info=infoEl('Turno: Blancas');const grid=el('div','board-8x8');
    const inB=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
    const movesFor=(r,c)=>{const p=board[r][c];if(!p)return[];const col=p[0],t=p[1],res=[];const slide=ds=>{for(const[dr,dc]of ds){let nr=r+dr,nc=c+dc;while(inB(nr,nc)){if(!board[nr][nc])res.push([nr,nc]);else{if(board[nr][nc][0]!==col)res.push([nr,nc]);break;}nr+=dr;nc+=dc;}}};
      if(t==='P'){const d=col==='w'?-1:1;if(inB(r+d,c)&&!board[r+d][c])res.push([r+d,c]);if((col==='w'&&r===6)||(col==='b'&&r===1))if(!board[r+d][c]&&!board[r+2*d][c])res.push([r+2*d,c]);for(const dc of[-1,1])if(inB(r+d,c+dc)&&board[r+d][c+dc]&&board[r+d][c+dc][0]!==col)res.push([r+d,c+dc]);}
      if(t==='N')for(const[dr,dc]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])if(inB(r+dr,c+dc)&&(!board[r+dr][c+dc]||board[r+dr][c+dc][0]!==col))res.push([r+dr,c+dc]);
      if(t==='B')slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
      if(t==='R')slide([[-1,0],[1,0],[0,-1],[0,1]]);
      if(t==='Q')slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
      if(t==='K')for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if((dr||dc)&&inB(r+dr,c+dc)&&(!board[r+dr][c+dc]||board[r+dr][c+dc][0]!==col))res.push([r+dr,c+dc]);
      return res;};
    const doMove=(fr,fc,r,c)=>{const cap=board[r][c];board[r][c]=board[fr][fc];board[fr][fc]='';if(board[r][c][1]==='P'&&(r===0||r===7))board[r][c]=board[r][c][0]+'Q';return cap;};
    const cpuMove=()=>{
      const moves=[];
      for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]&&board[r][c][0]==='b')for(const[nr,nc]of movesFor(r,c)){const cap=board[nr][nc];const score=(cap?VAL[cap[1]]*10:0)+Math.random()*2;moves.push({r,c,nr,nc,score});}
      if(!moves.length){over=true;info.textContent='🏆 Ganan Blancas (sin movimientos)';return;}
      moves.sort((a,b)=>b.score-a.score);const m=moves[0];const cap=doMove(m.r,m.c,m.nr,m.nc);turn='w';
      if(cap&&cap[1]==='K'){over=true;info.textContent='🏆 ¡Ganan Negras (CPU)!';}else info.textContent='Turno: Blancas ♔';
    };
    const render=()=>{grid.innerHTML='';for(let r=0;r<8;r++)for(let c=0;c<8;c++){const sq=el('div','sq '+((r+c)%2?'dark':'light'));const p=board[r][c];if(p)sq.appendChild(el('span','piece '+(p[0]==='w'?'white':'black'),P[p]));if(sel&&sel[0]===r&&sel[1]===c)sq.classList.add('sel');if(sel&&movesFor(sel[0],sel[1]).some(([a,b])=>a===r&&b===c))sq.classList.add(board[r][c]?'capture':'move');
      sq.addEventListener('click',()=>{if(over)return;if(mode.get()==='CPU'&&turn!=='w')return;
        if(sel){const mv=movesFor(sel[0],sel[1]);if(mv.some(([a,b])=>a===r&&b===c)){const cap=doMove(sel[0],sel[1],r,c);sel=null;if(cap&&cap[1]==='K'){over=true;info.textContent='🏆 ¡Ganan Blancas!';render();return;}turn=turn==='w'?'b':'w';info.textContent=mode.get()==='CPU'?'CPU piensa…':'Turno: '+(turn==='w'?'Blancas ♔':'Negras ♚');render();if(mode.get()==='CPU'&&!over)setTimeout(()=>{cpuMove();render();},300);return;}}
        if(board[r][c]&&board[r][c][0]===turn){sel=[r,c];render();}else{sel=null;render();}});
      grid.appendChild(sq);}};
    const start=()=>{reset();info.textContent='Turno: Blancas ♔';render();};
    mode=modeBar([['CPU','🤖 vs CPU (blancas)'],['2P','👥 2 Jugadores']],'CPU');mode.el.addEventListener('click',start);
    stage.innerHTML='';stage.appendChild(titleBar('♔ Ajedrez',start));stage.appendChild(mode.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(grid);render();
    return null;
  }

  /* ---------- 3. DAMAS (2J / vs CPU) ---------- */
  function playCheckers(stage){
    let board,turn,sel,over,mode;
    const reset=()=>{board=Array.from({length:8},()=>Array(8).fill(''));for(let r=0;r<3;r++)for(let c=0;c<8;c++)if((r+c)%2)board[r][c]='b';for(let r=5;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2)board[r][c]='w';turn='w';sel=null;over=false;};
    reset();
    const info=infoEl('Turno: Blancas ○');const grid=el('div','board-8x8');
    const inB=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
    const piece=v=>v==='w'?'⚪':v==='b'?'⚫':v==='W'?'👑':v==='B'?'🔶':'';
    const movesFor=(r,c)=>{const p=board[r][c];if(!p)return[];const col=p.toLowerCase(),king=p===p.toUpperCase(),res=[];const dirs=king?[[-1,-1],[-1,1],[1,-1],[1,1]]:(col==='w'?[[-1,-1],[-1,1]]:[[1,-1],[1,1]]);for(const[dr,dc]of dirs){const nr=r+dr,nc=c+dc;if(inB(nr,nc)&&!board[nr][nc])res.push([nr,nc,false]);const jr=r+2*dr,jc=c+2*dc;if(inB(jr,jc)&&board[nr][nc]&&board[nr][nc].toLowerCase()!==col&&!board[jr][jc])res.push([jr,jc,true]);}return res;};
    const cpuMove=()=>{const moves=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]&&board[r][c].toLowerCase()==='b')for(const[nr,nc,cap]of movesFor(r,c))moves.push({r,c,nr,nc,cap,score:(cap?10:0)+Math.random()*3});if(!moves.length){over=true;info.textContent='🏆 Ganan Blancas';return;}moves.sort((a,b)=>b.score-a.score);const m=moves[0];board[m.nr][m.nc]=board[m.r][m.c];board[m.r][m.c]='';if(m.cap)board[(m.r+m.nr)/2][(m.c+m.nc)/2]='';if(m.nr===7&&board[m.nr][m.nc]==='b')board[m.nr][m.nc]='B';turn='w';};
    const render=()=>{grid.innerHTML='';let w=0,b=0;board.flat().forEach(v=>{if(v&&v.toLowerCase()==='w')w++;if(v&&v.toLowerCase()==='b')b++;});if(!over&&(w===0||b===0)){over=true;info.textContent='🏆 Gana '+(w===0?'Negras ●':'Blancas ○');}
      for(let r=0;r<8;r++)for(let c=0;c<8;c++){const sq=el('div','sq '+((r+c)%2?'dark':'light'));if(board[r][c])sq.appendChild(el('span','piece',piece(board[r][c])));if(sel&&sel[0]===r&&sel[1]===c)sq.classList.add('sel');if(sel&&movesFor(sel[0],sel[1]).some(([a,b])=>a===r&&b===c))sq.classList.add('move');
        sq.addEventListener('click',()=>{if(over)return;if(mode.get()==='CPU'&&turn!=='w')return;
          if(sel){const mv=movesFor(sel[0],sel[1]);const hit=mv.find(([a,b])=>a===r&&b===c);if(hit){board[r][c]=board[sel[0]][sel[1]];board[sel[0]][sel[1]]='';if(hit[2])board[(sel[0]+r)/2][(sel[1]+c)/2]='';if(r===0&&board[r][c]==='w')board[r][c]='W';sel=null;turn=turn==='w'?'b':'w';info.textContent=mode.get()==='CPU'?'CPU piensa…':'Turno: '+(turn==='w'?'Blancas ○':'Negras ●');render();if(mode.get()==='CPU'&&!over)setTimeout(()=>{cpuMove();render();},300);return;}}
          if(board[r][c]&&board[r][c].toLowerCase()===turn){sel=[r,c];render();}else{sel=null;render();}});
        grid.appendChild(sq);}};
    const start=()=>{reset();info.textContent='Turno: Blancas ○';render();};
    mode=modeBar([['CPU','🤖 vs CPU (blancas)'],['2P','👥 2 Jugadores']],'CPU');mode.el.addEventListener('click',start);
    stage.innerHTML='';stage.appendChild(titleBar('⚫ Damas',start));stage.appendChild(mode.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(grid);render();
    return null;
  }

  /* ---------- 4. CONECTA 4 (2J / vs CPU) ---------- */
  function playConnect4(stage){
    const R=6,C=7;let board,turn,over,mode;
    const info=infoEl('');const grid=el('div','c4-grid');
    const reset=()=>{board=Array.from({length:R},()=>Array(C).fill(0));turn=1;over=false;render();info.textContent='Turno: 🔴';};
    const win=p=>{for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){let ok=true;for(let i=0;i<4;i++){const nr=r+dr*i,nc=c+dc*i;if(nr<0||nr>=R||nc<0||nc>=C||board[nr][nc]!==p){ok=false;break;}}if(ok)return true;}return false;};
    const drop=(col,p)=>{for(let r=R-1;r>=0;r--)if(!board[r][col]){board[r][col]=p;return r;}return -1;};
    const cpu=()=>{for(let c=0;c<C;c++){const r=drop(c,2);if(r!==-1){if(win(2)){render();return;}board[r][c]=0;}}for(let c=0;c<C;c++){const r=drop(c,1);if(r!==-1){board[r][c]=0;const r2=drop(c,2);if(r2!==-1)board[r2][c]=0;}}const order=shuffle([3,2,4,1,5,0,6]).filter(c=>!board[0][c]);if(order.length)drop(order[0],2);};
    const render=()=>{grid.innerHTML='';for(let r=0;r<R;r++)for(let c=0;c<C;c++){const cell=el('div','c4-cell');if(board[r][c]===1)cell.classList.add('p1');if(board[r][c]===2)cell.classList.add('p2');cell.addEventListener('click',()=>{if(over)return;if(mode.get()==='CPU'&&turn!==1)return;const r=drop(c,turn);if(r===-1)return;if(win(turn)){over=true;info.textContent='🏆 ¡Gana '+(turn===1?'🔴':'🟡')+'!';render();return;}turn=turn===1?2:1;info.textContent='Turno: '+(turn===1?'🔴':'🟡');render();if(mode.get()==='CPU'&&!over){setTimeout(()=>{cpu();if(win(2)){over=true;info.textContent='💀 Gana la CPU 🟡';}else{turn=1;info.textContent='Tu turno: 🔴';}render();},350);}});grid.appendChild(cell);}};
    mode=modeBar([['CPU','🤖 vs CPU'],['2P','👥 2 Jugadores']],'CPU');mode.el.addEventListener('click',reset);
    stage.innerHTML='';stage.appendChild(titleBar('🔴 Conecta 4',reset));stage.appendChild(mode.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(grid);reset();
    return null;
  }

  /* ---------- 5. MEMORIA (1P / CPU / 2J) ---------- */
  function playMemory(stage){
    const ICONS=['🍎','🍌','🍇','🍓','🍊','🍉','🍒','🥝'];
    let cards,first,lock,moves,found,turn,scores,mode;
    const info=infoEl('');const grid=el('div','mem-grid');
    const render=()=>{info.textContent=mode.get()==='2P'?('Turno: Jugador '+(turn===1?'1 🔴':'2 🔵')+' · Puntos: '+scores[0]+'-'+scores[1]):('Movimientos: '+moves);};
    const flip=(card)=>{
      if(lock||card.flipped||card.matched)return;
      card.flipped=true;const idx=cards.indexOf(card);const mc=document.querySelectorAll('.mem-card')[idx];if(mc)mc.classList.add('flipped');
      if(!first){first=card;return;}
      moves++;
      if(first.v===card.v){
        first.matched=card.matched=true;found+=2;
        const a=cards.indexOf(first),b=idx;
        const all=document.querySelectorAll('.mem-card');
        if(all[a])all[a].classList.add('matched');if(all[b])all[b].classList.add('matched');
        if(mode.get()==='2P')scores[turn-1]++;
        first=null;
        if(found===16){info.textContent='🏆 ¡Completado! '+(mode.get()==='2P'?('Puntos: '+scores[0]+'-'+scores[1]):('en '+moves+' movimientos'));return;}
        render();
        if(mode.get()==='CPU'&&turn===2)setTimeout(cpuPick,600);
      }else{
        lock=true;const a=first,b=card;first=null;
        setTimeout(()=>{a.flipped=b.flipped=false;const ia=cards.indexOf(a),ib=cards.indexOf(b);const all=document.querySelectorAll('.mem-card');if(all[ia])all[ia].classList.remove('flipped');if(all[ib])all[ib].classList.remove('flipped');lock=false;if(mode.get()==='2P')turn=turn===1?2:1;else turn=1;render();if(mode.get()==='CPU'&&turn===2)setTimeout(cpuPick,600);},800);
      }
    };
    const cpuPick=()=>{const unflipped=cards.filter(c=>!c.flipped&&!c.matched);if(!unflipped.length)return;flip(unflipped[rnd(unflipped.length)]);};
    const start=()=>{const deck=shuffle([...ICONS,...ICONS]);cards=deck.map(v=>({v,flipped:false,matched:false}));first=null;lock=false;moves=0;found=0;turn=1;scores=[0,0];grid.innerHTML='';cards.forEach(card=>{const mc=el('div','mem-card');const inner=el('div','mem-inner');inner.appendChild(el('div','mem-face mem-front','?'));inner.appendChild(el('div','mem-face mem-back',card.v));mc.appendChild(inner);mc.addEventListener('click',()=>{if(mode.get()==='CPU'&&turn===2)return;flip(card);});grid.appendChild(mc);});render();};
    mode=modeBar([['1P','🧍 Solo'],['CPU','🤖 vs CPU'],['2P','👥 2 Jugadores']],'1P');mode.el.addEventListener('click',start);
    stage.innerHTML='';stage.appendChild(titleBar('🃏 Memoria',start));stage.appendChild(mode.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(grid);start();
    return null;
  }

  /* ---------- 6. SNAKE (dificultad) ---------- */
  function playSnake(stage){
    const S=20,N=20,cv=makeCanvas(S*N,S*N),ctx=cv.getContext('2d');
    let snake,dir,food,score,timer,alive,diff;
    const info=infoEl('');
    const place=()=>{do{food={x:rnd(N),y:rnd(N)};}while(snake.some(s=>s.x===food.x&&s.y===food.y));};
    const tick=()=>{if(!alive)return;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.x>=N||h.y<0||h.y>=N||snake.some(s=>s.x===h.x&&s.y===h.y)){alive=false;clearInterval(timer);info.textContent='💀 Game Over · Puntos: '+score;draw();return;}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score+=10;place();}else snake.pop();info.textContent='Puntos: '+score+' · '+diff.get();draw();};
    const draw=()=>{ctx.fillStyle='#0f172a';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#ef4444';ctx.fillRect(food.x*S+2,food.y*S+2,S-4,S-4);snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#22c55e':'#16a34a';ctx.fillRect(s.x*S+1,s.y*S+1,S-2,S-2);});if(!alive){ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',cv.width/2,cv.height/2);}};
    const setDir=(x,y)=>{if((dir.x!==-x||dir.y!==-y)&&(dir.x!==x||dir.y!==y))dir={x,y};};
    const onKey=e=>{if(e.key==='ArrowUp'){setDir(0,-1);e.preventDefault();}if(e.key==='ArrowDown'){setDir(0,1);e.preventDefault();}if(e.key==='ArrowLeft'){setDir(-1,0);e.preventDefault();}if(e.key==='ArrowRight'){setDir(1,0);e.preventDefault();}};
    document.addEventListener('keydown',onKey);
    const start=()=>{snake=[{x:10,y:10}];dir={x:1,y:0};score=0;alive=true;place();if(timer)clearInterval(timer);timer=setInterval(tick,speedMs(diff.get(),120));draw();};
    diff=diffBar('Medio');diff.el.addEventListener('click',start);
    const ctrl=el('div','game-controls');ctrl.appendChild(btn('⬆️','btn secondary',()=>setDir(0,-1)));ctrl.appendChild(btn('⬇️','btn secondary',()=>setDir(0,1)));ctrl.appendChild(btn('⬅️','btn secondary',()=>setDir(-1,0)));ctrl.appendChild(btn('➡️','btn secondary',()=>setDir(1,0)));
    stage.innerHTML='';stage.appendChild(titleBar('🐍 Snake',start));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(cv);stage.appendChild(ctrl);start();
    return ()=>{clearInterval(timer);document.removeEventListener('keydown',onKey);};
  }

  /* ---------- 7. 2048 (sin cambios) ---------- */
  function play2048(stage){
    let g,score,over,won;const info=infoEl('Puntos: 0');const grid=el('div','g2048-grid');const cells=[];
    for(let i=0;i<16;i++){const c=el('div','g2048-cell');cells.push(c);grid.appendChild(c);}
    const empty=()=>{const e=[];g.forEach((v,i)=>{if(!v)e.push(i);});return e;};
    const add=()=>{const e=empty();if(!e.length)return;g[e[rnd(e.length)]]=Math.random()<0.9?2:4;};
    const slide=row=>{let a=row.filter(v=>v);for(let i=0;i<a.length-1;i++)if(a[i]===a[i+1]){a[i]*=2;score+=a[i];if(a[i]===2048)won=true;a.splice(i+1,1);}while(a.length<4)a.push(0);return a;};
    const move=dir=>{const before=g.slice();for(let i=0;i<4;i++){let idx,row=[];for(let j=0;j<4;j++){if(dir==='L')idx=i*4+j;if(dir==='R')idx=i*4+(3-j);if(dir==='U')idx=j*4+i;if(dir==='D')idx=(3-j)*4+i;row.push(g[idx]);}const s=slide(row);for(let j=0;j<4;j++){if(dir==='L')g[i*4+j]=s[j];if(dir==='R')g[i*4+(3-j)]=s[j];if(dir==='U')g[j*4+i]=s[j];if(dir==='D')g[(3-j)*4+i]=s[j];}}if(g.some((v,i)=>v!==before[i]))add();render();check();};
    const check=()=>{if(empty().length)return;for(let i=0;i<4;i++)for(let j=0;j<4;j++){const v=g[i*4+j];if(j<3&&v===g[i*4+j+1])return;if(i<3&&v===g[(i+1)*4+j])return;}over=true;info.textContent='💀 Sin movimientos · Puntos: '+score;};
    const COL={2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
    const render=()=>{cells.forEach((c,i)=>{const v=g[i];c.textContent=v||'';c.style.background=v?COL[v]||'#3c3a32':'#cdc1b4';c.style.color=v<=4?'#776e65':'#f9f6f2';c.style.fontSize=v>=1024?'1rem':'1.4rem';});info.textContent=(won?'🏆 ¡2048! ':'')+'Puntos: '+score;};
    const reset=()=>{g=Array(16).fill(0);score=0;over=false;won=false;add();add();render();};
    const onKey=e=>{if(over)return;if(e.key==='ArrowLeft'){move('L');e.preventDefault();}if(e.key==='ArrowRight'){move('R');e.preventDefault();}if(e.key==='ArrowUp'){move('U');e.preventDefault();}if(e.key==='ArrowDown'){move('D');e.preventDefault();}};
    document.addEventListener('keydown',onKey);
    const ctrl=el('div','game-controls');ctrl.appendChild(btn('⬆️','btn secondary',()=>move('U')));ctrl.appendChild(btn('⬇️','btn secondary',()=>move('D')));ctrl.appendChild(btn('⬅️','btn secondary',()=>move('L')));ctrl.appendChild(btn('➡️','btn secondary',()=>move('R')));
    stage.innerHTML='';stage.appendChild(titleBar('🔢 2048',reset));stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(grid);stage.appendChild(ctrl);reset();
    return ()=>document.removeEventListener('keydown',onKey);
  }

  /* ---------- 8. TETRIS (dificultad) ---------- */
  function playTetris(stage){
    const COLS=10,ROWS=20,B=24,cv=makeCanvas(COLS*B,ROWS*B),ctx=cv.getContext('2d');
    const SH={I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]]};
    const COL={I:'#22d3ee',O:'#facc15',T:'#a855f7',S:'#22c55e',Z:'#ef4444',J:'#3b82f6',L:'#f97316'};
    let grid,cur,px,py,score,lines,timer,over,diff;
    const info=infoEl('');
    const newPiece=()=>{const ks=Object.keys(SH);const k=ks[rnd(ks.length)];cur={shape:SH[k].map(r=>r.slice()),color:COL[k]};px=Math.floor((COLS-cur.shape[0].length)/2);py=0;};
    const reset=()=>{grid=Array.from({length:ROWS},()=>Array(COLS).fill(0));score=0;lines=0;over=false;newPiece();if(timer)clearInterval(timer);timer=setInterval(tick,speedMs(diff.get(),500));draw();};
    const collide=(sh,x,y)=>sh.some((r,dy)=>r.some((v,dx)=>v&&(y+dy>=ROWS||x+dx<0||x+dx>=COLS||(grid[y+dy]&&grid[y+dy][x+dx]))));
    const merge=()=>cur.shape.forEach((r,dy)=>r.forEach((v,dx)=>{if(v)grid[py+dy][px+dx]=cur.color;}));
    const clearL=()=>{let c=0;for(let y=ROWS-1;y>=0;y--)if(grid[y].every(v=>v)){grid.splice(y,1);grid.unshift(Array(COLS).fill(0));c++;y++;}if(c){lines+=c;score+=[0,100,300,500,800][c];info.textContent='Puntos: '+score+' · Filas: '+lines+' · '+diff.get();}};
    const tick=()=>{if(over)return;if(!collide(cur.shape,px,py+1))py++;else{merge();clearL();newPiece();if(collide(cur.shape,px,py)){over=true;clearInterval(timer);info.textContent='💀 Game Over · Puntos: '+score;}}draw();};
    const rotate=()=>{const s=cur.shape;const rot=s[0].map((_,i)=>s.map(r=>r[i]).reverse());if(!collide(rot,px,py))cur.shape=rot;};
    const draw=()=>{ctx.fillStyle='#0f172a';ctx.fillRect(0,0,cv.width,cv.height);grid.forEach((r,y)=>r.forEach((v,x)=>{if(v){ctx.fillStyle=v;ctx.fillRect(x*B+1,y*B+1,B-2,B-2);}}));if(!over)cur.shape.forEach((r,dy)=>r.forEach((v,dx)=>{if(v){ctx.fillStyle=cur.color;ctx.fillRect((px+dx)*B+1,(py+dy)*B+1,B-2,B-2);}}));if(over){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',cv.width/2,cv.height/2);}};
    const onKey=e=>{if(over)return;if(e.key==='ArrowLeft'&&!collide(cur.shape,px-1,py)){px--;draw();e.preventDefault();}if(e.key==='ArrowRight'&&!collide(cur.shape,px+1,py)){px++;draw();e.preventDefault();}if(e.key==='ArrowDown'){tick();e.preventDefault();}if(e.key==='ArrowUp'){rotate();draw();e.preventDefault();}if(e.key===' '){while(!collide(cur.shape,px,py+1))py++;tick();e.preventDefault();}};
    document.addEventListener('keydown',onKey);
    diff=diffBar('Medio');diff.el.addEventListener('click',reset);
    const ctrl=el('div','game-controls');ctrl.appendChild(btn('⬅️','btn secondary',()=>{if(!over&&!collide(cur.shape,px-1,py)){px--;draw();}}));ctrl.appendChild(btn('🔄','btn secondary',()=>{if(!over){rotate();draw();}}));ctrl.appendChild(btn('➡️','btn secondary',()=>{if(!over&&!collide(cur.shape,px+1,py)){px++;draw();}}));ctrl.appendChild(btn('⬇️','btn secondary',()=>{if(!over)tick();}));
    stage.innerHTML='';stage.appendChild(titleBar('🟦 Tetris',reset));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(cv);stage.appendChild(ctrl);reset();
    return ()=>{clearInterval(timer);document.removeEventListener('keydown',onKey);};
  }

  /* ---------- 9. BUSCAMINAS (3x3 / 6x6 / 9x9) ---------- */
  function playMines(stage){
    let N,MINES,grid,rev,flag,over,flagMode,first;
    const info=infoEl('');const g=el('div','ms-grid');
    const sizes=[['3×3 Fácil',3,2],['6×6 Medio',6,6],['9×9 Difícil',9,10]];
    let curSize=2;
    const nb=i=>{const r=Math.floor(i/N),c=i%N,res=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(nr>=0&&nr<N&&nc>=0&&nc<N)res.push(nr*N+nc);}return res;};
    const place=skip=>{let p=0;while(p<MINES){const i=rnd(N*N);if(i!==skip&&grid[i]!==-1){grid[i]=-1;p++;}}for(let i=0;i<N*N;i++){if(grid[i]===-1)continue;let c=0;nb(i).forEach(j=>{if(grid[j]===-1)c++;});grid[i]=c;}};
    const flood=i=>{const st=[i];while(st.length){const x=st.pop();if(rev[x])continue;rev[x]=true;if(grid[x]===0)nb(x).forEach(j=>{if(!rev[j])st.push(j);});}};
    const render=()=>{g.innerHTML='';const sz=N>6?32:44;g.style.gridTemplateColumns='repeat('+N+', '+sz+'px)';for(let i=0;i<N*N;i++){const c=el('div','ms-cell');c.style.width=c.style.height=sz+'px';if(rev[i]){c.classList.add('open');if(grid[i]===-1){c.classList.add('mine');c.textContent='💣';}else if(grid[i]>0){c.textContent=grid[i];c.style.color=['','#2563eb','#16a34a','#dc2626','#7c3aed','#b91c1c','#0891b2','#111','#6b7280'][grid[i]];}}else if(flag[i]){c.classList.add('flag');c.textContent='🚩';}
      c.addEventListener('click',()=>{if(over)return;if(flagMode){if(!rev[i]){flag[i]=!flag[i];render();}return;}if(flag[i])return;if(first){first=false;place(i);}if(grid[i]===-1){rev=grid.map((v,i)=>v===-1?true:rev[i]);over=true;info.textContent='💥 ¡Boom! Game Over';render();return;}flood(i);if(rev.every((v,i)=>v||grid[i]===-1)){over=true;info.textContent='🏆 ¡Ganaste!';}render();});g.appendChild(c);}};
    const start=()=>{const s=sizes[curSize];N=s[1];MINES=s[2];grid=Array(N*N).fill(0);rev=Array(N*N).fill(false);flag=Array(N*N).fill(false);over=false;first=true;flagMode=false;info.textContent='Minas: '+MINES+' · Modo: descubrir';render();};
    const sizeBar=el('div','game-controls');sizes.forEach((s,i)=>sizeBar.appendChild(btn(s[0],'btn small-btn'+(i===curSize?'':' secondary'),()=>{curSize=i;sizeBar.querySelectorAll('button').forEach(x=>x.classList.add('secondary'));sizeBar.querySelectorAll('button')[i].classList.remove('secondary');start();})));
    const flagBtn=btn('🚩 Modo bandera: OFF','btn warning',()=>{flagMode=!flagMode;flagBtn.textContent='🚩 Modo bandera: '+(flagMode?'ON':'OFF');info.textContent='Minas: '+MINES+' · Modo: '+(flagMode?'bandera':'descubrir');});
    const ctrl=el('div','game-controls');ctrl.appendChild(flagBtn);
    stage.innerHTML='';stage.appendChild(titleBar('💣 Buscaminas',start));stage.appendChild(sizeBar);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(g);stage.appendChild(ctrl);start();
    return null;
  }

  /* ---------- 10. AHORCADO (palabras argentinas extenso) ---------- */
  function playHangman(stage){
    const WORDS=['MANZANA','BANANA','SUPERMERCADO','COMPUTADORA','ELEFANTE','JIRAFA','MURCIELAGO','PARAGUAS','TELEFONO','AURICULARES','CHOCOLATE','FIDEOS','YERBA','MATE','ZANAHORIA','TOMATE','CEBOLLA','NARANJA','PELOTA','BICICLETA','LIBRO','CUADERNO','LAPIZ','PEINE','TOALLA','JABON','LECHE','PAN','QUESO','HUEVO','EMPANADA','ASADO','DULCEDELECHE','MEDIALUNA','FACTURA','ALFAJOR','CHORIPAN','MILANESA','PICADA','BIRRA','FUTBOL','CANCHA','ARQUERO','DELANTRO','CAMISETA','BOTINES','COLECTIVO','SUBTE','ESCUELA','UNIVERSIDAD','PROFESOR','ALUMNO','MOCHILA','RELOJ','GAFAS','LLUVIA','VIENTO','TRUENO','RAYO','VERANO','INVIERNO','PRIMAVERA','OTONO','PLAYA','RIO','MONTAÑA','PAMPA','PATAGONIA','TANGO','FOLCLORE','CUARTETO','CUMBIA','ROCK','GUITARRA','PIANO','BATERIA','VIOLIN','CINE','PELICULA','ACTORES','DIRECTOR','PALOMITAS','TELEVISOR','CONTROL','WIFI','INTERNET','CORREO','MENSAJE','FOTO','VIDEO','JUEGO','CONSOLA','MANDO','PANTALLA','TECLADO','MOUSE','IMPRESORA','CARGADOR','BATERIA','ALARMA','DESPERTADOR','CAMA','ALMOHADA','SABANA','FRACADA','COCINA','HORNO','MICROONDAS','HELADERA','FREEZER','LAVARROPAS','ESPEJO','SHAMPOO','ACONDICIONADOR','CEPILLO','PASTA','TIJERA','CLAVO','DESTORNILLADOR','MARTILLO','SIERRA','CINTA','PEGAMENTO','REGLA','CARTUCHERA','BORRADOR','SACAPUNTA','GOMA','LAPICERA','BOLIGOMA','RESALTADOR','MARCADOR','TEMPERA','ACUARELA','PINCEL','LIENZO','OLEO','ESCULTURA','MUSEO','TEATRO','OBRA','MUSICAL','DANZA','BALLET','ZAPATO','VESTIDO','PANTALON','REMERA','CAMPERA','BUFANDA','GUANTE','MEDIAS','ZAPATILLAS','OJOTAS','BOLSO','MOCHILA','VALIJA','PASAPORTE','VUELO','AEROPUERTO','MALETA','SELLO','MONEDA','BILLETE','CAJERO','TARJETA','ALCANCIA','AHORRO','PRESTAMO','CUOTA','PRECIO','OFERTA','DESCUENTO','TICKET','FACTURA','RECIBO','SALDO','DEBITO','CREDITO','PLAZO','INVERSION','BOLSA','ACCION','DOLAR','EURO','PESO','CENTAVO','SUELDO','AGUINALDO','JUBILACION','PENSION','MEDICO','ENFERMERO','HOSPITAL','CLINICA','FARMACIA','REMEDIO','VITAMINA','JARABE','PASTILLA','INYECCION','CURA','CURITA','GAZA','ALCOHOL','TERMOMETRO','PRESION','TEMPERATURA','FIEBRE','TOS','GRIPE','VACUNA','VIRUS','BACTERIA','FREIDORA','LICUADORA','BATIDORA','EXPRIMIDOR','RALLADOR','COLADOR','OLLA','SARTEN','CUCHARA','TENEDOR','CUCHILLO','PLATO','VASO','TAZA','JARRA','TETERA','BOMBILLA','TERMO','MATERA','AZUCAR','EDULCORANTE','CAFE','JUGO','AGUA','SODA','GASEOSA','CERVEZA','VINO','CHAMPAGNE','FARDO','LATA','BOTELLA','TETRA','CAJA','PAQUETE','FRASCO','POTE','BOLSA','ATADO','MANOJO','DOCENA','KILO','GRAMO','LITRO','MILILITRO','CENTIMETRO','METRO','KILOMETRO','HORA','MINUTO','SEGUNDO','SEMANA','MES','ANO','DECADA','SIGLO','MILENIO','AYER','HOY','MANANA','TARDE','NOCHE','MADRUGADA','MEDIODIA','ATARDECER','AMANECER','LUNA','SOL','ESTRELLA','PLANETA','GALAXIA','UNIVERSO','COHETE','SATELITE','ASTRO','COMETA','METEORO','VOLCAN','TERREMOTO','TSUNAMI','HURACAN','TORNADO','INUNDACION','SEQUIA','INCENDIO','NIEVE','GRANIZO','NIEBLA','AIRE','FUEGO','AGUA','TIERRA','MADERA','METAL','PLASTICO','VIDRIO','CARTON','PAPEL','TELA','CUERO','LANA','SEDA','ALGODON','POLIESTER','NYLON','GOMA','CERAMICA','PORCELANA','BARRO','ARENA','PIEDRA','ROCA','CARBON','DIAMANTE','ORO','PLATA','BRONCE','COBRE','HIERRO','ACERO','ALUMINIO','PLOMO','ZINC','NIQUEL','MERCURIO','SODIO','POTASIO','CALCIO','MAGNESIO','YODO','CLORO','OXIGENO','NITROGENO','CARBONO','HIDROGENO','HELIO','NEON','ARGON','AZUFRE','FOSFORO','SILICIO','TITANIO','CROMO','MANGANESO','COBALTO','NIQUEL','CADMIO','ORO','PLATINO','MERCURIO','PLOMO','BISMUTO','URANIO','PLUTONIO','TORIO','RADIO','ACTINIO'];
    const DRAW=['  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========','  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========','  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========','  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========','  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========','  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========','  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========='];
    let word,guessed,wrong,over;
    const drawEl=el('div','hangman-draw');const wordEl=el('div','hangman-word');const kb=el('div','kb');const info=infoEl('Adiviná la palabra');
    const render=()=>{drawEl.textContent=DRAW[wrong];wordEl.textContent=word.split('').map(l=>guessed.has(l)?l:'_').join(' ');if(word.split('').every(l=>guessed.has(l))){over=true;info.textContent='🏆 ¡Ganaste! Palabra: '+word;}else if(wrong>=6){over=true;info.textContent='💀 Ahorcado. Era: '+word;wordEl.textContent=word;}else info.textContent='Errores: '+wrong+' / 6';};
    const reset=()=>{word=WORDS[rnd(WORDS.length)];guessed=new Set();wrong=0;over=false;kb.innerHTML='';'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').forEach(l=>{const b=el('button','',l);b.addEventListener('click',()=>{if(over||guessed.has(l))return;guessed.add(l);if(word.includes(l))b.classList.add('hit');else{wrong++;b.classList.add('miss');}b.disabled=true;render();});kb.appendChild(b);});render();};
    stage.innerHTML='';stage.appendChild(titleBar('🪢 Ahorcado ('+WORDS.length+' palabras argentinas)',reset));stage.appendChild(info);const w=el('div','game-board');w.appendChild(drawEl);stage.appendChild(w);stage.appendChild(wordEl);stage.appendChild(kb);reset();
    return null;
  }

  /* ---------- 11. LABERINTO (dificultad + etapas progresivas) ---------- */
  function playMaze(stage){
    let W,H,maze,px,py,gx,gy,level,diff;
    const info=infoEl('');const grid=el('div','maze-grid');
    const sizeFor=()=>{const d=diff.get();const base=d==='Fácil'?9:d==='Medio'?13:17;return {w:base+Math.floor(level/10)*2,h:base+Math.floor(level/10)};};
    const gen=()=>{const s=sizeFor();W=s.w;H=s.h;if(W%2===0)W++;if(H%2===0)H++;maze=Array.from({length:H},()=>Array(W).fill(1));const st=[[0,0]];maze[0][0]=0;while(st.length){const[x,y]=st[st.length-1];const dirs=shuffle([[2,0],[-2,0],[0,2],[0,-2]]).filter(([dx,dy])=>{const nx=x+dx,ny=y+dy;return nx>=0&&nx<W&&ny>=0&&ny<H&&maze[ny][nx]===1;});if(!dirs.length){st.pop();continue;}const[dx,dy]=dirs[0];maze[y+dy/2][x+dx/2]=0;maze[y+dy][x+dx]=0;st.push([x+dx,y+dy]);}gx=W-1;gy=H-1;maze[gy][gx]=0;px=0;py=0;};
    const render=()=>{grid.innerHTML='';grid.style.gridTemplateColumns='repeat('+W+', 24px)';for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=el('div','maze-cell '+(maze[y][x]?'maze-wall':'maze-path'));if(x===gx&&y===gy)c.classList.add('maze-goal');if(x===px&&y===py)c.classList.add('maze-player');grid.appendChild(c);}};
    const move=(dx,dy)=>{const nx=px+dx,ny=py+dy;if(nx<0||nx>=W||ny<0||ny>=H||maze[ny][nx])return;px=nx;py=ny;render();if(px===gx&&py===gy){level++;info.textContent='🏆 ¡Nivel '+(level-1)+' completado! Cargando siguiente…';setTimeout(()=>{gen();render();info.textContent='Nivel '+level+' · '+diff.get()+' · Etapas infinitas (procedural)';},700);}};
    const onKey=e=>{if(e.key==='ArrowUp'){move(0,-1);e.preventDefault();}if(e.key==='ArrowDown'){move(0,1);e.preventDefault();}if(e.key==='ArrowLeft'){move(-1,0);e.preventDefault();}if(e.key==='ArrowRight'){move(1,0);e.preventDefault();}};
    document.addEventListener('keydown',onKey);
    const start=()=>{level=1;gen();render();info.textContent='Nivel 1 · '+diff.get();};
    diff=diffBar('Medio');diff.el.addEventListener('click',start);
    const ctrl=el('div','game-controls');ctrl.appendChild(btn('⬆️','btn secondary',()=>move(0,-1)));ctrl.appendChild(btn('⬇️','btn secondary',()=>move(0,1)));ctrl.appendChild(btn('⬅️','btn secondary',()=>move(-1,0)));ctrl.appendChild(btn('➡️','btn secondary',()=>move(1,0)));
    stage.innerHTML='';stage.appendChild(titleBar('🌀 Laberinto (etapas progresivas)',start));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(grid);stage.appendChild(ctrl);start();
    return ()=>document.removeEventListener('keydown',onKey);
  }

  /* ---------- 12. PONG (dificultad) ---------- */
  function playPong(stage){
    const W=600,H=380,cv=makeCanvas(W,H),ctx=cv.getContext('2d');
    let pY,cY,bx,by,bvx,bvy,pS,cS,raf,running,diff;
    const PH=80,PW=10;
    const info=infoEl('');
    const reset=()=>{bx=W/2;by=H/2;bvx=(Math.random()<0.5?-1:1)*4;bvy=(Math.random()<0.5?-1:1)*3;};
    const cpuSpeed=()=> diff.get()==='Fácil'?0.04 : diff.get()==='Medio'?0.07 : 0.12;
    const loop=()=>{if(!running)return;bx+=bvx;by+=bvy;if(by<8||by>H-8)bvy*=-1;cY+=(by-(cY+PH/2))*cpuSpeed();cY=Math.max(0,Math.min(H-PH,cY));if(bx<25&&by>pY&&by<pY+PH){bvx=Math.abs(bvx)*1.05;bvy+=(by-(pY+PH/2))*0.1;}if(bx>W-25&&by>cY&&by<cY+PH){bvx=-Math.abs(bvx)*1.05;}if(bx<0){cS++;reset();}if(bx>W){pS++;reset();}info.textContent='Tú '+pS+' - '+cS+' CPU · '+diff.get();ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);ctx.setLineDash([6,8]);ctx.strokeStyle='#334155';ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#60a5fa';ctx.fillRect(10,pY,PW,PH);ctx.fillStyle='#f87171';ctx.fillRect(W-20,cY,PW,PH);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx,by,7,0,7);ctx.fill();raf=requestAnimationFrame(loop);};
    const onMove=e=>{const r=cv.getBoundingClientRect();const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top;pY=Math.max(0,Math.min(H-PH,y*(H/r.height)-PH/2));};
    cv.addEventListener('mousemove',onMove);cv.addEventListener('touchmove',e=>{onMove(e);e.preventDefault();},{passive:false});
    const onKey=e=>{if(e.key==='ArrowUp'){pY=Math.max(0,pY-20);e.preventDefault();}if(e.key==='ArrowDown'){pY=Math.min(H-PH,pY+20);e.preventDefault();}};
    document.addEventListener('keydown',onKey);
    const start=()=>{pY=H/2-40;cY=H/2-40;pS=0;cS=0;running=true;reset();loop();};
    diff=diffBar('Medio');
    stage.innerHTML='';stage.appendChild(titleBar('🏓 Pong (vs CPU)',start));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(cv);start();
    return ()=>{running=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',onKey);};
  }

  /* ---------- 13. BREAKOUT (power-ups + 100 niveles + 10 vidas) ---------- */
  function playBreakout(stage){
    const W=480,H=420,cv=makeCanvas(W,H),ctx=cv.getContext('2d');
    let px,pw,balls,bricks,bullets,powerups,lives,level,score,raf,running,diff,gunsUntil,wideUntil,fastUntil;
    const info=infoEl('');
    const POWERTYPES=['M','G','W','F'];
    const levelBricks=lv=>{const rows=3+Math.min(5,Math.floor(lv/20));const cols=8;const arr=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(Math.random()<0.12)continue;const hasPower=Math.random()<0.18;const pt=hasPower?(Math.random()<0.04?'X':POWERTYPES[rnd(POWERTYPES.length)]):null;arr.push({x:c*(50+6)+20,y:r*(16+6)+40,alive:true,color:['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'][r%6],power:pt});}return arr;};
    const newBall=(x,y)=>balls.push({x,y,vx:(Math.random()<0.5?-1:1)*3,vy:-3});
    const startLevel=()=>{bricks=levelBricks(level);balls=[];newBall(W/2,H-60);bullets=[];powerups=[];gunsUntil=0;wideUntil=0;fastUntil=0;pw=70;px=W/2-pw/2;};
    const applyPower=(t)=>{
      if(t==='M'||t==='X'){const n=t==='X'?100:50;const base=balls[0]||{x:W/2,y:H/2};for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2;balls.push({x:base.x,y:base.y,vx:Math.cos(a)*3,vy:Math.sin(a)*3-1});}}
      if(t==='G')gunsUntil=Date.now()+30000;
      if(t==='W'||t==='X')wideUntil=Date.now()+45000;
      if(t==='F')fastUntil=Date.now()+15000;
    };
    let lastGun=0;
    const loop=()=>{if(!running)return;const now=Date.now();const speedMul=fastUntil>now?1.5:1;
      balls.forEach(b=>{b.x+=b.vx*speedMul;b.y+=b.vy*speedMul;if(b.x<6||b.x>W-6)b.vx*=-1;if(b.y<6)b.vy*=-1;if(b.y>H-18&&b.x>px&&b.x<px+pw)b.vy=-Math.abs(b.vy);});
      balls=balls.filter(b=>b.y<=H+20);
      if(bricks.every(b=>!b.alive)){level++;if(level>100){info.textContent='🏆 ¡Completaste los 100 niveles! Puntos: '+score;running=false;return;}startLevel();}
      if(!balls.length){lives--;if(lives<=0){info.textContent='💀 Game Over · Nivel '+level+' · Puntos '+score;running=false;}else{newBall(px+pw/2,H-60);}}
      bricks.forEach(br=>{if(!br.alive)return;balls.forEach(b=>{if(b.x>br.x&&b.x<br.x+50&&b.y>br.y&&b.y<br.y+16){br.alive=false;b.vy*=-1;score+=10;if(br.power)powerups.push({x:br.x+25,y:br.y,type:br.power,vy:2});}});});
      powerups.forEach(p=>p.y+=p.vy);
      powerups=powerups.filter(p=>{if(p.y>H-12&&p.x>px&&p.x<px+pw){applyPower(p.type);return false;}return p.y<=H;});
      if(gunsUntil>now&&now-lastGun>3000){bullets.push({x:px+5,y:H-14,vy:-6},{x:px+pw-5,y:H-14,vy:-6});lastGun=now;}
      bullets.forEach(b=>b.y+=b.vy);
      bullets=bullets.filter(b=>{if(b.y<0)return false;let hit=false;bricks.forEach(br=>{if(br.alive&&b.x>br.x&&b.x<br.x+50&&b.y>br.y&&b.y<br.y+16){br.alive=false;hit=true;score+=10;}});return !hit;});
      pw=wideUntil>now?140:70;
      info.textContent='Nivel '+level+'/100 · Vidas: '+lives+' · Puntos: '+score+(gunsUntil>now?' 🔫':'')+(wideUntil>now?' 📏':'');
      ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);
      bricks.forEach(br=>{if(br.alive){ctx.fillStyle=br.color;ctx.fillRect(br.x,br.y,50,16);if(br.power){ctx.fillStyle='#fff';ctx.font='10px sans-serif';ctx.fillText(br.power,br.x+22,br.y+12);}}});
      ctx.fillStyle='#60a5fa';ctx.fillRect(px,H-12,pw,10);
      if(gunsUntil>now){ctx.fillStyle='#f59e0b';ctx.fillRect(px-2,H-18,4,8);ctx.fillRect(px+pw-2,H-18,4,8);}
      balls.forEach(b=>{ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,6,0,7);ctx.fill();});
      bullets.forEach(b=>{ctx.fillStyle='#facc15';ctx.fillRect(b.x-1,b.y,3,8);});
      const PCOL={M:'#22c55e',G:'#f59e0b',W:'#3b82f6',F:'#a855f7',X:'#ec4899'};
      powerups.forEach(p=>{ctx.fillStyle=PCOL[p.type];ctx.beginPath();ctx.arc(p.x,p.y,8,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(p.type,p.x,p.y+3);ctx.textAlign='left';});
      raf=requestAnimationFrame(loop);
    };
    const onMove=e=>{const r=cv.getBoundingClientRect();const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;px=Math.max(0,Math.min(W-pw,x*(W/r.width)-pw/2));};
    cv.addEventListener('mousemove',onMove);cv.addEventListener('touchmove',e=>{onMove(e);e.preventDefault();},{passive:false});
    const onKey=e=>{if(e.key==='ArrowLeft'){px=Math.max(0,px-20);e.preventDefault();}if(e.key==='ArrowRight'){px=Math.min(W-pw,px+20);e.preventDefault();}};
    document.addEventListener('keydown',onKey);
    const start=()=>{level=1;lives=10;score=0;running=true;lastGun=0;startLevel();loop();};
    diff=diffBar('Medio');
    stage.innerHTML='';stage.appendChild(titleBar('🧱 Breakout (100 niveles · power-ups)',start));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(cv);
    const legend=el('div','game-info','Power-ups: 🟢M=50 pelotas · 🟡G=ametralladoras 30s · 🔵W=base x2 45s · 🟣F=velocidad · 💗X=MEGA raro (x2+100)');legend.style.fontSize='0.72rem';stage.appendChild(legend);
    start();
    return ()=>{running=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',onKey);};
  }

  /* ---------- 14. GOLPEA AL TOPO (dificultad) ---------- */
  function playMole(stage){
    let score,time,timer,moleIdx,running,diff;
    const info=infoEl('');const grid=el('div','mole-grid');const holes=[];
    for(let i=0;i<9;i++){const h=el('div','mole-hole','');holes.push(h);grid.appendChild(h);h.addEventListener('click',()=>{if(!running)return;if(moleIdx===i){score++;info.textContent='Puntos: '+score+' · Tiempo: '+time+'s';moleIdx=-1;render();}});}
    const render=()=>holes.forEach((h,i)=>h.textContent=i===moleIdx?'🐹':'');
    const interval=()=> diff.get()==='Fácil'?1400 : diff.get()==='Medio'?900 : 500;
    const start=()=>{score=0;time=30;running=true;if(timer)clearInterval(timer);timer=setInterval(()=>{time--;moleIdx=rnd(9);render();info.textContent='Puntos: '+score+' · Tiempo: '+time+'s · '+diff.get();if(time<=0){clearInterval(timer);running=false;moleIdx=-1;render();info.textContent='⏰ ¡Tiempo! Puntos: '+score;}},interval());moleIdx=rnd(9);render();};
    diff=diffBar('Medio');diff.el.addEventListener('click',start);
    const ctrl=el('div','game-controls');ctrl.appendChild(btn('▶️ Jugar (30s)','btn success',start));
    stage.innerHTML='';stage.appendChild(titleBar('🐹 Golpea al Topo',start));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(grid);stage.appendChild(ctrl);
    return ()=>clearInterval(timer);
  }

  /* ---------- 15. TEST DE REACCIÓN (dificultad) ---------- */
  function playReaction(stage){
    let state='idle',startTime,timer,best=Infinity,diff;
    const box=el('div','');box.style.cssText='width:100%;max-width:480px;height:220px;margin:0 auto;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:bold;color:#fff;cursor:pointer;background:#64748b;text-align:center;padding:10px';
    const info=infoEl('Clic para empezar');
    const setBox=(c,t)=>{box.style.background=c;box.textContent=t;};
    const waitRange=()=> diff.get()==='Fácil'?[2000,5000] : diff.get()==='Medio'?[1000,3000] : [500,1500];
    const start=()=>{state='wait';setBox('#ef4444','⏳ Esperá el verde… ('+diff.get()+')');const r=waitRange();const delay=r[0]+Math.random()*(r[1]-r[0]);timer=setTimeout(()=>{state='go';startTime=Date.now();setBox('#22c55e','¡CLIC AHORA!');},delay);};
    box.addEventListener('click',()=>{if(state==='idle'||state==='done'){start();return;}if(state==='wait'){clearTimeout(timer);state='done';setBox('#f59e0b','⚠️ ¡Muy pronto! Clic para reintentar');return;}if(state==='go'){const t=Date.now()-startTime;best=Math.min(best,t);state='done';setBox('#3b82f6','⚡ '+t+' ms · Mejor: '+best+' ms · Clic para jugar de nuevo');}});
    diff=diffBar('Medio');
    const reset=()=>{state='idle';best=Infinity;setBox('#64748b','Clic para empezar');};
    stage.innerHTML='';stage.appendChild(titleBar('⚡ Test de Reacción',reset));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(box);
    return ()=>clearTimeout(timer);
  }

  /* ---------- 16. QUIZ (banco por categorías, aleatorio) ---------- */
  function playQuiz(stage){
    const QS=[
      {q:'¿Cuál es la capital de Argentina?',o:['Buenos Aires','Córdoba','Rosario','Mendoza'],a:0,cat:'Geografía'},
      {q:'¿Cuántos planetas tiene el sistema solar?',o:['7','8','9','10'],a:1,cat:'Ciencia'},
      {q:'¿Quién pintó la Mona Lisa?',o:['Van Gogh','Picasso','Da Vinci','Dalí'],a:2,cat:'Arte'},
      {q:'¿Cuál es el río más largo del mundo?',o:['Nilo','Amazonas','Misisipi','Paraná'],a:1,cat:'Geografía'},
      {q:'¿En qué año llegó el hombre a la Luna?',o:['1959','1965','1969','1975'],a:2,cat:'Historia'},
      {q:'¿Cuántas cuerdas tiene una guitarra clásica?',o:['4','5','6','7'],a:2,cat:'Música'},
      {q:'¿Cuál es el país más grande del mundo?',o:['China','EE.UU.','Canadá','Rusia'],a:3,cat:'Geografía'},
      {q:'¿Qué gas respiramos principalmente del aire?',o:['Oxígeno','Nitrógeno','CO2','Hidrógeno'],a:1,cat:'Ciencia'},
      {q:'¿Cuántos lados tiene un hexágono?',o:['5','6','7','8'],a:1,cat:'Matemática'},
      {q:'¿Quién escribió "Don Quijote de la Mancha"?',o:['Cervantes','Shakespeare','García Márquez','Borges'],a:0,cat:'Literatura'},
      {q:'¿Cuál es el océano más grande?',o:['Atlántico','Índico','Pacífico','Ártico'],a:2,cat:'Geografía'},
      {q:'¿Cuántas copas del mundo tiene Argentina?',o:['2','3','4','5'],a:1,cat:'Deportes'},
      {q:'¿En qué año ganó Argentina el Mundial en Qatar?',o:['2018','2022','2014','2010'],a:1,cat:'Deportes'},
      {q:'¿Quién es el máximo goleador histórico de la Selección Argentina?',o:['Maradona','Messi','Batistuta','Kempes'],a:1,cat:'Deportes'},
      {q:'¿Cuál es la moneda de Argentina?',o:['Dólar','Euro','Peso','Real'],a:2,cat:'Actualidad'},
      {q:'¿Cuál es el alimento base de la dieta argentina?',o:['Arroz','Papa','Trigo','Asado'],a:3,cat:'Cultura'},
      {q:'¿Quién compuso la letra del Himno Nacional Argentino?',o:['San Martín','Belgrano','Vicente López y Planes','Sarmiento'],a:2,cat:'Historia'},
      {q:'¿Cuál es la provincia más extensa de Argentina?',o:['Buenos Aires','Santa Fe','Córdoba','Santa Cruz'],a:3,cat:'Geografía'},
      {q:'¿Qué día se celebra el Día de la Tradición?',o:['10 de noviembre','25 de mayo','9 de julio','18 de junio'],a:0,cat:'Cultura'},
      {q:'¿Cuál es el metal más abundante en la corteza terrestre?',o:['Hierro','Cobre','Aluminio','Oro'],a:2,cat:'Ciencia'},
      {q:'¿Cuántos jugadores tiene un equipo de fútbol en cancha?',o:['9','10','11','12'],a:2,cat:'Deportes'},
      {q:'¿Cuál es la velocidad de la luz?',o:['300.000 km/s','150.000 km/s','1.000.000 km/s','30.000 km/s'],a:0,cat:'Ciencia'},
      {q:'¿Quién pintó "La Noche Estrellada"?',o:['Monet','Van Gogh','Picasso','Rembrandt'],a:1,cat:'Arte'},
      {q:'¿Cuál es el idioma más hablado del mundo?',o:['Inglés','Español','Chino mandarín','Hindi'],a:2,cat:'Idiomas'},
      {q:'¿Cuántos huesos tiene el cuerpo humano adulto?',o:['186','206','226','246'],a:1,cat:'Ciencia'},
      {q:'¿Cuál es el planeta más cercano al Sol?',o:['Venus','Tierra','Mercurio','Marte'],a:2,cat:'Ciencia'},
      {q:'¿Quién inventó la bombilla eléctrica?',o:['Edison','Tesla','Einstein','Newton'],a:0,cat:'Historia'},
      {q:'¿Cuál es la capital de Francia?',o:['Londres','París','Berlín','Roma'],a:1,cat:'Geografía'},
      {q:'¿Cuántos colores tiene el arcoíris?',o:['5','6','7','8'],a:2,cat:'Ciencia'},
      {q:'¿Cuál es el animal terrestre más rápido?',o:['León','Guepardo','Caballo','Antílope'],a:1,cat:'Naturaleza'},
      {q:'¿Cuántos minutos dura un partido de fútbol?',o:['80','90','100','120'],a:1,cat:'Deportes'},
      {q:'¿Cuál es el continente más poblado?',o:['África','Europa','Asia','América'],a:2,cat:'Geografía'},
      {q:'¿Quién escribió "Cien años de soledad"?',o:['Borges','Cortázar','García Márquez','Sabato'],a:2,cat:'Literatura'},
      {q:'¿Cuál es el símbolo químico del oro?',o:['Ag','Au','Fe','Cu'],a:1,cat:'Ciencia'},
      {q:'¿En qué año cayó el Muro de Berlín?',o:['1987','1989','1991','1993'],a:1,cat:'Historia'},
      {q:'¿Cuál es la montaña más alta del mundo?',o:['K2','Everest','Aconcagua','Kilimanjaro'],a:1,cat:'Geografía'},
      {q:'¿Cuántas teclas tiene un piano estándar?',o:['76','82','88','96'],a:2,cat:'Música'},
      {q:'¿Quién fue el primer presidente de Argentina?',o:['Rivadavia','Urquiza','Mitre','San Martín'],a:0,cat:'Historia'},
      {q:'¿Qué significa EAN en códigos de barras?',o:['European Article Number','Easy Access Number','Electronic Article Name','Ninguna'],a:0,cat:'Comercio'},
      {q:'¿Cuál es la unidad de la resistencia eléctrica?',o:['Voltio','Amperio','Ohm','Watt'],a:2,cat:'Ciencia'},
      {q:'¿Cuántas caras tiene un cubo?',o:['4','6','8','12'],a:1,cat:'Matemática'},
      {q:'¿Quién pintó "El Grito"?',o:['Munch','Picasso','Dalí','Kandinsky'],a:0,cat:'Arte'},
      {q:'¿Cuál es el deporte más popular del mundo?',o:['Básquet','Tenis','Fútbol','Cricket'],a:2,cat:'Deportes'},
      {q:'¿Cuál es el idioma oficial de Brasil?',o:['Español','Portugués','Inglés','Francés'],a:1,cat:'Idiomas'},
      {q:'¿Cuántos días tiene un año bisiesto?',o:['364','365','366','367'],a:2,cat:'General'},
      {q:'¿Cuál es el río más caudaloso del mundo?',o:['Nilo','Amazonas','Yangtsé','Misisipi'],a:1,cat:'Geografía'},
      {q:'¿Quién compuso las Cuatro Estaciones?',o:['Mozart','Beethoven','Vivaldi','Bach'],a:2,cat:'Música'},
      {q:'¿Cuál es el metal líquido a temperatura ambiente?',o:['Plomo','Mercurio','Aluminio','Cobre'],a:1,cat:'Ciencia'},
      {q:'¿Cuál es el instrumento de viento más grande?',o:['Flauta','Saxo','Tuba','Clarinete'],a:2,cat:'Música'},
      {q:'¿Qué fruta es típica del asado argentino como postre?',o:['Manzana','Durazno','Higo','No hay postre típico'],a:3,cat:'Cultura'}
    ];
    let idx=0,score=0,bank=[];
    const info=infoEl('');const qEl=el('div','quiz-q');const opts=el('div','quiz-opts');
    const render=()=>{if(idx>=bank.length){qEl.textContent='🏆 Quiz completado: '+score+'/'+bank.length;opts.innerHTML='';info.textContent='Fin';return;}const q=bank[idx];qEl.textContent='['+q.cat+'] '+q.q;opts.innerHTML='';info.textContent='Pregunta '+(idx+1)+'/'+bank.length+' · Aciertos: '+score;q.o.forEach((o,i)=>{const b=el('button','quiz-opt',o);b.addEventListener('click',()=>{if(i===q.a){score++;b.classList.add('correct');}else{b.classList.add('wrong');opts.children[q.a].classList.add('correct');}opts.querySelectorAll('button').forEach(x=>x.disabled=true);setTimeout(()=>{idx++;render();},1100);});opts.appendChild(b);});};
    const reset=()=>{bank=shuffle(QS.slice()).slice(0,15);idx=0;score=0;render();};
    stage.innerHTML='';stage.appendChild(titleBar('🧠 Quiz ('+QS.length+' preguntas · aleatorio)',reset));stage.appendChild(info);stage.appendChild(qEl);stage.appendChild(opts);reset();
    return null;
  }

  /* ---------- 17. BATALLA NAVAL (colocar + vs CPU + tamaños) ---------- */
  function playBattleship(stage){
    const SIZES={Fácil:7,Medio:8,Difícil:10};
    const SHIPS=[5,4,3,3,2,2,1];
    let N,player,enemy,shots,enemyShots,phase,placingIdx,placingHoriz,turn,hitsP,hitsE,over,diff;
    const info=infoEl('');const boards=el('div','');boards.style.cssText='display:flex;gap:20px;flex-wrap:wrap;justify-content:center';
    const shipText='Barcos: 1 de 5 · 1 de 4 · 2 de 3 · 2 de 2 · 1 de 1';
    const makeBoard=id=>{const g=el('div','bn-grid');g.id=id;g.style.gridTemplateColumns='repeat('+N+', '+(N>8?30:38)+'px)';return g;};
    const placeShips=board=>{SHIPS.forEach(len=>{let placed=false;while(!placed){const horiz=Math.random()<0.5,r=rnd(horiz?N:N-len+1),c=rnd(horiz?N-len+1:N);let ok=true;for(let i=0;i<len;i++){const rr=horiz?r:r+i,cc=horiz?c+i:c;if(board[rr][cc])ok=false;}if(ok){for(let i=0;i<len;i++)board[horiz?r:r+i][horiz?c+i:c]=len;placed=true;}}});};
    const render=()=>{const pg=document.getElementById('player-bn'),eg=document.getElementById('enemy-bn');if(pg){pg.innerHTML='';for(let i=0;i<N*N;i++){const r=Math.floor(i/N),c=i%N;const cell=el('div','bn-cell');cell.style.width=cell.style.height=(N>8?30:38)+'px';const v=player[r][c];if(enemyShots.has(i)){if(v){cell.classList.add('hit');cell.textContent='💥';}else{cell.classList.add('miss');cell.textContent='·';}}else if(v){cell.classList.add('ship');}pg.appendChild(cell);}}if(eg){eg.innerHTML='';for(let i=0;i<N*N;i++){const r=Math.floor(i/N),c=i%N;const cell=el('div','bn-cell');cell.style.width=cell.style.height=(N>8?30:38)+'px';const v=enemy[r][c];if(shots.has(i)){if(v){cell.classList.add('hit');cell.textContent='💥';}else{cell.classList.add('miss');cell.textContent='·';}}eg.appendChild(cell);}}};
    const cpuFire=()=>{let i;do{i=rnd(N*N);}while(enemyShots.has(i));enemyShots.add(i);const r=Math.floor(i/N),c=i%N;if(player[r][c])hitsE++;turn='player';};
    const startGame=()=>{N=SIZES[diff.get()];player=Array.from({length:N},()=>Array(N).fill(0));enemy=Array.from({length:N},()=>Array(N).fill(0));placeShips(enemy);shots=new Set();enemyShots=new Set();phase='place';placingIdx=0;placingHoriz=true;hitsP=0;hitsE=0;over=false;turn='player';boards.innerHTML='';
      const pWrap=el('div','');pWrap.appendChild(el('div','game-info','Tu flota (colocá tus barcos)'));pWrap.appendChild(makeBoard('player-bn'));
      const eWrap=el('div','');eWrap.appendChild(el('div','game-info','Flota enemiga (dispará aquí)'));eWrap.appendChild(makeBoard('enemy-bn'));
      boards.appendChild(pWrap);boards.appendChild(eWrap);
      info.textContent='Colocación: barco '+(placingIdx+1)+'/'+SHIPS.length+' (largo '+SHIPS[placingIdx]+') · '+shipText;
      const rotateBtn=btn('🔄 Rotar','btn warning',()=>{placingHoriz=!placingHoriz;});stage.appendChild(rotateBtn);
      document.getElementById('player-bn').addEventListener('click',e=>{if(phase!=='place'||!e.target.classList.contains('bn-cell'))return;const cells=[...document.getElementById('player-bn').children];const i=cells.indexOf(e.target);const r=Math.floor(i/N),c=i%N;const len=SHIPS[placingIdx];let ok=true;for(let k=0;k<len;k++){const rr=placingHoriz?r:r+k,cc=placingHoriz?c+k:c;if(rr>=N||cc>=N||player[rr][cc])ok=false;}if(ok){for(let k=0;k<len;k++)player[placingHoriz?r:r+k][placingHoriz?c+k:c]=len;placingIdx++;if(placingIdx>=SHIPS.length){phase='battle';info.textContent='¡Flota lista! Dispará en el tablero enemigo. '+shipText;}else info.textContent='Colocá barco '+(placingIdx+1)+'/'+SHIPS.length+' (largo '+SHIPS[placingIdx]+')';render();}});
      document.getElementById('enemy-bn').addEventListener('click',e=>{if(phase!=='battle'||over||turn!=='player'||!e.target.classList.contains('bn-cell'))return;const cells=[...document.getElementById('enemy-bn').children];const i=cells.indexOf(e.target);if(shots.has(i))return;shots.add(i);const r=Math.floor(i/N),c=i%N;if(enemy[r][c])hitsP++;turn='cpu';setTimeout(()=>{cpuFire();turn='player';const total=SHIPS.reduce((a,b)=>a+b,0);if(hitsP>=total){over=true;info.textContent='🏆 ¡Hundiste toda la flota enemiga! ('+shots.size+' disparos)';}else if(hitsE>=total){over=true;info.textContent='💀 La CPU hundió tu flota.';}else info.textContent='Tu turno. Impactos tuyos: '+hitsP+' · de la CPU: '+hitsE;render();},400);render();});
      render();
    };
    diff=diffBar('Medio');diff.el.addEventListener('click',startGame);
    stage.innerHTML='';stage.appendChild(titleBar('🚢 Batalla Naval (colocar + vs CPU)',startGame));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(boards);startGame();
    return null;
  }

  /* ---------- 18. FLAPPY BIRD (reemplaza Simon) ---------- */
  function playFlappy(stage){
    const W=320,H=480,cv=makeCanvas(W,H),ctx=cv.getContext('2d');
    let y,vy,pipes,score,timer,alive,diff;
    const info=infoEl('');
    const gap=()=> diff.get()==='Fácil'?160 : diff.get()==='Medio'?130 : 100;
    const reset=()=>{y=H/2;vy=0;pipes=[];score=0;alive=true;if(timer)clearInterval(timer);timer=setInterval(tick,speedMs(diff.get(),30));};
    const flap=()=>{if(alive)vy=-6;};
    const tick=()=>{if(!alive)return;vy+=0.4;y+=vy;if(pipes.length===0||pipes[pipes.length-1].x<W-160)pipes.push({x:W,gapY:60+Math.random()*(H-180)});pipes.forEach(p=>p.x-=2.5);pipes=pipes.filter(p=>p.x>-60);if(pipes[0]&&pipes[0].x<30&&pipes[0].x>15)score++;const g=gap();if(y<0||y>H||pipes.some(p=>p.x<60&&p.x+50>30&&(y<p.gapY||y>p.gapY+g))){alive=false;clearInterval(timer);info.textContent='💀 Game Over · Puntos: '+score;}else info.textContent='Puntos: '+score;draw();};
    const draw=()=>{ctx.fillStyle='#70c5ce';ctx.fillRect(0,0,W,H);const g=gap();pipes.forEach(p=>{ctx.fillStyle='#22c55e';ctx.fillRect(p.x,0,50,p.gapY);ctx.fillRect(p.x,p.gapY+g,50,H-p.gapY-g);});ctx.fillStyle='#facc15';ctx.beginPath();ctx.arc(40,y,12,0,7);ctx.fill();if(!alive){ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',W/2,H/2);}};
    cv.addEventListener('click',flap);cv.addEventListener('touchstart',e=>{flap();e.preventDefault();},{passive:false});
    const onKey=e=>{if(e.key===' '){flap();e.preventDefault();}};document.addEventListener('keydown',onKey);
    diff=diffBar('Medio');diff.el.addEventListener('click',reset);
    stage.innerHTML='';stage.appendChild(titleBar('🐤 Flappy Bird (clic/espacio)',reset));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(cv);reset();
    return ()=>{clearInterval(timer);document.removeEventListener('keydown',onKey);};
  }

  /* ---------- 19. SPACE INVADERS (reemplaza RPS) ---------- */
  function playInvaders(stage){
    const W=400,H=500,cv=makeCanvas(W,H),ctx=cv.getContext('2d');
    let px,bullets,enemies,dir,score,timer,alive,diff;
    const info=infoEl('');
    const reset=()=>{px=W/2;bullets=[];enemies=[];for(let r=0;r<4;r++)for(let c=0;c<8;c++)enemies.push({x:40+c*40,y:40+r*36,alive:true});dir=1;score=0;alive=true;if(timer)clearInterval(timer);timer=setInterval(tick,speedMs(diff.get(),40));};
    const tick=()=>{if(!alive)return;let edge=false;enemies.forEach(e=>{if(e.alive){e.x+=dir*8;if(e.x<20||e.x>W-20)edge=true;}});if(edge){dir*=-1;enemies.forEach(e=>e.y+=12);}bullets.forEach(b=>b.y-=8);bullets=bullets.filter(b=>b.y>0);bullets.forEach(b=>enemies.forEach(e=>{if(e.alive&&Math.abs(b.x-e.x)<16&&Math.abs(b.y-e.y)<16){e.alive=false;b.y=-100;score+=10;}}));if(enemies.every(e=>!e.alive)){alive=false;info.textContent='🏆 ¡Ganaste! Puntos: '+score;}if(enemies.some(e=>e.alive&&e.y>H-40)){alive=false;info.textContent='💀 Invadieron · Puntos: '+score;}info.textContent='Puntos: '+score;draw();};
    const draw=()=>{ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);ctx.fillStyle='#60a5fa';ctx.fillRect(px-20,H-20,40,12);bullets.forEach(b=>{ctx.fillStyle='#facc15';ctx.fillRect(b.x-2,b.y,4,10);});enemies.forEach(e=>{if(e.alive){ctx.fillStyle='#22c55e';ctx.fillRect(e.x-12,e.y-10,24,18);}});if(!alive){ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText('¡FIN!',W/2,H/2);}};
    const fire=()=>{if(alive&&bullets.length<3)bullets.push({x:px,y:H-30});};
    cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();px=(e.clientX-r.left)*(W/r.width);});
    cv.addEventListener('click',fire);
    const onKey=e=>{if(e.key==='ArrowLeft'){px=Math.max(20,px-15);e.preventDefault();}if(e.key==='ArrowRight'){px=Math.min(W-20,px+15);e.preventDefault();}if(e.key===' '){fire();e.preventDefault();}};document.addEventListener('keydown',onKey);
    diff=diffBar('Medio');diff.el.addEventListener('click',reset);
    stage.innerHTML='';stage.appendChild(titleBar('👾 Space Invaders',reset));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(cv);reset();
    return ()=>{clearInterval(timer);document.removeEventListener('keydown',onKey);};
  }

  /* ---------- 20. ATRAPA FRUTAS (reemplaza Blackjack) ---------- */
  function playCatch(stage){
    const W=360,H=480,cv=makeCanvas(W,H),ctx=cv.getContext('2d');
    let px,items,score,lives,timer,alive,diff;
    const info=infoEl('');
    const FRUITS=['🍎','🍌','🍇','🍓','🍊'];
    const reset=()=>{px=W/2;items=[];score=0;lives=3;alive=true;if(timer)clearInterval(timer);timer=setInterval(tick,speedMs(diff.get(),40));};
    const tick=()=>{if(!alive)return;if(Math.random()<0.04)items.push({x:20+Math.random()*(W-40),y:0,type:Math.random()<0.15?'bomb':'fruit',emoji:FRUITS[rnd(FRUITS.length)]});items.forEach(i=>i.y+=3);items=items.filter(i=>{if(i.y>H-30&&Math.abs(i.x-px)<35){if(i.type==='bomb')lives--;else score+=10;return false;}if(i.y>H){if(i.type==='fruit')lives--;return false;}return true;});if(lives<=0){alive=false;clearInterval(timer);info.textContent='💀 Game Over · Puntos: '+score;}else info.textContent='Puntos: '+score+' · Vidas: '+lives;draw();};
    const draw=()=>{ctx.fillStyle='#1e293b';ctx.fillRect(0,0,W,H);ctx.fillStyle='#60a5fa';ctx.fillRect(px-35,H-20,70,14);ctx.font='24px sans-serif';ctx.textAlign='center';items.forEach(i=>ctx.fillText(i.type==='bomb'?'💣':i.emoji,i.x,i.y));if(!alive){ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.fillText('GAME OVER',W/2,H/2);}ctx.textAlign='left';};
    cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();px=(e.clientX-r.left)*(W/r.width);});
    cv.addEventListener('touchmove',e=>{const r=cv.getBoundingClientRect();px=(e.touches[0].clientX-r.left)*(W/r.width);e.preventDefault();},{passive:false});
    diff=diffBar('Medio');diff.el.addEventListener('click',reset);
    stage.innerHTML='';stage.appendChild(titleBar('🍎 Atrapa Frutas (esquivá 💣)',reset));stage.appendChild(diff.el);stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(cv);reset();
    return ()=>clearInterval(timer);
  }

  /* ---------- 21. ADIVINA EL NÚMERO (reemplaza Tragamonedas) ---------- */
  function playGuess(stage){
    let target,attempts,min,max;
    const info=infoEl('');
    const input=el('input','');input.type='number';input.placeholder='Tu número';input.style.cssText='padding:10px;font-size:1.1rem;width:140px;text-align:center';
    const result=el('div','game-info','');
    const reset=()=>{target=1+Math.floor(Math.random()*100);attempts=0;min=1;max=100;result.textContent='';info.textContent='Adiviná un número del 1 al 100';input.value='';};
    const tryGuess=()=>{const v=parseInt(input.value);if(isNaN(v)){result.textContent='⚠️ Ingresá un número válido';return;}attempts++;if(v===target){result.textContent='🏆 ¡Correcto! Era '+target+' en '+attempts+' intentos.';}else if(v<target){min=Math.max(min,v);result.textContent='📈 Más alto. Rango: '+min+' - '+max+' (intento '+attempts+')';}else{max=Math.min(max,v);result.textContent='📉 Más bajo. Rango: '+min+' - '+max+' (intento '+attempts+')';}input.value='';input.focus();};
    input.addEventListener('keydown',e=>{if(e.key==='Enter')tryGuess();});
    const ctrl=el('div','game-controls');ctrl.appendChild(input);ctrl.appendChild(btn('✅ Adivinar','btn success',tryGuess));
    stage.innerHTML='';stage.appendChild(titleBar('🔢 Adivina el Número (1-100)',reset));stage.appendChild(info);stage.appendChild(ctrl);stage.appendChild(result);reset();
    return null;
  }

  /* ---------- 22. MASTERMIND (sin cambios) ---------- */
  function playMastermind(stage){
    const COLORS=['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899'];
    let code,guesses,current;
    const info=infoEl('Adiviná el código de 4 colores (10 intentos)');
    const board=el('div','');board.style.cssText='display:flex;flex-direction:column;gap:6px;align-items:center';
    const picker=el('div','game-controls');
    const reset=()=>{code=Array.from({length:4},()=>rnd(COLORS.length));guesses=[];current=[];render();info.textContent='Adiviná el código de 4 colores (10 intentos)';};
    const render=()=>{board.innerHTML='';guesses.forEach(g=>{const row=el('div','mm-row');g.guess.forEach(c=>{const p=el('div','mm-peg');p.style.background=COLORS[c];row.appendChild(p);});const hint=el('div','mm-hint');let black=0,white=0;const cC=code.slice(),gC=g.guess.slice();g.guess.forEach((c,i)=>{if(c===code[i]){black++;cC[i]=-1;gC[i]=-2;}});gC.forEach((c,i)=>{if(c!==-2){const j=cC.indexOf(c);if(j!==-1){white++;cC[j]=-1;}}});for(let i=0;i<black;i++){const d=el('div','mm-hint-dot');d.style.background='#111';hint.appendChild(d);}for(let i=0;i<white;i++){const d=el('div','mm-hint-dot');d.style.background='#fff';d.style.border='1px solid #999';hint.appendChild(d);}row.appendChild(hint);board.appendChild(row);});const cur=el('div','mm-row');for(let i=0;i<4;i++){const p=el('div','mm-peg');if(current[i]!==undefined)p.style.background=COLORS[current[i]];cur.appendChild(p);}board.appendChild(cur);};
    COLORS.forEach((c,i)=>{const b=el('button','btn small-btn','');b.style.cssText='background:'+c+';width:36px;height:36px;padding:0';b.addEventListener('click',()=>{if(current.length<4&&guesses.length<10){current.push(i);render();}});picker.appendChild(b);});
    const check=()=>{if(current.length!==4||guesses.length>=10)return;guesses.push({guess:current.slice()});if(current.every((c,i)=>c===code[i])){info.textContent='🏆 ¡Adivinaste en '+guesses.length+' intentos!';current=[];render();return;}current=[];if(guesses.length>=10)info.textContent='💀 Sin intentos. Código: '+code.map(c=>['🔴','🟡','🟢','🔵','🟣','🩷'][c]).join(' ');render();};
    const undo=()=>{current.pop();render();};
    const ctrl=el('div','game-controls');ctrl.appendChild(btn('✅ Comprobar','btn success',check));ctrl.appendChild(btn('↩️ Borrar','btn danger',undo));
    stage.innerHTML='';stage.appendChild(titleBar('🎯 Mastermind',reset));stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(board);stage.appendChild(picker);stage.appendChild(ctrl);reset();
    return null;
  }

  /* ---------- 23. SUDOKU (sin cambios) ---------- */
  function playSudoku(stage){
    const PUZ={Fácil:'530070000600195000098000060800060003400803001700020006060000280000419005000080079',Medio:'0002607016800700901900045008201000400046029000500030280093000740400500036703018000',Difícil:'800000000003600000070090200050007000000045700000100030001000068008500010090000400'};
    let sol,cur,fixed,sel=null,level='Fácil';
    const info=infoEl('Nivel: Fácil');const grid=el('div','sudoku-grid');
    const solve=b=>{const bt=b.slice();const find=()=>{for(let i=0;i<81;i++)if(!bt[i])return i;return -1;};const ok=(i,n)=>{const r=Math.floor(i/9),c=i%9;for(let x=0;x<9;x++){if(bt[r*9+x]===n||bt[x*9+c]===n)return false;}const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;for(let y=0;y<3;y++)for(let x=0;x<3;x++)if(bt[(br+y)*9+(bc+x)]===n)return false;return true;};const rec=()=>{const i=find();if(i===-1)return true;for(let n=1;n<=9;n++)if(ok(i,n)){bt[i]=n;if(rec())return true;bt[i]=0;}return false;};rec();return bt;};
    const load=l=>{level=l;cur=PUZ[l].split('').map(Number);fixed=cur.map(v=>v!==0);sol=solve(cur.map(v=>v));sel=null;render();info.textContent='Nivel: '+l;};
    const render=()=>{grid.innerHTML='';for(let i=0;i<81;i++){const c=el('div','sudoku-cell');const r=Math.floor(i/9);if(r===2||r===5)c.classList.add('sudoku-row-sep');if(fixed[i]){c.classList.add('fixed');c.textContent=cur[i];}else c.textContent=cur[i]||'';if(sel===i)c.classList.add('sel');c.addEventListener('click',()=>{if(!fixed[i]){sel=i;render();}});grid.appendChild(c);}};
    const numpad=el('div','game-controls');for(let n=1;n<=9;n++)numpad.appendChild(btn(String(n),'btn secondary',()=>{if(sel===null)return;cur[sel]=n;if(cur.every((v,i)=>v===sol[i]))info.textContent='🏆 ¡Sudoku completado!';else info.textContent='Nivel: '+level;render();}));numpad.appendChild(btn('↩️ Borrar','btn danger',()=>{if(sel!==null){cur[sel]=0;render();}}));
    const lvls=el('div','game-controls');Object.keys(PUZ).forEach(l=>lvls.appendChild(btn(l,'btn',()=>load(l))));
    stage.innerHTML='';stage.appendChild(titleBar('🔢 Sudoku',()=>load(level)));stage.appendChild(info);stage.appendChild(el('div','game-board')).appendChild(grid);stage.appendChild(numpad);stage.appendChild(lvls);load('Fácil');
    return null;
  }

  /* ---------- Registro ---------- */
  const GAMES=[
    {id:'ttt',name:'Ta-Te-Ti',icon:'⭕',cat:'Estrategia',play:playTTT},
    {id:'chess',name:'Ajedrez',icon:'♔',cat:'Estrategia',play:playChess},
    {id:'checkers',name:'Damas',icon:'⚫',cat:'Estrategia',play:playCheckers},
    {id:'connect4',name:'Conecta 4',icon:'🔴',cat:'Estrategia',play:playConnect4},
    {id:'memory',name:'Memoria',icon:'🃏',cat:'Clásicos',play:playMemory},
    {id:'mastermind',name:'Mastermind',icon:'🎯',cat:'Estrategia',play:playMastermind},
    {id:'battleship',name:'Batalla Naval',icon:'🚢',cat:'Estrategia',play:playBattleship},
    {id:'snake',name:'Snake',icon:'🐍',cat:'Clásicos',play:playSnake},
    {id:'g2048',name:'2048',icon:'🔢',cat:'Clásicos',play:play2048},
    {id:'tetris',name:'Tetris',icon:'🟦',cat:'Clásicos',play:playTetris},
    {id:'mines',name:'Buscaminas',icon:'💣',cat:'Clásicos',play:playMines},
    {id:'sudoku',name:'Sudoku',icon:'🧩',cat:'Clásicos',play:playSudoku},
    {id:'hangman',name:'Ahorcado',icon:'🪢',cat:'Clásicos',play:playHangman},
    {id:'maze',name:'Laberinto',icon:'🌀',cat:'Clásicos',play:playMaze},
    {id:'pong',name:'Pong',icon:'🏓',cat:'Acción',play:playPong},
    {id:'breakout',name:'Breakout',icon:'🧱',cat:'Acción',play:playBreakout},
    {id:'mole',name:'Golpea al Topo',icon:'🐹',cat:'Acción',play:playMole},
    {id:'reaction',name:'Test de Reacción',icon:'⚡',cat:'Acción',play:playReaction},
    {id:'flappy',name:'Flappy Bird',icon:'🐤',cat:'Acción',play:playFlappy},
    {id:'invaders',name:'Space Invaders',icon:'👾',cat:'Acción',play:playInvaders},
    {id:'catch',name:'Atrapa Frutas',icon:'🍎',cat:'Casual',play:playCatch},
    {id:'guess',name:'Adivina el Número',icon:'🔢',cat:'Casual',play:playGuess},
    {id:'quiz',name:'Quiz Cultura',icon:'🧠',cat:'Casual',play:playQuiz}
  ];

  let currentCleanup=null;
  function init(hub,stage,backBtn){
    hub.innerHTML='';stage.innerHTML='';stage.classList.add('hidden');if(backBtn)backBtn.style.display='none';
    GAMES.forEach(g=>{const card=el('div','game-card');card.innerHTML='<div class="game-icon">'+g.icon+'</div><div class="game-name">'+g.name+'</div><div class="game-cat">'+g.cat+'</div>';card.addEventListener('click',()=>openGame(g,hub,stage,backBtn));hub.appendChild(card);});
  }
  function openGame(g,hub,stage,backBtn){
    if(currentCleanup){try{currentCleanup();}catch(e){}currentCleanup=null;}
    hub.classList.add('hidden');stage.classList.remove('hidden');if(backBtn)backBtn.style.display='inline-flex';
    const c=g.play(stage);if(typeof c==='function')currentCleanup=c;
    stage.scrollIntoView({behavior:'smooth',block:'start'});
  }
  document.addEventListener('click',e=>{
    if(e.target&&e.target.closest&&e.target.closest('#btn-games-back')){
      const hub=document.getElementById('games-hub'),stage=document.getElementById('games-stage');
      if(hub&&stage){if(currentCleanup){try{currentCleanup();}catch(err){}currentCleanup=null;}stage.innerHTML='';stage.classList.add('hidden');hub.classList.remove('hidden');const b=document.getElementById('btn-games-back');if(b)b.style.display='none';}
    }
  });
  return {init,GAMES};
})();
