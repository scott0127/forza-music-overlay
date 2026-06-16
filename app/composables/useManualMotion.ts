import { nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';

export const useManualMotion = (pageRoot: Ref<HTMLElement | null>) => {
  let media: ReturnType<typeof gsap.matchMedia> | undefined;
  let context: gsap.Context | undefined;

  onMounted(async () => {
    await nextTick();
    const root = pageRoot.value;
    if (!root) return;

    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    context = gsap.context(() => {
      media = gsap.matchMedia();

      media.add(
        {
          animate: '(prefers-reduced-motion: no-preference)',
          desktop: '(min-width: 1024px)'
        },
        (state) => {
          const { animate, desktop } = state.conditions as { animate: boolean; desktop: boolean };
          if (!animate) return;

          const steps = gsap.utils.toArray<HTMLElement>('.manual-step', root);
          const preview = root.querySelector<HTMLElement>('.manual-preview');
          const previewMode = root.querySelector<HTMLElement>('.manual-preview-mode');
          const previewTitle = root.querySelector<HTMLElement>('.manual-preview-title');
          const previewMeta = root.querySelector<HTMLElement>('.manual-preview-meta');
          const previewCombo = root.querySelector<HTMLElement>('.manual-preview-combo');
          const previewVolume = root.querySelector<HTMLElement>('.manual-preview-volume');
          const previewLyrics = root.querySelector<HTMLElement>('.manual-preview-lyrics');
          const previewFill = root.querySelector<HTMLElement>('.manual-preview-fill');
          const previewGhost = root.querySelector<HTMLElement>('.manual-preview-ghost');
          const stageNo = root.querySelector<HTMLElement>('.manual-stage-no');
          const stageEyebrow = root.querySelector<HTMLElement>('.manual-stage-eyebrow');
          const stageTitle = root.querySelector<HTMLElement>('.manual-stage-title');
          const stageBody = root.querySelector<HTMLElement>('.manual-stage-body');
          const stageChips = root.querySelector<HTMLElement>('.manual-stage-chips');

          // Stacked deck card references
          const cardBrowser = root.querySelector<HTMLElement>('.card-browser');
          const cardCode = root.querySelector<HTMLElement>('.card-code');
          const cardStatus = root.querySelector<HTMLElement>('.card-status');
          const previewCode = root.querySelector<HTMLElement>('.manual-preview-code');
          const previewStatus = root.querySelector<HTMLElement>('.manual-preview-status');
          const previewStatusDesc = root.querySelector<HTMLElement>('.manual-preview-status-desc');

          let activeStepIndex = -1;

          // 3D Card Deck states mapping to all 9 steps
          const deckStates = [
            {
              browser: { x: 0, y: 0, rotation: -3, scale: 1, zIndex: 30 },
              code: { x: 80, y: 20, rotation: 5, scale: 0.95, zIndex: 20 },
              status: { x: -60, y: 160, rotation: -2, scale: 1, zIndex: 40 }
            },
            {
              browser: { x: -30, y: 20, rotation: -5, scale: 0.96, zIndex: 20 },
              code: { x: 20, y: -20, rotation: 2, scale: 1, zIndex: 30 },
              status: { x: -40, y: 140, rotation: 1, scale: 0.98, zIndex: 40 }
            },
            {
              browser: { x: 10, y: 0, rotation: 2, scale: 1.02, zIndex: 30 },
              code: { x: 90, y: 40, rotation: -3, scale: 0.9, zIndex: 15 },
              status: { x: -80, y: 180, rotation: -1, scale: 0.95, zIndex: 40 }
            },
            {
              browser: { x: -40, y: -10, rotation: -4, scale: 0.98, zIndex: 25 },
              code: { x: 40, y: 30, rotation: 4, scale: 0.95, zIndex: 20 },
              status: { x: -50, y: 110, rotation: 3, scale: 1, zIndex: 40 }
            },
            {
              browser: { x: 5, y: 15, rotation: -1, scale: 0.96, zIndex: 20 },
              code: { x: 30, y: -25, rotation: 4, scale: 1, zIndex: 35 },
              status: { x: -60, y: 150, rotation: -3, scale: 0.97, zIndex: 40 }
            },
            {
              browser: { x: -20, y: 10, rotation: -3, scale: 0.96, zIndex: 20 },
              code: { x: 15, y: -15, rotation: 3, scale: 1, zIndex: 30 },
              status: { x: -50, y: 130, rotation: 1, scale: 0.95, zIndex: 40 }
            },
            {
              browser: { x: 20, y: 20, rotation: 3, scale: 0.98, zIndex: 20 },
              code: { x: 75, y: 35, rotation: -4, scale: 0.93, zIndex: 15 },
              status: { x: -30, y: 150, rotation: -2, scale: 1.03, zIndex: 45 }
            },
            {
              browser: { x: -30, y: -5, rotation: -5, scale: 0.98, zIndex: 25 },
              code: { x: 25, y: 15, rotation: 4, scale: 0.96, zIndex: 20 },
              status: { x: -70, y: 120, rotation: 2, scale: 1, zIndex: 40 }
            },
            {
              browser: { x: -10, y: 15, rotation: -2, scale: 0.97, zIndex: 20 },
              code: { x: 35, y: -10, rotation: 3, scale: 1, zIndex: 30 },
              status: { x: -80, y: 140, rotation: -1, scale: 0.96, zIndex: 40 }
            }
          ];

          // Syntax highlights JSON for code block
          const formatJsonHighlight = (json: string) => {
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?/g, (match, p1, p2, p3) => {
              if (p3) {
                return `<span class="code-key">${p1}</span>:`;
              }
              return `<span class="code-string">${p1}</span>`;
            })
            .replace(/\b(true|false)\b/g, '<span class="code-boolean">$1</span>')
            .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="code-number">$1</span>')
            .replace(/([\{\}\[\]])/g, '<span class="code-bracket">$1</span>');
          };

          const layoutDeck = (activeIndex: number, immediate = false) => {
            const state = deckStates[activeIndex] ?? deckStates[0];
            const duration = immediate ? 0 : 0.62;

            if (cardBrowser) {
              gsap.to(cardBrowser, {
                x: state.browser.x,
                y: state.browser.y,
                rotation: state.browser.rotation,
                scale: state.browser.scale,
                zIndex: state.browser.zIndex,
                duration,
                ease: 'power3.out',
                overwrite: 'auto'
              });
            }
            if (cardCode) {
              gsap.to(cardCode, {
                x: state.code.x,
                y: state.code.y,
                rotation: state.code.rotation,
                scale: state.code.scale,
                zIndex: state.code.zIndex,
                duration,
                ease: 'power3.out',
                overwrite: 'auto'
              });
            }
            if (cardStatus) {
              gsap.to(cardStatus, {
                x: state.status.x,
                y: state.status.y,
                rotation: state.status.rotation,
                scale: state.status.scale,
                zIndex: state.status.zIndex,
                duration,
                ease: 'power3.out',
                overwrite: 'auto'
              });
            }
          };

          const setStep = (step: HTMLElement) => {
            const index = Math.max(0, steps.indexOf(step));
            if (index === activeStepIndex) return;
            activeStepIndex = index;
            steps.forEach((item) => item.classList.toggle('is-active', item === step));
            const volume = Number(step.dataset.volume ?? '72');
            if (stageNo) stageNo.textContent = step.dataset.no ?? `${index + 1}`.padStart(2, '0');
            if (stageEyebrow) stageEyebrow.textContent = step.dataset.title ?? '';
            if (stageTitle) stageTitle.textContent = step.dataset.zh ?? '';
            if (stageBody) stageBody.textContent = step.dataset.body ?? '';
            if (stageChips) {
              stageChips.innerHTML = '';
              (step.dataset.chips ?? '').split('|').filter(Boolean).forEach((chip) => {
                const chipNode = document.createElement('b');
                chipNode.textContent = chip;
                stageChips.appendChild(chipNode);
              });
            }
            if (previewMode) previewMode.textContent = step.dataset.mode ?? 'Overlay';
            if (previewTitle) previewTitle.textContent = step.dataset.previewTitle ?? 'Night Drive';
            if (previewMeta) previewMeta.textContent = step.dataset.previewMeta ?? 'YouTube Music / Active session';
            if (previewCombo) previewCombo.textContent = step.dataset.combo ?? 'L3 + A';
            if (previewLyrics) previewLyrics.textContent = step.dataset.lyrics ?? 'Real-time lyrics ready';
            
            // Update Code and Status card contents dynamically
            if (previewCode) {
              previewCode.innerHTML = formatJsonHighlight(step.dataset.code ?? '{}');
            }
            if (previewStatus) {
              previewStatus.textContent = step.dataset.status ?? 'CONNECTED';
            }
            if (previewStatusDesc) {
              previewStatusDesc.textContent = step.dataset.statusDesc ?? '';
            }

            layoutDeck(index);

            if (previewFill) {
              gsap.to(previewFill, {
                width: `${gsap.utils.clamp(0, 100, volume)}%`,
                duration: 0.42,
                ease: 'power2.out',
                overwrite: 'auto'
              });
            }
            if (previewVolume) {
              const value = { amount: Number(previewVolume.dataset.amount ?? '72') };
              gsap.to(value, {
                amount: volume,
                duration: 0.42,
                ease: 'power2.out',
                overwrite: 'auto',
                onUpdate: () => {
                  previewVolume.dataset.amount = `${value.amount}`;
                  previewVolume.textContent = `${Math.round(value.amount)}%`;
                }
              });
            }
            if (preview) {
              preview.dataset.state = step.dataset.state ?? 'source';
              gsap.fromTo(preview, { y: 10, filter: 'brightness(1.18)' }, {
                y: 0,
                filter: 'brightness(1)',
                duration: 0.38,
                ease: 'power3.out',
                overwrite: 'auto'
              });
            }
            if (previewGhost) {
              gsap.fromTo(previewGhost, { scale: 0.82, autoAlpha: 0.42 }, {
                scale: 1.24,
                autoAlpha: 0,
                duration: 0.68,
                ease: 'sine.out',
                overwrite: 'auto'
              });
            }
          };

          if (steps[0]) {
            layoutDeck(0, true);
            setStep(steps[0]);
          }

          gsap.from('.manual-reveal', {
            autoAlpha: 0,
            y: 24,
            duration: 0.72,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: '.manual-overview',
              start: 'top 72%',
              once: true
            }
          });

          gsap.utils.toArray<SVGPathElement>('.manual-flow-line path', root).forEach((path) => {
            const length = path.getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
            gsap.to(path, {
              strokeDashoffset: 0,
              duration: 1.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: path.closest('.manual-overview'),
                start: 'top 62%',
                once: true
              }
            });
          });

          if (steps.length) {
            if (desktop) {
              ScrollTrigger.create({
                trigger: '.manual-guide',
                pin: '.manual-guide-sticky',
                start: 'top top',
                end: 'bottom bottom',
                pinSpacing: true,
                scrub: 0.35,
                onUpdate: (self) => {
                  const index = gsap.utils.clamp(0, steps.length - 1, Math.round(self.progress * (steps.length - 1)));
                  setStep(steps[index]);
                }
              });
            } else {
              ScrollTrigger.create({
                trigger: '.manual-guide',
                start: 'top 72%',
                once: true,
                onEnter: () => setStep(steps[0])
              });
            }
          }

          gsap.from('.deck-card', {
            autoAlpha: 0,
            y: 80,
            rotation: 0,
            scale: 0.8,
            duration: 0.82,
            ease: 'back.out(1.2)',
            stagger: 0.12,
            scrollTrigger: {
              trigger: '.manual-guide',
              start: 'top 62%',
              once: true
            }
          });

          gsap.from('.manual-pipeline-step', {
            autoAlpha: 0,
            y: 28,
            duration: 0.58,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: {
              trigger: '.manual-install',
              start: 'top 68%',
              once: true
            }
          });

          gsap.from('.manual-ledger-row', {
            autoAlpha: 0,
            x: -18,
            duration: 0.52,
            ease: 'power2.out',
            stagger: 0.06,
            scrollTrigger: {
              trigger: '.manual-ledger',
              start: 'top 68%',
              once: true
            }
          });

          const cleanupFns: Array<() => void> = [];

          steps.forEach((step) => {
            const click = () => setStep(step);
            step.addEventListener('click', click);
            cleanupFns.push(() => step.removeEventListener('click', click));
          });

          gsap.utils.toArray<HTMLElement>('.manual-module, .manual-pipeline-step, .manual-ledger-row', root).forEach((card) => {
            const enter = () => gsap.to(card, {
              y: -6,
              scale: 1.012,
              duration: 0.32,
              ease: 'power3.out',
              overwrite: 'auto'
            });
            const leave = () => gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.42,
              ease: 'power3.out',
              overwrite: 'auto'
            });
            card.addEventListener('pointerenter', enter);
            card.addEventListener('pointerleave', leave);
            cleanupFns.push(() => {
              card.removeEventListener('pointerenter', enter);
              card.removeEventListener('pointerleave', leave);
            });
          });

          if (preview) {
            const moveX = gsap.quickTo(preview, 'x', { duration: 0.45, ease: 'power3.out' });
            const moveY = gsap.quickTo(preview, 'y', { duration: 0.45, ease: 'power3.out' });
            const rotateX = gsap.quickTo(preview, 'rotationX', { duration: 0.45, ease: 'power3.out' });
            const rotateY = gsap.quickTo(preview, 'rotationY', { duration: 0.45, ease: 'power3.out' });
            const move = (event: PointerEvent) => {
              const bounds = preview.getBoundingClientRect();
              const x = (event.clientX - bounds.left) / bounds.width - 0.5;
              const y = (event.clientY - bounds.top) / bounds.height - 0.5;
              moveX(x * 10);
              moveY(y * 8);
              rotateX(y * -4);
              rotateY(x * 5);
            };
            const leave = () => {
              moveX(0);
              moveY(0);
              rotateX(0);
              rotateY(0);
            };
            preview.addEventListener('pointermove', move);
            preview.addEventListener('pointerleave', leave);
            cleanupFns.push(() => {
              preview.removeEventListener('pointermove', move);
              preview.removeEventListener('pointerleave', leave);
            });
          }

          return () => {
            cleanupFns.forEach((cleanup) => cleanup());
          };
        },
        root
      );
    }, root);
  });

  onUnmounted(() => {
    media?.revert();
    context?.revert();
  });
};
