import { nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';

type LetterMotion = {
  element: HTMLElement;
  brightness: ReturnType<typeof gsap.quickTo>;
  rotationX: ReturnType<typeof gsap.quickTo>;
  rotationY: ReturnType<typeof gsap.quickTo>;
  scale: ReturnType<typeof gsap.quickTo>;
  y: ReturnType<typeof gsap.quickTo>;
};

const clamp = gsap.utils.clamp;

export const useTitleInteraction = (pageRoot: Ref<HTMLElement | null>) => {
  let media: ReturnType<typeof gsap.matchMedia> | undefined;

  onMounted(async () => {
    await nextTick();
    if (!pageRoot.value) return;

    media = gsap.matchMedia();
    media.add(
      {
        animate: '(prefers-reduced-motion: no-preference)',
        finePointer: '(hover: hover) and (pointer: fine)'
      },
      (context) => {
        const { animate, finePointer } = context.conditions as {
          animate: boolean;
          finePointer: boolean;
        };
        if (!animate || !pageRoot.value) return;

        const scope = pageRoot.value;
        const stage = scope.querySelector<HTMLElement>('.motion-title-stage');
        if (!stage) return;

        const cleanup: Array<() => void> = [];
        const scopedContext = gsap.context(() => {
          const primaryLetters = gsap.utils.toArray<HTMLElement>('.motion-title-primary-letter');
          const overlayLetters = gsap.utils.toArray<HTMLElement>('.motion-title-overlay-letter');
          const letters = [...primaryLetters, ...overlayLetters];
          const overlayInitial = overlayLetters[0];

          gsap.set(stage, {
            '--title-gradient-x': '50%',
            '--title-pointer-alpha': 0,
            '--title-spectrum-response': 0,
            '--title-o-ring-alpha': 0,
            '--title-o-ring-scale': 0.72,
            '--title-o-indicator': 0,
            '--title-wave-alpha': 0,
            '--title-wave-x': '16%',
            '--title-wave-scale-x': 0.72,
            '--title-wave-scale-y': 1
          });

          if (overlayInitial) {
            const indicator = gsap.timeline({
              delay: 2.8,
              repeat: -1,
              repeatDelay: 4.4
            });

            indicator
              .set(stage, {
                '--title-wave-x': '16%',
                '--title-wave-scale-x': 0.72,
                '--title-wave-scale-y': 1
              }, 0)
              .to(stage, {
                '--title-o-indicator': 1,
                '--title-o-ring-alpha': 0.78,
                '--title-o-ring-scale': 1,
                duration: 0.13,
                ease: 'power2.out'
              })
              .to(stage, {
                '--title-o-indicator': 0.22,
                '--title-o-ring-alpha': 0,
                '--title-o-ring-scale': 1.36,
                duration: 0.34,
                ease: 'power2.out'
              })
              .to(stage, {
                '--title-wave-alpha': 1,
                '--title-wave-x': '108%',
                duration: 0.86,
                ease: 'power2.inOut'
              }, 0.08)
              .to([...overlayLetters, ...primaryLetters.slice().reverse()], {
                '--title-letter-brightness': 1.72,
                '--title-letter-saturation': 0.28,
                '--title-letter-glow': '9px',
                '--title-letter-mirror-color': '100%',
                scale: 1.055,
                duration: 0.1,
                ease: 'power2.out',
                stagger: 0.028
              }, 0.1)
              .to([...overlayLetters, ...primaryLetters.slice().reverse()], {
                '--title-letter-brightness': 1,
                '--title-letter-saturation': 1,
                '--title-letter-glow': '0px',
                '--title-letter-mirror-color': '0%',
                scale: 1,
                duration: 0.24,
                ease: 'power2.out',
                stagger: 0.028
              }, 0.2)
              .to(stage, {
                '--title-wave-alpha': 0.34,
                '--title-wave-scale-x': 1.7,
                '--title-wave-scale-y': 0.72,
                duration: 0.3,
                ease: 'sine.out'
              }, 0.68)
              .to(stage, {
                '--title-wave-alpha': 0,
                '--title-wave-scale-x': 2.45,
                '--title-wave-scale-y': 0.46,
                duration: 0.4,
                ease: 'sine.out'
              }, 0.88)
              .to(stage, {
                '--title-o-indicator': 0.72,
                duration: 0.08,
                ease: 'power1.out'
              }, '+=0.06')
              .to(stage, {
                '--title-o-indicator': 0,
                duration: 0.2,
                ease: 'power1.out'
              });
          }

          if (!finePointer) return;

          const motion = letters.map<LetterMotion>((element) => ({
            element,
            brightness: gsap.quickTo(element, '--title-letter-brightness', {
              duration: 0.34,
              ease: 'power2.out'
            }),
            rotationX: gsap.quickTo(element, 'rotationX', {
              duration: 0.42,
              ease: 'power3.out'
            }),
            rotationY: gsap.quickTo(element, 'rotationY', {
              duration: 0.42,
              ease: 'power3.out'
            }),
            scale: gsap.quickTo(element, 'scale', {
              duration: 0.38,
              ease: 'power3.out'
            }),
            y: gsap.quickTo(element, 'y', {
              duration: 0.42,
              ease: 'power3.out'
            })
          }));

          const gradientX = gsap.quickTo(stage, '--title-gradient-x', {
            duration: 0.48,
            ease: 'power2.out'
          });
          const pointerAlpha = gsap.quickTo(stage, '--title-pointer-alpha', {
            duration: 0.42,
            ease: 'power2.out'
          });
          const spectrumResponse = gsap.quickTo(stage, '--title-spectrum-response', {
            duration: 0.48,
            ease: 'power2.out'
          });
          let colorFlow: gsap.core.Tween | undefined;

          const startColorFlow = () => {
            colorFlow?.kill();
            colorFlow = gsap.fromTo(letters, {
              '--title-flow-x': '-130%'
            }, {
              '--title-flow-x': '130%',
              duration: 1.8,
              ease: 'sine.inOut',
              stagger: 0.025,
              repeat: -1,
              yoyo: true
            });
          };

          const reset = () => {
            motion.forEach(({ brightness, rotationX, rotationY, scale, y }) => {
              y(0);
              rotationX(0);
              rotationY(0);
              scale(1);
              brightness(1);
            });
            gradientX('50%');
            pointerAlpha(0);
            spectrumResponse(0);
            colorFlow?.kill();
            gsap.to(letters, {
              '--title-flow-x': '50%',
              duration: 0.42,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          };

          const respondToPointer = (event: PointerEvent) => {
            const stageRect = stage.getBoundingClientRect();
            const pointerProgress = clamp(0, 1, (event.clientX - stageRect.left) / stageRect.width);

            gradientX(`${18 + pointerProgress * 64}%`);
            pointerAlpha(1);

            let strongestResponse = 0;
            motion.forEach(({ element, brightness, rotationX, rotationY, scale, y }) => {
              const rect = element.getBoundingClientRect();
              const dx = event.clientX - (rect.left + rect.width / 2);
              const dy = event.clientY - (rect.top + rect.height / 2);
              const distance = Math.hypot(dx, dy);
              const strength = clamp(0, 1, 1 - distance / 360);

              strongestResponse = Math.max(strongestResponse, strength);
              y(clamp(-12, 12, dy * -0.055) * strength);
              rotationX(clamp(-11, 11, dy * -0.05) * strength);
              rotationY(clamp(-14, 14, dx * 0.06) * strength);
              scale(1 + strength * 0.075);
              brightness(1 + strength * 0.52);
            });

            spectrumResponse(strongestResponse);
          };

          stage.addEventListener('pointermove', respondToPointer);
          stage.addEventListener('pointerenter', startColorFlow);
          stage.addEventListener('pointerleave', reset);
          cleanup.push(() => {
            stage.removeEventListener('pointermove', respondToPointer);
            stage.removeEventListener('pointerenter', startColorFlow);
            stage.removeEventListener('pointerleave', reset);
            colorFlow?.kill();
          });
        }, scope);

        cleanup.push(() => scopedContext.revert());
        return () => cleanup.forEach((remove) => remove());
      },
      pageRoot.value
    );
  });

  onUnmounted(() => {
    media?.revert();
  });
};
