import { useEffect, useState } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { upsertMarket } from "@/lib/admin-markets.functions";
import {
  PETS_OPTIONS,
  PARKING_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  PAYMENT_METHODS_OPTIONS,
  FAMILY_FRIENDLY_OPTIONS,
  FOOD_AREA_OPTIONS,
} from "@/lib/submissions.functions";

import {
  MARKET_CATEGORIES,
  MARKET_REGIONS,
  type Market,
} from "@/types/market";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

import {
  RecurrenceFields,
  type RecurrenceFormShape,
} from "@/components/rutamercado/RecurrenceFields";
import { FocalPointSelector } from "./FocalPointSelector";

type PaymentMethod = (typeof PAYMENT_METHODS_OPTIONS)[number];

type FormValues = RecurrenceFormShape & {
  name: string;
  description: string;
  category: string;
  region: string;
  municipality: string;
  address: string;
  image_url: string;
  organizer_name: string;
  organizer_phone: string;
  organizer_email: string;
  organizer_instagram: string;
  organizer_contact_url: string;
  is_active: boolean;
  destacado: boolean;
  focal_x: number;
  focal_y: number;
  pets: string;
  parking: string;
  accessibility: string;
  payment_methods: PaymentMethod[];
  family_friendly: string;
  food_area: string;
};

const empty: FormValues = {
  name: "",
  description: "",
  category: MARKET_CATEGORIES[0],
  region: MARKET_REGIONS[0],
  municipality: "",
  address: "",
  recurrence_type: "unico",
  recurrence_day_of_week: "",
  recurrence_week_of_month: "",
  recurrence_start_date: "",
  recurrence_end_date: "",
  start_time: "09:00",
  end_time: "14:00",

  image_url: "",
  organizer_name: "",
  organizer_phone: "",
  organizer_email: "",
  organizer_instagram: "",
  organizer_contact_url: "",
  is_active: true,
  destacado: false,
  focal_x: 50,
  focal_y: 50,
  pets: "",
  parking: "",
  accessibility: "",
  payment_methods: [],
  family_friendly: "",
  food_area: "",
};


function marketToForm(m: Market): FormValues {
  return {
    name: m.name,
    description: m.description ?? "",
    category: m.category,
    region: m.region,
    municipality: m.municipality,
    address: m.address,
    recurrence_type: m.recurrence_type ?? "unico",
    recurrence_day_of_week: m.recurrence_day_of_week ?? "",
    recurrence_week_of_month: m.recurrence_week_of_month ?? "",
    recurrence_start_date: m.recurrence_start_date ?? "",
    recurrence_end_date: m.recurrence_end_date ?? "",
    start_time: m.start_time.slice(0, 5),
    end_time: m.end_time.slice(0, 5),
    image_url: m.image_url ?? "",
    organizer_name: m.organizer_name ?? "",
    organizer_phone: m.organizer_phone ?? "",
    organizer_email: m.organizer_email ?? "",
    organizer_instagram: m.organizer_instagram ?? "",
    organizer_contact_url: (m as { organizer_contact_url?: string | null }).organizer_contact_url ?? "",
    is_active: m.is_active,
    destacado: Boolean((m as { destacado?: boolean }).destacado),
    focal_x: m.focal_x ?? 50,
    focal_y: m.focal_y ?? 50,
    pets: m.pets ?? "",
    parking: m.parking ?? "",
    accessibility: m.accessibility ?? "",
    payment_methods: (m.payment_methods ?? []) as PaymentMethod[],
    family_friendly: m.family_friendly ?? "",
    food_area: m.food_area ?? "",
  };
}


