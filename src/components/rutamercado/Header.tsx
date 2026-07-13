import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FavoritesTrigger } from "./FavoritesTrigger";
import { FavoritesDrawer } from "./FavoritesDrawer";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-[#18253f] text-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_2px_20px_rgba(24,37,63,0.35)]" : ""
      }`}
      style={{ height: 64 }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label="RutaMercado — Inicio" className="flex items-center">
          <img
            src="/logo-rutamercado-horizontal.png"
            alt="RutaMercado"
            className="h-16 w-auto"
          />

        </a>

        <nav className="hidden items-center gap-2 md:flex">
          <a
            href="#sobre-nosotros"
            className="rounded-md px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:text-[#54b678]"
          >
            Sobre Nosotros
          </a>
          <Link
            to="/productores"
            className="rounded-md px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:text-[#54b678]"
          >
            Productores
          </Link>
          <Link
            to="/enviar"
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#54b678] px-4 text-sm font-semibold text-[#54b678] transition-colors hover:bg-[#54b678] hover:text-[#18253f]"
          >
            Enviar mi Mercado
          </Link>
          <FavoritesTrigger onOpen={() => setFavOpen(true)} />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <FavoritesTrigger onOpen={() => setFavOpen(true)} />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menú"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white hover:bg-white/10"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#18253f] text-white border-l-0">
              <SheetHeader>
                <SheetTitle className="font-display text-xl text-white">
                  Menú
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href="#sobre-nosotros"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base text-white/90 hover:bg-white/10"
                >
                  Sobre Nosotros
                </a>
                <Link
                  to="/productores"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base text-white/90 hover:bg-white/10"
                >
                  Productores
                </Link>
                <Link
                  to="/enviar"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex h-12 items-center justify-center rounded-md bg-[#54b678] px-4 text-base font-semibold text-[#18253f]"
                >
                  Enviar mi Mercado
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <FavoritesDrawer open={favOpen} onOpenChange={setFavOpen} />
    </header>
  );
}
