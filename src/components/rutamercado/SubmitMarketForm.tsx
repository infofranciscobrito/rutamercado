import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createMarketSubmission } from "@/lib/submissions.functions";
import { MARKET_CATEGORIES, MARKET_REGIONS } from "@/types/market";
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
import { ImageUpload16x9 } from "./ImageUpload16x9";
import {
  RecurrenceFields,
  type RecurrenceFormShape,
} from "./RecurrenceFields";

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
};

const defaults: FormValues = {
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
};

function normalizeUrl(input: string): string | undefined {
  const v = (input ?? "").trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export function SubmitMarketForm() {
  const [submitted, setSubmitted] = useState(false);
  const submitFn = useServerFn(createMarketSubmission);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaults });

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      submitFn({
        data: {
          name: v.name,
          description: v.description || undefined,
          category: v.category,
          region: v.region,
          municipality: v.municipality,
          address: v.address,
          start_time: v.start_time,
          end_time: v.end_time,
          recurrence_type: v.recurrence_type,
          recurrence_day_of_week: v.recurrence_day_of_week || undefined,
          recurrence_week_of_month: v.recurrence_week_of_month || undefined,
          recurrence_start_date: v.recurrence_start_date,
          recurrence_end_date: v.recurrence_end_date || undefined,
          image_url: v.image_url || undefined,
          organizer_name: v.organizer_name,
          organizer_phone: v.organizer_phone || undefined,
          organizer_email: v.organizer_email || undefined,
          organizer_instagram: v.organizer_instagram || undefined,
          organizer_contact_url: normalizeUrl(v.organizer_contact_url),
        },
      }),
    onSuccess: () => {
      toast.success("¡Mercado recibido! Nuestro equipo lo revisará en 1–2 días.");
      setSubmitted(true);
    },
    onError: (e: Error) => {
      toast.error("No se pudo enviar el mercado", {
        description: e.message,
      });
    },
  });

  const imageUrl = watch("image_url");

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center rm-shadow-warm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#22C55E]" />
        <h2 className="mt-4 font-display text-2xl text-[#18253f]">
          ¡Gracias! Recibimos tu mercado
        </h2>
        <p className="mt-3 text-[#18253f]/70">
          Nuestro equipo revisará la información y lo publicaremos en 1–2 días.
          Te contactaremos si necesitamos algo más.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#54b678] px-6 font-semibold text-[#18253f] hover:bg-[#3f9560]"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="mx-auto max-w-2xl space-y-6 rounded-2xl bg-white p-6 sm:p-8 rm-shadow-warm"
      noValidate
    >
      <Section title="Sobre el mercado">
        <Field label="Nombre del mercado *" error={errors.name?.message}>
          <Input
            {...register("name", { required: "Requerido", maxLength: 200 })}
            placeholder="Mercado del Pueblo"
            disabled={mutation.isPending}
          />
        </Field>
        <Field label="Descripción">
          <Textarea
            rows={3}
            {...register("description", { maxLength: 2000 })}
            placeholder="Cuéntanos brevemente qué se ofrece, ambiente, productos…"
            disabled={mutation.isPending}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría *">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={mutation.isPending}>
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
          <Field label="Región *">
            <Controller
              control={control}
              name="region"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={mutation.isPending}>
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
        <Field label="Municipio *" error={errors.municipality?.message}>
          <Input
            {...register("municipality", { required: "Requerido", maxLength: 120 })}
            placeholder="Ponce"
            disabled={mutation.isPending}
          />
        </Field>
        <Field label="Dirección *" error={errors.address?.message}>
          <Input
            {...register("address", { required: "Requerido", maxLength: 300 })}
            placeholder="Plaza Las Delicias, Calle Atocha"
            disabled={mutation.isPending}
          />
        </Field>
      </Section>

      <Section title="Cuándo ocurre">
        <RecurrenceFields control={control} watch={watch} disabled={mutation.isPending} />
      </Section>

      <Section title="Foto del mercado">
        <p className="-mt-2 text-sm text-[#18253f]/60">
          Opcional. Tu foto se recorta automáticamente al formato del directorio
          (16:9) para que se vea perfecta.
        </p>
        <ImageUpload16x9
          value={imageUrl}
          onChange={(url) => setValue("image_url", url, { shouldDirty: true })}
          disabled={mutation.isPending}
        />
      </Section>

      <Section title="Contacto del organizador">
        <Field label="Nombre del organizador *" error={errors.organizer_name?.message}>
          <Input
            {...register("organizer_name", { required: "Requerido", maxLength: 200 })}
            placeholder="José Santiago"
            disabled={mutation.isPending}
          />
        </Field>
        <p className="-mb-1 text-sm text-[#18253f]/60">
          Opcional: añade los medios de contacto que prefieras.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono">
            <Input
              {...register("organizer_phone", { maxLength: 50 })}
              placeholder="787-555-0123"
              disabled={mutation.isPending}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              {...register("organizer_email", { maxLength: 255 })}
              placeholder="contacto@ejemplo.com"
              disabled={mutation.isPending}
            />
          </Field>
        </div>
        <Field label="Perfil de redes sociales">
          <Input
            type="text"
            {...register("organizer_instagram", { maxLength: 100 })}
            disabled={mutation.isPending}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            readOnly
            onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
          />
        </Field>
        <Field label="Enlace de contacto">
          <Input
            type="text"
            {...register("organizer_contact_url", { maxLength: 500 })}
            placeholder="https://..."
            disabled={mutation.isPending}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
          />
        </Field>
      </Section>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#54b678] text-base font-semibold text-[#18253f] transition-all hover:bg-[#3f9560] hover:shadow-[0_4px_15px_rgba(84,182,120,0.3)] disabled:opacity-60"
      >
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar mi mercado
      </button>
      <p className="text-center text-xs text-[#18253f]/55">
        Tu mercado será revisado antes de publicarse. No compartimos tus datos.
      </p>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg text-[#18253f]">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-[#18253f]/70">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
