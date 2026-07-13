import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { submitContactMessage } from "@/lib/contact.functions";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Role = "productor" | "vendor" | "publico_general";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  role: z.enum(["productor", "vendor", "publico_general"], {
    message: "Selecciona una opción",
  }),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().min(7, "Teléfono muy corto").max(20),
  message: z
    .string()
    .trim()
    .min(5, "Cuéntanos un poco más (mínimo 5 caracteres)")
    .max(2000),
});

type FormState = {
  name: string;
  role: Role | "";
  email: string;
  phone: string;
  message: string;
};

const empty: FormState = {
  name: "",
  role: "",
  email: "",
  phone: "",
  message: "",
};

export function ContactForm() {
  const submitFn = useServerFn(submitContactMessage);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      await submitFn({ data: parsed.data });
      setForm(empty);
      setErrors({});
      setSuccessOpen(true);
    } catch (err) {
      console.error("[Contact] submit error", err);
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "No pudimos enviar tu mensaje. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
        noValidate
      >
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="contact-name">Nombre</Label>
            <Input
              id="contact-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              disabled={submitting}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact-role">Soy</Label>
            <Select
              value={form.role}
              onValueChange={(v) => set("role", v as Role)}
              disabled={submitting}
            >
              <SelectTrigger id="contact-role">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="productor">Productor</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="publico_general">Público en general</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Correo electrónico</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                disabled={submitting}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact-phone">Número de teléfono</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="787-000-0000"
                autoComplete="tel"
                disabled={submitting}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact-message">¿Cómo le ayudamos?</Label>
            <Textarea
              id="contact-message"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Cuéntanos tu consulta..."
              rows={5}
              disabled={submitting}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#54b678] text-[#18253f] hover:bg-[#4aa66b]"
          >
            {submitting ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </form>

      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Mensaje enviado!</AlertDialogTitle>
            <AlertDialogDescription>
              Tu mensaje fue enviado exitosamente. Nos estaremos comunicando contigo
              pronto para atender tu consulta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setSuccessOpen(false)}
              className="bg-[#54b678] text-[#18253f] hover:bg-[#4aa66b]"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
