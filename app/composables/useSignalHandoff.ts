import { nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';

const getPlatformColor = (button: HTMLElement) => {
  return button.style.getPropertyValue('--platform-art-color').trim() || '#22d3ee';
};

export const useSignalHandoff = (pageRoot: Ref<HTMLElement | null>) => {
  let media: ReturnType<typeof gsap.matchMedia> | undefined;

  onMounted(async () => {
    await nextTick();
    const root = pageRoot.value;
    if (!root) return;

    const { MotionPathPlugin } = await import('gsap/MotionPathPlugin');
    gsap.registerPlugin(MotionPathPlugin);
    media = gsap.matchMedia();

    media.add(
      {
        animate: '(prefers-reduced-motion: no-preference)'
      },
      (context) => {
        const { animate } = context.conditions as { animate: boolean };
        const buttons = gsap.utils.toArray<HTMLElement>('.motion-platform-button', root);
        const signalLayer = root.querySelector<HTMLElement>('.motion-signal-layer');
        const signalSvg = signalLayer?.querySelector<SVGSVGElement>('svg');
        const signalPath = signalLayer?.querySelector<SVGPathElement>('.motion-signal-path');
        const signalDot = signalLayer?.querySelector<HTMLElement>('.motion-signal-dot');
        const receiver = root.querySelector<HTMLElement>('.motion-radio-receiver');
        const radioCard = root.querySelector<HTMLElement>('.motion-radio-card');
        const radioCover = root.querySelector<HTMLElement>('.motion-radio-cover');
        const radioCopy = gsap.utils.toArray<HTMLElement>('.motion-radio-copy > *', root);
        const radioProgress = root.querySelector<HTMLElement>('.motion-radio-progress');
        const cleanup: Array<() => void> = [];
        let activeButton: HTMLElement | undefined;
        let handoff: gsap.core.Timeline | undefined;
        let readyCall: gsap.core.Tween | undefined;
        let signalReady = false;
        let syncFrame = 0;

        const resetSignalLayer = () => {
          if (!signalLayer || !signalPath || !signalDot) return;
          gsap.set(signalLayer, { autoAlpha: 0 });
          gsap.set(signalPath, { strokeDasharray: 0, strokeDashoffset: 0 });
          gsap.set(signalDot, { autoAlpha: 0, x: 0, y: 0 });
        };

        const activateGlass = (button?: HTMLElement) => {
          buttons.forEach((item) => item.classList.toggle('is-signal-active', item === button));
          if (!button || !animate) return;

          const pulse = button.querySelector<HTMLElement>('.motion-platform-pulse');
          const glow = pulse?.querySelector<HTMLElement>('b');
          if (!pulse || !glow) return;

          gsap.set(pulse, { autoAlpha: 1 });
          gsap.fromTo(glow, {
            autoAlpha: 0,
            xPercent: -145,
            scaleX: 0.52
          }, {
            autoAlpha: 0.82,
            xPercent: 190,
            scaleX: 1.18,
            duration: 0.72,
            ease: 'power2.inOut',
            overwrite: 'auto',
            onComplete: () => gsap.set(pulse, { autoAlpha: 0 })
          });
        };

        const updateSignalPath = (button: HTMLElement) => {
          if (!signalLayer || !signalSvg || !signalPath || !receiver) return '';

          const layerRect = signalLayer.getBoundingClientRect();
          const buttonRect = button.getBoundingClientRect();
          const receiverRect = receiver.getBoundingClientRect();
          const startX = buttonRect.right - layerRect.left - 8;
          const startY = buttonRect.top + buttonRect.height / 2 - layerRect.top;
          const endX = receiverRect.left + receiverRect.width / 2 - layerRect.left;
          const endY = receiverRect.top + receiverRect.height / 2 - layerRect.top;
          const distance = Math.max(120, endX - startX);
          const d = [
            `M ${startX} ${startY}`,
            `C ${startX + distance * 0.28} ${startY - 54},`,
            `${endX - distance * 0.3} ${endY + 44},`,
            `${endX} ${endY}`
          ].join(' ');

          signalSvg.setAttribute('viewBox', `0 0 ${layerRect.width} ${layerRect.height}`);
          signalPath.setAttribute('d', d);
          return d;
        };

        const animateReception = (color: string) => {
          if (!radioCard) return gsap.timeline();

          radioCard.classList.remove('is-radio-pending');
          gsap.set(radioCard, { '--radio-signal-color': color });
          gsap.set(receiver, { color });

          return gsap.timeline()
            .fromTo(radioCard, {
              scale: 0.985,
              filter: 'brightness(1)'
            }, {
              scale: 1.025,
              filter: 'brightness(1.24)',
              boxShadow: `0 0 46px ${color}88`,
              duration: 0.18,
              ease: 'power2.out',
              immediateRender: false
            })
            .to(radioCard, {
              scale: 1,
              filter: 'brightness(1)',
              boxShadow: `0 0 30px ${color}55`,
              duration: 0.42,
              ease: 'back.out(2)'
            })
            .fromTo(receiver, {
              autoAlpha: 0.95,
              scale: 0.45
            }, {
              autoAlpha: 0,
              scale: 3.8,
              duration: 0.62,
              ease: 'power2.out',
              immediateRender: false
            }, 0)
            .fromTo(radioCover, {
              rotationY: -88,
              scale: 0.9
            }, {
              rotationY: 0,
              scale: 1,
              duration: 0.58,
              ease: 'back.out(1.7)',
              immediateRender: false
            }, 0.06)
            .fromTo(radioCopy, {
              autoAlpha: 0,
              y: 12
            }, {
              autoAlpha: 1,
              y: 0,
              duration: 0.34,
              ease: 'power2.out',
              stagger: 0.07,
              immediateRender: false
            }, 0.16)
            .fromTo(radioProgress, {
              scaleX: 0.18,
              filter: `drop-shadow(0 0 0 ${color})`,
              transformOrigin: 'left center'
            }, {
              scaleX: 1,
              filter: `drop-shadow(0 0 9px ${color})`,
              duration: 0.52,
              ease: 'power2.out',
              immediateRender: false
            }, 0.2);
        };

        const transmit = (button: HTMLElement) => {
          const color = getPlatformColor(button);
          const pathData = updateSignalPath(button);
          activeButton = button;
          activateGlass(button);

          if (!animate || !pathData || !signalLayer || !signalPath || !signalDot) {
            resetSignalLayer();
            return;
          }

          handoff?.kill();
          if (radioCard) {
            const holdColor = radioCard.style.getPropertyValue('--radio-signal-color') || '#22d3ee';
            radioCard.style.setProperty('--radio-hold-color', holdColor);
            radioCard.classList.add('is-radio-pending');
          }
          const length = signalPath.getTotalLength();
          gsap.set(signalLayer, { autoAlpha: 1, '--signal-color': color });
          gsap.set(signalPath, {
            strokeDasharray: length,
            strokeDashoffset: length
          });
          gsap.set(signalDot, { autoAlpha: 1, x: 0, y: 0 });

          handoff = gsap.timeline({
            onComplete: resetSignalLayer
          })
            .fromTo(button, {
              scale: 0.97
            }, {
              scale: 1,
              duration: 0.28,
              ease: 'back.out(2.4)'
            }, 0)
            .to(signalPath, {
              strokeDashoffset: 0,
              duration: 0.62,
              ease: 'power2.inOut'
            }, 0.08)
            .to(signalDot, {
              motionPath: {
                path: signalPath,
                align: signalPath,
                alignOrigin: [0.5, 0.5]
              },
              duration: 0.7,
              ease: 'power2.inOut'
            }, 0.04)
            .add(() => {
              animateReception(color);
            }, 0.74)
            .to(signalLayer, {
              autoAlpha: 0,
              duration: 0.24,
              ease: 'power1.out'
            }, 0.84);
        };

        const syncActiveButton = (shouldTransmit = true) => {
          cancelAnimationFrame(syncFrame);
          syncFrame = requestAnimationFrame(() => {
            const nextActive = buttons.find((button) => button.classList.contains('is-active'));
            if (!nextActive || nextActive === activeButton) return;
            if (shouldTransmit && activeButton) transmit(nextActive);
            else {
              activeButton = nextActive;
              activateGlass(nextActive);
              if (radioCard) {
                radioCard.style.setProperty('--radio-signal-color', getPlatformColor(nextActive));
              }
            }
          });
        };

        resetSignalLayer();
        if (radioCard && animate) {
          gsap.to(radioCard, {
            y: -4,
            duration: 2.8,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
          });
        }

        const observer = new MutationObserver(() => {
          if (signalReady) syncActiveButton();
        });
        buttons.forEach((button) => {
          observer.observe(button, { attributes: true, attributeFilter: ['class'] });
          const onClick = () => {
            if (signalReady) syncActiveButton();
          };
          button.addEventListener('click', onClick);
          cleanup.push(() => button.removeEventListener('click', onClick));
        });
        cleanup.push(() => observer.disconnect());
        cleanup.push(() => cancelAnimationFrame(syncFrame));
        cleanup.push(() => handoff?.kill());
        cleanup.push(() => readyCall?.kill());

        readyCall = gsap.delayedCall(3.2, () => {
          signalReady = true;
          syncActiveButton(false);
        });
        return () => cleanup.forEach((remove) => remove());
      },
      root
    );
  });

  onUnmounted(() => {
    media?.revert();
  });
};
