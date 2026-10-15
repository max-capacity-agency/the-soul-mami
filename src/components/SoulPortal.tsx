import { useEffect, useState } from "react";
import GlyphPortal from "@/components/ui/glyph-portal";
import SoulBee from "./SoulBee";
import "@/styles/soul-portal.css";

const YOUNG_SERIF = '"Young Serif", serif';
const FALLBACK = "Georgia, serif";

function Opening() {
  return (
    <>
      {/* The big animated word is decorative, so the heading carries "soul" for screen readers and search. */}
      <h1 className="sp-lead-in">
        Remember your<span className="sp-sr-only"> soul</span>
      </h1>
      {/* SOUL itself is drawn as SVG, so this box over it is what SoulBee launches from. */}
      <span className="sp-word-anchor" data-soul-bee-anchor aria-hidden="true" />
      <div className="sp-below">
        <p className="sp-sub">
          Journaling circles, 1:1 mentoring, and music for coming home to who you already are.
        </p>
        <p className="sp-scroll" aria-hidden="true">Scroll to enter the garden &darr;</p>
      </div>
    </>
  );
}

function Scene() {
  return (
    <div className="sp-scene">
      <img src="/images/eliana-gold.jpg" alt="" decoding="async" fetchPriority="high" />
      <div className="sp-shade" />
    </div>
  );
}

function Inside() {
  return (
    <div className="sp-inside">
      <span className="eyebrow">Hola, I'm Eliana</span>
      <h2>Your marriage with yourself is the most important one you'll ever be in.</h2>
      <p className="lead">
        I'm a mentor, facilitator, and music maker. Not a guru, and not here
        to fix you. Everything here helps you know, trust, and show up as
        yourself: mind, body, and soul.
      </p>
      <div className="sp-ctas">
        <a className="btn btn--honey" href="/garden/">Join my Garden</a>
        <a className="btn btn--ghost sp-ghost" href="#doorways">Open the drawers</a>
      </div>
    </div>
  );
}

export default function SoulPortal() {
  const [face, setFace] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;
    const finish = (value: string) => {
      if (!settled) { settled = true; setFace(value); }
    };
    const timeout = window.setTimeout(() => finish(FALLBACK), 1600);
    document.fonts.load('400 100px "Young Serif"', "SOUL").then(
      (faces) => finish(faces.length ? YOUNG_SERIF : FALLBACK),
      () => finish(FALLBACK),
    );
    return () => { settled = true; clearTimeout(timeout); };
  }, []);

  if (!face) {
    return (
      <section className="soul-portal sp-pending" aria-label="SOUL">
        <Opening />
      </section>
    );
  }

  return (
    <GlyphPortal
      className="soul-portal"
      word="SOUL"
      focusChar="O"
      interactive={false}
      fontFamily={face}
      fontWeight={400}
      scrollLength={1.8}
      enterLabel="Step inside"
      background={<Scene />}
      front={<Opening />}
      pinLayer={<SoulBee />}
      style={{
        "--gp-paper": "var(--paper)",
        "--gp-ink": "var(--espresso)",
        "--gp-field": "var(--espresso)",
        "--gp-foreground": "var(--cream)",
        fontFamily: "var(--font-body)",
      }}
    >
      <Inside />
    </GlyphPortal>
  );
}
