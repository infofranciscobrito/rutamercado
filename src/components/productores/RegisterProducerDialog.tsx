import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MARKET_CATEGORIES, MARKET_REGIONS } from "@/types/market";
import { registerProducer } from "@/lib/producer-registration.functions";
import { listProducerRegions } from "@/lib/producers.functions";
import { PuebloTagsInput } from "./PuebloTagsInput";
import { TipoMercadoMultiSelect } from "./TipoMercadoMultiSelect";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png"] as const;

const noFill = {
  autoComplete: "off",
  "data-lpignore": "true",
  "data-form-type": "other",
} as const;

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

export function RegisterProducerDialog({ open, onOpenChange }: Props) {
  const submitFn = useServerFn(registerProducer);
  const regionsListFn = useServerFn(listProducerRegions);
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [region, setRegion] = useState<string>("");
  const [pueblo, setPueblo] = useState<string>("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [website, setWebsite] = useState("");
  const [mercados, setMercados] = useState("");
  const [tipoMercado, setTipoMercado] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existingRegions = [] } = useQuery({
    queryKey: ["producers", "regions"],
    queryFn: () => regionsListFn(),
    enabled: open,
  });
  const regionOptions = useMemo(() => {
    const set = new Set<string>([...MARKET_REGIONS, ...existingRegions]);
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" }),
    );
  }, [existingRegions]);

  const reset = () => {
    setNombre("");
    setContacto("");
    setRegion("");
    setPueblo("");
    setEmail("");
    setTelefono("");
    setWebsite("");
    setMercados("");
    setTipoMercado("");
    setSubmitting(false);
    setDone(false);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
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
    if (!nombre.trim()) {
      toast.error("El nombre del productor es obligatorio.");
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
          nombre: nombre.trim(),
          contacto: contacto.trim() || null,
          region: region || null,
          pueblo: pueblo.trim() || null,
          email: email.trim() || null,
          telefono: telefono.trim() || null,
          website: website.trim() || null,
          mercados: mercados.trim(),
          tipo_mercado: tipoMercado.trim() || null,
          ...(logoPayload ?? {}),
        },
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar el registro. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-[#18253f]">
            Registro de productores
          </DialogTitle>
          {!done ? (
            <DialogDescription>
              Completa tus datos. Revisaremos la información y publicaremos tu perfil
              en el directorio.
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {done ? (
          <div className="py-4">
            <p className="text-sm text-[#18253f]">
              ¡Gracias por registrarte! Revisaremos tu información y en 24 horas o
              menos tu perfil estará visible en el directorio. Muchas gracias por su
              registro.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" {...noFill}>
            <div>
              <Label htmlFor="reg-nombre">
                Nombre del Mercado <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                maxLength={200}
                className="mt-1"
                {...noFill}
              />
            </div>

            <div>
              <Label htmlFor="reg-contacto">Persona de contacto</Label>
              <Input
                id="reg-contacto"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                maxLength={200}
                className="mt-1"
                {...noFill}
              />
            </div>

            <div>
              <Label htmlFor="reg-region">Región</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger id="reg-region" className="mt-1">
                  <SelectValue placeholder="Selecciona una región" />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reg-pueblo">Pueblo</Label>
              <p className="mt-1 text-xs text-[#18253f]/60">
                Puedes añadir uno o más pueblos (presiona coma o Enter).
              </p>
              <div className="mt-2">
                <PuebloTagsInput
                  id="reg-pueblo"
                  value={pueblo}
                  onChange={setPueblo}
                  placeholder="Ej: Ponce, Mayagüez..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  {...noFill}
                />
              </div>
              <div>
                <Label htmlFor="reg-telefono">Teléfono</Label>
                <Input
                  id="reg-telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  maxLength={50}
                  className="mt-1"
                  {...noFill}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reg-website">Página de redes sociales</Label>
              <Input
                id="reg-website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                maxLength={500}
                className="mt-1"
                {...noFill}
              />
            </div>

            <div>
              <Label htmlFor="reg-mercados">¿Qué tipo de mercado organizas?</Label>
              <Select value={mercados} onValueChange={setMercados}>
                <SelectTrigger id="reg-mercados" className="mt-1">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {MARKET_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Logo del productor</Label>
              <p className="mt-1 text-xs text-[#18253f]/60">
                JPG o PNG, máximo 5MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
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
                    <p className="truncate text-sm text-[#18253f]">{logoFile?.name}</p>
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
              {submitting ? "Enviando..." : "Enviar registro"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
