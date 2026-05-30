import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/rutamercado/Header";
import { Footer } from "@/components/rutamercado/Footer";

export const Route = createFileRoute("/politica-de-privacidad")({
  head: () => ({
    meta: [
      { title: "Políticas de Privacidad y Términos de Uso — RutaMercado" },
      {
        name: "description",
        content:
          "Política de Privacidad y Términos de Uso del portal RutaMercado PR, directorio de mercados, ferias y bazares en Puerto Rico.",
      },
      { property: "og:title", content: "Políticas de Privacidad y Términos de Uso — RutaMercado" },
      {
        property: "og:description",
        content:
          "Política de Privacidad y Términos de Uso del portal RutaMercado PR.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <article
          className="mx-auto w-full max-w-[800px] px-5 py-12 sm:px-6 sm:py-16 text-[#2a2a2a]"
          style={{ fontSize: 16, lineHeight: 1.7 }}
        >
          <h1
            className="text-3xl sm:text-4xl font-bold leading-tight"
            style={{ color: "#1c1e37" }}
          >
            Política de Privacidad y Términos de Uso — RutaMercado PR
          </h1>
          <p className="mt-3 text-sm text-[#555]">
            <strong style={{ color: "#1c1e37" }}>Fecha de vigencia:</strong> 1 de junio de 2026
          </p>

          <Section title="1. Información General">
            <p>
              RutaMercado PR (<B>"RutaMercado"</B>, <B>"el Portal"</B>, <B>"nosotros"</B>) opera el
              sitio web rutamercadopr.com, un directorio digital de acceso público cuyo propósito es
              centralizar y difundir información sobre mercados locales, ferias artesanales,
              bazares, mercados agrícolas y eventos similares celebrados en Puerto Rico.
            </p>
            <p>
              Al acceder y utilizar este Portal, usted (<B>"el Usuario"</B>) acepta íntegramente los
              términos establecidos en esta Política.
            </p>
          </Section>

          <Section title="2. Naturaleza del Portal — RutaMercado como Intermediario">
            <p>
              RutaMercado actúa <B>exclusivamente como plataforma intermediaria</B> de difusión de
              información. El Portal <B>no organiza, produce, opera, ni patrocina</B> ninguno de los
              eventos o mercados publicados en el directorio.
            </p>
            <p>Toda la información publicada en el Portal proviene de dos fuentes:</p>
            <ol className="ml-5 list-[lower-alpha] space-y-3">
              <li>
                Información suministrada voluntariamente por terceros (organizadores, productores o
                promotores de eventos) mediante el formulario de registro disponible en el sitio.
              </li>
              <li>
                Información recopilada por el equipo de RutaMercado de manera directa, tomada
                exclusivamente de fuentes públicas y medios oficiales de los organizadores, tales
                como páginas web oficiales, perfiles verificados en redes sociales, comunicados de
                prensa y anuncios públicos emitidos por los propios organizadores.
              </li>
            </ol>
            <p>
              RutaMercado <B>no es propietario</B> de la información de los eventos publicados.
              Dicha información pertenece exclusivamente a sus respectivos organizadores y es
              publicada en el Portal con fines informativos y de difusión pública únicamente.
            </p>
          </Section>

          <Section title="3. Limitación de Responsabilidad sobre la Información Publicada">
            <p>
              RutaMercado <B>no garantiza la exactitud, vigencia, completitud ni veracidad</B> de la
              información publicada en el Portal, incluyendo pero no limitándose a:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Fechas y horarios de los eventos</li>
              <li>Ubicaciones y direcciones</li>
              <li>Datos de contacto de los organizadores</li>
              <li>Descripción de productos, servicios o actividades ofrecidas en los mercados</li>
            </ul>
            <p>El Usuario reconoce y acepta que:</p>
            <ol className="ml-5 list-[lower-alpha] space-y-3">
              <li>
                Los eventos publicados en el Portal pueden ser cancelados, pospuestos, reubicados o
                modificados por sus organizadores en cualquier momento y sin previo aviso a
                RutaMercado.
              </li>
              <li>
                RutaMercado <B>no se hace responsable</B> por cancelaciones, cambios de fecha,
                cambios de lugar, suspensiones o cualquier otra modificación a los eventos
                publicados, independientemente de si dicha información fue actualizada oportunamente
                en el Portal.
              </li>
              <li>
                RutaMercado <B>no será responsable</B> por ningún daño directo, indirecto,
                incidental, especial o consecuente que surja del uso de la información publicada en
                el Portal, incluyendo gastos de transportación, pérdida de tiempo, pérdida económica
                u otros perjuicios ocasionados por asistir o intentar asistir a un evento que haya
                sido cancelado, modificado o que no se celebre según lo publicado.
              </li>
              <li>
                Es <B>responsabilidad exclusiva del Usuario</B> verificar directamente con el
                organizador del evento la vigencia y exactitud de la información antes de asistir a
                cualquier mercado o evento listado en el Portal.
              </li>
            </ol>
          </Section>

          <Section title="4. Registro de Eventos — Fuentes de Información y Responsabilidad del Organizador">
            <SubSection title="4.1 Registro por parte del organizador">
              <p>
                Al someter información de un evento o mercado a través del formulario de registro de
                RutaMercado, el organizador declara y garantiza que:
              </p>
              <ol className="ml-5 list-[lower-alpha] space-y-3">
                <li>Es el legítimo organizador o representante autorizado del evento registrado.</li>
                <li>
                  La información suministrada es veraz, exacta y actualizada al momento de su
                  envío.
                </li>
                <li>
                  Se compromete a notificar a RutaMercado de forma oportuna cualquier cambio,
                  cancelación o modificación relevante al evento registrado, mediante los canales
                  de contacto disponibles en el Portal.
                </li>
                <li>
                  Otorga a RutaMercado una licencia no exclusiva, gratuita y revocable para
                  publicar, reproducir y difundir la información del evento a través del Portal y
                  sus canales de comunicación asociados, con el único fin de su promoción y
                  difusión pública.
                </li>
                <li>
                  Asume <B>plena responsabilidad</B> por la veracidad de la información suministrada
                  y por cualquier reclamación de terceros derivada de inexactitudes, omisiones o
                  información engañosa en los datos registrados.
                </li>
              </ol>
            </SubSection>
            <SubSection title="4.2 Registro directo por parte de RutaMercado">
              <p>
                RutaMercado se reserva el derecho de registrar y publicar eventos de manera directa
                en el Portal, sin que medie una solicitud formal del organizador. En estos casos:
              </p>
              <ol className="ml-5 list-[lower-alpha] space-y-3">
                <li>
                  La información publicada es recopilada exclusivamente de <B>fuentes públicas y
                  medios oficiales</B> del organizador, tales como sus páginas web, perfiles
                  verificados en redes sociales, comunicados de prensa u otros canales de
                  comunicación pública emitidos por el propio organizador o sus representantes
                  autorizados.
                </li>
                <li>
                  El organizador cuyo evento haya sido registrado directamente por RutaMercado puede
                  encontrar su evento publicado en el Portal sin haber iniciado el proceso de
                  registro. Esto responde al compromiso de RutaMercado de mantener un directorio
                  completo y actualizado en beneficio de la comunidad.
                </li>
                <li>
                  RutaMercado publica únicamente información que ya es de <B>dominio público</B>,
                  por lo que dicho registro no constituye apropiación indebida de información
                  privada ni confidencial.
                </li>
                <li>
                  Si un organizador desea corregir, actualizar o solicitar la eliminación de su
                  evento del Portal, puede comunicarse con RutaMercado a través de{" "}
                  <a
                    href="mailto:info@rutamercadopr.com"
                    className="font-semibold underline"
                    style={{ color: "#1c1e37" }}
                  >
                    info@rutamercadopr.com
                  </a>{" "}
                  y la solicitud será atendida a la brevedad posible.
                </li>
                <li>
                  RutaMercado no asume responsabilidad por desactualizaciones o inexactitudes en la
                  información recopilada de fuentes públicas, dado que dichas fuentes son
                  administradas por los propios organizadores y están fuera del control directo del
                  Portal.
                </li>
              </ol>
            </SubSection>
          </Section>

          <Section title="5. Recopilación de Datos y Privacidad">
            <SubSection title="5.1 Información de visitantes del Portal">
              <p>
                RutaMercado utiliza herramientas de análisis web, incluyendo el <B>Meta Pixel de
                Facebook</B>, para recopilar datos anónimos de navegación con el propósito de
                mejorar la experiencia del Usuario y optimizar campañas de difusión del Portal.
                Estos datos pueden incluir páginas visitadas, tiempo de sesión y comportamiento de
                navegación general.
              </p>
            </SubSection>
            <SubSection title="5.2 Información de organizadores">
              <p>
                La información personal suministrada por organizadores a través del formulario de
                registro (nombre, correo electrónico, teléfono) será utilizada exclusivamente para
                la gestión y publicación del evento en el Portal. RutaMercado <B>no vende, cede ni
                comparte</B> esta información con terceros con fines comerciales.
              </p>
            </SubSection>
            <SubSection title="5.3 Cookies">
              <p>
                El Portal puede utilizar cookies para mejorar la funcionalidad y experiencia de
                navegación. El Usuario puede configurar su navegador para rechazar cookies, aunque
                esto puede afectar algunas funcionalidades del Portal.
              </p>
            </SubSection>
          </Section>

          <Section title="6. Propiedad Intelectual">
            <p>
              El nombre <B>RutaMercado</B>, el logo, el diseño del Portal y los contenidos
              editoriales propios son propiedad exclusiva de RutaMercado PR y están protegidos por
              las leyes aplicables de propiedad intelectual. Su reproducción total o parcial sin
              autorización expresa está prohibida.
            </p>
            <p>
              La información de los eventos publicados en el Portal pertenece a sus respectivos
              organizadores y no constituye contenido propio de RutaMercado.
            </p>
          </Section>

          <Section title="7. Modificaciones a esta Política">
            <p>
              RutaMercado se reserva el derecho de modificar esta Política en cualquier momento. Los
              cambios entrarán en vigencia a partir de su publicación en el Portal. El uso continuado
              del Portal tras la publicación de cambios constituye aceptación de los mismos.
            </p>
          </Section>

          <Section title="8. Contacto">
            <p>
              Para notificar cancelaciones, cambios de eventos, solicitar correcciones o la
              eliminación de información publicada, o cualquier consulta relacionada con el Portal:
            </p>
            <div className="mt-2 space-y-1">
              <p>
                <B>RutaMercado PR</B>
              </p>
              <p>
                📧{" "}
                <a
                  href="mailto:info@rutamercadopr.com"
                  className="font-semibold underline"
                  style={{ color: "#1c1e37" }}
                >
                  info@rutamercadopr.com
                </a>
              </p>
              <p>🌐 rutamercadopr.com</p>
            </div>
          </Section>

          <hr className="my-10 border-[#e5e7eb]" />
          <p className="italic text-[#555]">
            Este documento constituye el acuerdo completo entre RutaMercado PR y los usuarios y
            organizadores que interactúan con el Portal.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-bold leading-snug" style={{ color: "#1c1e37" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-lg font-semibold" style={{ color: "#1c1e37" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold" style={{ color: "#1c1e37" }}>
      {children}
    </strong>
  );
}
