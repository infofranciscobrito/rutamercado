import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegisterEmprendedorForm } from "./RegisterEmprendedorForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RegisterEmprendedorDialog({ open, onOpenChange }: Props) {
  const [done, setDone] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setDone(false);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-[#18253f]">
            Regístrate como Emprendedor
          </DialogTitle>
          {!done ? (
            <DialogDescription>
              Completa los datos de tu negocio. Revisaremos tu información y
              publicaremos tu perfil en el directorio.
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {/* Mounted only while open so closing resets the form state. */}
        {open ? <RegisterEmprendedorForm onSuccess={() => setDone(true)} /> : null}
      </DialogContent>
    </Dialog>
  );
}
