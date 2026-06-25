import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producerName: string;
  marketNames: string;
};

export function UpdateProducerDialog({
  open,
  onOpenChange,
  producerName,
  marketNames,
}: Props) {
  const submitFn = useServerFn(submitProducerUpdateRequest);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setMessage("");
    setEmail("");
    setSubmitting(false);
    setDone(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) {
      toast.error("Completa todos los campos.");
      return;
    }
    setSubmitting(true);
    try {
      await submitFn({
        data: {
          producer_name: producerName,
          market_names: marketNames,
          requester_email: email.trim(),
          message: message.trim(),
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
      <DialogContent className="sm:max-w-[480px]">
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
              <Input id="producer-ref" value={producerName} readOnly className="mt-1 bg-[#FFF8EC]" />
            </div>
            <div>
              <Label htmlFor="producer-message">
                ¿Qué información deseas actualizar?
              </Label>
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
