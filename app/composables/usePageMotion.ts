import { nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';

export const usePageMotion = (pageRoot: Ref<HTMLElement | null>) => {
  let media: ReturnType<typeof gsap.matchMedia> | undefined;

  onMounted(async () => {
    await nextTick();
    if (!pageRoot.value) return;

    const { MorphSVGPlugin } = await import('gsap/MorphSVGPlugin');
    gsap.registerPlugin(MorphSVGPlugin);
    media = gsap.matchMedia();

    media.add(
      {
        animate: '(prefers-reduced-motion: no-preference)'
      },
      (context) => {
        const { animate } = context.conditions as { animate: boolean };
        if (!animate || !pageRoot.value) return;

        const platformButtons = gsap.utils.toArray<HTMLElement>('.motion-platform-button', pageRoot.value);
        const platformIcons = gsap.utils.toArray<HTMLElement>('.motion-platform-icon', pageRoot.value);
        const platformLabels = gsap.utils.toArray<HTMLElement>('.motion-platform-label', pageRoot.value);
        const platformMorphs: SVGPathElement[] = [];
        const platformTargets: SVGPathElement[] = [];
        const platformSeedPaths: string[] = [];
        const cleanup: Array<() => void> = [];

        platformButtons.forEach((button) => {
          const seed = button.querySelector<SVGElement>('.motion-platform-morph');
          const target = button.querySelector<SVGElement>('.motion-platform-morph-target');
          const art = button.querySelector<SVGSVGElement>('.motion-platform-art');
          const icon = button.querySelector<HTMLElement>('.motion-platform-icon');
          if (!seed || !target || !art || !icon) return;

          const artRect = art.getBoundingClientRect();
          const iconRect = icon.getBoundingClientRect();
          const viewBox = art.viewBox.baseVal;
          const scaleX = artRect.width / viewBox.width;
          const scaleY = artRect.height / viewBox.height;
          const radius = Math.min(20, artRect.height * 0.42);

          if (scaleX && scaleY) {
            seed.setAttribute('cx', `${(iconRect.left + iconRect.width / 2 - artRect.left) / scaleX}`);
            seed.setAttribute('cy', `${(iconRect.top + iconRect.height / 2 - artRect.top) / scaleY}`);
            seed.setAttribute('rx', `${radius / scaleX}`);
            seed.setAttribute('ry', `${radius / scaleY}`);
          }

          const morphPath = MorphSVGPlugin.convertToPath(seed)[0] as SVGPathElement;
          const targetPath = MorphSVGPlugin.convertToPath(target)[0] as SVGPathElement;
          platformMorphs.push(morphPath);
          platformTargets.push(targetPath);
          platformSeedPaths.push(morphPath.getAttribute('d') ?? '');
        });

        gsap.set('.motion-hero-badges > *', { autoAlpha: 0, y: -12 });
        gsap.set('.motion-title-stage', {
          '--title-row-gap': '-0.12em'
        });
        gsap.set('.motion-spectrum-bar', {
          autoAlpha: 0,
          scaleY: 0.08,
          transformOrigin: 'bottom center'
        });
        gsap.set('.motion-title-primary-letter', {
          autoAlpha: 0,
          filter: 'blur(10px)',
          scale: 0.92,
          y: 18,
          transformOrigin: 'center center'
        });
        gsap.set('.motion-title-overlay-letter', {
          autoAlpha: 0,
          filter: 'blur(12px)',
          y: 30,
          rotationX: -24,
          transformOrigin: 'center center'
        });
        gsap.set('.motion-title-overlay', {
          y: 10,
          transformOrigin: 'top left'
        });
        gsap.set([
          '.motion-hero-description',
          '.motion-platform-block',
          '.motion-hero-actions > *',
          '.motion-safety-note'
        ], { autoAlpha: 0 });
        gsap.set('.motion-hero-description', { y: 20 });
        gsap.set('.motion-platform-block', { y: 18 });
        gsap.set('.motion-hero-actions > *', { y: 18 });
        gsap.set('.motion-safety-note', { x: -18 });
        gsap.set(platformButtons, {
          autoAlpha: 1,
          '--platform-sheen-x': '-135%'
        });
        gsap.set(platformMorphs, { transformOrigin: 'center center' });
        gsap.set(platformIcons, {
          autoAlpha: 0,
          rotation: -90,
          scale: 0.35,
          transformOrigin: 'center center'
        });
        gsap.set(platformLabels, { autoAlpha: 0, x: -12 });
        const intro = gsap.timeline({
          defaults: { ease: 'power3.out' }
        });

        intro
          .to('.motion-hero-badges > *', {
            autoAlpha: 1,
            y: 0,
            duration: 0.38,
            stagger: 0.08
          }, 0)
          .to('.motion-spectrum-bar', {
            autoAlpha: 1,
            scaleY: 1,
            duration: 0.52,
            stagger: {
              amount: 0.24,
              from: 'center'
            }
          }, 0.12)
          .to('.motion-title-primary-letter', {
            autoAlpha: 1,
            filter: 'blur(0px)',
            scale: 1,
            y: 0,
            duration: 0.58,
            stagger: {
              each: 0.038,
              from: 'center'
            }
          }, 0.2)
          .to('.motion-title-primary-letter', {
            y: (index) => (index % 2 === 0 ? -2 : 2),
            duration: 0.14,
            ease: 'sine.inOut',
            repeat: 1,
            yoyo: true,
            stagger: 0.018
          }, 0.76)
          .to('.motion-title-stage', {
            '--title-row-gap': '-0.32em',
            duration: 0.58,
            ease: 'power3.out'
          }, 0.7)
          .to('.motion-title-overlay', {
            y: 0,
            duration: 0.62,
            ease: 'power3.out'
          }, 0.72)
          .to('.motion-title-overlay-letter', {
            autoAlpha: 1,
            filter: 'blur(0px)',
            y: 0,
            rotationX: 0,
            duration: 0.58,
            ease: 'power3.out',
            stagger: 0.052
          }, 0.78)
          .to('.motion-title-overlay', {
            '--overlay-sheen-alpha': 0.95,
            '--overlay-sheen-x': '128%',
            duration: 0.76,
            ease: 'power2.inOut'
          }, 1.1)
          .to('.motion-title-overlay', {
            '--overlay-sheen-alpha': 0,
            duration: 0.28,
            ease: 'power1.out'
          }, 1.7)
          .to('.motion-hero-description', {
            autoAlpha: 1,
            y: 0,
            duration: 0.52
          }, 1.18)
          .to('.motion-platform-block', {
            autoAlpha: 1,
            y: 0,
            duration: 0.38
          }, 1.36)
          .to(platformIcons, {
            autoAlpha: 1,
            rotation: 0,
            scale: 1,
            duration: 0.48,
            ease: 'back.out(2)',
            stagger: 0.12
          }, 1.48)
          .to(platformLabels, {
            autoAlpha: 1,
            x: 0,
            duration: 0.34,
            stagger: 0.12
          }, 3.22)
          .to(platformButtons, {
            '--platform-sheen-x': '135%',
            duration: 0.58,
            stagger: 0.1
          }, 3.4)
          .to('.motion-hero-actions > *', {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.1
          }, 3.72)
          .to('.motion-safety-note', {
            autoAlpha: 1,
            x: 0,
            duration: 0.48
          }, 3.98);

        platformMorphs.forEach((morph, index) => {
          intro.to(morph, {
            morphSVG: {
              shape: platformTargets[index],
              type: 'rotational',
              curveMode: true
            },
            duration: 0.64,
            ease: 'power3.inOut'
          }, 2.38 + index * 0.1);
        });

        gsap.to('.motion-spectrum-bar', {
          scaleY: (index) => 0.34 + ((index * 17) % 8) * 0.085,
          delay: 1.68,
          duration: 0.78,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          stagger: {
            each: 0.045,
            from: 'random'
          },
          transformOrigin: 'bottom center'
        });

        gsap.to('.motion-title-overlay', {
          '--overlay-flow-x': '100%',
          delay: 1.72,
          duration: 4.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });

        platformButtons.forEach((button) => {
          const icon = button.querySelector('.motion-platform-icon');
          const buttonIndex = platformButtons.indexOf(button);
          const morph = platformMorphs[buttonIndex];
          const target = platformTargets[buttonIndex];
          const seedPath = platformSeedPaths[buttonIndex];
          const activate = () => {
            if (morph && target && seedPath) {
              gsap.timeline({ defaults: { overwrite: 'auto' } })
                .to(morph, {
                  morphSVG: { shape: seedPath, type: 'rotational', curveMode: true },
                  duration: 0.22,
                  ease: 'power2.in'
                })
                .to(morph, {
                  morphSVG: { shape: target, type: 'rotational', curveMode: true },
                  duration: 0.46,
                  ease: 'power3.out'
                });
            }
            gsap.fromTo(button, {
              '--platform-sheen-x': '-135%',
              filter: 'brightness(1.38)'
            }, {
              '--platform-sheen-x': '135%',
              filter: 'brightness(1)',
              duration: 0.52,
              ease: 'power2.out',
              overwrite: 'auto'
            });
            gsap.fromTo(icon, {
              rotation: -16,
              scale: 0.72
            }, {
              rotation: 0,
              scale: 1,
              duration: 0.58,
              ease: 'elastic.out(1, 0.45)',
              overwrite: 'auto'
            });
          };

          button.addEventListener('click', activate);
          cleanup.push(() => button.removeEventListener('click', activate));
        });

        return () => cleanup.forEach((removeListener) => removeListener());
      },
      pageRoot.value
    );
  });

  onUnmounted(() => {
    media?.revert();
  });
};
