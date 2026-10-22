document.addEventListener('DOMContentLoaded', () => {
  let lenis = null;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.9,
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      e.preventDefault();

      if (targetId === '#') {
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.4 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -20, duration: 1.4 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Scroll reveal observer
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-fade');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach((el) => observer.observe(el));

  // Typing Animation
  const biographies = document.querySelectorAll('.biography');

  function extractTokens(node, tokens) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.replace(/\s+/g, ' ');
        for (const char of text) {
          tokens.push({ type: 'char', char });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const attrs = {};
        Array.from(child.attributes).forEach((attr) => {
          attrs[attr.name] = attr.value;
        });
        tokens.push({ type: 'open', tag: child.tagName.toLowerCase(), attrs });
        extractTokens(child, tokens);
        tokens.push({ type: 'close' });
      }
    });
  }

  biographies.forEach((bio, index) => {
    const cleanHTML = bio.innerHTML.trim().replace(/\s+/g, ' ');

    const ghostSpan = document.createElement('span');
    ghostSpan.className = 'bio-ghost';
    ghostSpan.setAttribute('aria-hidden', 'true');
    ghostSpan.innerHTML = cleanHTML;

    const typedSpan = document.createElement('span');
    typedSpan.className = 'bio-typed';

    bio.innerHTML = '';
    bio.appendChild(ghostSpan);
    bio.appendChild(typedSpan);

    const tokens = [];
    extractTokens(ghostSpan, tokens);

    const bioObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            obs.unobserve(entry.target); // Trigger only once

            setTimeout(() => {
              typedSpan.classList.add('is-typing');
              let tokenIdx = 0;
              let currentContainer = typedSpan;

              function applyToken(token) {
                if (token.type === 'open') {
                  const el = document.createElement(token.tag);
                  if (token.attrs) {
                    Object.keys(token.attrs).forEach((name) => {
                      el.setAttribute(name, token.attrs[name]);
                    });
                  }
                  currentContainer.appendChild(el);
                  currentContainer = el;
                } else if (token.type === 'close') {
                  if (currentContainer.parentElement && currentContainer !== typedSpan) {
                    currentContainer = currentContainer.parentElement;
                  }
                } else if (token.type === 'char') {
                  const lastNode = currentContainer.lastChild;
                  if (lastNode && lastNode.nodeType === Node.TEXT_NODE) {
                    lastNode.nodeValue += token.char;
                  } else {
                    currentContainer.appendChild(document.createTextNode(token.char));
                  }
                }
              }

              function typeNext() {
                if (tokenIdx >= tokens.length) {
                  typedSpan.classList.remove('is-typing');
                  return;
                }

                // Apply any open/close tag tokens immediately at the current position
                while (tokenIdx < tokens.length && tokens[tokenIdx].type !== 'char') {
                  applyToken(tokens[tokenIdx]);
                  tokenIdx++;
                }

                let currentChar = '';
                if (tokenIdx < tokens.length && tokens[tokenIdx].type === 'char') {
                  currentChar = tokens[tokenIdx].char;
                  applyToken(tokens[tokenIdx]);
                  tokenIdx++;
                }

                if (tokenIdx < tokens.length) {
                  let delay = 15 + Math.random() * 15;
                  
                  // Delay typing
                  if (currentChar === ' ' && Math.random() < 0.18) {
                    delay += 120 + Math.random() * 160;
                  } else if (currentChar === '.' || currentChar === ',' || currentChar === '—') {
                    delay += 150 + Math.random() * 130;
                  }

                  setTimeout(typeNext, delay);
                } else {
                  typedSpan.classList.remove('is-typing');
                }
              }

              typeNext();
            }, index * 220 + 250);
          }
        });
      },
      {
        threshold: 0.25
      }
    );

    bioObserver.observe(bio);
  });

  // Hero cover / uncover curtain & rising shapes animation
  const heroSection = document.querySelector('.welcome-section');
  const heroContainer = heroSection ? heroSection.querySelector('.container') : null;
  const heroDim = document.getElementById('hero-dim');
  const spark = document.getElementById('spark-icon');
  const waveBack = document.getElementById('wave-back');
  const waveMid = document.getElementById('wave-mid');
  const waveFront = document.getElementById('wave-front');
  const shapes = document.querySelectorAll('.c-shape');

  const shapeConfigs = [
    { maxLift: 135, rot: -25, scale: 1.05 },
    { maxLift: 165, rot: 14, scale: 1.1 },
    { maxLift: 120, rot: -18, scale: 1.0 },
    { maxLift: 180, rot: 140, scale: 1.15 },
    { maxLift: 145, rot: 35, scale: 1.05 }
  ];

  function updateHeroCoverAnimation() {
    const scrollY = window.scrollY;

    if (spark) {
      spark.style.transform = `rotate(${scrollY * 0.18}deg)`;
    }

    if (!heroSection) return;

    const heroHeight = heroSection.offsetHeight || 650;
    const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);
    const waveIntensity = Math.sin(progress * Math.PI);

    if (heroContainer) {
      const scale = 1 - progress * 0.06;
      const translateY = progress * -40;
      const opacity = 1 - progress * 0.55;
      heroContainer.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      heroContainer.style.opacity = opacity;
    }

    if (heroDim) {
      heroDim.style.opacity = (progress * 0.9).toFixed(3);
    }

    if (waveBack && waveMid && waveFront) {
      const backPeak = 160 - waveIntensity * 155;
      const midPeak = 160 - waveIntensity * 115;
      const frontPeak = 160 - waveIntensity * 75;

      waveBack.setAttribute(
        'd',
        `M0,160 Q720,${backPeak.toFixed(1)} 1440,160 L1440,160 L0,160 Z`
      );
      waveMid.setAttribute(
        'd',
        `M0,160 Q720,${midPeak.toFixed(1)} 1440,160 L1440,160 L0,160 Z`
      );
      waveFront.setAttribute(
        'd',
        `M0,160 Q720,${frontPeak.toFixed(1)} 1440,160 L1440,160 L0,160 Z`
      );
    }

    shapes.forEach((shape, idx) => {
      const cfg = shapeConfigs[idx % shapeConfigs.length];
      const lift = waveIntensity * cfg.maxLift;
      const currentScale = 0.3 + waveIntensity * cfg.scale;
      const currentRot = progress * cfg.rot;
      const opacity = Math.min(waveIntensity * 1.4, 1);

      shape.style.opacity = opacity.toFixed(3);
      shape.style.transform = `translate3d(0, ${-lift.toFixed(1)}px, 0) scale(${currentScale.toFixed(2)}) rotate(${currentRot.toFixed(1)}deg)`;
    });
  }

  window.addEventListener('scroll', updateHeroCoverAnimation, { passive: true });
  updateHeroCoverAnimation();
});
