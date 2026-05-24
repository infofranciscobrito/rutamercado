import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createMarketSubmission } from "@/lib/submissions.functions";
import {
  MARKET_CATEGORIES,
  MARKET_REGIONS,
  MARKET_FREQUENCIES,
} from "@/types/market";
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

type FormValues = {
  name: string;
  description: string;
  category: string;
  region: string;
  municipality: string;
  address: string;
  event_date: string;
  start_time: string;
  end_time: string;
  frequency: string;
  image_url: string;
  organizer_name: string;
  organizer_phone: string;
  organizer_email: string;
  organizer_instagram: string;
};

const defaults: FormValues = {
  name: "",
  description: "",
  category: MARKET_CATEGORIES[0],
  region: MARKET_REGIONS[0],
  municipality: "",
  address: "",
  event_date: "",
  start_time: "09:00",
  end_time: "14:00",
  frequency: "",
  image_url: "",
  organizer_name: "",
  organizer_phone: "",
  organizer_email: "",
  organizer_instagram: "",
};

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
          ...v,
          description: v.description || undefined,
          frequency: v.frequency || undefined,
          image_url: v.image_url || undefined,
          organizer_phone: v.organizer_phone || undefined,
          organizer_email: v.organizer_email || undefined,
          organizer_instagram: v.organizer_instagram || undefined,
        },
      }),
    onSuccess: () => setSubmitted(true),
    onError: (e: Error) => toast.error(e.message),
  });

  const imageUrl = watch("image_url");

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center rm-shadow-warm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#22C55E]" />
        <h2 className="mt-4 font-display text-2xl text-[#1c1e37]">
          ¡Gracias! Recibimos tu mercado
        </h2>
        <p className="mt-3 text-[#1c1e37]/70">
          Nuestro equipo revisará la información y lo publicaremos en 1–2 días.
          Te contactaremos si necesitamos algo más.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#f8b625] px-6 font-semibold text-[#1c1e37] hover:bg-[#f59e0b]"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const contactError =
    errors.organizer_phone?.message || errors.organizer_email?.message;

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
          />
        </Field>
        <Field label="Descripción">
          <Textarea
            rows={3}
            {...register("description", { maxLength: 2000 })}
            placeholder="Cuéntanos brevemente qué se ofrece, ambiente, productos…"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría *">
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
          <Field label="Región *">
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
        <Field label="Municipio *" error={errors.municipality?.message}>
          <Input
            {...register("municipality", { required: "Requerido", maxLength: 120 })}
            placeholder="Ponce"
          />
        </Field>
        <Field label="Dirección *" error={errors.address?.message}>
          <Input
            {...register("address", { required: "Requerido", maxLength: 300 })}
            placeholder="Plaza Las Delicias, Calle Atocha"
          />
        </Field>
      </Section>

      <Section title="Fecha y horario">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Fecha *" error={errors.event_date?.message}>
            <Input type="date" {...register("event_date", { required: "Requerido" })} />
          </Field>
          <Field label="Inicio *">
            <Input type="time" {...register("start_time", { required: true })} />
          </Field>
          <Field label="Fin *">
            <Input type="time" {...register("end_time", { required: true })} />
          </Field>
        </div>
        <Field label="Frecuencia">
          <Controller
            control={control}
            name="frequency"
            render={({ field }) => (
              <Select value={field.value || "Único"} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MARKET_FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </Section>

      <Section title="Foto del mercado">
        <p className="-mt-2 text-sm text-[#1c1e37]/60">
          Opcional. Tu foto se recorta automáticamente al formato del directorio
          (16:9) para que se vea perfecta.
        </p>
        <ImageUpload16x9
          value={imageUrl}
          onChange={(url) => setValue("image_url", url, { shouldDirty: true })}
        />
      </Section>

      <Section title="Contacto del organizador">
        <Field label="Nombre del organizador *" error={errors.organizer_name?.message}>
          <Input
            {...register("organizer_name", { required: "Requerido", maxLength: 200 })}
            placeholder="José Santiago"
          />
        </Field>
        <p className="-mb-1 text-sm text-[#1c1e37]/60">
          Provee al menos un medio de contacto:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono">
            <Input
              {...register("organizer_phone", { maxLength: 50 })}
              placeholder="787-555-0123"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              {...register("organizer_email", { maxLength: 255 })}
              placeholder="contacto@ejemplo.com"
            />
          </Field>
        </div>
        <Field label="Instagram">
          <Input
            {...register("organizer_instagram", { maxLength: 100 })}
            placeholder="@mimercado"
          />
        </Field>
        {contactError && (
          <p className="text-sm text-red-600">{contactError}</p>
        )}
      </Section>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f8b625] text-base font-semibold text-[#1c1e37] transition-all hover:bg-[#f59e0b] hover:shadow-[0_4px_15px_rgba(248,182,37,0.3)] disabled:opacity-60"
      >
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar mi mercado
      </button>
      <p className="text-center text-xs text-[#1c1e37]/55">
        Tu mercado será revisado antes de publicarse. No compartimos tus datos.
      </p>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg text-[#1c1e37]">{title}</h3>
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
      <Label className="text-xs font-semibold uppercase tracking-wide text-[#1c1e37]/70">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
