import { useCallback, useRef, useState } from "react";
import { Crosshair } from "lucide-react";

interface Props {
  src: string;
  valueX: number;
  valueY: number;
  onChange: (x: number, y: number) => void;
  disabled?: boolean;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function FocalPointSelector({
  src,
  valueX,
  valueY,
  onChange,
  disabled,
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const fromEvent = useCallback((clientX: number, clientY: number) => {
    const el = boxRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: clamp(((clientX - r.left) / r.width) * 100),
      y: clamp(((clientY - r.top) / r.height) * 100),
    };
  }, []);

  const handleMove = (clientX: number, clientY: number) => {
    const p = fromEvent(clientX, clientY);
    if (!p) return;
    setHover(p);
    if (dragging) onChange(Math.round(p.x), Math.round(p.y));
  };

  const handleDown = (clientX: number, clientY: number) => {
    if (disabled) return;
    const p = fromEvent(clientX, clientY);
    if (!p) return;
    setDragging(true);
    onChange(Math.round(p.x), Math.round(p.y));
  };

  const indicator = hover ?? { x: valueX, y: valueY };

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#18253f]/70">
        Arrastra o haz clic para elegir el área de preview
      </p>
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <div
          ref={boxRef}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseLeave={() => {
            setHover(null);
            setDragging(false);
          }}
          onMouseDown={(e) => handleDown(e.clientX, e.clientY)}
          onMouseUp={() => setDragging(false)}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (t) handleDown(t.clientX, t.clientY);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            if (t) handleMove(t.clientX, t.clientY);
          }}
          onTouchEnd={() => setDragging(false)}
          className={`relative aspect-video w-full select-none overflow-hidden rounded-lg bg-black ${
            disabled ? "pointer-events-none opacity-60" : "cursor-crosshair"
          }`}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
          />
          <div className="pointer-events-none absolute inset-0 bg-black/35" />
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-75"
            style={{ left: `${indicator.x}%`, top: `${indicator.y}%` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#FACC15] bg-white/20 shadow-[0_0_0_2px_rgba(0,0,0,0.4)] backdrop-blur-[1px]">
              <Crosshair className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[#18253f]/10 bg-[#FFF8EC]">
            <img
              src={src}
              alt="Vista previa del card"
              className="h-full w-full"
              style={{
                objectFit: "cover",
                objectPosition: `${valueX}% ${valueY}%`,
              }}
              draggable={false}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#18253f]/60">
            <span>
              {Math.round(valueX)}% · {Math.round(valueY)}%
            </span>
            <button
              type="button"
              onClick={() => onChange(50, 50)}
              disabled={disabled}
              className="rounded-md border border-[#18253f]/15 px-2 py-1 font-medium text-[#18253f] hover:bg-[#FFF8EC] disabled:opacity-50"
            >
              Centrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
