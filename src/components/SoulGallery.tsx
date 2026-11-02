import { useEffect, useRef, useState } from "react";
import { ArchGallery } from "@/components/ui/arch-gallery";

const CIRCLE = {
  night: { src: "/images/gallery-1.webp", alt: "An evening circle gathered under a tree strung with warm lights" },
  cacao: { src: "/images/gallery-2.webp", alt: "Eliana and friends holding fresh cacao pods on a farm" },
  kitchen: { src: "/images/gallery-3.webp", alt: "Friends cooking together in a big open kitchen" },
  hammock: { src: "/images/gallery-4.webp", alt: "Four women laughing together in a hillside hammock net" },
  blankets: { src: "/images/gallery-5.webp", alt: "Circle members resting close together on blankets in the sun" },
  workshop: { src: "/images/gallery-6.webp", alt: "A hands-on workshop around an outdoor table in the mountains" },
  deck: { src: "/images/gallery-7.webp", alt: "People resting on mats on a bamboo deck at sunset" },
  laughing: { src: "/images/gallery-8.webp", alt: "Eliana laughing with friends at a lively evening get-together" },
  picnic: { src: "/images/gallery-9.webp", alt: "A picnic on blankets under the trees by a lake" },
};

/** Homepage "Moments from the circle". */
const HOME = [CIRCLE.night, CIRCLE.cacao, CIRCLE.kitchen, CIRCLE.hammock, CIRCLE.blankets, CIRCLE.workshop, CIRCLE.deck];
/** Journaling Hive "Moments from the Hive": adds the Hive photos and centres on the blankets photo. The lake
 *  group is left out because it is already that page's hero. The middle five (shown on phones) hold both new ones. */
const HIVE = [CIRCLE.night, CIRCLE.cacao, CIRCLE.laughing, CIRCLE.kitchen, CIRCLE.blankets, CIRCLE.hammock, CIRCLE.picnic, CIRCLE.workshop, CIRCLE.deck];

/** Width of the fanned stage relative to one card, from ArchGallery's own layout math. */
const stageUnits = (count: number) => 1.2 + (count - 1) * 0.58;

export default function SoulGallery({ set = "home" }: { set?: "home" | "hive" }) {
  const photos = (set === "hive" ? HIVE : HOME).map((image) => ({ image }));
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ count: 7, width: 200 });

  // The arch has a fixed pixel width, so size the cards to the space available;
  // narrower screens show only the middle photos (5 on phones, 7 on tablets) so the
  // cards stay legible. The count keeps the same parity as the set so it trims evenly.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const available = el.clientWidth;
      let count = Math.min(photos.length, available < 640 ? 5 : available < 1000 ? 7 : 9);
      if ((photos.length - count) % 2) count -= 1;
      const width = Math.min(220, Math.floor(available / stageUnits(count)));
      setSize((s) => (s.count === count && s.width === width ? s : { count, width }));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    fit();
    return () => observer.disconnect();
  }, [photos.length]);

  const trim = (photos.length - size.count) / 2;
  const items = photos.slice(trim, photos.length - trim);

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
