import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TARGET_W = 1600;
const TARGET_H = 900; // 16:9
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

async function detectMimeFromBytes(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47)
    return "image/png";
  if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return "image/gif";
  if (
    head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
    head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
  )
    return "image/webp";
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

/** Center-crop the image to 16:9 and resize to 1600x900, output WebP. */
async function cropTo16x9(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const srcRatio = img.width / img.height;
  const targetRatio = TARGET_W / TARGET_H;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (srcRatio > targetRatio) {
    // wider than 16:9 → crop sides
    sw = Math.round(img.height * targetRatio);
    sx = Math.round((img.width - sw) / 2);
  } else if (srcRatio < targetRatio) {
    // taller than 16:9 → crop top/bottom
    sh = Math.round(img.width / targetRatio);
    sy = Math.round((img.height - sh) / 2);
  }
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_W;
  canvas.height = TARGET_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", 0.85),
  );
  if (!blob) throw new Error("No se pudo generar la imagen procesada.");
  return blob;
}

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload16x9({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ALLOWED.includes(file.type as (typeof ALLOWED)[number])) {
      toast.error("Formato no permitido. Usa JPG, PNG, WebP o GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("La imagen excede 5 MB.");
      return;
    }
    const detected = await detectMimeFromBytes(file);
    if (!detected) {
      toast.error("El archivo no es una imagen válida.");
      return;
    }
    setUploading(true);
    try {
      const blob = await cropTo16x9(file);
      const path = `submissions/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage
        .from("market-images")
        .upload(path, blob, { upsert: false, contentType: "image/webp" });
      if (error) throw error;
      const { data } = supabase.storage.from("market-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Foto subida y ajustada");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[#1c1e37]/10 bg-[#FFF8EC]">
          <img src={value} alt="Vista previa" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Quitar foto"
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#1c1e37]/20 bg-[#FFF8EC] text-center text-sm text-[#1c1e37]/70 transition-colors hover:border-[#f8b625] hover:bg-[#f8b625]/5 ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-[#f8b625]" />
              <span>Procesando…</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-[#f8b625]" />
              <span className="font-medium">Sube una foto</span>
              <span className="text-xs text-[#1c1e37]/55">
                JPG, PNG o WebP · máx 5 MB · se ajusta automáticamente a 16:9
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      )}
    </div>
  );
}
