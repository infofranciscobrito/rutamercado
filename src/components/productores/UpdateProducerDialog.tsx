import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitProducerUpdateRequest } from "@/lib/producers.functions";
import { PuebloTagsInput } from "./PuebloTagsInput";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producerName: string;
  marketNames: string;
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png"] as const;

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function UpdateProducerDialog({
  open,
  onOpenChange,
  producerName,
  marketNames,
}: Props) {
  const submitFn = useServerFn(submitProducerUpdateRequest);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [pueblo, setPueblo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMessage("");
    setEmail("");
    setPueblo("");
    setSubmitting(false);
    setDone(false);
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSelectFile = (file: File) => {
    if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
      toast.error("Formato no válido. Solo se aceptan archivos JPG o PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("La imagen es demasiado grande. El tamaño máximo es 5MB.");
      return;
    }
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) {
      toast.error("Completa todos los campos.");
      return;
    }
    setSubmitting(true);
    try {
      let logoPayload:
        | { logo_base64: string; logo_filename: string; logo_mime: "image/jpeg" | "image/png" }
        | undefined;
      if (logoFile) {
        const base64 = await fileToBase64(logoFile);
        logoPayload = {
          logo_base64: base64,
          logo_filename: logoFile.name,
          logo_mime: logoFile.type as "image/jpeg" | "image/png",
        };
      }
      await submitFn({
        data: {
          producer_name: producerName,
          market_names: marketNames,
          requester_email: email.trim(),
          message: message.trim(),
          ...(logoPayload ?? {}),
        },
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-[#18253f]">
            Actualizar perfil de productor
          </DialogTitle>
          <DialogDescription>
            Cuéntanos qué información necesitas actualizar y te respondemos pronto.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-[#18253f]">
              Recibimos tu solicitud. Actualizaremos tu información en 24 horas o menos.
            </p>
            <Button
              className="w-full bg-[#54b678] text-[#18253f] hover:bg-[#3f9560]"
              onClick={() => handleOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="producer-ref">Productor</Label>
              <Input
                id="producer-ref"
                value={producerName}
                readOnly
                className="mt-1 bg-[#FFF8EC]"
              />
            </div>
            <div>
              <Label htmlFor="producer-message">¿Qué información deseas actualizar?</Label>
              <Textarea
                id="producer-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                required
                rows={5}
                placeholder="Describe los cambios que necesitas..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="producer-email">Tu email de contacto</Label>
              <Input
                id="producer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Logo o imagen del mercado</Label>
              <p className="mt-1 text-xs text-[#18253f]/60">
                Sube el logo o imagen de tu mercado. Formatos aceptados: JPG, PNG. Tamaño
                máximo: 5MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleSelectFile(f);
                }}
              />
              {logoPreview ? (
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#18253f]/10 bg-[#FFF8EC] p-3">
                  <img
                    src={logoPreview}
                    alt="Vista previa"
                    className="h-20 w-20 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#18253f]">
                      {logoFile?.name}
                    </p>
                    <p className="text-xs text-[#18253f]/60">
                      {logoFile ? `${(logoFile.size / 1024).toFixed(0)} KB` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeLogo}
                    className="text-[#18253f]/60 hover:text-destructive"
                    aria-label="Quitar imagen"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full border-dashed border-[#54b678]/40 text-[#18253f] hover:border-[#54b678] hover:bg-[#54b678]/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="mr-2 h-4 w-4 text-[#54b678]" />
                  Seleccionar imagen
                </Button>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#54b678] text-[#18253f] hover:bg-[#3f9560]"
            >
              {submitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
