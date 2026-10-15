import { useEffect, useRef } from "react";

import "./soul-bee.css";

type Point = { x: number; y: number };

type Bezier = {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
};

export type SoulBeeProps = {
  /** A selector for the span wrapping the word “soul”. */
  anchorSelector?: string;
  /** Set false if the parent hero’s own motion is disabled. */
  enabled?: boolean;
  /** Called after the bee has left the hero. */
  onComplete?: () => void;
};

const point = (x: number, y: number): Point => ({ x, y });

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const cubicPoint = (segment: Bezier, t: number): Point => {
  const inverse = 1 - t;
  return {
    x:
      inverse ** 3 * segment.p0.x +
      3 * inverse ** 2 * t * segment.p1.x +
      3 * inverse * t ** 2 * segment.p2.x +
      t ** 3 * segment.p3.x,
    y:
      inverse ** 3 * segment.p0.y +
      3 * inverse ** 2 * t * segment.p1.y +
      3 * inverse * t ** 2 * segment.p2.y +
      t ** 3 * segment.p3.y,
  };
};

const cubicTangent = (segment: Bezier, t: number): Point => {
  const inverse = 1 - t;
  return {
    x:
      3 * inverse ** 2 * (segment.p1.x - segment.p0.x) +
      6 * inverse * t * (segment.p2.x - segment.p1.x) +
      3 * t ** 2 * (segment.p3.x - segment.p2.x),
    y:
      3 * inverse ** 2 * (segment.p1.y - segment.p0.y) +
      6 * inverse * t * (segment.p2.y - segment.p1.y) +
      3 * t ** 2 * (segment.p3.y - segment.p2.y),
  };
};

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

/**
 * A route is expressed as percentages of the hero, not pixels. That means the
 * flight scales with the hero while still letting mobile take a shorter route.
 */
const buildRoute = (origin: Point, compact: boolean): Bezier[] => {
  if (compact) {
    const first = point(clamp(origin.x + 25, 58, 80), clamp(origin.y - 5, 23, 43));
    const second = point(64, 55);
    const third = point(81, 71);
    const exit = point(75, 109);

    return [
      { p0: origin, p1: point(origin.x + 9, origin.y - 9), p2: point(first.x - 2, first.y - 9), p3: first },
      { p0: first, p1: point(86, 42), p2: point(75, 61), p3: second },
      { p0: second, p1: point(57, 65), p2: point(73, 60), p3: third },
      { p0: third, p1: point(89, 83), p2: point(74, 95), p3: exit },
    ];
  }

  const first = point(clamp(origin.x + 15, 58, 68), clamp(origin.y - 10, 23, 38));
  const second = point(74, 46);
  const third = point(54, 55);
  const fourth = point(78, 66);
  const exit = point(75, 109);

  return [
    { p0: origin, p1: point(origin.x + 4, origin.y - 8), p2: point(first.x - 7, first.y - 10), p3: first },
    { p0: first, p1: point(77, 30), p2: point(84, 41), p3: second },
    { p0: second, p1: point(66, 56), p2: point(52, 42), p3: third },
    { p0: third, p1: point(49, 66), p2: point(73, 54), p3: fourth },
    { p0: fourth, p1: point(87, 78), p2: point(75, 95), p3: exit },
  ];
};

