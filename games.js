/* ============================================================
   games.js - Zona de Juegos (23 juegos) para Supermercado Pro
   Vanilla JS / Canvas, sin dependencias externas.
   ============================================================ */
const GamesHub = (() => {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  const btn = (text, cls, onClick) => {
    const b = el('button', cls || 'btn small-btn', text);
    if (onClick) b.addEventListener('click', onClick);
    return b;
  };
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const rnd = (n) => Math.floor(Math.random() * n);
  const makeCanvas = (w, h) => {
    const c = el('canvas', 'game-canvas');
    c.width = w; c.height = h;
    return c;
  };

  /* ---------- Barra de título / info / controles ---------- */
  const titleBar = (name, onRestart) => {
    const tb = el('div', 'game-title-bar');
    tb.appendChild(el('h3', '', name));
    const actions = el('div', 'page-actions');
    if (onRestart) actions.appendChild(btn('🔄 Reiniciar', 'btn secondary', onRestart));
    tb.appendChild(actions);
    return tb;
  };
  const infoEl = (t) => { const d = el('div', 'game-info', t); return d; };

  /* ============================================================
     1. TA-TE-TI (vs CPU imbatible - minimax)
     ============================================================ */
  function playTTT(stage) {
    let board = Array(9).fill(''), turn = 'X', over = false;
    const info = infoEl('Tu turno: X');
    const grid = el('div', 'ttt-grid');
    const cells = [];
    const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const winner = (b) => {
      for (const [a,bb,c] of winLines) if (b[a] && b[a]===b[bb] && b[a]===b[c]) return b[a];
      return b.every(x=>x) ? 'E' : null;
    };
    const minimax = (b, p) => {
      const w = winner(b);
      if (w === 'O') return {score:10}; if (w === 'X') return {score:-10}; if (w === 'E') return {score:0};
      const moves = [];
      b.forEach((v,i)=>{ if(!v){ const nb=b.slice(); nb[i]=p; const r=minimax(nb, p==='O'?'X':'O'); moves.push({i, score:r.score}); } });
      let best = moves[0];
      for (const m of moves) if ((p==='O' && m.score>best.score) || (p==='X' && m.score<best.score)) best=m;
      return best;
    };
    const render = () => {
      cells.forEach((c,i)=>{ c.textContent = board[i]; c.className='ttt-cell '+(board[i]==='X'?'x':board[i]==='O'?'o':''); });
      const w = winner(board);
      if (w) { over = true; info.textContent = w==='E' ? '🤝 Empate' : (w==='X' ? '❌ Ganaste!' : '⭕ Ganó la CPU'); return; }
      info.textContent = turn==='X' ? 'Tu turno: X' : 'CPU piensa…';
    };
    const cpuMove = () => {
      if (over) return;
      const best = minimax(board, 'O');
      if (best && best.i !== undefined) { board[best.i]='O'; turn='X'; render(); }
    };
    for (let i=0;i<9;i++){
      const c = el('div','ttt-cell');
      c.addEventListener('click', ()=>{
        if (over || board[i] || turn!=='X') return;
        board[i]='X'; turn='O'; render();
        if (!over) setTimeout(cpuMove, 350);
      });
      cells.push(c); grid.appendChild(c);
    }
    const restart = () => { board=Array(9).fill(''); turn='X'; over=false; render(); };
    stage.innerHTML=''; stage.appendChild(titleBar('⭕ Ta-Te-Ti (vs CPU)', restart));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid);
    render();
    return null;
  }

  /* ============================================================
     2. AJEDREZ (2 jugadores, movimientos legales básicos)
     ============================================================ */
  function playChess(stage) {
    // piezas: wK wQ wR wB wN wP / bK bQ ...
    const P = { wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙', bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟' };
    let board, turn, sel, over;
    const reset = () => {
      board = [
        ['bR','bN','bB','bQ','bK','bB','bN','bR'],
        Array(8).fill('bP'), Array(8).fill(''), Array(8).fill(''),
        Array(8).fill(''), Array(8).fill(''),
        Array(8).fill('wP'),
        ['wR','wN','wB','wQ','wK','wB','wN','wR']
      ];
      turn='w'; sel=null; over=false;
    };
    reset();
    const info = infoEl('Turno: Blancas');
    const grid = el('div','board-8x8');
    const enemy = (c)=> c==='w'?'b':'w';
    const inB = (r,c)=> r>=0&&r<8&&c>=0&&c<8;
    const movesFor = (r,c) => {
      const p = board[r][c]; if(!p) return [];
      const col = p[0], t = p[1], res = [];
      const slide = (dirs) => { for (const [dr,dc] of dirs){ let nr=r+dr,nc=c+dc; while(inB(nr,nc)){ if(!board[nr][nc]) res.push([nr,nc]); else { if(board[nr][nc][0]!==col) res.push([nr,nc]); break; } nr+=dr; nc+=dc; } } };
      if (t==='P'){ const d = col==='w'?-1:1;
        if (inB(r+d,c) && !board[r+d][c]) res.push([r+d,c]);
        if ((col==='w'&&r===6)||(col==='b'&&r===1)) if(!board[r+d][c]&&!board[r+2*d][c]) res.push([r+2*d,c]);
        for (const dc of [-1,1]) if(inB(r+d,c+dc)&&board[r+d][c+dc]&&board[r+d][c+dc][0]!==col) res.push([r+d,c+dc]);
      }
      if (t==='N'){ for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) if(inB(r+dr,c+dc)&&(!board[r+dr][c+dc]||board[r+dr][c+dc][0]!==col)) res.push([r+dr,c+dc]); }
      if (t==='B') slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
      if (t==='R') slide([[-1,0],[1,0],[0,-1],[0,1]]);
      if (t==='Q') slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
      if (t==='K') for (const dr of [-1,0,1]) for (const dc of [-1,0,1]) if((dr||dc)&&inB(r+dr,c+dc)&&(!board[r+dr][c+dc]||board[r+dr][c+dc][0]!==col)) res.push([r+dr,c+dc]);
      return res;
    };
    const render = () => {
      grid.innerHTML='';
      for (let r=0;r<8;r++) for (let c=0;c<8;c++){
        const sq = el('div','sq '+((r+c)%2?'dark':'light'));
        const p = board[r][c];
        if (p) { const pe = el('span','piece '+ (p[0]==='w'?'white':'black'), P[p]); sq.appendChild(pe); }
        if (sel && sel[0]===r && sel[1]===c) sq.classList.add('sel');
        if (sel && movesFor(sel[0],sel[1]).some(([mr,mc])=>mr===r&&mc===c)) sq.classList.add(board[r][c]?'capture':'move');
        sq.addEventListener('click', ()=>{
          if (over) return;
          if (sel){
            const mv = movesFor(sel[0],sel[1]);
            if (mv.some(([mr,mc])=>mr===r&&mc===c)){
              const cap = board[r][c];
              board[r][c]=board[sel[0]][sel[1]]; board[sel[0]][sel[1]]='';
              // promoción de peón a dama
              if (board[r][c][1]==='P' && (r===0||r===7)) board[r][c]=board[r][c][0]+'Q';
              sel=null; turn=enemy(turn);
              if (cap && cap[1]==='K'){ over=true; info.textContent='🏆 ¡'+(cap[0]==='w'?'Negras':'Blancas')+' ganan! (rey capturado)'; }
              else info.textContent = 'Turno: '+(turn==='w'?'Blancas ♔':'Negras ♚');
              render(); return;
            }
          }
          if (board[r][c] && board[r][c][0]===turn){ sel=[r,c]; render(); } else { sel=null; render(); }
        });
        grid.appendChild(sq);
      }
    };
    const restart = () => { reset(); info.textContent='Turno: Blancas'; render(); };
    stage.innerHTML=''; stage.appendChild(titleBar('♔ Ajedrez (2 jugadores)', restart));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid);
    render();
    return null;
  }

  /* ============================================================
     3. DAMAS (2 jugadores)
     ============================================================ */
  function playCheckers(stage) {
    let board, turn, sel, over;
    const reset = () => {
      board = Array.from({length:8},()=>Array(8).fill(''));
      for (let r=0;r<3;r++) for (let c=0;c<8;c++) if((r+c)%2) board[r][c]='b';
      for (let r=5;r<8;r++) for (let c=0;c<8;c++) if((r+c)%2) board[r][c]='w';
      turn='w'; sel=null; over=false;
    };
    reset();
    const info = infoEl('Turno: Blancas ○');
    const grid = el('div','board-8x8');
    const inB=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
    const piece = (v)=> v==='w'?'⚪':v==='b'?'⚫':v==='W'?'👑':v==='B'?'🔶':'';
    const movesFor = (r,c) => {
      const p=board[r][c]; if(!p) return [];
      const col=p.toLowerCase(), isKing=p===p.toUpperCase(), res=[];
      const dirs = isKing?[[-1,-1],[-1,1],[1,-1],[1,1]] : (col==='w'?[[-1,-1],[-1,1]]:[[1,-1],[1,1]]);
      for (const [dr,dc] of dirs){
        const nr=r+dr, nc=c+dc;
        if (inB(nr,nc) && !board[nr][nc]) res.push([nr,nc,false]);
        const jr=r+2*dr, jc=c+2*dc;
        if (inB(jr,jc) && board[nr][nc] && board[nr][nc].toLowerCase()!==col && !board[jr][jc]) res.push([jr,jc,true]);
      }
      return res;
    };
    const render = () => {
      grid.innerHTML='';
      let wCount=0,bCount=0;
      board.flat().forEach(v=>{ if(v&&v.toLowerCase()==='w')wCount++; if(v&&v.toLowerCase()==='b')bCount++; });
      if (!over && (wCount===0||bCount===0)){ over=true; info.textContent='🏆 Ganó '+(wCount===0?'Negras ●':'Blancas ○'); }
      for (let r=0;r<8;r++) for (let c=0;c<8;c++){
        const sq=el('div','sq '+((r+c)%2?'dark':'light'));
        if (board[r][c]) sq.appendChild(el('span','piece', piece(board[r][c])));
        if (sel&&sel[0]===r&&sel[1]===c) sq.classList.add('sel');
        if (sel && movesFor(sel[0],sel[1]).some(([mr,mc])=>mr===r&&mc===c)) sq.classList.add('move');
        sq.addEventListener('click',()=>{
          if (over) return;
          if (sel){
            const mv=movesFor(sel[0],sel[1]);
            const hit=mv.find(([mr,mc])=>mr===r&&mc===c);
            if (hit){
              board[r][c]=board[sel[0]][sel[1]]; board[sel[0]][sel[1]]='';
              if (hit[2]) board[(sel[0]+r)/2][(sel[1]+c)/2]='';
              if (r===0&&board[r][c]==='w') board[r][c]='W';
              if (r===7&&board[r][c]==='b') board[r][c]='B';
              sel=null; turn=turn==='w'?'b':'w';
              info.textContent='Turno: '+(turn==='w'?'Blancas ○':'Negras ●');
              render(); return;
            }
          }
          if (board[r][c] && board[r][c].toLowerCase()===turn){ sel=[r,c]; render(); } else { sel=null; render(); }
        });
        grid.appendChild(sq);
      }
    };
    const restart=()=>{ reset(); info.textContent='Turno: Blancas ○'; render(); };
    stage.innerHTML=''; stage.appendChild(titleBar('⚫ Damas (2 jugadores)', restart));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid);
    render();
    return null;
  }

  /* ============================================================
     4. MEMORIA (encontrar parejas)
     ============================================================ */
  function playMemory(stage) {
    const icons = ['🍎','🍌','🍇','🍓','🍊','🍉','🍒','🥝'];
    let cards, first, lock, moves, found;
    const info = infoEl('Movimientos: 0');
    const grid = el('div','mem-grid');
    const restart = () => {
      const deck = shuffle([...icons, ...icons]);
      cards = deck.map((v,i)=>({v, i, flipped:false, matched:false}));
      first=null; lock=false; moves=0; found=0;
      grid.innerHTML='';
      cards.forEach(card=>{
        const mc = el('div','mem-card');
        const inner = el('div','mem-inner');
        inner.appendChild(el('div','mem-face mem-front','?'));
        inner.appendChild(el('div','mem-face mem-back', card.v));
        mc.appendChild(inner);
        mc.addEventListener('click', ()=>{
          if (lock || card.flipped || card.matched) return;
          card.flipped=true; mc.classList.add('flipped');
          if (!first){ first=card; return; }
          moves++; info.textContent='Movimientos: '+moves;
          if (first.v===card.v){
            first.matched=card.matched=true; found+=2;
            const idxA = cards.findIndex(c=>c===first);
            const idxB = cards.findIndex(c=>c===card);
            const all = document.querySelectorAll('.mem-card');
            if (all[idxA]) all[idxA].classList.add('matched');
            if (all[idxB]) all[idxB].classList.add('matched');
            first=null;
            if (found===16) info.textContent='🏆 ¡Completado en '+moves+' movimientos!';
          } else {
            lock=true;
            const a=first, b=card; first=null;
            setTimeout(()=>{
              a.flipped=b.flipped=false;
              document.querySelectorAll('.mem-card')[cards.indexOf(a)].classList.remove('flipped');
              document.querySelectorAll('.mem-card')[cards.indexOf(b)].classList.remove('flipped');
              lock=false;
            }, 800);
          }
        });
        grid.appendChild(mc);
      });
      info.textContent='Movimientos: 0';
    };
    stage.innerHTML=''; stage.appendChild(titleBar('🃏 Memoria', restart));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid);
    restart();
    return null;
  }

  /* ============================================================
     5. SNAKE (canvas)
     ============================================================ */
  function playSnake(stage) {
    const S=20, N=20, cv=makeCanvas(S*N, S*N), ctx=cv.getContext('2d');
    let snake, dir, food, score, timer, alive;
    const info = infoEl('Puntos: 0 · Usa flechas / botones');
    const reset = () => {
      snake=[{x:10,y:10}]; dir={x:1,y:0}; score=0; alive=true;
      placeFood();
      if (timer) clearInterval(timer);
      timer=setInterval(tick, 120);
      draw();
    };
    const placeFood = () => { do { food={x:rnd(N),y:rnd(N)}; } while (snake.some(s=>s.x===food.x&&s.y===food.y)); };
    const tick = () => {
      if (!alive) return;
      const h={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
      if (h.x<0||h.x>=N||h.y<0||h.y>=N||snake.some(s=>s.x===h.x&&s.y===h.y)){ alive=false; info.textContent='💀 Game Over · Puntos: '+score+' · Reiniciá'; clearInterval(timer); draw(); return; }
      snake.unshift(h);
      if (h.x===food.x&&h.y===food.y){ score+=10; placeFood(); } else snake.pop();
      info.textContent='Puntos: '+score;
      draw();
    };
    const draw = () => {
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,cv.width,cv.height);
      ctx.fillStyle='#ef4444'; ctx.fillRect(food.x*S+2, food.y*S+2, S-4, S-4);
      snake.forEach((s,i)=>{ ctx.fillStyle = i===0?'#22c55e':'#16a34a'; ctx.fillRect(s.x*S+1, s.y*S+1, S-2, S-2); });
      if (!alive){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,cv.width,cv.height); ctx.fillStyle='#fff'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center'; ctx.fillText('GAME OVER', cv.width/2, cv.height/2); }
    };
    const setDir = (x,y)=>{ if ((dir.x!==-x||dir.y!==-y) && (dir.x!==x||dir.y!==y)) dir={x,y}; };
    const onKey = (e) => {
      if (e.key==='ArrowUp'){ setDir(0,-1); e.preventDefault(); }
      if (e.key==='ArrowDown'){ setDir(0,1); e.preventDefault(); }
      if (e.key==='ArrowLeft'){ setDir(-1,0); e.preventDefault(); }
      if (e.key==='ArrowRight'){ setDir(1,0); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    const ctrl = el('div','game-controls');
    ctrl.appendChild(btn('⬆️', 'btn secondary', ()=>setDir(0,-1)));
    ctrl.appendChild(btn('⬇️', 'btn secondary', ()=>setDir(0,1)));
    ctrl.appendChild(btn('⬅️', 'btn secondary', ()=>setDir(-1,0)));
    ctrl.appendChild(btn('➡️', 'btn secondary', ()=>setDir(1,0)));
    stage.innerHTML=''; stage.appendChild(titleBar('🐍 Snake', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(cv);
    stage.appendChild(ctrl);
    reset();
    return () => { clearInterval(timer); document.removeEventListener('keydown', onKey); };
  }

  /* ============================================================
     6. 2048
     ============================================================ */
  function play2048(stage) {
    let g, score, over, won;
    const info = infoEl('Puntos: 0');
    const grid = el('div','g2048-grid');
    const cells = [];
    for (let i=0;i<16;i++){ const c=el('div','g2048-cell'); cells.push(c); grid.appendChild(c); }
    const empty = () => { const e=[]; g.forEach((v,i)=>{ if(!v) e.push(i); }); return e; };
    const add = () => { const e=empty(); if(!e.length) return; g[e[rnd(e.length)]] = Math.random()<0.9?2:4; };
    const slide = (row) => {
      let arr = row.filter(v=>v);
      for (let i=0;i<arr.length-1;i++) if (arr[i]===arr[i+1]){ arr[i]*=2; score+=arr[i]; if (arr[i]===2048) won=true; arr.splice(i+1,1); }
      while (arr.length<4) arr.push(0);
      return arr;
    };
    const move = (dir) => {
      const before = g.slice();
      for (let i=0;i<4;i++){
        let idx, row=[];
        for (let j=0;j<4;j++){
          if (dir==='L') idx=i*4+j;
          if (dir==='R') idx=i*4+(3-j);
          if (dir==='U') idx=j*4+i;
          if (dir==='D') idx=(3-j)*4+i;
          row.push(g[idx]);
        }
        const s = slide(row);
        for (let j=0;j<4;j++){
          if (dir==='L') g[i*4+j]=s[j];
          if (dir==='R') g[i*4+(3-j)]=s[j];
          if (dir==='U') g[j*4+i]=s[j];
          if (dir==='D') g[(3-j)*4+i]=s[j];
        }
      }
      if (g.some((v,i)=>v!==before[i])) add();
      render();
      checkEnd();
    };
    const checkEnd = () => {
      if (empty().length) return;
      for (let i=0;i<4;i++) for (let j=0;j<4;j++){
        const v=g[i*4+j];
        if (j<3 && v===g[i*4+j+1]) return;
        if (i<3 && v===g[(i+1)*4+j]) return;
      }
      over=true; info.textContent='💀 Sin movimientos · Puntos: '+score;
    };
    const colors = {2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
    const render = () => {
      cells.forEach((c,i)=>{ const v=g[i]; c.textContent=v||''; c.style.background=v?colors[v]||'#3c3a32':'#cdc1b4'; c.style.color=v<=4?'#776e65':'#f9f6f2'; c.style.fontSize=v>=1024?'1rem':'1.4rem'; });
      info.textContent = (won?'🏆 ¡2048! ':'')+'Puntos: '+score;
    };
    const reset = () => { g=Array(16).fill(0); score=0; over=false; won=false; add(); add(); render(); };
    const onKey = (e) => {
      if (over) return;
      if (e.key==='ArrowLeft'){ move('L'); e.preventDefault(); }
      if (e.key==='ArrowRight'){ move('R'); e.preventDefault(); }
      if (e.key==='ArrowUp'){ move('U'); e.preventDefault(); }
      if (e.key==='ArrowDown'){ move('D'); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    const ctrl = el('div','game-controls');
    ctrl.appendChild(btn('⬆️','btn secondary',()=>move('U')));
    ctrl.appendChild(btn('⬇️','btn secondary',()=>move('D')));
    ctrl.appendChild(btn('⬅️','btn secondary',()=>move('L')));
    ctrl.appendChild(btn('➡️','btn secondary',()=>move('R')));
    stage.innerHTML=''; stage.appendChild(titleBar('🔢 2048', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid);
    stage.appendChild(ctrl);
    reset();
    return () => document.removeEventListener('keydown', onKey);
  }

  /* ============================================================
     7. SUDOKU (3 niveles)
     ============================================================ */
  function playSudoku(stage) {
    const puzzles = {
      Fácil:  '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
      Medio:  '000260701680070090190004500820100040004602900050003028009300074040050036703018000',
      Difícil:'800000000003600000070090200050007000000045700000100030001000068008500010090000400'
    };
    let sol, cur, fixed, sel=null, level='Fácil';
    const info = infoEl('Nivel: Fácil');
    const grid = el('div','sudoku-grid');
    const cells = [];
    const solve = (b) => {
      const bt = b.slice();
      const find = () => { for (let i=0;i<81;i++) if(!bt[i]) return i; return -1; };
      const ok = (i,n) => {
        const r=Math.floor(i/9), c=i%9;
        for (let x=0;x<9;x++){ if (bt[r*9+x]===n||bt[x*9+c]===n) return false; }
        const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3;
        for (let y=0;y<3;y++) for (let x=0;x<3;x++) if (bt[(br+y)*9+(bc+x)]===n) return false;
        return true;
      };
      const rec = () => {
        const i=find(); if (i===-1) return true;
        for (let n=1;n<=9;n++) if (ok(i,n)){ bt[i]=n; if (rec()) return true; bt[i]=0; }
        return false;
      };
      rec(); return bt;
    };
    const load = (lvl) => {
      level=lvl;
      const p = puzzles[lvl];
      cur = p.split('').map(Number);
      fixed = cur.map(v=>v!==0);
      sol = solve(cur.map(v=>v));
      sel=null; render();
      info.textContent='Nivel: '+lvl;
    };
    const render = () => {
      grid.innerHTML=''; cells.length=0;
      for (let i=0;i<81;i++){
        const c=el('div','sudoku-cell');
        const r=Math.floor(i/9);
        if (r===2||r===5) c.classList.add('sudoku-row-sep');
        if (fixed[i]){ c.classList.add('fixed'); c.textContent=cur[i]; }
        else c.textContent = cur[i]||'';
        if (sel===i) c.classList.add('sel');
        c.addEventListener('click', ()=>{ if(!fixed[i]){ sel=i; render(); } });
        cells.push(c); grid.appendChild(c);
      }
    };
    const numpad = el('div','game-controls');
    for (let n=1;n<=9;n++) numpad.appendChild(btn(String(n), 'btn secondary', ()=>{
      if (sel===null) return;
      cur[sel]=n;
      if (cur.every((v,i)=>v===sol[i])){ info.textContent='🏆 ¡Sudoku completado!'; }
      else info.textContent='Nivel: '+level;
      render();
    }));
    numpad.appendChild(btn('↩️ Borrar','btn danger', ()=>{ if (sel!==null){ cur[sel]=0; render(); } }));
    const lvls = el('div','game-controls');
    Object.keys(puzzles).forEach(l=> lvls.appendChild(btn(l,'btn',()=>load(l))));
    stage.innerHTML=''; stage.appendChild(titleBar('🔢 Sudoku', ()=>load(level)));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid);
    stage.appendChild(numpad); stage.appendChild(lvls);
    load('Fácil');
    return null;
  }

  /* ============================================================
     8. BUSCAMINAS
     ============================================================ */
  function playMines(stage) {
    const N=9, MINES=10;
    let grid, revealed, flagged, over, flagMode, first;
    const info = infoEl('Minas: '+MINES+' · Modo: descubrir');
    const g = el('div','ms-grid');
    g.style.gridTemplateColumns = `repeat(${N}, 32px)`;
    const cells = [];
    const reset = () => {
      grid=Array(N*N).fill(0); revealed=Array(N*N).fill(false); flagged=Array(N*N).fill(false);
      over=false; first=true; flagMode=false;
      info.textContent='Minas: '+MINES+' · Modo: descubrir';
      render();
    };
    const placeMines = (skip) => {
      let placed=0;
      while (placed<MINES){ const i=rnd(N*N); if (i!==skip && grid[i]!==-1){ grid[i]=-1; placed++; } }
      for (let i=0;i<N*N;i++){ if (grid[i]===-1) continue; let c=0; nb(i).forEach(j=>{ if(grid[j]===-1)c++; }); grid[i]=c; }
    };
    const nb = (i) => {
      const r=Math.floor(i/N), c=i%N, res=[];
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++){ if(!dr&&!dc) continue; const nr=r+dr,nc=c+dc; if(nr>=0&&nr<N&&nc>=0&&nc<N) res.push(nr*N+nc); }
      return res;
    };
    const flood = (i) => {
      const st=[i];
      while (st.length){ const x=st.pop(); if (revealed[x]) continue; revealed[x]=true; if (grid[x]===0) nb(x).forEach(j=>{ if(!revealed[j]) st.push(j); }); }
    };
    const render = () => {
      g.innerHTML='';
      for (let i=0;i<N*N;i++){
        const c=el('div','ms-cell');
        if (revealed[i]){
          c.classList.add('open');
          if (grid[i]===-1){ c.classList.add('mine'); c.textContent='💣'; }
          else if (grid[i]>0){ c.textContent=grid[i]; c.style.color=['','#2563eb','#16a34a','#dc2626','#7c3aed','#b91c1c','#0891b2','#111','#6b7280'][grid[i]]; }
        } else if (flagged[i]){ c.classList.add('flag'); c.textContent='🚩'; }
        c.addEventListener('click', ()=>{
          if (over) return;
          if (flagMode){ if(!revealed[i]){ flagged[i]=!flagged[i]; render(); } return; }
          if (flagged[i]) return;
          if (first){ first=false; placeMines(i); }
          if (grid[i]===-1){ revealed=grid.map((v,i)=>v===-1?true:revealed[i]); over=true; info.textContent='💥 ¡Boom! Game Over'; render(); return; }
          flood(i);
          if (revealed.every((v,i)=>v||grid[i]===-1)){ over=true; info.textContent='🏆 ¡Ganaste!'; }
          render();
        });
        g.appendChild(c);
      }
    };
    const ctrl = el('div','game-controls');
    const flagBtn = btn('🚩 Modo bandera: OFF', 'btn warning', ()=>{
      flagMode=!flagMode; flagBtn.textContent='🚩 Modo bandera: '+(flagMode?'ON':'OFF');
      info.textContent='Minas: '+MINES+' · Modo: '+(flagMode?'bandera':'descubrir');
    });
    ctrl.appendChild(flagBtn);
    stage.innerHTML=''; stage.appendChild(titleBar('💣 Buscaminas (9×9)', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(g);
    stage.appendChild(ctrl);
    reset();
    return null;
  }

  /* ============================================================
     9. PONG (vs CPU)
     ============================================================ */
  function playPong(stage) {
    const W=600,H=380,cv=makeCanvas(W,H),ctx=cv.getContext('2d');
    let pY=H/2-40, cY=H/2-40, bx=W/2, by=H/2, bvx=4, bvy=3, pS=0, cS=0, raf, running=true;
    const PH=80,PW=10;
    const info = infoEl('Tú 0 - 0 CPU · Mueve con mouse/flechas');
    const reset = () => { bx=W/2; by=H/2; bvx=(Math.random()<0.5?-1:1)*4; bvy=(Math.random()<0.5?-1:1)*3; };
    const loop = () => {
      if (!running) return;
      bx+=bvx; by+=bvy;
      if (by<8||by>H-8) bvy*=-1;
      cY += (by - (cY+PH/2)) * 0.08;
      cY=Math.max(0,Math.min(H-PH,cY));
      if (bx<25 && by>pY && by<pY+PH){ bvx=Math.abs(bvx)*1.05; bvy+=(by-(pY+PH/2))*0.1; }
      if (bx>W-25 && by>cY && by<cY+PH){ bvx=-Math.abs(bvx)*1.05; }
      if (bx<0){ cS++; reset(); } if (bx>W){ pS++; reset(); }
      info.textContent=`Tú ${pS} - ${cS} CPU`;
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      ctx.setLineDash([6,8]); ctx.strokeStyle='#334155'; ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#60a5fa'; ctx.fillRect(10,pY,PW,PH);
      ctx.fillStyle='#f87171'; ctx.fillRect(W-20,cY,PW,PH);
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(bx,by,7,0,7); ctx.fill();
      raf=requestAnimationFrame(loop);
    };
    const onMove = (e) => {
      const r=cv.getBoundingClientRect();
      const y = (e.touches? e.touches[0].clientY : e.clientY) - r.top;
      pY = Math.max(0, Math.min(H-PH, y * (H/r.height) - PH/2));
    };
    cv.addEventListener('mousemove', onMove);
    cv.addEventListener('touchmove', (e)=>{ onMove(e); e.preventDefault(); }, {passive:false});
    const onKey = (e)=>{
      if (e.key==='ArrowUp'){ pY=Math.max(0,pY-20); e.preventDefault(); }
      if (e.key==='ArrowDown'){ pY=Math.min(H-PH,pY+20); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    const restart = () => { pS=0; cS=0; reset(); };
    stage.innerHTML=''; stage.appendChild(titleBar('🏓 Pong (vs CPU)', restart));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(cv);
    loop();
    return () => { running=false; cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); };
  }

  /* ============================================================
     10. BREAKOUT / ARKANOID
     ============================================================ */
  function playBreakout(stage) {
    const W=480,H=400,cv=makeCanvas(W,H),ctx=cv.getContext('2d');
    let px=W/2-35, bx=W/2, by=H-60, bvx=3, bvy=-3, bricks, lives=3, score=0, raf, running=true;
    const info = infoEl('Puntos: 0 · Vidas: 3');
    const COLS=8, ROWS=4, BW=50, BH=16;
    const reset = () => {
      bricks=[];
      for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) bricks.push({x:c*(BW+6)+20, y:r*(BH+6)+40, alive:true, color:['#ef4444','#f59e0b','#10b981','#3b82f6'][r]});
      bx=W/2; by=H-60; bvx=(Math.random()<0.5?-1:1)*3; bvy=-3;
    };
    const loop = () => {
      if (!running) return;
      bx+=bvx; by+=bvy;
      if (bx<6||bx>W-6) bvx*=-1;
      if (by<6) bvy*=-1;
      if (by>H-18 && bx>px && bx<px+70){ bvy=-Math.abs(bvy); bvx+=(bx-(px+35))*0.08; }
      if (by>H){ lives--; if (lives<=0){ info.textContent='💀 Game Over · Puntos: '+score; running=false; } else { bx=W/2; by=H-60; bvx=3; bvy=-3; } }
      bricks.forEach(b=>{ if(b.alive && bx>b.x && bx<b.x+BW && by>b.y && by<b.y+BH){ b.alive=false; bvy*=-1; score+=10; } });
      if (bricks.every(b=>!b.alive)){ info.textContent='🏆 ¡Nivel completado! Puntos: '+score; running=false; }
      info.textContent='Puntos: '+score+' · Vidas: '+lives;
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      bricks.forEach(b=>{ if(b.alive){ ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,BW,BH); } });
      ctx.fillStyle='#60a5fa'; ctx.fillRect(px,H-12,70,10);
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(bx,by,6,0,7); ctx.fill();
      raf=requestAnimationFrame(loop);
    };
    const onMove = (e)=>{
      const r=cv.getBoundingClientRect();
      const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
      px=Math.max(0,Math.min(W-70, x*(W/r.width)-35));
    };
    cv.addEventListener('mousemove', onMove);
    cv.addEventListener('touchmove', (e)=>{ onMove(e); e.preventDefault(); }, {passive:false});
    const onKey=(e)=>{ if(e.key==='ArrowLeft'){px=Math.max(0,px-20);e.preventDefault();} if(e.key==='ArrowRight'){px=Math.min(W-70,px+20);e.preventDefault();} };
    document.addEventListener('keydown', onKey);
    const restart=()=>{ lives=3; score=0; running=true; reset(); loop(); };
    stage.innerHTML=''; stage.appendChild(titleBar('🧱 Breakout', restart));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(cv);
    reset(); loop();
    return () => { running=false; cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); };
  }

  /* ============================================================
     11. TETRIS
     ============================================================ */
  function playTetris(stage) {
    const COLS=10, ROWS=20, B=24, cv=makeCanvas(COLS*B, ROWS*B), ctx=cv.getContext('2d');
    const SHAPES = { I:[[1,1,1,1]], O:[[1,1],[1,1]], T:[[0,1,0],[1,1,1]], S:[[0,1,1],[1,1,0]], Z:[[1,1,0],[0,1,1]], J:[[1,0,0],[1,1,1]], L:[[0,0,1],[1,1,1]] };
    const COLORS = { I:'#22d3ee', O:'#facc15', T:'#a855f7', S:'#22c55e', Z:'#ef4444', J:'#3b82f6', L:'#f97316' };
    let grid, cur, px, py, score, lines, timer, over, next;
    const info = infoEl('Puntos: 0 · Filas: 0');
    const newPiece = () => {
      const keys = Object.keys(SHAPES);
      const k = keys[rnd(keys.length)];
      cur = { shape: SHAPES[k].map(r=>r.slice()), color: COLORS[k] };
      px = Math.floor((COLS - cur.shape[0].length)/2); py = 0;
    };
    const reset = () => {
      grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
      score=0; lines=0; over=false; newPiece();
      if (timer) clearInterval(timer);
      timer=setInterval(tick, 500);
      draw();
    };
    const collide = (sh, x, y) => sh.some((r,dy)=>r.some((v,dx)=> v && (y+dy>=ROWS || x+dx<0 || x+dx>=COLS || (grid[y+dy]&&grid[y+dy][x+dx]))));
    const merge = () => cur.shape.forEach((r,dy)=>r.forEach((v,dx)=>{ if(v) grid[py+dy][px+dx]=cur.color; }));
    const clearLines = () => {
      let cleared=0;
      for (let y=ROWS-1;y>=0;y--) if (grid[y].every(v=>v)){ grid.splice(y,1); grid.unshift(Array(COLS).fill(0)); cleared++; y++; }
      if (cleared){ lines+=cleared; score+=[0,100,300,500,800][cleared]; info.textContent='Puntos: '+score+' · Filas: '+lines; }
    };
    const tick = () => {
      if (over) return;
      if (!collide(cur.shape, px, py+1)){ py++; }
      else {
        merge(); clearLines(); newPiece();
        if (collide(cur.shape, px, py)){ over=true; info.textContent='💀 Game Over · Puntos: '+score; clearInterval(timer); }
      }
      draw();
    };
    const rotate = () => {
      const s = cur.shape;
      const rot = s[0].map((_,i)=> s.map(r=>r[i]).reverse());
      if (!collide(rot, px, py)) cur.shape = rot;
    };
    const draw = () => {
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,cv.width,cv.height);
      grid.forEach((r,y)=>r.forEach((v,x)=>{ if(v){ ctx.fillStyle=v; ctx.fillRect(x*B+1,y*B+1,B-2,B-2); } }));
      if (!over) cur.shape.forEach((r,dy)=>r.forEach((v,dx)=>{ if(v){ ctx.fillStyle=cur.color; ctx.fillRect((px+dx)*B+1,(py+dy)*B+1,B-2,B-2); } }));
      if (over){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,cv.width,cv.height); ctx.fillStyle='#fff'; ctx.font='bold 20px sans-serif'; ctx.textAlign='center'; ctx.fillText('GAME OVER', cv.width/2, cv.height/2); }
    };
    const onKey=(e)=>{
      if (over) return;
      if (e.key==='ArrowLeft' && !collide(cur.shape,px-1,py)){ px--; draw(); e.preventDefault(); }
      if (e.key==='ArrowRight' && !collide(cur.shape,px+1,py)){ px++; draw(); e.preventDefault(); }
      if (e.key==='ArrowDown'){ tick(); e.preventDefault(); }
      if (e.key==='ArrowUp'){ rotate(); draw(); e.preventDefault(); }
      if (e.key===' '){ while(!collide(cur.shape,px,py+1)) py++; tick(); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    const ctrl=el('div','game-controls');
    ctrl.appendChild(btn('⬅️','btn secondary',()=>{ if(!over&&!collide(cur.shape,px-1,py)){px--;draw();} }));
    ctrl.appendChild(btn('🔄','btn secondary',()=>{ if(!over){rotate();draw();} }));
    ctrl.appendChild(btn('➡️','btn secondary',()=>{ if(!over&&!collide(cur.shape,px+1,py)){px++;draw();} }));
    ctrl.appendChild(btn('⬇️','btn secondary',()=>{ if(!over) tick(); }));
    stage.innerHTML=''; stage.appendChild(titleBar('🟦 Tetris', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(cv);
    stage.appendChild(ctrl);
    reset();
    return () => { clearInterval(timer); document.removeEventListener('keydown', onKey); };
  }

  /* ============================================================
     12. AHORCADO
     ============================================================ */
  function playHangman(stage) {
    const WORDS = ['MANZANA','BANANA','SUPERMERCADO','COMPUTADORA','ELEFANTE','JIRAFA','MURCIELAGO','PARAGUAS','TELEFONO','AURICULARES','CHOCOLATE','FIDEOS','YERBA','MATE','ZANAHORIA','TOMATE','CEBOLLA','NARANJA','PELOTA','BICICLETA','LIBRO','CUADERNO','LAPIZ','PEINE','TOALLA','JABON','LECHE','PAN','QUESO','HUEVO'];
    const DRAW = [
      `  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========`,
      `  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========`,
      `  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========`,
      `  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========`,
      `  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========`,
      `  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========`,
      `  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========`
    ];
    let word, guessed, wrong, over;
    const drawEl = el('div','hangman-draw');
    const wordEl = el('div','hangman-word');
    const kb = el('div','kb');
    const info = infoEl('Adiviná la palabra');
    const render = () => {
      drawEl.textContent = DRAW[wrong];
      wordEl.textContent = word.split('').map(l=> guessed.has(l)? l : '_').join(' ');
      if (word.split('').every(l=>guessed.has(l))){ over=true; info.textContent='🏆 ¡Ganaste! La palabra era: '+word; }
      else if (wrong>=6){ over=true; info.textContent='💀 Ahorcado. La palabra era: '+word; wordEl.textContent=word; }
      else info.textContent = 'Errores: '+wrong+' / 6';
    };
    const reset = () => {
      word = WORDS[rnd(WORDS.length)]; guessed=new Set(); wrong=0; over=false;
      kb.innerHTML='';
      'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').forEach(l=>{
        const b=el('button','',l);
        b.addEventListener('click', ()=>{
          if (over || guessed.has(l)) return;
          guessed.add(l);
          if (word.includes(l)){ b.classList.add('hit'); } else { wrong++; b.classList.add('miss'); }
          b.disabled=true; render();
        });
        kb.appendChild(b);
      });
      render();
    };
    stage.innerHTML=''; stage.appendChild(titleBar('🪢 Ahorcado', reset));
    stage.appendChild(info);
    const wrap=el('div','game-board'); wrap.appendChild(drawEl);
    stage.appendChild(wrap);
    stage.appendChild(wordEl); stage.appendChild(kb);
    reset();
    return null;
  }

  /* ============================================================
     13. SIMON (secuencia de colores)
     ============================================================ */
  function playSimon(stage) {
    const pads=[], seq=[], pos=0, COLORS=['#22c55e','#ef4444','#facc15','#3b82f6'];
    let playing=false, cpuTurn=false, timer;
    const info=infoEl('Presioná "Jugar" para empezar');
    const grid=el('div','simon-grid');
    for (let i=0;i<4;i++){
      const p=el('div','simon-pad'); pads.push(p); grid.appendChild(p);
      p.addEventListener('click', ()=>{
        if (!playing || cpuTurn) return;
        flash(i);
        if (i===seq[pos]){ pos++; if (pos===seq.length){ info.textContent='✅ ¡Bien! Siguiente nivel…'; pos=0; setTimeout(cpuPlay, 900); } }
        else { info.textContent='💀 Fallaste. Llegaste a '+(seq.length-1)+' puntos'; playing=false; }
      });
    }
    const flash=(i)=>{ pads[i].classList.add('active'); setTimeout(()=>pads[i].classList.remove('active'), 350); };
    const cpuPlay=()=>{
      seq.push(rnd(4)); cpuTurn=true; let i=0;
      info.textContent='Observá… (nivel '+seq.length+')';
      timer=setInterval(()=>{
        if (i>=seq.length){ clearInterval(timer); cpuTurn=false; info.textContent='Tu turno'; return; }
        flash(seq[i]); i++;
      }, 600);
    };
    const start=()=>{ seq.length=0; pos=0; playing=true; cpuPlay(); };
    const ctrl=el('div','game-controls'); ctrl.appendChild(btn('▶️ Jugar','btn success', start));
    stage.innerHTML=''; stage.appendChild(titleBar('🎵 Simon', start));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid); stage.appendChild(ctrl);
    return () => clearInterval(timer);
  }

  /* ============================================================
     14. CONECTA 4 (vs CPU)
     ============================================================ */
  function playConnect4(stage) {
    const R=6,C=7; let board, turn, over;
    const info=infoEl('Tu turno: 🔴');
    const grid=el('div','c4-grid');
    const cells=[];
    const reset=()=>{ board=Array.from({length:R},()=>Array(C).fill(0)); turn=1; over=false; render(); info.textContent='Tu turno: 🔴'; };
    const win=(p)=>{
      for (let r=0;r<R;r++) for (let c=0;c<C;c++){
        for (const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
          let ok=true;
          for (let i=0;i<4;i++){ const nr=r+dr*i, nc=c+dc*i; if (nr<0||nr>=R||nc<0||nc>=C||board[nr][nc]!==p){ ok=false; break; } }
          if (ok) return true;
        }
      }
      return false;
    };
    const drop=(col,p)=>{ for (let r=R-1;r>=0;r--) if(!board[r][col]){ board[r][col]=p; return r; } return -1; };
    const cpuMove=()=>{
      // 1. ganar, 2. bloquear, 3. centro, 4. random
      for (let c=0;c<C;c++){ const r=drop(c,2); if(r!==-1){ if(win(2)){ render(); return; } board[r][c]=0; } }
      for (let c=0;c<C;c++){ const r=drop(c,1); if(r!==-1){ board[r][c]=0; const r2=drop(c,2); if(r2!==-1){ board[r2][c]=0; } } }
      // simple: columna central preferida
      const order=[3,2,4,1,5,0,6].filter(c=>board[0][c]===0);
      const c=order[rnd(order.length)]; drop(c,2);
    };
    const render=()=>{
      grid.innerHTML=''; cells.length=0;
      for (let r=0;r<R;r++) for (let c=0;c<C;c++){
        const cell=el('div','c4-cell');
        if (board[r][c]===1) cell.classList.add('p1');
        if (board[r][c]===2) cell.classList.add('p2');
        cell.addEventListener('click', ()=>{
          if (over||turn!==1) return;
          const r=drop(c,1);
          if (r===-1) return;
          if (win(1)){ over=true; info.textContent='🏆 ¡Ganaste! 🔴'; render(); return; }
          turn=2; info.textContent='CPU piensa…'; render();
          setTimeout(()=>{ cpuMove(); if (win(2)){ over=true; info.textContent='💀 Ganó la CPU 🟡'; } else { turn=1; info.textContent='Tu turno: 🔴'; } render(); }, 400);
        });
        cells.push(cell); grid.appendChild(cell);
      }
    };
    stage.innerHTML=''; stage.appendChild(titleBar('🔴 Conecta 4 (vs CPU)', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid);
    reset();
    return null;
  }

  /* ============================================================
     15. PIEDRA PAPEL TIJERA
     ============================================================ */
  function playRPS(stage) {
    let you=0,cpu=0;
    const info=infoEl('Tú 0 - 0 CPU · Elegí una opción');
    const result=el('div','game-info','');
    const opts=[['🪨 Piedra','piedra'],['📄 Papel','papel'],['✂️ Tijera','tijera'],['🦎 Lagarto','lagarto'],['🖖 Spock','spock']];
    const beats={piedra:['tijera','lagarto'], papel:['piedra','spock'], tijera:['papel','lagarto'], lagarto:['papel','spock'], spock:['piedra','tijera']};
    const ctrl=el('div','game-controls');
    opts.forEach(([label,val])=> ctrl.appendChild(btn(label,'btn', ()=>{
      const cpuVal=opts[rnd(opts.length)][1];
      let msg;
      if (val===cpuVal) msg='🤝 Empate';
      else if (beats[val].includes(cpuVal)){ you++; msg='✅ ¡Ganaste! '+val+' vence a '+cpuVal; }
      else { cpu++; msg='❌ Perdiste. '+cpuVal+' vence a '+val; }
      info.textContent=`Tú ${you} - ${cpu} CPU`;
      result.textContent=msg+' (Tú: '+val+' · CPU: '+cpuVal+')';
    })));
    const reset=()=>{ you=0; cpu=0; info.textContent='Tú 0 - 0 CPU · Elegí una opción'; result.textContent=''; };
    stage.innerHTML=''; stage.appendChild(titleBar('✂️ Piedra Papel Tijera Lagarto Spock', reset));
    stage.appendChild(info); stage.appendChild(result); stage.appendChild(ctrl);
    return null;
  }

  /* ============================================================
     16. GOLPEA AL TOPO
     ============================================================ */
  function playMole(stage) {
    let score=0, time=30, timer, moleIdx=-1, running=false;
    const info=infoEl('Puntos: 0 · Tiempo: 30s');
    const grid=el('div','mole-grid');
    const holes=[];
    for (let i=0;i<9;i++){
      const h=el('div','mole-hole',''); holes.push(h); grid.appendChild(h);
      h.addEventListener('click', ()=>{ if (!running) return; if (moleIdx===i){ score++; info.textContent='Puntos: '+score+' · Tiempo: '+time+'s'; moleIdx=-1; render(); } });
    }
    const render=()=> holes.forEach((h,i)=> h.textContent = (i===moleIdx?'🐹':''));
    const start=()=>{
      score=0; time=30; running=true;
      if (timer) clearInterval(timer);
      timer=setInterval(()=>{
        time--;
        moleIdx=rnd(9); render();
        info.textContent='Puntos: '+score+' · Tiempo: '+time+'s';
        if (time<=0){ clearInterval(timer); running=false; moleIdx=-1; render(); info.textContent='⏰ ¡Tiempo! Puntos finales: '+score; }
      }, 1000);
      moleIdx=rnd(9); render();
    };
    const ctrl=el('div','game-controls'); ctrl.appendChild(btn('▶️ Jugar (30s)','btn success', start));
    stage.innerHTML=''; stage.appendChild(titleBar('🐹 Golpea al Topo', start));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid); stage.appendChild(ctrl);
    return () => clearInterval(timer);
  }

  /* ============================================================
     17. QUIZ CULTURA GENERAL
     ============================================================ */
  function playQuiz(stage) {
    const QS = [
      {q:'¿Cuál es la capital de Argentina?', o:['Buenos Aires','Córdoba','Rosario','Mendoza'], a:0},
      {q:'¿Cuántos planetas tiene el sistema solar?', o:['7','8','9','10'], a:1},
      {q:'¿Quién pintó la Mona Lisa?', o:['Van Gogh','Picasso','Da Vinci','Dalí'], a:2},
      {q:'¿Cuál es el río más largo del mundo?', o:['Nilo','Amazonas','Misisipi','Paraná'], a:1},
      {q:'¿En qué año llegó el hombre a la Luna?', o:['1959','1965','1969','1975'], a:2},
      {q:'¿Cuál es el metal más abundante en la corteza terrestre?', o:['Hierro','Cobre','Aluminio','Oro'], a:2},
      {q:'¿Cuántas cuerdas tiene una guitarra clásica?', o:['4','5','6','7'], a:2},
      {q:'¿Cuál es el país más grande del mundo?', o:['China','EE.UU.','Canadá','Rusia'], a:3},
      {q:'¿Qué gas respiramos principalmente del aire?', o:['Oxígeno','Nitrógeno','CO2','Hidrógeno'], a:1},
      {q:'¿Cuántos lados tiene un hexágono?', o:['5','6','7','8'], a:1},
      {q:'¿Quién escribió "Don Quijote de la Mancha"?', o:['Cervantes','Shakespeare','García Márquez','Borges'], a:0},
      {q:'¿Cuál es el océano más grande?', o:['Atlántico','Índico','Pacífico','Ártico'], a:2}
    ];
    let idx=0, score=0;
    const info=infoEl('Pregunta 1/'+QS.length);
    const qEl=el('div','quiz-q');
    const opts=el('div','quiz-opts');
    const render=()=>{
      if (idx>=QS.length){ qEl.textContent='🏆 Quiz completado: '+score+'/'+QS.length+' correctas'; opts.innerHTML=''; info.textContent='Fin del juego'; return; }
      const q=QS[idx];
      qEl.textContent=q.q; opts.innerHTML='';
      info.textContent='Pregunta '+(idx+1)+'/'+QS.length+' · Aciertos: '+score;
      q.o.forEach((o,i)=>{
        const b=el('button','quiz-opt', o);
        b.addEventListener('click', ()=>{
          if (i===q.a){ score++; b.classList.add('correct'); }
          else { b.classList.add('wrong'); opts.children[q.a].classList.add('correct'); }
          opts.querySelectorAll('button').forEach(x=>x.disabled=true);
          setTimeout(()=>{ idx++; render(); }, 1100);
        });
        opts.appendChild(b);
      });
    };
    const reset=()=>{ idx=0; score=0; shuffle(QS); render(); };
    stage.innerHTML=''; stage.appendChild(titleBar('🧠 Quiz de Cultura General', reset));
    stage.appendChild(info); stage.appendChild(qEl); stage.appendChild(opts);
    reset();
    return null;
  }

  /* ============================================================
     18. TEST DE REACCIÓN
     ============================================================ */
  function playReaction(stage) {
    let state='idle', startTime, timer, best=Infinity;
    const box=el('div','');
    box.style.cssText='width:100%;max-width:480px;height:220px;margin:0 auto;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:bold;color:#fff;cursor:pointer;background:#64748b;transition:background 0.1s';
    const info=infoEl('Clic para empezar');
    const setBox=(color,text)=>{ box.style.background=color; box.textContent=text; };
    const start=()=>{
      state='wait'; setBox('#ef4444','⏳ Esperá el verde…');
      const delay=1500+rnd(3000);
      timer=setTimeout(()=>{ state='go'; startTime=Date.now(); setBox('#22c55e','¡CLIC AHORA!'); }, delay);
    };
    box.addEventListener('click', ()=>{
      if (state==='idle'||state==='done'){ start(); return; }
      if (state==='wait'){ clearTimeout(timer); state='done'; setBox('#f59e0b','⚠️ ¡Muy pronto! Clic para reintentar'); return; }
      if (state==='go'){
        const t=Date.now()-startTime; best=Math.min(best,t);
        state='done';
        setBox('#3b82f6','⚡ '+t+' ms · Mejor: '+best+' ms · Clic para jugar de nuevo');
      }
    });
    const reset=()=>{ state='idle'; best=Infinity; setBox('#64748b','Clic para empezar'); info.textContent='Clic para empezar'; };
    stage.innerHTML=''; stage.appendChild(titleBar('⚡ Test de Reacción', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(box);
    return () => clearTimeout(timer);
  }

  /* ============================================================
     19. LABERINTO (generado)
     ============================================================ */
  function playMaze(stage) {
    const W=15,H=11; let maze, px=0, py=0, gx=W-1, gy=H-1;
    const info=infoEl('Llegá al cuadro verde · Flechas / botones');
    const grid=el('div','maze-grid');
    grid.style.gridTemplateColumns=`repeat(${W}, 26px)`;
    const gen=()=>{
      maze=Array.from({length:H},()=>Array(W).fill(1));
      const stack=[[0,0]]; maze[0][0]=0;
      while (stack.length){
        const [x,y]=stack[stack.length-1];
        const dirs=shuffle([[2,0],[-2,0],[0,2],[0,-2]]).filter(([dx,dy])=>{ const nx=x+dx,ny=y+dy; return nx>=0&&nx<W&&ny>=0&&ny<H&&maze[ny][nx]===1; });
        if (!dirs.length){ stack.pop(); continue; }
        const [dx,dy]=dirs[0];
        maze[y+dy/2][x+dx/2]=0; maze[y+dy][x+dx]=0; stack.push([x+dx,y+dy]);
      }
      maze[gy][gx]=0; px=0; py=0;
    };
    const render=()=>{
      grid.innerHTML='';
      for (let y=0;y<H;y++) for (let x=0;x<W;x++){
        const c=el('div','maze-cell '+(maze[y][x]?'maze-wall':'maze-path'));
        if (x===gx&&y===gy) c.classList.add('maze-goal');
        if (x===px&&y===py) c.classList.add('maze-player');
        grid.appendChild(c);
      }
    };
    const move=(dx,dy)=>{
      const nx=px+dx, ny=py+dy;
      if (nx<0||nx>=W||ny<0||ny>=H||maze[ny][nx]) return;
      px=nx; py=ny; render();
      if (px===gx&&py===gy) info.textContent='🏆 ¡Llegaste al final!';
    };
    const onKey=(e)=>{
      if (e.key==='ArrowUp'){ move(0,-1); e.preventDefault(); }
      if (e.key==='ArrowDown'){ move(0,1); e.preventDefault(); }
      if (e.key==='ArrowLeft'){ move(-1,0); e.preventDefault(); }
      if (e.key==='ArrowRight'){ move(1,0); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    const ctrl=el('div','game-controls');
    ctrl.appendChild(btn('⬆️','btn secondary',()=>move(0,-1)));
    ctrl.appendChild(btn('⬇️','btn secondary',()=>move(0,1)));
    ctrl.appendChild(btn('⬅️','btn secondary',()=>move(-1,0)));
    ctrl.appendChild(btn('➡️','btn secondary',()=>move(1,0)));
    const reset=()=>{ gen(); render(); info.textContent='Llegá al cuadro verde · Flechas / botones'; };
    stage.innerHTML=''; stage.appendChild(titleBar('🌀 Laberinto', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid); stage.appendChild(ctrl);
    reset();
    return () => document.removeEventListener('keydown', onKey);
  }

  /* ============================================================
     20. BLACKJACK (21)
     ============================================================ */
  function playBlackjack(stage) {
    const PALOS=['♠','♥','♦','♣'], VALS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    let deck, player, dealer, over;
    const info=infoEl('Tu turno · Pedí carta o plantate');
    const pHand=el('div','bj-hand'), dHand=el('div','bj-hand');
    const pScore=el('div','game-info'), dScore=el('div','game-info');
    const newDeck=()=> shuffle(PALOS.flatMap(p=> VALS.map(v=>({p,v}))));
    const val=(c)=> c.v==='A'?11 : (['J','Q','K'].includes(c.v)?10 : Number(c.v));
    const total=(h)=>{ let s=h.reduce((a,c)=>a+val(c),0); let aces=h.filter(c=>c.v==='A').length; while (s>21&&aces){ s-=10; aces--; } return s; };
    const cardEl=(c, hidden)=>{
      const d=el('div','bj-card'+(hidden?'':' '+(c.p==='♥'||c.p==='♦'?'red':'')));
      if (hidden){ d.textContent='?'; d.style.background='#1e293b'; d.style.color='#fff'; }
      else { d.innerHTML='<span>'+c.v+'</span><span class="suit">'+c.p+'</span>'; }
      return d;
    };
    const render=(hideDealer)=>{
      pHand.innerHTML=''; player.forEach(c=>pHand.appendChild(cardEl(c)));
      dHand.innerHTML='';
      dealer.forEach((c,i)=> dHand.appendChild(cardEl(c, hideDealer && i===1)));
      pScore.textContent='Tú: '+total(player);
      dScore.textContent='Croupier: '+(hideDealer? '?': total(dealer));
    };
    const deal=()=>{ deck=newDeck(); player=[deck.pop(),deck.pop()]; dealer=[deck.pop(),deck.pop()]; over=false;
      info.textContent='Tu turno · Pedí carta o plantate'; render(true);
      if (total(player)===21){ end('🏆 ¡Blackjack! Ganaste.'); }
    };
    const end=(msg)=>{ over=true; info.textContent=msg; render(false); };
    const hit=()=>{ if (over) return; player.push(deck.pop()); render(true);
      if (total(player)>21) end('💀 Te pasaste de 21. Gana el croupier.');
      else if (total(player)===21) stand(); };
    const stand=()=>{
      if (over) return;
      while (total(dealer)<17) dealer.push(deck.pop());
      const p=total(player), d=total(dealer);
      if (d>21 || p>d) end('🏆 ¡Ganaste! Tú '+p+' vs '+d);
      else if (p===d) end('🤝 Empate '+p);
      else end('❌ Perdiste. Tú '+p+' vs '+d);
    };
    const ctrl=el('div','game-controls');
    ctrl.appendChild(btn('🃏 Pedir carta','btn success', hit));
    ctrl.appendChild(btn('✋ Plantarse','btn warning', stand));
    ctrl.appendChild(btn('🔄 Nueva mano','btn secondary', deal));
    stage.innerHTML=''; stage.appendChild(titleBar('🃏 Blackjack (21)', deal));
    stage.appendChild(info);
    stage.appendChild(el('div','game-info','Croupier:')); stage.appendChild(dHand); stage.appendChild(dScore);
    stage.appendChild(el('div','game-info','Tus cartas:')); stage.appendChild(pHand); stage.appendChild(pScore);
    stage.appendChild(ctrl);
    deal();
    return null;
  }

  /* ============================================================
     21. TRAGAMONEDAS (slots)
     ============================================================ */
  function playSlots(stage) {
    const SYM=['🍒','🍋','🍊','🍇','💎','7️⃣','⭐'];
    let credits=100, spinning=false;
    const info=infoEl('Créditos: 100 · Apuesta: 10');
    const reels=[];
    const wrap=el('div','slots');
    for (let i=0;i<3;i++){ const r=el('div','slot-reel','❔'); reels.push(r); wrap.appendChild(r); }
    const spin=()=>{
      if (spinning || credits<10){ info.textContent='💀 Sin créditos suficientes'; return; }
      spinning=true; credits-=10;
      reels.forEach(r=>r.classList.add('spin'));
      const results=[SYM[rnd(SYM.length)],SYM[rnd(SYM.length)],SYM[rnd(SYM.length)]];
      let i=0;
      const stop=setInterval(()=>{
        reels[i].textContent=results[i]; reels[i].classList.remove('spin'); i++;
        if (i>=3){
          clearInterval(stop); spinning=false;
          let win=0;
          if (results[0]===results[1]&&results[1]===results[2]) win = results[0]==='7️⃣'?500:100;
          else if (results[0]===results[1]||results[1]===results[2]||results[0]===results[2]) win=20;
          credits+=win;
          info.textContent = win? '🎉 ¡Ganaste '+win+' créditos! · Total: '+credits : 'Créditos: '+credits+' · Apuesta: 10';
        }
      }, 500);
    };
    const reset=()=>{ credits=100; info.textContent='Créditos: 100 · Apuesta: 10'; reels.forEach(r=>r.textContent='❔'); };
    const ctrl=el('div','game-controls'); ctrl.appendChild(btn('🎰 Girar (10 créditos)','btn warning', spin));
    stage.innerHTML=''; stage.appendChild(titleBar('🎰 Tragamonedas', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(wrap); stage.appendChild(ctrl);
    return null;
  }

  /* ============================================================
     22. BATALLA NAVAL (vs CPU)
     ============================================================ */
  function playBattleship(stage) {
    const N=8, SHIPS=[4,3,3,2,2];
    let cpuBoard, shots, hits, sunk, over;
    const info=infoEl('Hundí los 5 barcos · Clic para disparar');
    const grid=el('div','bn-grid');
    const cells=[];
    const place=()=>{
      cpuBoard=Array.from({length:N},()=>Array(N).fill(0));
      SHIPS.forEach(len=>{
        let placed=false;
        while (!placed){
          const horiz=Math.random()<0.5, r=rnd(horiz?N:N-len+1), c=rnd(horiz?N-len+1:N);
          let ok=true;
          for (let i=0;i<len;i++){ const rr=horiz?r:r+i, cc=horiz?c+i:c; if (cpuBoard[rr][cc]) ok=false; }
          if (ok){ for (let i=0;i<len;i++) cpuBoard[horiz?r:r+i][horiz?c+i:c]=len; placed=true; }
        }
      });
    };
    const reset=()=>{ place(); shots=new Set(); hits=0; sunk=0; over=false; grid.innerHTML=''; cells.length=0;
      for (let i=0;i<N*N;i++){
        const c=el('div','bn-cell'); const idx=i;
        c.addEventListener('click', ()=>{
          if (over || shots.has(idx)) return;
          shots.add(idx);
          const r=Math.floor(idx/N), col=idx%N;
          if (cpuBoard[r][col]){ hits++; c.classList.add('hit'); c.textContent='💥';
            const len=cpuBoard[r][col];
            // chequear si se hundió
            let shipCells=[]; for (let rr=0;rr<N;rr++) for (let cc=0;cc<N;cc++) if (cpuBoard[rr][cc]===len) shipCells.push(rr*N+cc);
            if (shipCells.every(x=>shots.has(x))){ sunk++; }
            if (hits===SHIPS.reduce((a,b)=>a+b,0)){ over=true; info.textContent='🏆 ¡Hundiste toda la flota en '+shots.size+' disparos!'; }
            else info.textContent='¡Impacto! ('+hits+'/'+SHIPS.reduce((a,b)=>a+b,0)+') · Barcos hundidos: '+sunk+'/5';
          } else { c.classList.add('miss'); c.textContent='·'; info.textContent='Disparos: '+shots.size+' · Hundidos: '+sunk+'/5'; }
        });
        cells.push(c); grid.appendChild(c);
      }
      info.textContent='Hundí los 5 barcos · Clic para disparar';
    };
    stage.innerHTML=''; stage.appendChild(titleBar('🚢 Batalla Naval', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(grid);
    reset();
    return null;
  }

  /* ============================================================
     23. MASTERMIND (adiviná el código)
     ============================================================ */
  function playMastermind(stage) {
    const COLORS=['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899'];
    let code, guesses, current;
    const info=infoEl('Adiviná el código de 4 colores (10 intentos)');
    const board=el('div','');
    board.style.cssText='display:flex;flex-direction:column;gap:6px;align-items:center';
    const picker=el('div','game-controls');
    const reset=()=>{
      code=Array.from({length:4},()=>rnd(COLORS.length));
      guesses=[]; current=[]; render();
      info.textContent='Adiviná el código de 4 colores (10 intentos)';
    };
    const render=()=>{
      board.innerHTML='';
      guesses.forEach(g=>{
        const row=el('div','mm-row');
        g.guess.forEach(c=>{ const p=el('div','mm-peg'); p.style.background=COLORS[c]; row.appendChild(p); });
        const hint=el('div','mm-hint');
        let black=0, white=0;
        const cCopy=code.slice(), gCopy=g.guess.slice();
        g.guess.forEach((c,i)=>{ if (c===code[i]){ black++; cCopy[i]=-1; gCopy[i]=-2; } });
        gCopy.forEach((c,i)=>{ if (c!==-2){ const j=cCopy.indexOf(c); if (j!==-1){ white++; cCopy[j]=-1; } } });
        for (let i=0;i<black;i++){ const d=el('div','mm-hint-dot'); d.style.background='#111'; hint.appendChild(d); }
        for (let i=0;i<white;i++){ const d=el('div','mm-hint-dot'); d.style.background='#fff'; d.style.border='1px solid #999'; hint.appendChild(d); }
        row.appendChild(hint);
        board.appendChild(row);
      });
      // fila actual
      const cur=el('div','mm-row');
      for (let i=0;i<4;i++){ const p=el('div','mm-peg'); if (current[i]!==undefined) p.style.background=COLORS[current[i]]; cur.appendChild(p); }
      board.appendChild(cur);
    };
    COLORS.forEach((c,i)=>{
      const b=el('button','btn small-btn','');
      b.style.background=c; b.style.width='36px'; b.style.height='36px'; b.style.padding='0';
      b.addEventListener('click', ()=>{ if (current.length<4 && guesses.length<10){ current.push(i); render(); } });
      picker.appendChild(b);
    });
    const check=()=>{
      if (current.length!==4 || guesses.length>=10) return;
      guesses.push({guess:current.slice()});
      if (current.every((c,i)=>c===code[i])){ info.textContent='🏆 ¡Adivinaste en '+guesses.length+' intentos!'; current=[]; render(); return; }
      current=[];
      if (guesses.length>=10) info.textContent='💀 Sin intentos. El código era: '+code.map(c=>['🔴','🟡','🟢','🔵','🟣','🩷'][c]).join(' ');
      render();
    };
    const undo=()=>{ current.pop(); render(); };
    const ctrl=el('div','game-controls');
    ctrl.appendChild(btn('✅ Comprobar','btn success', check));
    ctrl.appendChild(btn('↩️ Borrar','btn danger', undo));
    stage.innerHTML=''; stage.appendChild(titleBar('🎯 Mastermind', reset));
    stage.appendChild(info); stage.appendChild(el('div','game-board')).appendChild(board);
    stage.appendChild(picker); stage.appendChild(ctrl);
    reset();
    return null;
  }

  /* ---------- Registro de juegos ---------- */
  const GAMES = [
    { id:'ttt',       name:'Ta-Te-Ti',          icon:'⭕', cat:'Estrategia', play: playTTT },
    { id:'chess',     name:'Ajedrez',            icon:'♔', cat:'Estrategia', play: playChess },
    { id:'checkers',  name:'Damas',              icon:'⚫', cat:'Estrategia', play: playCheckers },
    { id:'connect4',  name:'Conecta 4',          icon:'🔴', cat:'Estrategia', play: playConnect4 },
    { id:'mastermind',name:'Mastermind',         icon:'🎯', cat:'Estrategia', play: playMastermind },
    { id:'memory',    name:'Memoria',            icon:'🃏', cat:'Clásicos',  play: playMemory },
    { id:'snake',     name:'Snake',              icon:'🐍', cat:'Clásicos',  play: playSnake },
    { id:'g2048',     name:'2048',               icon:'🔢', cat:'Clásicos',  play: play2048 },
    { id:'tetris',    name:'Tetris',             icon:'🟦', cat:'Clásicos',  play: playTetris },
    { id:'mines',     name:'Buscaminas',         icon:'💣', cat:'Clásicos',  play: playMines },
    { id:'sudoku',    name:'Sudoku',             icon:'🧩', cat:'Clásicos',  play: playSudoku },
    { id:'hangman',   name:'Ahorcado',           icon:'🪢', cat:'Clásicos',  play: playHangman },
    { id:'simon',     name:'Simon',              icon:'🎵', cat:'Clásicos',  play: playSimon },
    { id:'maze',      name:'Laberinto',          icon:'🌀', cat:'Clásicos',  play: playMaze },
    { id:'pong',      name:'Pong',               icon:'🏓', cat:'Acción',    play: playPong },
    { id:'breakout',  name:'Breakout',           icon:'🧱', cat:'Acción',    play: playBreakout },
    { id:'mole',      name:'Golpea al Topo',     icon:'🐹', cat:'Acción',    play: playMole },
    { id:'reaction',  name:'Test de Reacción',   icon:'⚡', cat:'Acción',    play: playReaction },
    { id:'rps',       name:'Piedra Papel Tijera',icon:'✂️', cat:'Casual',    play: playRPS },
    { id:'quiz',      name:'Quiz Cultura',       icon:'🧠', cat:'Casual',    play: playQuiz },
    { id:'blackjack', name:'Blackjack 21',       icon:'🃏', cat:'Casino',    play: playBlackjack },
    { id:'slots',     name:'Tragamonedas',       icon:'🎰', cat:'Casino',    play: playSlots },
    { id:'battleship',name:'Batalla Naval',      icon:'🚢', cat:'Estrategia', play: playBattleship }
  ];

  let currentCleanup = null;

  function init(hub, stage, backBtn) {
    hub.innerHTML = '';
    stage.innerHTML = '';
    stage.classList.add('hidden');
    if (backBtn) backBtn.style.display = 'none';

    GAMES.forEach(g => {
      const card = el('div', 'game-card');
      card.innerHTML = `<div class="game-icon">${g.icon}</div><div class="game-name">${g.name}</div><div class="game-cat">${g.cat}</div>`;
      card.addEventListener('click', () => openGame(g, hub, stage, backBtn));
      hub.appendChild(card);
    });
  }

  function openGame(g, hub, stage, backBtn) {
    if (currentCleanup) { try { currentCleanup(); } catch (e) {} currentCleanup = null; }
    hub.classList.add('hidden');
    stage.classList.remove('hidden');
    if (backBtn) backBtn.style.display = 'inline-flex';
    const cleanup = g.play(stage);
    if (typeof cleanup === 'function') currentCleanup = cleanup;
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Botón "Volver al menú" (se asigna desde app.js vía backBtn)
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-games-back') {
      const hub = document.getElementById('games-hub');
      const stage = document.getElementById('games-stage');
      if (hub && stage) {
        if (currentCleanup) { try { currentCleanup(); } catch (err) {} currentCleanup = null; }
        stage.innerHTML = '';
        stage.classList.add('hidden');
        hub.classList.remove('hidden');
        e.target.style.display = 'none';
      }
    }
  });

  return { init, GAMES };
})();
