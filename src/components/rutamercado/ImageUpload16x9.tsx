import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const extByType: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
      };
      const path = `submissions/${crypto.randomUUID()}.${extByType[detected]}`;
      const { error } = await supabase.storage
        .from("market-images")
        .upload(path, file, { upsert: false, contentType: detected });
      if (error) throw error;
      const { data } = supabase.storage.from("market-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Foto subida completa");
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
                JPG, PNG o WebP · máx 5 MB · se conserva completa
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
