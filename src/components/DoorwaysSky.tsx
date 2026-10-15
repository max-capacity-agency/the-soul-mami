import { useState } from "react";
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

  return (
    <CloudShader
      className="doorways-sky"
      speed={0.5}
      count={count}
      maxDpr={1}
      {...GOLDEN_HOUR}
    />
  );
}
