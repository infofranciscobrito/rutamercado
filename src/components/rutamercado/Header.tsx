export function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-[#1c1e37] text-white"
      style={{ height: 88 }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <img
          src="/logo-rutamercado-horizontal.png"
          alt="RutaMercado — Directorio de mercados locales en Puerto Rico"
          className="h-16 w-auto sm:h-20"
        />
        <p className="hidden text-sm text-white/80 sm:block">
          Descubre los mercados locales de Puerto Rico
        </p>
      </div>
    </header>
  );
}
