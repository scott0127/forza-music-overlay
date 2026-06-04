import { nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';

export const useDesktopReleaseMotion = (pageRoot: Ref<HTMLElement | null>) => {
  let media: ReturnType<typeof gsap.matchMedia> | undefined;

  onMounted(async () => {
    await nextTick();
    const root = pageRoot.value;
    if (!root) return;

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

        gsap.utils.toArray<HTMLElement>('.desktop-release', root).forEach((section) => {
          const sponsor = section.querySelector<HTMLElement>('.sponsor-story');
          const releasePanel = section.querySelector<HTMLElement>('.download-panel');
          const routeLine = section.querySelector<HTMLElement>('.support-route-line');
          const routeSteps = gsap.utils.toArray<HTMLElement>('.support-route-step', section);
          const panelHead = releasePanel?.querySelector<HTMLElement>('.panel-head');
          const metaRows = releasePanel ? gsap.utils.toArray<HTMLElement>('.meta-row', releasePanel) : [];
          const snapshotItems = releasePanel ? gsap.utils.toArray<HTMLElement>('.snapshot-box p:not(.box-label)', releasePanel) : [];
          const snapshotBox = releasePanel?.querySelector<HTMLElement>('.snapshot-box');
          const downloadBox = releasePanel?.querySelector<HTMLElement>('.download-box');
          const downloadLink = releasePanel?.querySelector<HTMLElement>('.download-link');
          const downloadIcon = downloadLink?.querySelector<SVGElement>('.icon');

          if (!sponsor || !releasePanel || !routeLine || !panelHead || !snapshotBox || !downloadBox || !downloadLink) return;

          gsap.set([sponsor, releasePanel], {
            autoAlpha: 0,
            y: 24,
            transformOrigin: 'center top'
          });
          gsap.set(routeLine, {
            scaleX: 0,
            transformOrigin: 'left center'
          });
          gsap.set(routeSteps, {
            autoAlpha: 0,
            y: 12,
            scale: 0.94
          });
          gsap.set([panelHead, ...metaRows, snapshotBox, downloadBox], {
            autoAlpha: 0,
            y: 14
          });
          gsap.set(snapshotItems, {
            autoAlpha: 0,
            x: -10
          });
          gsap.set(releasePanel, {
            '--handoff-alpha': 0,
            '--handoff-x': '-18%'
          });

          const intro = gsap.timeline({
            defaults: { ease: 'power3.out' },
            delay: 0.1,
            paused: true
          });

          intro
            .to(sponsor, {
              autoAlpha: 1,
              y: 0,
              duration: 0.58
            }, 0)
            .to(releasePanel, {
              autoAlpha: 1,
              y: 0,
              duration: 0.58
            }, 0.08)
            .to(routeLine, {
              scaleX: 1,
              duration: 0.62
            }, 0.24)
            .to(routeSteps, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.42,
              stagger: 0.1
            }, 0.32)
            .to(panelHead, {
              autoAlpha: 1,
              y: 0,
              duration: 0.42
            }, 0.28)
            .to(metaRows, {
              autoAlpha: 1,
              y: 0,
              duration: 0.36,
              stagger: 0.07
            }, 0.46)
            .to(snapshotBox, {
              autoAlpha: 1,
              y: 0,
              duration: 0.42
            }, 0.72)
            .to(snapshotItems, {
              autoAlpha: 1,
              x: 0,
              duration: 0.34,
              stagger: 0.055
            }, 0.86)
            .to(downloadBox, {
              autoAlpha: 1,
              y: 0,
              duration: 0.42
            }, 1.08);

          const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            intro.play();
            observer.disconnect();
          }, {
            rootMargin: '0px 0px -18% 0px',
            threshold: 0.22
          });

          observer.observe(section);
          cleanup.push(() => observer.disconnect());

          const runHandoff = () => {
            if (intro.progress() < 1) intro.progress(1);
            gsap.timeline({ defaults: { ease: 'power2.out' } })
              .set(releasePanel, {
                '--handoff-alpha': 0.72,
                '--handoff-x': '-18%'
              })
              .to(releasePanel, {
                '--handoff-x': '116%',
                duration: 0.76,
                ease: 'power3.inOut'
              })
              .to(releasePanel, {
                '--handoff-alpha': 0,
                duration: 0.28
              }, '-=0.18')
              .fromTo(downloadBox, {
                y: 0,
                boxShadow: '0 0 0 rgba(34, 211, 238, 0)'
              }, {
                y: -2,
                boxShadow: '0 0 28px rgba(34, 211, 238, 0.16)',
                duration: 0.28,
                yoyo: true,
                repeat: 1
              }, 0.22);
          };

          const handoffHandler = () => runHandoff();
          section.addEventListener('drink-lab:brew', handoffHandler);
          cleanup.push(() => section.removeEventListener('drink-lab:brew', handoffHandler));

          if (finePointer) {
            const enterDownload = () => {
              gsap.to(downloadBox, {
                y: -3,
                borderColor: 'rgba(103, 232, 249, 0.34)',
                duration: 0.28,
                ease: 'power2.out'
              });
              gsap.to(downloadIcon, {
                y: -2,
                scale: 1.12,
                duration: 0.24,
                ease: 'back.out(1.7)'
              });
            };
            const leaveDownload = () => {
              gsap.to(downloadBox, {
                y: 0,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                duration: 0.32,
                ease: 'power2.out'
              });
              gsap.to(downloadIcon, {
                y: 0,
                scale: 1,
                duration: 0.28,
                ease: 'power2.out'
              });
            };

            downloadLink.addEventListener('pointerenter', enterDownload);
            downloadLink.addEventListener('pointerleave', leaveDownload);
            cleanup.push(() => {
              downloadLink.removeEventListener('pointerenter', enterDownload);
              downloadLink.removeEventListener('pointerleave', leaveDownload);
            });
          }
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
