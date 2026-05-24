import { MapPin } from "lucide-react";

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
}

export function MarketImage({ src, alt, className }: Props) {
  if (src) {
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
