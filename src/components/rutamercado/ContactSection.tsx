import { ContactForm } from "./ContactForm";

export function ContactSection() {
  return (
    <section
      id="contacto"
      className="scroll-mt-24 bg-[#FAFAF8] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="font-display text-3xl text-[#18253f] sm:text-4xl">
            Contáctanos
          </h2>
          <p className="mt-3 text-sm text-[#18253f]/70 sm:text-base">
            ¿Tienes preguntas, sugerencias o quieres colaborar? Escríbenos y te
            responderemos lo antes posible.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
