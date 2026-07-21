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
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function LogoUploader({ value, onChange, disabled = false }: Props) {
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
      const path = `emprendedores/${crypto.randomUUID()}.${extByType[detected]}`;
      const { error } = await supabase.storage
        .from("market-images")
        .upload(path, file, { upsert: false, contentType: detected });
      if (error) throw error;
      const { data } = supabase.storage.from("market-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Logo subido");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="mt-1 flex items-center gap-3">
      {value ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#18253f]/15 bg-white">
          <img src={value} alt="Logo" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Quitar logo"
            disabled={disabled}
            className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/85 disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#18253f]/20 bg-[#FFF8EC] text-[#18253f]/40">
          <Upload className="h-5 w-5" />
        </div>
      )}
      <label
        className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#54b678] bg-white px-3 py-2 text-sm font-medium text-[#54b678] hover:bg-[#54b678]/10 ${
          uploading || disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Subiendo…
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {value ? "Cambiar logo" : "Subir logo"}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>
    </div>
  );
}
