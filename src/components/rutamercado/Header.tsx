export function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-[#1c1e37] text-white"
      style={{ height: 64 }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo-placeholder.svg"
            alt="RutaMercado"
            className="h-10 w-10 rounded-md bg-[#f8b625]/15 p-1"
          />
          <span className="font-display text-2xl text-[#f8b625]">
            RutaMercado
          </span>
        </div>
        <p className="hidden text-sm text-white/80 sm:block">
          Descubre los mercados locales de Puerto Rico
        </p>
      </div>
    </header>
  );
}
