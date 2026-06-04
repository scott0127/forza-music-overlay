import { nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';

export const useSupportEnergyMotion = (pageRoot: Ref<HTMLElement | null>) => {
  let media: ReturnType<typeof gsap.matchMedia> | undefined;

  onMounted(async () => {
    await nextTick();
    const root = pageRoot.value;
    if (!root) return;

    const { MorphSVGPlugin } = await import('gsap/MorphSVGPlugin');
    gsap.registerPlugin(MorphSVGPlugin);
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
        if (!animate) return;

        const cleanup: Array<() => void> = [];
        gsap.utils.toArray<HTMLElement>('.motion-support-energy', root).forEach((panel) => {
          const tabs = gsap.utils.toArray<HTMLButtonElement>('.motion-drink-tab', panel);
          const photos = gsap.utils.toArray<HTMLImageElement>('.motion-drink-photo', panel);
          const shape = panel.querySelector<SVGPathElement>('.motion-blueprint-shape');
          const drinkTargets = gsap.utils.toArray<SVGPathElement>('.motion-blueprint-target', panel);
          const detailGroups = gsap.utils.toArray<SVGGElement>('.motion-drink-details', panel);
          const orbit = panel.querySelector<HTMLElement>('.motion-drink-orbit');
          const label = panel.querySelector<HTMLElement>('.motion-drink-label');
          const preview = panel.querySelector<HTMLElement>('.motion-drink-cursor-preview');
          const stage = panel.querySelector<HTMLElement>('.support-drink-stage');
          const blueprint = panel.querySelector<SVGSVGElement>('.motion-drink-blueprint');
          const releaseSection = panel.closest<HTMLElement>('.desktop-release');
          if (!tabs.length || !shape || !orbit || !label || !preview || !stage || !blueprint) return;

          let activeDrink = 'pour-over';
          let morph: gsap.core.Timeline | undefined;
          let detailIdle: gsap.core.Tween | undefined;
          const coffeeTextPath = shape.getAttribute('d') ?? '';
          const previewX = gsap.quickTo(preview, 'x', { duration: 0.34, ease: 'power3.out' });
          const previewY = gsap.quickTo(preview, 'y', { duration: 0.34, ease: 'power3.out' });

          const showPreview = (drink = activeDrink) => {
            photos.forEach((photo) => photo.classList.toggle('is-active', photo.dataset.drink === drink));
            gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'power2.out' });
          };
          const triggerReleaseHandoff = (drink: string) => {
            releaseSection?.dispatchEvent(new CustomEvent('drink-lab:brew', {
              bubbles: true,
              detail: { drink }
            }));
          };
          const hidePreview = () => {
            gsap.to(preview, { autoAlpha: 0, scale: 0.9, duration: 0.24, ease: 'power2.out' });
          };
          const followPointer = (event: PointerEvent) => {
            const rect = panel.getBoundingClientRect();
            previewX(event.clientX - rect.left + 20);
            previewY(event.clientY - rect.top + 18);
          };

          gsap.set(preview, { autoAlpha: 0, scale: 0.9, x: 16, y: 16 });
          gsap.set(shape, { transformOrigin: 'center center' });
          gsap.set(orbit, { autoAlpha: 0, scale: 0.5 });
          gsap.set(detailGroups, { autoAlpha: 0, scale: 0.82, transformOrigin: 'center center' });

          tabs.forEach((tab) => {
            const tabLiquid = tab.querySelector<SVGPathElement>('.motion-drink-liquid');
            const tabSvg = tab.querySelector<SVGSVGElement>('svg');
            const tabDetails = tabSvg ? gsap.utils.toArray<SVGElement>('path:not(.motion-drink-liquid), circle', tabSvg) : [];

            const enter = () => {
              gsap.to(tab, { y: -5, scale: 1.04, duration: 0.3, ease: 'power2.out' });
              gsap.to(tabLiquid, {
                y: -3,
                scaleY: 1.14,
                transformOrigin: 'bottom center',
                duration: 0.42,
                ease: 'sine.inOut',
                repeat: 1,
                yoyo: true
              });
              gsap.to(tabSvg, { rotation: -3, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 });
              gsap.fromTo(tabDetails, {
                strokeDashoffset: 8
              }, {
                strokeDashoffset: 0,
                duration: 0.46,
                stagger: 0.035,
                ease: 'power2.out'
              });
              showPreview(tab.dataset.drink);
            };
            const leave = () => {
              gsap.to(tab, { y: 0, scale: 1, duration: 0.36, ease: 'power2.out' });
            };
            const choose = () => {
              const nextDrink = tab.dataset.drink;
              const nextShape = drinkTargets.find((target) => target.dataset.drink === nextDrink);
              if (!nextDrink || !nextShape) return;

              activeDrink = nextDrink;
              morph?.kill();
              tabs.forEach((item) => {
                const isActive = item === tab;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-pressed', String(isActive));
              });
              label.textContent = tab.dataset.label ?? '';
              showPreview(nextDrink);
              detailIdle?.kill();
              const nextDetails = panel.querySelector<SVGGElement>(
                nextDrink === 'pour-over' ? '.motion-detail-coffee' : nextDrink === 'boba' ? '.motion-detail-boba' : '.motion-detail-lemon'
              );

              morph = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
                .to(detailGroups, {
                  autoAlpha: 0,
                  scale: 0.82,
                  duration: 0.22
                }, 0)
                .to(shape, {
                  morphSVG: { shape: coffeeTextPath, type: 'rotational', map: 'complexity', smooth: 'auto' },
                  duration: 0.48
                }, 0)
                .to(shape, {
                  morphSVG: { shape: nextShape, type: 'rotational', map: 'complexity', smooth: 'auto' },
                  duration: 0.88
                }, 0.48)
                .fromTo(nextDetails, {
                  autoAlpha: 0,
                  scale: 0.74
                }, {
                  autoAlpha: 1,
                  scale: 1,
                  duration: 0.46,
                  ease: 'back.out(1.8)',
                  onComplete: () => {
                    if (!nextDetails) return;
                    detailIdle = gsap.to(nextDetails, {
                      y: -3,
                      duration: 1.35,
                      ease: 'sine.inOut',
                      repeat: -1,
                      yoyo: true
                    });
                  }
                }, 1.12)
                .fromTo(orbit, {
                  autoAlpha: 0.8,
                  scale: 0.52
                }, {
                  autoAlpha: 0,
                  scale: 1.48,
                  duration: 0.72,
                  ease: 'sine.out'
                }, 1.06)
                .fromTo(label, {
                  autoAlpha: 0,
                  y: 8
                }, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.34,
                  ease: 'power2.out',
                  onComplete: () => triggerReleaseHandoff(nextDrink)
                }, 1.14);
            };

            tab.addEventListener('pointerenter', enter);
            tab.addEventListener('pointerleave', leave);
            tab.addEventListener('click', choose);
            cleanup.push(() => {
              tab.removeEventListener('pointerenter', enter);
              tab.removeEventListener('pointerleave', leave);
              tab.removeEventListener('click', choose);
            });
          });

          if (finePointer) {
            const rotateX = gsap.quickTo(blueprint, 'rotationX', { duration: 0.44, ease: 'power3.out' });
            const rotateY = gsap.quickTo(blueprint, 'rotationY', { duration: 0.44, ease: 'power3.out' });
            const tiltBlueprint = (event: PointerEvent) => {
              const rect = stage.getBoundingClientRect();
              rotateX(gsap.utils.clamp(-7, 7, ((event.clientY - rect.top) / rect.height - 0.5) * -14));
              rotateY(gsap.utils.clamp(-9, 9, ((event.clientX - rect.left) / rect.width - 0.5) * 18));
            };
            const resetBlueprint = () => {
              rotateX(0);
              rotateY(0);
            };
            panel.addEventListener('pointermove', followPointer);
            panel.addEventListener('pointerleave', hidePreview);
            const enterPanel = () => showPreview();
            panel.addEventListener('pointerenter', enterPanel);
            stage.addEventListener('pointermove', tiltBlueprint);
            stage.addEventListener('pointerleave', resetBlueprint);
            cleanup.push(() => {
              panel.removeEventListener('pointerenter', enterPanel);
              panel.removeEventListener('pointermove', followPointer);
              panel.removeEventListener('pointerleave', hidePreview);
              stage.removeEventListener('pointermove', tiltBlueprint);
              stage.removeEventListener('pointerleave', resetBlueprint);
            });
          }
          cleanup.push(() => morph?.kill());
          cleanup.push(() => detailIdle?.kill());
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
