import { Link } from "@tanstack/react-router";

const linkClass =
  "font-medium text-[#54b678] underline decoration-[#54b678]/40 underline-offset-4 transition-colors hover:text-[#3f9a5f] hover:decoration-[#3f9a5f]";

export function IntroSEO() {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <p className="text-center text-[15px] leading-relaxed text-[#6B7280]">
        RutaMercado reúne los mercados locales más activos de Puerto Rico en un
        solo lugar: desde{" "}
        <Link to="/mercados-agricolas" className={linkClass}>
          mercados agrícolas
        </Link>{" "}
        y{" "}
        <Link to="/ferias-artesanales" className={linkClass}>
          ferias artesanales
        </Link>{" "}
        hasta{" "}
        <Link to="/bazares" className={linkClass}>
          bazares y pop ups
        </Link>{" "}
        y{" "}
        <Link to="/mercados-mixtos" className={linkClass}>
          mercados mixtos
        </Link>
        . Cubrimos las regiones Metro, Norte, Sur, Este, Oeste y Centro. Filtra
        por región, categoría o fecha y encuentra tu próxima parada este fin de
        semana.
      </p>
    </section>
  );
}
