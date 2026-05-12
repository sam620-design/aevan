/* =============================================================
   AEVAN DIGITAL v5 — Core Logic Engine
   Premium Interactions, Canvas Physics, & SPA Routing
   ============================================================= */

   'use strict';

   const $ = (s, c = document) => c.querySelector(s);
   const $$ = (s, c = document) => [...c.querySelectorAll(s)];
   const lerp = (a, b, t) => a + (b - a) * t;
   const routeMap = {
     home: '/',
     services: '/services',
     work: '/work',
     contact: '/contact'
   };
   
   // Global State
   const state = {
     mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
     scroll: { target: 0, current: 0, ease: 0.08 }
   };
   
   // Track mouse globally
   window.addEventListener('mousemove', e => {
     state.mouse.x = e.clientX;
     state.mouse.y = e.clientY;
   });
   
   /* ============================================================
      1. NATIVE SCROLL OBSERVER (Replaces Hijacked Scroll)
      ============================================================ */
   function initScrollObserver() {
     const nav = $('#navbar');
     if (!nav) return;

     const handleScroll = () => {
       const scrolled = window.scrollY > 24;
       nav.classList.toggle('scrolled', scrolled);
     };

     window.addEventListener('scroll', handleScroll, { passive: true });
     handleScroll(); // Initial check
   }
   
   /* ============================================================
      2. SPA ROUTER 
      ============================================================ */
   function initRouteButtons() {
     $$('[data-route]').forEach(el => {
       const route = el.dataset.route;
       const target = routeMap[route];
       if (!target) return;

       if (el.tagName === 'A') {
         if (!el.getAttribute('href')) {
           el.setAttribute('href', target);
         }
       } else {
         el.addEventListener('click', () => {
           window.location.href = target;
         });
       }
     });
   }

   function initActiveNavigation() {
     const current = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
     const route = current === 'index' ? 'home' : current;
     $$('[data-route]').forEach(el => {
       if (el.dataset.route === route) el.classList.add('active');
     });
   }
   
   /* ============================================================
      3. CANVAS PHYSICS
      ============================================================ */
   function initCanvasPhysics() {
     const canvas = $('#particleCanvas');
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     
     let W, H;
     let pts = [];
     const CONNECT_DIST = 120;
     const MOUSE_RADIUS = 250;
     const REPULSE_FORCE = 3;
     const ATTRACT_FORCE = 0.05;
   
     function resize() {
       W = canvas.width = window.innerWidth;
       H = canvas.height = window.innerHeight;
     }
     
     class Particle {
       constructor() {
         this.x = Math.random() * W;
         this.y = Math.random() * H;
         this.baseX = this.x;
         this.baseY = this.y;
         this.vx = (Math.random() - 0.5) * 0.5;
         this.vy = (Math.random() - 0.5) * 0.5;
         this.size = Math.random() * 2 + 1;
       }
       update() {
         const dx = state.mouse.x - this.x;
         const dy = state.mouse.y - this.y;
         const dist = Math.hypot(dx, dy);
         
         if (dist < MOUSE_RADIUS) {
           const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
           if (dist < MOUSE_RADIUS * 0.4) {
             const safeDist = Math.max(dist, 0.001);
             this.x -= (dx / safeDist) * force * REPULSE_FORCE;
             this.y -= (dy / safeDist) * force * REPULSE_FORCE;
           } else {
             this.x += dx * ATTRACT_FORCE * force;
             this.y += dy * ATTRACT_FORCE * force;
           }
         }
         this.x += (this.baseX - this.x) * 0.02;
         this.y += (this.baseY - this.y) * 0.02;
         this.baseX += this.vx;
         this.baseY += this.vy;
         if (this.baseX < 0 || this.baseX > W) this.vx *= -1;
         if (this.baseY < 0 || this.baseY > H) this.vy *= -1;
       }
       draw() {
         ctx.beginPath();
         ctx.fillStyle = `rgba(77, 159, 255, 0.4)`;
         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
         ctx.fill();
       }
     }
   
     function init() {
       const isMobile = window.innerWidth < 768;
       pts = Array.from({ length: isMobile ? 60 : 180 }, () => new Particle());
     }
   
     function drawNetwork() {
       for (let i = 0; i < pts.length; i++) {
         for (let j = i + 1; j < pts.length; j++) {
           const dx = pts[i].x - pts[j].x;
           const dy = pts[i].y - pts[j].y;
           const dist = Math.hypot(dx, dy);
           if (dist < CONNECT_DIST) {
             const alpha = 1 - (dist / CONNECT_DIST);
             ctx.beginPath();
             ctx.strokeStyle = `rgba(77, 159, 255, ${alpha * 0.25})`;
             ctx.lineWidth = 1;
             ctx.moveTo(pts[i].x, pts[i].y);
             ctx.lineTo(pts[j].x, pts[j].y);
             ctx.stroke();
           }
         }
       }
     }
   
     function render() {
       ctx.clearRect(0, 0, W, H);
       drawNetwork();
       pts.forEach(p => { p.update(); p.draw(); });
       requestAnimationFrame(render);
     }
   
     window.addEventListener('resize', () => { resize(); init(); });
     resize();
     init();
     render();
   }
   
   function initAmbientParallax() {
     const layers = $$('.parallax-layer');
     let cx = 0, cy = 0;
     function tick() {
       const tx = (state.mouse.x / window.innerWidth - 0.5) * 2;
       const ty = (state.mouse.y / window.innerHeight - 0.5) * 2;
       cx = lerp(cx, tx, 0.05);
       cy = lerp(cy, ty, 0.05);
       layers.forEach(layer => {
         const depth = parseFloat(layer.dataset.depth || 0.1);
         layer.style.transform = `translate(${cx * depth * 100}px, ${cy * depth * 100}px)`;
       });
       requestAnimationFrame(tick);
     }
     tick();
   }
   
   /* ============================================================
      4. VIRTUAL ASSISTANT
      ============================================================ */
   function initVirtualAssistant() {
     const core = $('.mascot-core');
     const panel = $('#assistantPanel');
     const msg = $('#assistantMsg');
     if(!core || !panel) return;

     core.addEventListener('click', () => {
       panel.classList.toggle('open');
       if (panel.classList.contains('open') && msg && msg.innerHTML === '') {
         const text = "Hi, I'm Aevi! How can we help construct your vision today?";
         let i = 0;
         function type() {
           if (i < text.length) {
             msg.innerHTML += text.charAt(i);
             i++;
             setTimeout(type, 30);
           }
         }
         type();
       }
     });

     let rx = 0, ry = 0;
     function trackMouse() {
       const rect = core.getBoundingClientRect();
       const centerX = rect.left + rect.width / 2;
       const centerY = rect.top + rect.height / 2;
       const tx = (state.mouse.x - centerX) / window.innerWidth;
       const ty = (state.mouse.y - centerY) / window.innerHeight;
       rx = lerp(rx, -ty * 40, 0.1); 
       ry = lerp(ry, tx * 40, 0.1);
       
       // Calculate advanced procedural floating and swaying movements
       const floatY = Math.sin(Date.now() / 600) * 12; // Natural 12px vertical breathe/float
       const swayZ = lerp(0, tx * -20, 0.8); // Side-to-side tilt based on mouse position
       
       core.style.transform = `perspective(800px) translateY(${floatY}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${swayZ}deg) scale(1.15)`;
       requestAnimationFrame(trackMouse);
     }
     if (window.innerWidth >= 768) trackMouse();
   }
   
   /* ============================================================
      5. DOM / TEXT ANIMATIONS
      ============================================================ */
   function splitTextAnimations() {
     const target = $('.split-text-target');
     if (target) target.classList.add('fade-in-up', 'in');
   }
   
   function initRevealAnimations() {
     const els = $$('.fade-in-up');
     const obs = new IntersectionObserver((entries) => {
       entries.forEach(e => {
         if (e.isIntersecting) {
           e.target.classList.add('in');
           obs.unobserve(e.target);
         }
       });
     }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
     els.forEach(el => obs.observe(el));
   }
   
   function initMagneticButtons() {
     if (window.innerWidth < 1024) return;
     $$('.magnetic-btn, .nav-link, .logo').forEach(btn => {
       btn.addEventListener('mousemove', e => {
         const rect = btn.getBoundingClientRect();
         const centerX = rect.left + rect.width / 2;
         const centerY = rect.top + rect.height / 2;
         const x = (e.clientX - centerX) * 0.3;
         const y = (e.clientY - centerY) * 0.3;
         btn.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
       });
       btn.addEventListener('mouseleave', () => {
         btn.style.transform = 'translate(0px, 0px) scale(1)';
       });
     });
    }

  /* ============================================================
     6. CONTACT FORM HANDLING & GOOGLE FORMS
     ============================================================ */
  function initContactForm() {
    const btn = $('#btnSendMessage');
    const form = $('#contactForm');
    const success = $('#formSuccess');
    const phoneInput = $('#contactPhone');
    
    if (!btn || !form || !success) return;

    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    });

    // Enforce +91 prefix
    if (phoneInput) {
      phoneInput.addEventListener('keydown', (e) => {
        if (e.target.selectionStart < 3 && (e.key === 'Backspace' || e.key === 'Delete')) {
          e.preventDefault();
        }
      });
      phoneInput.addEventListener('input', (e) => {
        if (!e.target.value.startsWith('+91')) {
          e.target.value = '+91' + e.target.value.replace(/\D/g, '');
        }
        // Force numeric only after prefix
        const prefix = '+91';
        const rest = e.target.value.substring(3).replace(/\D/g, '');
        e.target.value = prefix + rest;
      });
    }

    btn.addEventListener('click', async () => {
      const name = $('#contactName')?.value || '';
      const email = $('#contactEmail')?.value || '';
      const phone = phoneInput?.value || '';
      const projectType = $('#contactProjectType')?.value || '';
      const timeline = $('#contactTimeline')?.value || '';
      const message = $('#contactRequirements')?.value || '';

      if (!name || !email) {
        alert('Name and Email are required.');
        return;
      }

      // Strict 10-digit validation
      const phoneDigits = phone.substring(3);
      if (phoneDigits.length !== 10) {
        alert('Please enter a valid 10-digit phone number after the +91 prefix.');
        return;
      }

      btn.innerHTML = '<span class="btn-text">Sending...</span>';
      btn.style.opacity = '0.7';
      btn.style.pointerEvents = 'none';

      const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSd6PUpGMuoU3QoK8OABmPTD5nN6XssupmNToCT-R3V1s3wDxA/formResponse';
      const formData = new URLSearchParams();
      formData.append('entry.632516448', name);
      formData.append('entry.1233814043', email);
      formData.append('entry.1430003953', `Project Type: ${projectType || 'Not specified'}\nTimeline: ${timeline || 'Not specified'}\n\n${message}`);
      formData.append('entry.352594219', phone);

      try {
        await fetch(formUrl, { method: 'POST', mode: 'no-cors', body: formData });
        
        setTimeout(() => {
          form.style.display = 'none';
          success.style.display = 'block';
          success.classList.add('fade-in-up', 'in');
        }, 1000);
      } catch (err) {
        btn.innerHTML = '<span class="btn-text">Retry Submission</span>';
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      }
    });
  }

  /* ============================================================
     7. MOBILE NAVIGATION ENGINE
     ============================================================ */
  function initMobileMenu() {
    const ham = $('#hamburger');
    const menu = $('#mobileMenu');
    if (!ham || !menu) return;

    const links = $$('.mobile-link', menu);
    const cta = menu.querySelector('.btn-primary');

    const closeMenu = () => {
      ham.classList.remove('open');
      menu.classList.remove('open');
    };

    ham.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = ham.classList.toggle('open');
      menu.classList.toggle('open', isOpen);
    });

    links.forEach(link => link.addEventListener('click', closeMenu));
    if (cta) cta.addEventListener('click', closeMenu);

    // Dismiss on outside click
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') && !menu.contains(e.target) && !ham.contains(e.target)) {
        closeMenu();
      }
    });
  }
   
   /* ============================================================
     8. SITE PROTECTION ENGINE (Anti-Copy/Anti-Theft)
     ============================================================ */
  function initSiteProtection() {
    // Disable Right-Click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Disable Key Combinations
    document.addEventListener('keydown', e => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+C
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // I, J, C
        (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 67)) // U, S, C
      ) {
        e.preventDefault();
        return false;
      }
    });

    // Disable Image Dragging
    document.addEventListener('dragstart', e => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });

    console.log("%cAevan Digital — System Protected", "color: #4d9fff; font-size: 20px; font-weight: bold;");
  }

  /* ============================================================
     BOOTSTRAP
     ============================================================ */
    function initPreloader() {
      const preloader = $('#preloader');
      if (!preloader) return;
      
      const hasShown = sessionStorage.getItem('aevan_preloader_shown');
      if (hasShown) {
        preloader.style.display = 'none';
        return;
      }

      window.addEventListener('load', () => {
        setTimeout(() => {
          preloader.classList.add('loaded');
          sessionStorage.setItem('aevan_preloader_shown', 'true');
        }, 4000); // 4 seconds allows for ~3 slow pulses
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      initPreloader();
      initScrollObserver();
      initCanvasPhysics();
      initAmbientParallax();
      initVirtualAssistant();
      initRouteButtons();
      initActiveNavigation();
      initContactForm();
      initMobileMenu();
      initSiteProtection();
      splitTextAnimations();
      initRevealAnimations();
      initMagneticButtons();
    });
