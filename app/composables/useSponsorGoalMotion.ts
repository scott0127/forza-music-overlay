import { nextTick, onMounted, onUnmounted, type Ref } from 'vue';
import { gsap } from 'gsap';

export const useSponsorGoalMotion = (pageRoot: Ref<HTMLElement | null>) => {
  let media: ReturnType<typeof gsap.matchMedia> | undefined;

  onMounted(async () => {
    await nextTick();
    const root = pageRoot.value;
    if (!root) return;

    media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const cleanup: Array<() => void> = [];

      gsap.utils.toArray<HTMLElement>('.motion-sponsor-goal', root).forEach((goal) => {
        const lines = gsap.utils.toArray<SVGGeometryElement>('.motion-case-line', goal);
        const flows = gsap.utils.toArray<SVGPathElement>('.motion-case-flow', goal);
        const lenses = gsap.utils.toArray<SVGCircleElement>('.case-lens', goal);
        const caseScan = goal.querySelector<SVGPathElement>('.motion-case-scan');
        const meterScan = goal.querySelector<HTMLElement>('.motion-goal-scan');
        const device = goal.querySelector<HTMLElement>('.sponsor-goal-device');
        const tickerTrack = goal.querySelector<HTMLElement>('.motion-sponsor-ticker-track');
        const tickerGroup = tickerTrack?.querySelector<HTMLElement>('.sponsor-goal-ticker-group');
        if (!lines.length || !flows.length || !caseScan || !meterScan || !device) return;

        lines.forEach((line) => {
          const length = line.getTotalLength();
          gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
        });
        flows.forEach((flow) => {
          const length = flow.getTotalLength();
          gsap.set(flow, { strokeDasharray: `12 ${Math.max(18, length / 4)}`, strokeDashoffset: length });
        });
        gsap.set(caseScan, { autoAlpha: 0, y: 0 });
        gsap.set(meterScan, { xPercent: -135 });

        const intro = gsap.timeline({ delay: 4.1 })
          .fromTo(goal, {
            autoAlpha: 0,
            x: 24,
            scale: 0.96
          }, {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: 0.58,
            ease: 'power3.out'
          })
          .to(lines, {
            strokeDashoffset: 0,
            duration: 0.82,
            ease: 'power2.inOut',
            stagger: 0.055
          }, '<0.1');

        const flowIdle = gsap.to(flows, {
          strokeDashoffset: -110,
          duration: 2.8,
          ease: 'none',
          repeat: -1
        });
        const lensIdle = gsap.to(lenses, {
          filter: 'drop-shadow(0 0 7px rgba(103, 232, 249, 0.82))',
          duration: 1.55,
          ease: 'sine.inOut',
          stagger: 0.14,
          repeat: -1,
          yoyo: true
        });
        const scanIdle = gsap.timeline({ repeat: -1, repeatDelay: 2.4 })
          .fromTo(caseScan, {
            autoAlpha: 0,
            y: 0
          }, {
            autoAlpha: 0.82,
            y: 86,
            duration: 1.35,
            ease: 'power2.inOut'
          })
          .to(caseScan, { autoAlpha: 0, duration: 0.2 }, '<0.1')
          .fromTo(meterScan, {
            xPercent: -135
          }, {
            xPercent: 225,
            duration: 0.92,
            ease: 'power2.inOut'
          }, 0.34);
        const tickerDistance = tickerGroup?.offsetWidth ?? 0;
        const tickerIdle = tickerTrack && tickerDistance
          ? gsap.to(tickerTrack, {
              x: -tickerDistance,
              duration: Math.max(14, tickerDistance / 34),
              ease: 'none',
              repeat: -1
            })
          : undefined;

        const enter = () => {
          tickerIdle?.timeScale(0.42);
          gsap.to(device, {
            rotationY: -7,
            rotationX: 4,
            scale: 1.045,
            duration: 0.42,
            ease: 'power3.out'
          });
        };
        const leave = () => {
          tickerIdle?.timeScale(1);
          gsap.to(device, {
            rotationY: 0,
            rotationX: 0,
            scale: 1,
            duration: 0.58,
            ease: 'power3.out'
          });
        };

        goal.addEventListener('pointerenter', enter);
        goal.addEventListener('pointerleave', leave);
        cleanup.push(() => {
          goal.removeEventListener('pointerenter', enter);
          goal.removeEventListener('pointerleave', leave);
          intro.kill();
          flowIdle.kill();
          lensIdle.kill();
          scanIdle.kill();
          tickerIdle?.kill();
        });
      });

      return () => cleanup.forEach((remove) => remove());
    }, root);
  });

  onUnmounted(() => {
    media?.revert();
  });
};
