import { nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';

export const useHeroActionsMotion = (pageRoot: Ref<HTMLElement | null>) => {
  let context: gsap.Context | undefined;
  let media: ReturnType<typeof gsap.matchMedia> | undefined;
  const cleanup: Array<() => void> = [];

  onMounted(async () => {
    await nextTick();
    if (!pageRoot.value) return;

    const root = pageRoot.value;
    const actions = root.querySelector<HTMLElement>('.motion-hero-actions');
    const download = actions?.querySelector<HTMLElement>('.motion-download-cta');
    const snapshot = actions?.querySelector<HTMLElement>('.motion-snapshot-cta');
    const downloadChoices = download
      ? gsap.utils.toArray<HTMLElement>('.motion-download-choice', download)
      : [];
    const downloadIcons = download
      ? gsap.utils.toArray<HTMLElement>('.motion-download-icon', download)
      : [];
    const snapshotLines = snapshot
      ? gsap.utils.toArray<SVGPathElement>('svg path', snapshot)
      : [];

    if (!actions || !download || !snapshot || downloadIcons.length === 0) return;

    actions.classList.add('hero-actions-motion-ready');
    download.classList.add('hero-action-card', 'hero-action-download');
    snapshot.classList.add('hero-action-card', 'hero-action-snapshot');
    downloadIcons.forEach((icon) => icon.classList.add('hero-action-download-icon'));
    snapshotLines.forEach((line) => line.classList.add('hero-action-snapshot-line'));

    context = gsap.context(() => {
      gsap.set(actions, {
        '--hero-actions-frame-alpha': 0,
        '--hero-actions-frame-scale': 0.7
      });
      gsap.set([download, snapshot], {
        '--hero-action-corner-alpha': 0,
        '--hero-action-scan-x': '-135%'
      });
      gsap.set(download, {
        '--hero-action-divider-alpha': 0
      });
      gsap.set(downloadChoices, {
        '--download-choice-sheen-x': '-135%',
        '--download-choice-glass-alpha': 0,
        '--download-choice-border-alpha': 0,
        '--download-choice-gradient-alpha': 0,
        '--download-choice-gradient-x': '0%',
        '--download-choice-shadow-alpha': 0,
        '--download-choice-pointer-x': '50%',
        '--download-choice-pointer-y': '50%'
      });
    }, root);

    const runInContext = (animation: () => void) => {
      context?.add(animation);
    };

    const bind = (
      element: HTMLElement,
      event: keyof HTMLElementEventMap,
      handler: EventListener
    ) => {
      element.addEventListener(event, handler);
      cleanup.push(() => element.removeEventListener(event, handler));
    };

    media = gsap.matchMedia();
    media.add(
      {
        animate: '(prefers-reduced-motion: no-preference)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      (mediaContext) => {
        const { animate } = mediaContext.conditions as { animate: boolean };

        if (!animate) {
          gsap.set(actions, {
            '--hero-actions-frame-alpha': 0.65,
            '--hero-actions-frame-scale': 1
          });
          gsap.set([download, snapshot], {
            '--hero-action-corner-alpha': 0.72,
            '--hero-action-scan-x': '135%'
          });
          gsap.set(download, {
            '--hero-action-divider-alpha': 0.72
          });
          gsap.set(downloadChoices, {
            '--download-choice-sheen-x': '135%',
            '--download-choice-glass-alpha': 0,
            '--download-choice-border-alpha': 0
          });
          return;
        }

        /*
         * usePageMotion reveals both cards at 3.72s. This timeline adds the
         * frame assembly around that landing without competing for card y.
         */
        gsap.timeline({ delay: 3.48 })
          .to(actions, {
            '--hero-actions-frame-alpha': 0.78,
            '--hero-actions-frame-scale': 1,
            duration: 0.42,
            ease: 'power2.out'
          })
          .to([download, snapshot], {
            '--hero-action-corner-alpha': 0.84,
            duration: 0.28,
            stagger: 0.1,
            ease: 'power1.out'
          }, '<0.12')
          .to(download, {
            '--hero-action-scan-x': '135%',
            '--hero-action-divider-alpha': 0.88,
            duration: 0.72,
            ease: 'power2.inOut'
          }, '+=0.12')
          .to(downloadChoices, {
            '--download-choice-sheen-x': '135%',
            duration: 0.48,
            stagger: 0.08,
            ease: 'power2.inOut'
          }, '<0.08')
          .fromTo(download, {
            '--hero-action-glow-alpha': 0
          }, {
            '--hero-action-glow-alpha': 0.64,
            duration: 0.34,
            ease: 'sine.out',
            repeat: 1,
            yoyo: true
          }, '<0.08');
      },
      root
    );

    bind(download, 'pointerenter', () => runInContext(() => {
      gsap.to(download, {
        '--hero-action-glow-alpha': 0.42,
        '--hero-action-corner-alpha': 1,
        duration: 0.24,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      gsap.fromTo(downloadIcons, {
        y: -2
      }, {
        y: 4,
        duration: 0.24,
        ease: 'power2.in',
        repeat: 1,
        yoyo: true,
        overwrite: 'auto'
      });
    }));

    bind(download, 'pointerleave', () => runInContext(() => {
      gsap.to(download, {
        '--hero-action-glow-alpha': 0.14,
        '--hero-action-corner-alpha': 0.84,
        duration: 0.32,
        ease: 'sine.out',
        overwrite: 'auto'
      });
    }));

    downloadChoices.forEach((choice) => {
      const icon = choice.querySelector<HTMLElement>('.motion-download-icon');
      const otherChoices = downloadChoices.filter((item) => item !== choice);
      const restingSurfaceAlpha = choice.classList.contains('motion-download-choice-github') ? 0.11 : 0;

      bind(choice, 'pointerenter', () => runInContext(() => {
        gsap.timeline({ defaults: { overwrite: 'auto' } })
          .to(choice, {
            '--download-choice-glass-alpha': 0.94,
            '--download-choice-border-alpha': 0.86,
            '--download-choice-surface-alpha': 0.46,
            '--download-choice-gradient-alpha': 0.24,
            '--download-choice-gradient-x': '100%',
            '--download-choice-shadow-alpha': 0.3,
            y: -5,
            scale: 1.025,
            duration: 0.34,
            ease: 'power3.out'
          })
          .fromTo(choice, {
            '--download-choice-sheen-x': '-135%'
          }, {
            '--download-choice-sheen-x': '135%',
            duration: 0.62,
            ease: 'power2.inOut'
          }, '<0.04');

        gsap.to(otherChoices, {
          '--download-choice-muted-alpha': 0.2,
          scale: 0.988,
          duration: 0.28,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        gsap.to(download, {
          '--hero-action-divider-alpha': 1,
          duration: 0.32,
          ease: 'power3.out',
          overwrite: 'auto'
        });

        if (icon) {
          gsap.to(icon, {
            y: -2,
            scale: 1.08,
            rotation: -3,
            duration: 0.3,
            ease: 'back.out(1.8)',
            overwrite: 'auto'
          });
        }
      }));

      bind(choice, 'pointermove', ((event: PointerEvent) => runInContext(() => {
        const bounds = choice.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        gsap.to(choice, {
          '--download-choice-pointer-x': `${x}%`,
          '--download-choice-pointer-y': `${y}%`,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      })) as EventListener);

      bind(choice, 'pointerleave', () => runInContext(() => {
        gsap.to(choice, {
          '--download-choice-glass-alpha': 0,
          '--download-choice-border-alpha': 0,
          '--download-choice-surface-alpha': restingSurfaceAlpha,
          '--download-choice-gradient-alpha': 0,
          '--download-choice-gradient-x': '0%',
          '--download-choice-shadow-alpha': 0,
          '--download-choice-pointer-x': '50%',
          '--download-choice-pointer-y': '50%',
          y: 0,
          scale: 1,
          duration: 0.38,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        gsap.to(otherChoices, {
          '--download-choice-muted-alpha': 0,
          scale: 1,
          duration: 0.32,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        gsap.to(download, {
          '--hero-action-divider-alpha': 0.88,
          duration: 0.38,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        if (icon) {
          gsap.to(icon, {
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.34,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      }));
    });

    bind(snapshot, 'pointerenter', () => runInContext(() => {
      gsap.fromTo(snapshot, {
        '--hero-action-scan-x': '-135%'
      }, {
        '--hero-action-scan-x': '135%',
        '--hero-action-corner-alpha': 1,
        duration: 0.6,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
      gsap.fromTo(snapshotLines, {
        x: -2,
        autoAlpha: 0.42
      }, {
        x: 2,
        autoAlpha: 1,
        duration: 0.24,
        ease: 'power2.out',
        stagger: 0.07,
        repeat: 1,
        yoyo: true,
        overwrite: 'auto'
      });
    }));

    bind(snapshot, 'pointerleave', () => runInContext(() => {
      gsap.to(snapshot, {
        '--hero-action-corner-alpha': 0.84,
        duration: 0.3,
        ease: 'sine.out',
        overwrite: 'auto'
      });
    }));
  });

  onUnmounted(() => {
    cleanup.forEach((removeListener) => removeListener());
    media?.revert();
    context?.revert();
  });
};
