import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Orientation = "landscape" | "portrait" | "square";

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
  onOrientation?: (o: Orientation) => void;
}

export function MarketImage({ src, alt, className, fit = "cover", onOrientation }: Props) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset loaded state when src changes so new images start blurred again.
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  // Handle cached images: onLoad does not fire reliably when the browser
  // serves an image from cache, leaving the blur stuck. Check `complete`
  // after mount/src change and resolve manually if already available.
  useEffect(() => {
    if (!src) return;
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      setLoaded(true);
      if (fit === "contain" && onOrientation) {
        const { naturalWidth: w, naturalHeight: h } = img;
        if (w && h) {
          const ratio = w / h;
          onOrientation(
            ratio > 1.05 ? "landscape" : ratio < 0.95 ? "portrait" : "square",
          );
        }
      }
    }
  }, [src, fit, onOrientation]);

  if (src) {
    if (fit === "contain") {
      return (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={800}
          height={600}
          onLoad={(e) => {
            setLoaded(true);
            if (!onOrientation) return;
            const img = e.currentTarget;
            const { naturalWidth: w, naturalHeight: h } = img;
            if (!w || !h) return;
            const ratio = w / h;
            onOrientation(
              ratio > 1.05 ? "landscape" : ratio < 0.95 ? "portrait" : "square",
            );
          }}
          style={{
            filter: loaded ? "blur(0px)" : "blur(8px)",
            opacity: loaded ? 1 : 0.7,
            transition: "filter 500ms ease-out, opacity 500ms ease-out",
          }}
          className={`mx-auto block h-auto max-h-[72dvh] w-auto max-w-full object-contain object-center ${className ?? ""}`}
        />
      );
    }
    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={320}
        height={180}
        onLoad={() => setLoaded(true)}
        style={{
          filter: loaded ? "blur(0px)" : "blur(8px)",
          opacity: loaded ? 1 : 0.7,
          transition: "filter 500ms ease-out, opacity 500ms ease-out",
        }}
        className={`h-full w-full object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#54b678] to-[#18253f] ${className ?? ""}`}
      aria-label={alt}
    >
      <MapPin className="h-12 w-12 text-white/90" strokeWidth={2} />
    </div>
  );
}
