import { MapPin } from "lucide-react";

type Orientation = "landscape" | "portrait" | "square";

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
  onOrientation?: (o: Orientation) => void;
}

export function MarketImage({ src, alt, className, fit = "cover", onOrientation }: Props) {
  if (src) {
    if (fit === "contain") {
      return (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={(e) => {
            if (!onOrientation) return;
            const img = e.currentTarget;
            const { naturalWidth: w, naturalHeight: h } = img;
            if (!w || !h) return;
            const ratio = w / h;
            onOrientation(
              ratio > 1.05 ? "landscape" : ratio < 0.95 ? "portrait" : "square",
            );
          }}
          className={`mx-auto block h-auto max-h-[72dvh] w-auto max-w-full object-contain object-center ${className ?? ""}`}
        />
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f8b625] to-[#1c1e37] ${className ?? ""}`}
      aria-label={alt}
    >
      <MapPin className="h-12 w-12 text-white/90" strokeWidth={2} />
    </div>
  );
}