export default function SoulBee({
  anchorSelector = "[data-soul-bee-anchor]",
  enabled = true,
  onComplete,
}: SoulBeeProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const beeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const bee = beeRef.current;
    const host = layer?.parentElement;

    if (!layer || !bee || !host || !enabled) return;

    const anchor = host.querySelector<HTMLElement>(anchorSelector);
    if (!anchor) {
      console.warn(`SoulBee could not find ${anchorSelector} inside its hero.`);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 720px)");
    let animationFrame = 0;
    let elapsed = 0;
    let lastFrame = 0;
    let hasEntered = false;
    let readyToFly = false;
    let inView = false;
    let finished = false;
    let startTimer = 0;
    let route: Bezier[] = [];
    let bounds = { width: 0, height: 0 };

    const measure = () => {
      const heroBox = host.getBoundingClientRect();
      const wordBox = anchor.getBoundingClientRect();
      bounds = { width: heroBox.width, height: heroBox.height };

      const origin = point(
        ((wordBox.left - heroBox.left + wordBox.width * 0.56) / heroBox.width) * 100,
        ((wordBox.top - heroBox.top + wordBox.height * 0.58) / heroBox.height) * 100,
      );
      route = buildRoute(origin, compact.matches);
    };

    const place = (progress: number) => {
      if (!route.length || !bounds.width || !bounds.height) return;

      const scaled = easeInOut(progress) * route.length;
      const index = Math.min(Math.floor(scaled), route.length - 1);
      const t = Math.min(scaled - index, 1);
      const current = cubicPoint(route[index], t);
      const tangent = cubicTangent(route[index], Math.min(t + 0.015, 1));
      const angle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;
      const x = (current.x / 100) * bounds.width;
      const y = (current.y / 100) * bounds.height;

      bee.style.transform = `translate3d(${x - 27}px, ${y - 24}px, 0) rotate(${angle}deg)`;
      bee.style.opacity = progress > 0.94 ? String((1 - progress) / 0.06) : "1";
    };

    const stop = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrame = 0;
    };

    const tick = (now: number) => {
      if (!inView || document.hidden || finished) {
        stop();
        return;
      }

      if (!lastFrame) lastFrame = now;
      elapsed += now - lastFrame;
      lastFrame = now;

      const duration = compact.matches ? 5200 : 7200;
      const progress = Math.min(elapsed / duration, 1);
      place(progress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        finished = true;
        bee.dataset.complete = "true";
        onComplete?.();
      }
    };

    const resume = () => {
      if (
        !hasEntered ||
        !readyToFly ||
        finished ||
        animationFrame ||
        !inView ||
        document.hidden ||
        reducedMotion.matches
      ) {
        return;
      }
      animationFrame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (hasEntered) return;
      hasEntered = true;
      // Let the existing portal text settle before the bee makes its entrance.
      startTimer = window.setTimeout(() => {
        readyToFly = true;
        resume();
      }, 850);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          start();
          resume();
        } else {
          stop();
        }
      },
      { threshold: 0.35 },
    );

    const resizeObserver = new ResizeObserver(() => {
      measure();
      if (reducedMotion.matches) place(0.14);
    });

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else resume();
    };

    measure();
    observer.observe(host);
    resizeObserver.observe(host);
    document.addEventListener("visibilitychange", onVisibilityChange);

    if (reducedMotion.matches) {
      bee.dataset.reducedMotion = "true";
      place(0.14);
    }

    return () => {
      stop();
      window.clearTimeout(startTimer);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [anchorSelector, enabled, onComplete]);

  return (
    <div ref={layerRef} className="soul-bee-layer" aria-hidden="true">
      <div ref={beeRef} className="soul-bee" data-complete="false">
        <svg viewBox="0 0 72 60" focusable="false" aria-hidden="true">
          <g className="soul-bee__wings">
            <ellipse className="soul-bee__wing soul-bee__wing--far" cx="36" cy="19" rx="16" ry="6" />
            <ellipse className="soul-bee__wing soul-bee__wing--near" cx="42" cy="25" rx="16" ry="6" />
          </g>
          <g className="soul-bee__body">
            <path d="M16 32c0-10 9-17 23-17s22 7 22 17-8 17-22 17S16 42 16 32Z" />
            <path className="soul-bee__stripe" d="M31 17c-2 9-2 18 0 30" />
            <path className="soul-bee__stripe" d="M41 15c-2 10-2 20 0 34" />
            <path className="soul-bee__stripe" d="M51 19c-2 8-2 16 0 27" />
          </g>
          <g className="soul-bee__face">
            <circle cx="20" cy="31" r="11" />
            <path className="soul-bee__antenna" d="M16 21c-3-6-7-6-8-3M22 21c1-7 6-8 8-5" />
            <circle className="soul-bee__eye" cx="17" cy="30" r="1.15" />
            <circle className="soul-bee__eye" cx="23" cy="30" r="1.15" />
            <path className="soul-bee__smile" d="M17.5 35c1.8 1.6 3.8 1.6 5.6 0" />
          </g>
          <path className="soul-bee__stinger" d="m61 32 7 4-7 4Z" />
        </svg>
      </div>
    </div>
  );
}
