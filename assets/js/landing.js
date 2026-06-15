/* ============================================================
   Flavio Rigo Advocacia - landing main.js
   Mecanicas dos padroes da agencia (Almeida Escala).
   Vanilla JS + GSAP/ScrollTrigger. Comentarios em ASCII puro.
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = typeof window.ScrollTrigger !== 'undefined';

  if (!hasGSAP || !hasST || prefersReduced) {
    document.documentElement.classList.add('reveal-immediate');
  } else {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------------------------------------------------
     1. Header - scroll-linked exit + threshold reveal (s6)
     --------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  var EXIT_ZONE = 220;
  var UP_REVEAL_THRESHOLD = 60;
  var DOWN_DELTA_THRESHOLD = 6;
  var lastY = window.scrollY;
  var upAccum = 0;

  function onHeaderScroll() {
    var y = window.scrollY;
    var heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 600;
    // inverse enquanto o header esta sobre a hero navy
    var overHero = y < heroBottom - 96;
    header.classList.toggle('site-header--inverse', overHero);
    header.classList.toggle('is-elevated', y > 8 && !overHero);

    var exitStart = heroBottom - EXIT_ZONE;
    if (y < heroBottom) {
      // Fase A: dentro da hero - retrai proporcional ao scroll, sem transicao
      header.classList.remove('is-hidden');
      var progress = 0;
      if (y > exitStart) progress = Math.min(1, (y - exitStart) / EXIT_ZONE);
      header.style.transform = 'translateY(' + (-progress * 100) + '%)';
      upAccum = 0;
    } else {
      // Fase B: apos a hero - oculta; revela com scroll-up cumulativo >= 60px
      header.style.transform = '';
      var delta = y - lastY;
      if (delta > DOWN_DELTA_THRESHOLD) { upAccum = 0; header.classList.add('is-hidden'); }
      else if (delta < 0) {
        upAccum += -delta;
        if (upAccum >= UP_REVEAL_THRESHOLD) header.classList.remove('is-hidden');
      }
    }
    lastY = y;
  }
  if (header) { window.addEventListener('scroll', onHeaderScroll, { passive: true }); onHeaderScroll(); }

  /* ---------------------------------------------------------
     2. Reveals (s8)
     --------------------------------------------------------- */
  // Hero H1: divide em palavras com mascara (.hw) para entrada yPercent
  var heroTitle = document.getElementById('heroTitle');
  if (heroTitle && hasGSAP && hasST && !prefersReduced) {
    Array.prototype.slice.call(heroTitle.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (tok.length === 0) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          var mask = document.createElement('span');
          mask.className = 'hw';
          var inner = document.createElement('span');
          inner.textContent = tok;
          mask.appendChild(inner);
          frag.appendChild(mask);
        });
        heroTitle.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        var mask2 = document.createElement('span');
        mask2.className = 'hw';
        heroTitle.replaceChild(mask2, node);
        mask2.appendChild(node);
        node.style.display = 'inline-block';
      }
    });
  }

  if (hasGSAP && hasST && !prefersReduced) {
    // Hero timeline (carga inicial) - palavras sobem da mascara
    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } })
      .to('[data-anim="hero-eyebrow"]', { opacity: 1, y: 0 });
    if (heroTitle) heroTl.to('#heroTitle .hw > *', { yPercent: 0, y: 0, duration: 0.85, stagger: 0.08, ease: 'power4.out' }, '-=0.55');
    heroTl
      .to('[data-anim="hero-sub"]', { opacity: 1, y: 0 }, '-=0.45')
      .to('[data-anim="hero-cta"]', { opacity: 1, y: 0 }, '-=0.55')
      .to('[data-anim="hero-badge"]', { opacity: 1, y: 0 }, '-=0.6');

    // Composicao 3D em camadas (SO na hero, dirigida pelo scroll): perspectiva +
    // rotateX/rotateY + translate3d com profundidades distintas -> ilusao premium
    // de profundidade/parallax. As camadas de fundo deslocam em ritmos diferentes
    // do conteudo (foreground estatico e legivel). Tudo em transform (GPU). Nao
    // toca selo/conteudo/orb (que ja tem transform proprio). Reduzido em telas
    // menores; o bloco inteiro respeita prefers-reduced-motion (guarda acima).
    var heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    var depthK = window.matchMedia('(min-width: 1100px)').matches ? 1 : 0.4;
    // Perspectiva CONSTANTE (via set) - NUNCA animar transformPerspective: animar
    // de ~0 ate 1200 deixava a perspectiva minuscula no inicio do scroll (forte
    // distorcao), o que aparecia como "mudanca de tamanho" ao comecar a rolar.
    // force3D: true mantem as camadas SEMPRE em matrix3d (sem a troca 2D<->3D do
    // 'auto', que re-rasteriza o background cover/contain -> flicker).
    gsap.set('.hero__arch', { transformPerspective: 1200, force3D: true });
    gsap.set('.hero__linework', { transformPerspective: 1400, force3D: true });
    // base (mais profunda): leve zoom + subida
    gsap.to('.hero__bg', { yPercent: -7 * depthK, scale: 1.05, force3D: true, ease: 'none', scrollTrigger: heroST });
    // arquitetura (profunda): sobe + inclina no eixo X a partir da base
    gsap.to('.hero__arch', { yPercent: -12 * depthK, rotateX: 3 * depthK, transformOrigin: '70% 100%', force3D: true, ease: 'none', scrollTrigger: heroST });
    // painel principal (linework): inclina no eixo Y. A luz (.hero__lit) recebe a
    // MESMA tween dentro do heroCursorLight (ela so existe depois deste bloco).
    gsap.to('.hero__linework', { yPercent: -7 * depthK, rotateY: -2.5 * depthK, transformOrigin: '100% 50%', force3D: true, ease: 'none', scrollTrigger: heroST });
    // acento (frase): deslocamento leve
    gsap.to('.hero__deco-tag', { yPercent: -4 * depthK, force3D: true, ease: 'none', scrollTrigger: heroST });

    function reveal(selector, vars) {
      gsap.utils.toArray(selector).forEach(function (el) {
        gsap.to(el, Object.assign({
          opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        }, vars || {}));
      });
    }
    reveal('[data-anim="section-title"]');
    reveal('[data-anim="about-image"]');
    reveal('[data-anim="about-text"]');
    reveal('[data-anim="diff-list"]');
    reveal('[data-anim="diff-quote"]', { duration: 1.0 });
    reveal('[data-anim="final-cta"]');

    // Contadores da barra de numeros (snap inteiro, ~1.2s)
    gsap.utils.toArray('.num-item__value[data-count]').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      var suffix = el.dataset.suffix || '';
      var obj = { v: 0 };
      el.textContent = '0' + suffix;
      gsap.to(obj, {
        v: target, duration: 1.2, ease: 'power2.out', snap: { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
      });
    });

    // Timeline do atendimento: FILA sequencial. A timeline mestre toca
    // linha->no->linha->no... e o scroll apenas define o alvo (etapa).
    // Scroll rapido nao pula etapas: tweenTo percorre a fila na ordem,
    // para frente e para tras.
    var tl = document.getElementById('timeline');
    if (tl) {
      var tlTrack = tl.querySelector('.tl__track');
      var tlProg = document.getElementById('tlProgress');
      var tlDots = gsap.utils.toArray('.tl__dot');
      // fracao do centro de cada no em relacao a altura da linha
      var tlTr = tlTrack.getBoundingClientRect();
      var tlFracs = tlDots.map(function (d) {
        var r = d.getBoundingClientRect();
        return Math.min(1, Math.max(0, (r.top + r.height / 2 - tlTr.top) / tlTr.height));
      });
      var tlMaster = gsap.timeline({ paused: true });
      tlMaster.addLabel('L0');
      var tlPrev = 0;
      tlDots.forEach(function (dot, i) {
        tlMaster.to(tlProg, { scaleY: tlFracs[i], duration: Math.max(0.3, (tlFracs[i] - tlPrev) * 1.5), ease: 'power1.inOut' });
        tlMaster.to(dot, { '--fill': 1, duration: 0.6, ease: 'power3.out' });
        // card de texto entra junto com o preenchimento do no
        var card = dot.parentElement.querySelector('.tl__card');
        if (card) tlMaster.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '<');
        tlMaster.addLabel('L' + (i + 1));
        tlPrev = tlFracs[i];
      });
      tlMaster.to(tlProg, { scaleY: 1, duration: Math.max(0.3, (1 - tlPrev) * 1.5), ease: 'power1.inOut' });
      tlMaster.addLabel('END');

      var tlCurrent = 'L0', tlQueue = null;
      function tlGoTo(label) {
        if (label === tlCurrent) return;
        tlCurrent = label;
        if (tlQueue) tlQueue.kill();
        tlQueue = tlMaster.tweenTo(label, { ease: 'none' });
      }
      ScrollTrigger.create({
        trigger: tl, start: 'top 80%', end: 'center center',
        onUpdate: function (self) {
          var p = self.progress;
          if (p >= 0.985) { tlGoTo('END'); return; }
          var n = 0;
          tlFracs.forEach(function (f) { if (p >= f) n++; });
          tlGoTo('L' + n);
        }
      });
    }

    // Grupos com stagger
    ['[data-anim="cred-item"]', '[data-anim="service-card"]', '[data-anim="faq-item"]'].forEach(function (sel) {
      ScrollTrigger.batch(sel, {
        start: 'top 88%',
        onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, x: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, overwrite: true }); }
      });
    });
  }

  /* ---------------------------------------------------------
     2b. Hero cursor light - disco de luz fria recortado nos
     pixels das linhas (hero-lines.png), segue o ponteiro com
     atraso suave (gsap.quickTo em transform = composited, sem
     repaint por frame) e volta para casa (acima do selo) ao sair.
     Ativa so com ponteiro fino/hover e sem reduced-motion; mobile
     ja oculta .hero__deco. Le o rect fresco a cada move, entao o
     mapeamento e invariante a scroll sem listener extra.
     --------------------------------------------------------- */
  (function heroCursorLight() {
    if (!hero) return;
    var fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReduced || !hasGSAP || !fineHover) return;

    var baseLines = hero.querySelector('.hero__linework');
    if (!baseLines || !baseLines.parentNode) return;

    var lit = document.createElement('span');
    lit.className = 'hero__lit';
    lit.setAttribute('aria-hidden', 'true');
    var orb = document.createElement('span');
    orb.className = 'hero__lit-orb';
    lit.appendChild(orb);
    // logo acima das linhas base, dentro de .hero__deco (herda o fade-esquerda)
    baseLines.parentNode.insertBefore(lit, baseLines.nextSibling);

    var HOME_FX = 0.767, HOME_FY = 0.481; // ponto de descanso (marcado pelo cliente)
    function rectOf() { return hero.getBoundingClientRect(); }

    var r0 = rectOf();
    // posicao inicial = ponto de descanso
    gsap.set(orb, { x: r0.width * HOME_FX, y: r0.height * HOME_FY });
    var setX = gsap.quickTo(orb, 'x', { duration: 0.5, ease: 'power3.out' });
    var setY = gsap.quickTo(orb, 'y', { duration: 0.6, ease: 'power3.out' });

    // brilho de descanso permanente no ponto marcado (fade-in suave no load)
    requestAnimationFrame(function () { lit.classList.add('is-rest'); });

    hero.addEventListener('pointermove', function (e) {
      var r = rectOf();
      lit.classList.add('is-lit');            // intensifica enquanto segue o cursor
      setX(e.clientX - r.left);
      setY(e.clientY - r.top);
    }, { passive: true });
    hero.addEventListener('pointerleave', function () {
      var r = rectOf();
      lit.classList.remove('is-lit');         // volta ao brilho de descanso (is-rest fica)
      setX(r.width * HOME_FX);                 // e retorna para o ponto marcado
      setY(r.height * HOME_FY);
    }, { passive: true });
    // re-ancora o ponto de descanso quando a janela muda de tamanho
    var reflowPending = false;
    window.addEventListener('resize', function () {
      if (reflowPending) return; reflowPending = true;
      requestAnimationFrame(function () {
        reflowPending = false;
        var r = rectOf();
        gsap.set(orb, { x: r.width * HOME_FX, y: r.height * HOME_FY });
      });
    }, { passive: true });

    // a luz acompanha EXATAMENTE o parallax do linework (mesmos parametros). Criada
    // aqui porque .hero__lit so existe agora (depois do bloco de parallax geral).
    // O transform do parallax fica no wrapper .hero__lit; o orb (filho) compoe por
    // cima via quickTo, entao a luz se move junto com as linhas durante o scroll.
    if (hasST) {
      var litK = window.matchMedia('(min-width: 1100px)').matches ? 1 : 0.4;
      gsap.set(lit, { transformPerspective: 1400, force3D: true }); // perspectiva constante (mesma do linework)
      gsap.to(lit, {
        yPercent: -7 * litK, rotateY: -2.5 * litK,
        transformOrigin: '100% 50%', force3D: true, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  })();

  /* ---------------------------------------------------------
     3. Text Trace (s9)
     --------------------------------------------------------- */
  var traceTargets = document.querySelectorAll('[data-anim="text-trace"]');
  Array.prototype.forEach.call(traceTargets, function (el) {
    var hasInlineChildren = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 1; });
    if (hasInlineChildren) return;
    var traceColor = getComputedStyle(el).color;
    el.style.setProperty('--trace-color', traceColor);

    var rawText = el.textContent;
    el.textContent = '';
    var chars = [];
    rawText.split(/(\s+)/).forEach(function (tok) {
      if (tok.length === 0) return;
      if (/^\s+$/.test(tok)) { el.appendChild(document.createTextNode(tok)); return; }
      var word = document.createElement('span');
      word.className = 'trace-word';
      for (var i = 0; i < tok.length; i++) {
        var span = document.createElement('span');
        span.className = 'trace-char';
        span.textContent = tok[i];
        word.appendChild(span);
        chars.push(span);
      }
      el.appendChild(word);
    });
    if (chars.length === 0) return;

    var staggerMs = parseInt(el.dataset.traceStaggerMs, 10) || 35;
    var durationMs = parseInt(el.dataset.traceDurationMs, 10) || 600;
    if (prefersReduced) return;
    chars.forEach(function (c) { c.style.setProperty('--trace-duration', durationMs + 'ms'); });

    var triggered = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !triggered) {
          triggered = true; io.disconnect();
          chars.forEach(function (char, i) {
            char.style.setProperty('--trace-delay', (i * staggerMs) + 'ms');
            char.classList.add('is-animating');
          });
        }
      });
    }, { threshold: 0.1 });
    io.observe(el);
  });

  /* ---------------------------------------------------------
     4. Mobile menu splash (s10)
     --------------------------------------------------------- */
  var menu = document.getElementById('mobileMenu');
  var burger = document.getElementById('hamburger');
  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open');
    document.body.classList.add('menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    if (hasGSAP && !prefersReduced) {
      gsap.fromTo('[data-menu-item]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.07, delay: 0.25 });
      gsap.fromTo('[data-menu-cta]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out', delay: 0.5 });
    } else {
      document.querySelectorAll('[data-menu-item],[data-menu-cta]').forEach(function (e) { e.style.opacity = 1; e.style.transform = 'none'; });
    }
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger) burger.addEventListener('click', function () {
    if (document.body.classList.contains('menu-open')) closeMenu(); else openMenu();
  });
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  var menuClose = document.getElementById('mobileMenuClose');
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) closeMenu();
  });

  /* ---------------------------------------------------------
     5. Sticky bar + WhatsApp FAB visibility (s10 / wa md s7a)
     Sem GSAP no transform do FAB (CSS controla 100%).
     --------------------------------------------------------- */
  var stickyBar = document.getElementById('mobileStickyBar');
  var fab = document.getElementById('whatsappFab');
  function onStickyScroll() {
    var trigger = hero ? hero.offsetHeight * 0.55 : 320;
    var show = window.scrollY > trigger;
    if (stickyBar) stickyBar.classList.toggle('is-visible', show);
    if (fab) fab.classList.toggle('is-visible', show);
  }
  window.addEventListener('scroll', onStickyScroll, { passive: true });
  onStickyScroll();

  /* ---------------------------------------------------------
     6. WhatsApp mini-FAQ chat + teaser (whatsapp-bubble-button.md s7b)
     --------------------------------------------------------- */
  var waWidget = document.getElementById('waWidget');
  var waFab = document.getElementById('whatsappFab');
  if (waWidget) {
    var waThread = document.getElementById('waThread');
    var waQuick = document.getElementById('waQuick');
    var waScroll = document.getElementById('waScroll');
    var waMsgs = [waWidget.dataset.msg1, waWidget.dataset.msg2, waWidget.dataset.msg3].filter(Boolean);
    var waWelcome = waMsgs.length ? waMsgs[Math.floor(Math.random() * waMsgs.length)] : 'Ola! Como posso ajudar?';
    var waReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var waFaqs = [];
    Array.prototype.forEach.call(document.querySelectorAll('#faqList .faq-item'), function (it) {
      var q = it.querySelector('summary span');
      var a = it.querySelector('.faq-a p');
      if (q && a) waFaqs.push({ q: q.textContent.trim(), a: a.textContent.trim(), used: false });
    });
    if (waFaqs.length === 0 && waWidget.dataset.faqs) {
      try {
        JSON.parse(waWidget.dataset.faqs).forEach(function (f) {
          if (f && f.q && f.a) waFaqs.push({ q: String(f.q), a: String(f.a), used: false });
        });
      } catch (e) { /* ignora */ }
    }

    function waScrollBottom() { if (waScroll) waScroll.scrollTop = waScroll.scrollHeight; }
    function waScrollToEl(el) {
      if (!waScroll || !el) return;
      var top = el.getBoundingClientRect().top - waScroll.getBoundingClientRect().top + waScroll.scrollTop;
      waScroll.scrollTop = Math.max(0, top - 8);
    }
    function waBubble(side, text) {
      var b = document.createElement('div');
      b.className = 'wa-bubble wa-bubble--' + side;
      b.textContent = text;
      if (waThread) waThread.appendChild(b);
      waScrollBottom();
      return b;
    }
    function waTypingBubble() {
      var b = document.createElement('div');
      b.className = 'wa-bubble wa-bubble--in wa-bubble--typing';
      b.innerHTML = '<span class="wa-dots"><span></span><span></span><span></span></span>';
      if (waThread) waThread.appendChild(b);
      waScrollBottom();
      return b;
    }
    function waSay(text, cb) {
      if (waReduced) { waBubble('in', text); if (cb) cb(); return; }
      var t = waTypingBubble();
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); waBubble('in', text); if (cb) cb(); }, 750);
    }
    function waRenderChips() {
      if (!waQuick) return;
      waQuick.innerHTML = '';
      var remaining = 0;
      waFaqs.forEach(function (f) {
        if (f.used) return;
        remaining++;
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'wa-chip';
        c.textContent = f.q;
        c.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          waPinned = true; f.used = true;
          var qb = waBubble('out', f.q);
          waQuick.innerHTML = '';
          waSay(f.a, function () { waRenderChips(); waScrollToEl(qb); });
        });
        waQuick.appendChild(c);
      });
      if (remaining === 0) {
        var p = document.createElement('p');
        p.className = 'wa-quick-end';
        p.textContent = waWidget.dataset.end || 'Fale com a gente no WhatsApp.';
        waQuick.appendChild(p);
      }
      waScrollBottom();
    }

    var waBuilt = false;
    function waBuildChat() { if (waBuilt) return; waBuilt = true; waSay(waWelcome, waRenderChips); }

    var waTeaser = document.getElementById('waTeaser');
    var waTeaserOpen = document.getElementById('waTeaserOpen');
    var waTeaserClose = document.getElementById('waTeaserClose');
    var waCanHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var waOverFab = false, waOverPanel = false, waCloseT = null, waDismissed = false, waPinned = false, waReady = false, waTimerStarted = false, waReopenT = null;
    var WA_TEASER_DELAY = parseInt(waWidget.dataset.teaserDelay, 10) || 10000;

    function waFabVisible() { return !waFab || waFab.classList.contains('is-visible'); }
    function waChatOpen() { return waWidget.classList.contains('is-open'); }
    function waSyncTeaser() {
      if (!waTeaser) return;
      if (waReady && !waDismissed && waFabVisible() && !waChatOpen()) waTeaser.classList.add('is-shown');
      else waTeaser.classList.remove('is-shown');
    }
    function waHideTeaser() { if (waTeaser) waTeaser.classList.remove('is-shown'); }
    function waStartTimer() {
      if (waTimerStarted || waDismissed || !waFabVisible()) return;
      waTimerStarted = true;
      setTimeout(function () { waReady = true; waSyncTeaser(); }, WA_TEASER_DELAY);
    }
    function waOpen() {
      if (waDismissed || !waFabVisible()) return;
      waReady = true; waHideTeaser();
      waWidget.classList.add('is-open');
      waBuildChat();
    }
    function waBackToTeaser() { waWidget.classList.remove('is-open'); waPinned = false; waSyncTeaser(); }
    function waDismiss() { waDismissed = true; waPinned = false; waWidget.classList.remove('is-open'); waHideTeaser(); }
    function waScheduleClose() {
      clearTimeout(waCloseT);
      waCloseT = setTimeout(function () { if (!waOverFab && !waOverPanel && !waPinned) waBackToTeaser(); }, 260);
    }

    var waCloseBtn = document.getElementById('waClose');
    if (waCloseBtn) waCloseBtn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); waDismiss(); });
    if (waTeaserOpen) waTeaserOpen.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); waPinned = true; waOpen(); });
    if (waTeaserClose) waTeaserClose.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); waDismiss(); });

    if (waCanHover) {
      if (waFab) {
        waFab.addEventListener('pointerenter', function () {
          waOverFab = true; clearTimeout(waCloseT);
          // manter o cursor >=600ms reverte um dismiss e reabre (wa md s2)
          waReopenT = setTimeout(function () { if (waDismissed) { waDismissed = false; } waOpen(); }, waDismissed ? 600 : 0);
        });
        waFab.addEventListener('pointerleave', function () { waOverFab = false; clearTimeout(waReopenT); waScheduleClose(); });
      }
      waWidget.addEventListener('pointerenter', function () { waOverPanel = true; clearTimeout(waCloseT); });
      waWidget.addEventListener('pointerleave', function () { waOverPanel = false; waScheduleClose(); });
      document.addEventListener('click', function (e) {
        if (!waChatOpen()) return;
        if (waWidget.contains(e.target) || (waFab && waFab.contains(e.target)) || (waTeaser && waTeaser.contains(e.target))) return;
        waBackToTeaser();
      });
    }

    window.addEventListener('scroll', function () { waStartTimer(); waSyncTeaser(); }, { passive: true });
    waStartTimer();
    waSyncTeaser();
  }

  /* ---------------------------------------------------------
     7. FAQ accordion - apenas um aberto por vez
     --------------------------------------------------------- */
  var faqItems = document.querySelectorAll('#faqList .faq-item');
  Array.prototype.forEach.call(faqItems, function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        Array.prototype.forEach.call(faqItems, function (other) { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---------------------------------------------------------
     8. Watchdog - se as animacoes GSAP nao rodarem (ex.: aba em
     segundo plano com requestAnimationFrame pausado), forca o
     estado final para o conteudo nunca ficar invisivel.
     setTimeout dispara mesmo com rAF estrangulado.
     --------------------------------------------------------- */
  if (hasGSAP && hasST && !prefersReduced) {
    setTimeout(function () {
      var t = document.querySelector('[data-anim="hero-sub"]');
      if (t && parseFloat(getComputedStyle(t).opacity) < 0.05) {
        document.documentElement.classList.add('reveal-immediate');
      }
    }, 1600);
  }
})();
