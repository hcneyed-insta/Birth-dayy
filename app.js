// Smooth on-scroll reveal, cursor/touch sparkle trail, hearts shower,
// and interactive "Reasons I Love You" list.
// All effects optimized to be gentle, subtle, and mobile-friendly.

(() => {
  /* Utilities */
  const qs = (s, sc=document) => sc.querySelector(s);
  const qsa = (s, sc=document) => Array.from(sc.querySelectorAll(s));

  /* On-scroll animations via IntersectionObserver */
  const revealTargets = qsa('[data-animate]');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el=>io.observe(el));

  /* Interactive "Reasons I Love You" */
  const reasons = [
    "Your smile turns ordinary moments into magic.",
    "You listen with your whole heart.",
    "You make me feel at home anywhere.",
    "You believe in me on the hard days.",
    "Your laugh is my favorite sound.",
    "You find beauty in little things.",
    "You’re gentle, strong, and endlessly kind.",
    "We dream together—and then chase it.",
    "You love so honestly and so fully.",
    "You make every day worth remembering."
  ];
  const list = qs('#reasonsList');
  const btn = qs('#showNextReason');
  let idx = 0;
  const addReason = () => {
    if(idx >= reasons.length) {
      btn.disabled = true;
      btn.textContent = "All reasons revealed ♡";
      return;
    }
    const li = document.createElement('li');
    li.textContent = `${idx+1}. ${reasons[idx]}`;
    list.appendChild(li);
    // Staggered fade-in
    requestAnimationFrame(()=> li.classList.add('show'));
    idx++;
  };
  btn.addEventListener('click', addReason);
  // Reveal first one on load
  addReason();

  /* Floating hearts shower */
  const heartsLayer = qs('#floatingHearts');
  function spawnHeartsBurst(x, y, count=18){
    for(let i=0;i<count;i++){
      const h = document.createElement('div');
      h.className = 'float-heart';
      h.textContent = '❤';
      const size = 12 + Math.random()*12;
      h.style.position='fixed';
      h.style.left = (x + (Math.random()*40 - 20)) + 'px';
      h.style.top = (y + (Math.random()*30 - 15)) + 'px';
      h.style.fontSize = size + 'px';
      h.style.color = ['#d6718c','#c95f84','#b85a7a','#e090a8'][Math.floor(Math.random()*4)];
      h.style.opacity = 0.9;
      h.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,.15))';
      h.style.transition = 'transform 1.8s cubic-bezier(.22,.61,.36,1), opacity 1.8s ease';
      heartsLayer.appendChild(h);

      const dx = (Math.random()*2-1) * 60;
      const dy = - (60 + Math.random()*120);
      const rot = (Math.random()*2-1) * 40;

      requestAnimationFrame(()=>{
        h.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        h.style.opacity = 0;
      });
      setTimeout(()=> h.remove(), 2000);
    }
  }
  // Heart button
  const heartBtn = document.querySelector('.heart-trigger');
  heartBtn.addEventListener('click', (e)=>{
    const rect = heartBtn.getBoundingClientRect();
    const x = rect.left + rect.width/2;
    const y = rect.top + rect.height/2;
    spawnHeartsBurst(x, y, 22);
  });

  /* Subtle sparkle/petal cursor trail with mobile touch support */
  const canvas = document.getElementById('cursorTrail');
  const ctx = canvas.getContext('2d');
  let w=0,h=0, dpr=1;
  const particles = [];
  const colors = ['#F7C9D4','#FDE3EA','#A7B9A8','#D4B277'];
  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth+'px';
    canvas.style.height = innerHeight+'px';
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr,dpr);
  }
  resize();
  addEventListener('resize', resize);

  function addParticle(x, y){
    particles.push({
      x, y,
      vx:(Math.random()-0.5)*0.8,
      vy:(Math.random()-0.6)*0.8,
      r: 2 + Math.random()*2,
      life: 1,
      decay: 0.015 + Math.random()*0.02,
      color: colors[Math.floor(Math.random()*colors.length)]
    });
    if(particles.length > 120) particles.splice(0, particles.length-120);
  }

  function draw(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.life -= p.decay;
      if(p.life<=0){ particles.splice(i,1); continue; }
      p.x += p.vx;
      p.y += p.vy + 0.08; // gentle gravity
      const alpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.fillStyle = hexToRgba(p.color, alpha*0.9);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  function hexToRgba(hex, a){
    const c = hex.replace('#','');
    const bigint = parseInt(c,16);
    const r = (bigint>>16) & 255, g = (bigint>>8) & 255, b = bigint & 255;
    return `rgba(${r},${g},${b},${a})`;
  }
  requestAnimationFrame(draw);

  // Mouse
  addEventListener('mousemove', (e)=> addParticle(e.clientX, e.clientY));
  // Touch (mobile)
  addEventListener('touchmove', (e)=>{
    const t = e.touches[0];
    if(!t) return;
    addParticle(t.clientX, t.clientY);
  }, {passive:true});
  addEventListener('touchstart', (e)=>{
    const t = e.touches[0];
    if(!t) return;
    for(let i=0;i<8;i++) addParticle(t.clientX, t.clientY);
  }, {passive:true});

  // Accessibility: triggering hearts with keyboard on polaroids
  qsa('.polaroid').forEach(card=>{
    card.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' || e.key===' '){
        const r = card.getBoundingClientRect();
        spawnHeartsBurst(r.left + r.width/2, r.top + r.height/2);
        e.preventDefault();
      }
    });
    card.addEventListener('click', (e)=>{
      const r = card.getBoundingClientRect();
      spawnHeartsBurst(r.left + r.width/2, r.top + r.height/2);
    });
  });
})();
