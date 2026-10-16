import { useEffect, useRef, useState } from "react";
import { ArchGallery } from "@/components/ui/arch-gallery";

const PHOTOS = [
  { src: "/images/gallery-1.webp", alt: "An evening circle gathered under a tree strung with warm lights" },
  { src: "/images/gallery-2.webp", alt: "Eliana and friends holding fresh cacao pods on a farm" },
  { src: "/images/gallery-3.webp", alt: "Friends cooking together in a big open kitchen" },
  { src: "/images/gallery-4.webp", alt: "Four women laughing together in a hillside hammock net" },
  { src: "/images/gallery-5.webp", alt: "Circle members resting close together on blankets in the sun" },
  { src: "/images/gallery-6.webp", alt: "A hands-on workshop around an outdoor table in the mountains" },
  { src: "/images/gallery-7.webp", alt: "People resting on mats on a bamboo deck at sunset" },
].map((image) => ({ image }));

/** Width of the fanned stage relative to one card, from ArchGallery's own layout math. */
const stageUnits = (count: number) => 1.2 + (count - 1) * 0.58;

export default function SoulGallery() {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ count: 7, width: 200 });

  // The arch has a fixed pixel width, so size the cards to the space available;
  // narrow screens show the middle five photos so the cards stay legible.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const available = el.clientWidth;
      const count = available < 640 ? 5 : 7;
      const width = Math.min(220, Math.floor(available / stageUnits(count)));
      setSize((s) => (s.count === count && s.width === width ? s : { count, width }));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    fit();
    return () => observer.disconnect();
  }, []);

  const trim = (PHOTOS.length - size.count) / 2;
  const items = PHOTOS.slice(trim, PHOTOS.length - trim);

  return (
    <div ref={box}>
      <ArchGallery
        items={items}
        cardWidth={size.width}
        cardHeight={Math.round((size.width * 4) / 3)}
        cornerRadius={20}
      />
    </div>
  );
}
