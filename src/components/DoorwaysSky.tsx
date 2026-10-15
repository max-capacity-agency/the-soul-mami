import { useEffect, useRef, useState } from "react";
import { CloudShader } from "@/components/ui/cloud-shader";

const GOLDEN_HOUR = {
  skyTopColor: "#d9952b",
  skyBottomColor: "#f4e4c6",
  cloudColor: "#fdf6e8",
};

export default function DoorwaysSky() {
  // Count isn't rendered into markup, so reading the viewport here can't cause a hydration mismatch.
  const [count] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches ? 3 : 6,
  );

  // Pause the sky while the card stack has fully covered this section.
  const [covered, setCovered] = useState(false);
  const probe = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const section = probe.current?.closest<HTMLElement>("section");
    if (!section) return;
    const sync = () => setCovered(section.dataset.stackCovered === "true");
    const observer = new MutationObserver(sync);
    observer.observe(section, { attributes: true, attributeFilter: ["data-stack-covered"] });
    sync();
    return () => observer.disconnect();
  }, []);

  return (
    <>
    <span ref={probe} hidden />
    <CloudShader
      className="doorways-sky"
      speed={0.5}
      count={count}
      maxDpr={1}
      paused={covered}
      {...GOLDEN_HOUR}
    />
    </>
  );
}