function normalizeUrl(input: string): string | null {
  const v = (input ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export function MarketFormDrawer({
  open,
  onOpenChange,
  market,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  market: Market | null;
}) {
  const queryClient = useQueryClient();
  const upsertFn = useServerFn(upsertMarket);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, control, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: empty,
  });

  useEffect(() => {
    if (open) reset(market ? marketToForm(market) : empty);
  }, [open, market, reset]);

  const imageUrl = watch("image_url");

  const mutation = useMutation({
    mutationFn: async (v: FormValues) => {
      return upsertFn({
        data: {
          id: market?.id,
          name: v.name,
          description: v.description || null,
          category: v.category,
          region: v.region,
          municipality: v.municipality,
          address: v.address,
          start_time: v.start_time,
          end_time: v.end_time,
          recurrence_type: v.recurrence_type,
          recurrence_day_of_week:
            v.recurrence_type === "unico" ? null : v.recurrence_day_of_week || null,
          recurrence_week_of_month:
            v.recurrence_type === "unico" || v.recurrence_type === "semanal"
              ? null
              : v.recurrence_week_of_month || null,
          recurrence_start_date: v.recurrence_start_date,
          recurrence_end_date: v.recurrence_end_date || null,
          image_url: v.image_url || null,
          organizer_name: v.organizer_name,
          organizer_phone: v.organizer_phone || null,
          organizer_email: v.organizer_email || null,
          organizer_instagram: v.organizer_instagram || null,
          organizer_contact_url: normalizeUrl(v.organizer_contact_url),
          is_active: v.is_active,
          destacado: v.destacado,
          focal_x: v.focal_x,
          focal_y: v.focal_y,
          pets: v.pets || null,
          parking: v.parking || null,
          accessibility: v.accessibility || null,
          payment_methods:
            v.payment_methods.length > 0 ? v.payment_methods : null,
          family_friendly: v.family_friendly || null,
          food_area: v.food_area || null,
        },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "markets"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success(market ? "Mercado actualizado" : "Mercado creado");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFile = async (file: File) => {
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
    const MAX_BYTES = 5 * 1024 * 1024;
    if (!ALLOWED.includes(file.type as typeof ALLOWED[number])) {
      toast.error("Formato no permitido. Usa JPG, PNG, WebP o GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("La imagen excede 5 MB.");
      return;
    }
    const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    const isPng =
      head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
    const isGif = head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46;
    const isWebp =
      head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
      head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50;
    if (!isJpeg && !isPng && !isGif && !isWebp) {
      toast.error("El archivo no es una imagen válida.");
      return;
    }
    const detectedType = isJpeg
      ? "image/jpeg"
      : isPng
        ? "image/png"
        : isGif
          ? "image/gif"
          : "image/webp";
    const extByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    };
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}.${extByType[detectedType]}`;
      const { error } = await supabase.storage
        .from("market-images")
        .upload(path, file, { upsert: false, contentType: detectedType });
      if (error) throw error;
      const { data } = supabase.storage.from("market-images").getPublicUrl(path);
      setValue("image_url", data.publicUrl, { shouldDirty: true });
      setValue("focal_x", 50, { shouldDirty: true });
      setValue("focal_y", 50, { shouldDirty: true });
      toast.success("Imagen subida");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{market ? "Editar Mercado" : "Agregar Mercado"}</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="mt-6 space-y-4"
          autoComplete="off"
        >
          <Field label="Nombre del mercado *">
            <Input {...register("name", { required: true })} />
          </Field>
          <Field label="Descripción">
            <Textarea rows={3} {...register("description")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría">
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MARKET_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Región">
              <Controller
                control={control}
                name="region"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MARKET_REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
          <Field label="Municipio">
            <Input {...register("municipality", { required: true })} />
          </Field>
          <Field label="Dirección *">
            <Input {...register("address", { required: true })} />
          </Field>

          <RecurrenceFields control={control} watch={watch} compact />

          <Field label="Imagen del mercado">
            <div className="space-y-2">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-32 w-full object-cover rounded-md" />
              ) : null}
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  {...register("image_url")}
                />
                <label className="inline-flex items-center justify-center gap-1 rounded-md border px-3 text-sm cursor-pointer hover:bg-accent">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Subir
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </label>
              </div>
            </div>
          </Field>
          {imageUrl ? (
            <Controller
              control={control}
              name="focal_x"
              render={({ field: fx }) => (
                <Controller
                  control={control}
                  name="focal_y"
                  render={({ field: fy }) => (
                    <FocalPointSelector
                      src={imageUrl}
                      valueX={fx.value}
                      valueY={fy.value}
                      onChange={(x, y) => {
                        fx.onChange(x);
                        fy.onChange(y);
                      }}
                    />
                  )}
                />
              )}
            />
          ) : null}
          {/* Fuente: markets.organizer_name del registro editado. Nunca de la sesión del admin. */}
          <Field label="Nombre del organizador">
            <div data-lpignore="true">
              <Input
                type="text"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                {...register("organizer_name")}
                name="contact-field-d"
                id="contact-field-d"
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            {/* Fuente: markets.organizer_phone del registro editado. Nunca de la sesión del admin. */}
            <Field label="Teléfono">
              <div data-lpignore="true">
                <Input
                  type="text"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
                  {...register("organizer_phone")}
                  name="contact-field-a"
                  id="contact-field-a"
                />
              </div>
            </Field>
            {/* Fuente: markets.organizer_email del registro editado. Nunca de la sesión del admin. */}
            <Field label="Email">
              <div data-lpignore="true">
                <Input
                  type="text"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
                  {...register("organizer_email")}
                  name="contact-field-b"
                  id="contact-field-b"
                />
              </div>
            </Field>
          </div>
          <Field label="Perfil de redes sociales">
            {/* Fuente: markets.organizer_instagram. Input de texto genérico con name/id neutros
                para que LastPass/1Password no lo detecten como campo social/login. */}
            <Controller
              control={control}
              name="organizer_instagram"
              render={({ field }) => (
                <Input
                  type="text"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name="contact-field-e"
                  id="contact-field-e"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
                />
              )}
            />
          </Field>
          <Field label="Enlace de contacto">
            {/* URL opcional (Linktree, WhatsApp, web, etc.). Se guarda en markets.organizer_contact_url. */}
            <Controller
              control={control}
              name="organizer_contact_url"
              render={({ field }) => (
                <Input
                  type="text"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  placeholder="https://..."
                  name="contact-field-url"
                  id="contact-field-url"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                />
              )}
            />
          </Field>
          <div className="space-y-3 rounded-md border border-dashed p-3">

            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Servicios e instalaciones (opcional)
            </p>
            <AdminRadioField
              control={control}
              name="pets"
              label="🐕 ¿Aceptan mascotas?"
              options={PETS_OPTIONS}
            />
            <AdminRadioField
              control={control}
              name="parking"
              label="🅿️ ¿Hay estacionamiento?"
              options={PARKING_OPTIONS}
            />
            <AdminRadioField
              control={control}
              name="accessibility"
              label="♿ ¿Es accesible?"
              options={ACCESSIBILITY_OPTIONS}
            />
            <Field label="💳 Métodos de pago">
              <Controller
                control={control}
                name="payment_methods"
                render={({ field }) => (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PAYMENT_METHODS_OPTIONS.map((opt) => {
                      const checked = field.value.includes(opt);
                      const id = `admin-payment-${opt}`;
                      return (
                        <label
                          key={opt}
                          htmlFor={id}
                          className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                        >
                          <Checkbox
                            id={id}
                            checked={checked}
                            onCheckedChange={(v) => {
                              if (v) field.onChange([...field.value, opt]);
                              else
                                field.onChange(
                                  field.value.filter(
                                    (x: PaymentMethod) => x !== opt,
                                  ),
                                );
                            }}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </Field>
            <AdminRadioField
              control={control}
              name="family_friendly"
              label="👶 ¿Es familiar?"
              options={FAMILY_FRIENDLY_OPTIONS}
            />
            <AdminRadioField
              control={control}
              name="food_area"
              label="🍴 ¿Tiene área de comida?"
              options={FOOD_AREA_OPTIONS}
            />
          </div>

          <Controller
            control={control}
            name="is_active"

            render={({ field }) => (
              <label className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Activo</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
          <Controller
            control={control}
            name="destacado"
            render={({ field }) => (
              <label className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Mercado destacado</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-background pb-2">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-[#54b678] text-[#18253f] hover:bg-[#54b678]/90"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function AdminRadioField({
  control,
  name,
  label,
  options,
}: {
  control: Control<FormValues>;
  name: "pets" | "parking" | "accessibility" | "family_friendly" | "food_area";
  label: string;
  options: readonly string[];
}) {
  return (
    <Field label={label}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup
            value={field.value || ""}
            onValueChange={field.onChange}
            className="grid gap-1.5"
          >
            {options.map((opt) => {
              const id = `admin-${name}-${opt}`;
              return (
                <label
                  key={opt}
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <RadioGroupItem id={id} value={opt} />
                  <span>{opt}</span>
                </label>
              );
            })}
          </RadioGroup>
        )}
      />
    </Field>
  );
}

