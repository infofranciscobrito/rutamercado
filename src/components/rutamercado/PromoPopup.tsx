import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STORAGE_KEY = "rm_promo_rodeo_seen";
const VENDORS_URL = "https://rodeocookoffpr.com/vendors";
const SHOW_DELAY_MS = 1500;

export function PromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      seen = true; // si no hay storage, no molestar
    }
    if (seen) return;

    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[520px] overflow-hidden border-0 bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">
          Rodeo Cook Off PR — Regístrate como vendor
        </DialogTitle>
        <DialogDescription className="sr-only">
          Promoción del evento Rodeo Cook Off Puerto Rico. Usa el botón para
          registrarte como vendor.
        </DialogDescription>

        <img
          src="/promo-rodeo.png"
          alt="Rodeo Cook Off Puerto Rico — arte promocional del evento"
          className="h-auto w-full rounded-xl"
          loading="lazy"
        />

        <a
          href={VENDORS_URL}
          target="_blank"
          rel="noopener"
          onClick={dismiss}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-md bg-[#54b678] text-base font-semibold text-white transition-colors hover:bg-[#439660]"
        >
          Regístrate como vendors
        </a>
      </DialogContent>
    </Dialog>
  );
}
