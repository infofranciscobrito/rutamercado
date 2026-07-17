import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegisterEmprendedorForm } from "./RegisterEmprendedorForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RegisterEmprendedorDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-[#18253f]">
            Regístrate como Emprendedor
          </DialogTitle>
          <DialogDescription>
            Completa los datos de tu negocio. Revisaremos tu información y
            publicaremos tu perfil en el directorio.
          </DialogDescription>
        </DialogHeader>
        <RegisterEmprendedorForm variant="dialog" />
      </DialogContent>
    </Dialog>
  );
}
