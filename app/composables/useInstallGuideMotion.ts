import { nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';

export const useInstallGuideMotion = (pageRoot: Ref<HTMLElement | null>) => {
  let context: gsap.Context | null = null;
  let media: gsap.MatchMedia | null = null;

  onMounted(async () => {
    await nextTick();

    const root = pageRoot.value;
    const install = root?.querySelector<HTMLElement>('.install-lab');

    if (!root || !install) return;

    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    context = gsap.context(() => {
      media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const revealItems = gsap.utils.toArray<HTMLElement>(
          '.install-column, .install-column .ready-note, .install-column .guide-carousel',
          install
        );

        gsap.set(revealItems, { autoAlpha: 0, y: 34 });
        gsap.to(revealItems, {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: install,
            start: 'top 72%',
            once: true
          }
        });

        gsap.to(install.querySelectorAll('.install-column .ready-note'), {
          backgroundPosition: '120% 50%',
          ease: 'none',
          scrollTrigger: {
            trigger: install,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          }
        });
      });

      media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const hoverTargets = gsap.utils.toArray<HTMLElement>(
          '.install-column .ready-note, .install-column .usage-card, .install-column .install-card, .install-column .demo-panel',
          install
        );
        const cleanups: Array<() => void> = [];

        hoverTargets.forEach((target) => {
          const onEnter = () => {
            gsap.to(target, {
              y: -6,
              scale: 1.012,
              duration: 0.28,
              ease: 'power3.out',
              overwrite: 'auto'
            });
          };

          const onLeave = () => {
            gsap.to(target, {
              y: 0,
              scale: 1,
              duration: 0.36,
              ease: 'power3.out',
              overwrite: 'auto'
            });
          };

          target.addEventListener('mouseenter', onEnter);
          target.addEventListener('mouseleave', onLeave);

          cleanups.push(() => {
            target.removeEventListener('mouseenter', onEnter);
            target.removeEventListener('mouseleave', onLeave);
          });
        });

        return () => cleanups.forEach((cleanup) => cleanup());
      });
    }, root);
  });

  onUnmounted(() => {
    media?.revert();
    context?.revert();
    media = null;
    context = null;
  });
};
