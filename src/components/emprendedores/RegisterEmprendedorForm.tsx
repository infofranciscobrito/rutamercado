import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MARKET_REGIONS } from "@/types/market";
import {
  EMPRENDEDOR_CATEGORIES,
  submitEmprendedor,
  type EmprendedorCategory,
} from "@/lib/emprendedores.functions";

type Props = {
  onDone?: () => void;
  variant?: "dialog" | "inline";
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

export function RegisterEmprendedorForm({ onDone, variant = "dialog" }: Props) {
  const submitFn = useServerFn(submitEmprendedor);
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState<EmprendedorCategory | "">("");
  const [region, setRegion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [personaContacto, setPersonaContacto] = useState("");
  const [mercadosInteres, setMercadosInteres] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const regionOptions = useMemo(() => [...MARKET_REGIONS], []);

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
    if (!nombre.trim()) return toast.error("El nombre del negocio es obligatorio.");
    if (!descripcion.trim()) return toast.error("La descripción es obligatoria.");
    if (!categoria) return toast.error("Selecciona una categoría de producto.");
    if (!instagram.trim() && !email.trim() && !telefono.trim()) {
      return toast.error("Provee al menos un contacto (Instagram, email o teléfono).");
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
          nombre_negocio: nombre.trim(),
          descripcion: descripcion.trim(),
          categoria_producto: categoria,
          region: region || null,
          municipio: municipio.trim() || null,
          instagram: instagram.trim() || null,
          email: email.trim() || null,
          telefono: telefono.trim() || null,
          persona_contacto: personaContacto.trim() || null,
          mercados_interes: mercadosInteres.trim() || null,
          ...(logoPayload ?? {}),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["emprendedores"] });
      setDone(true);
      onDone?.();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar el registro. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const isInline = variant === "inline";
  const labelClass = isInline ? "text-[#18253f]" : "";
  const helpClass = isInline
    ? "mt-1 text-xs text-[#18253f]/60"
    : "mt-1 text-xs text-[#18253f]/60";

  if (done) {
    return (
      <div
        className={
          isInline
            ? "rounded-2xl border border-[#54b678]/30 bg-white p-8 text-center shadow-sm"
            : "py-4"
        }
      >
        <p className="text-base text-[#18253f]">
          ¡Gracias por registrarte! Revisaremos tu información y en 24 horas o
          menos tu perfil estará visible en el Directorio de Emprendedores.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isInline
          ? "space-y-5 rounded-2xl border border-[#18253f]/10 bg-white p-6 shadow-sm sm:p-8"
          : "space-y-4"
      }
      {...noFill}
    >
      <div>
        <Label htmlFor="emp-nombre" className={labelClass}>
          Nombre del negocio / emprendedor <span className="text-destructive">*</span>
        </Label>
        <Input
          id="emp-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          maxLength={200}
          className="mt-1"
          {...noFill}
        />
      </div>

      <div>
        <Label htmlFor="emp-desc" className={labelClass}>
          Descripción breve del negocio <span className="text-destructive">*</span>
        </Label>
        <p className={helpClass}>Qué vendes, 1-2 frases. Máx 500 caracteres.</p>
        <Textarea
          id="emp-desc"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          maxLength={500}
          rows={3}
          className="mt-2"
          {...noFill}
        />
      </div>

      <div>
        <Label htmlFor="emp-cat" className={labelClass}>
          Categoría de producto <span className="text-destructive">*</span>
        </Label>
        <Select value={categoria} onValueChange={(v) => setCategoria(v as EmprendedorCategory)}>
          <SelectTrigger id="emp-cat" className="mt-1">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {EMPRENDEDOR_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="emp-region" className={labelClass}>Región</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger id="emp-region" className="mt-1">
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
          <Label htmlFor="emp-mun" className={labelClass}>Municipio base</Label>
          <Input
            id="emp-mun"
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            maxLength={100}
            className="mt-1"
            {...noFill}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="emp-persona" className={labelClass}>Persona de contacto</Label>
        <Input
          id="emp-persona"
          value={personaContacto}
          onChange={(e) => setPersonaContacto(e.target.value)}
          maxLength={200}
          className="mt-1"
          placeholder="Opcional"
          {...noFill}
        />
      </div>

      <div>
        <Label htmlFor="emp-ig" className={labelClass}>Instagram</Label>
        <Input
          id="emp-ig"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          maxLength={300}
          placeholder="@tunegocio o https://instagram.com/tunegocio"
          className="mt-1"
          {...noFill}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="emp-email" className={labelClass}>Correo electrónico</Label>
          <Input
            id="emp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            {...noFill}
          />
        </div>
        <div>
          <Label htmlFor="emp-tel" className={labelClass}>Teléfono</Label>
          <Input
            id="emp-tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            maxLength={50}
            className="mt-1"
            {...noFill}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="emp-mercados" className={labelClass}>
          Mercados donde ha participado o le interesaría participar
        </Label>
        <p className={helpClass}>Separa por comas.</p>
        <Input
          id="emp-mercados"
          value={mercadosInteres}
          onChange={(e) => setMercadosInteres(e.target.value)}
          maxLength={1000}
          placeholder="Ej: Mercado Agrícola de Río Piedras, Bazar Santurce..."
          className="mt-2"
          {...noFill}
        />
      </div>

      <div>
        <Label className={labelClass}>Logo o foto representativa</Label>
        <p className={helpClass}>JPG o PNG, máximo 5MB.</p>
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
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#18253f]/10 bg-[#f7f7f5] p-3">
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
        className={
          isInline
            ? "h-12 w-full bg-[#54b678] text-base font-bold text-white hover:bg-[#439660]"
            : "w-full bg-[#54b678] text-white hover:bg-[#439660]"
        }
      >
        {submitting ? "Enviando..." : "Enviar registro"}
      </Button>
    </form>
  );
}
