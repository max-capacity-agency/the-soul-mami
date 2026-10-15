import { useEffect, useState } from "react";
import GlyphPortal from "@/components/ui/glyph-portal";
import "@/styles/soul-portal.css";

const FRAUNCES = '"Fraunces", serif';
const FALLBACK = "Georgia, serif";

function Opening() {
  return (
    <>
      <p className="sp-eyebrow">Hola, welcome home</p>
      <div className="sp-below">
        <h1 className="sp-title">
          You are your own <em className="soul">missing piece.</em>
        </h1>
        <div className="sp-ctas">
          <a className="btn btn--primary" href="/garden/">Join my Garden</a>
        </div>
        <p className="sp-scroll" aria-hidden="true">Scroll to step inside &darr;</p>
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
      <h2>Mentor, facilitator, music maker, professional feeler of feelings.</h2>
      <p className="lead">
        Everything here exists for one reason: to help you get back in a
        healthy, loving marriage with yourself. Mind, body, and soul.
      </p>
      <div className="sp-ctas">
        <a className="btn btn--honey" href="/garden/">Join my Garden</a>
        <a className="btn btn--ghost sp-ghost" href="#doorways">Open the drawers</a>
      </div>
      <ul className="sp-trust">
        <li>TEDx speaker</li>
        <li>Author of two books</li>
        <li>200+ circles &amp; workshops facilitated</li>
      </ul>
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
    document.fonts.load('900 100px "Fraunces"', "SOUL").then(
      (faces) => finish(faces.length ? FRAUNCES : FALLBACK),
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
      fontWeight={900}
      scrollLength={1.8}
      enterLabel="Step inside"
      background={<Scene />}
      front={<Opening />}
      style={{
        "--gp-paper": "var(--cream)",
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
