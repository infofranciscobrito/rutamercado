/**
 * Efecto "boleto perforado" — firma visual de la página de mercado.
 * Se dibuja con radial-gradients (sin imágenes) sobre el fondo del sitio.
 */
export function TicketPerforation({
  orientation = "horizontal",
  className = "",
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  if (orientation === "vertical") {
    return (
      <div
        aria-hidden="true"
        className={`w-[2px] shrink-0 ${className}`}
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #54b678 0 2.5px, transparent 3px)",
          backgroundSize: "2px 14px",
          backgroundRepeat: "repeat-y",
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex items-center gap-3 ${className}`}
    >
      <span className="h-4 w-4 shrink-0 rounded-full bg-[#FAFAF8] ring-1 ring-[#E5E7EB]" />
      <span
        className="h-[2px] flex-1"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #54b678 0 2.5px, transparent 3px)",
          backgroundSize: "14px 2px",
          backgroundRepeat: "repeat-x",
        }}
      />
      <span className="h-4 w-4 shrink-0 rounded-full bg-[#FAFAF8] ring-1 ring-[#E5E7EB]" />
    </div>
  );
}
