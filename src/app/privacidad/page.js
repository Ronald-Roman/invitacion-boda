export const metadata = {
  title: "Política de privacidad · Boda Angélica & Benjamin",
};

export default function Privacidad() {
  return (
    <main className="min-h-screen bg-[#fdfaf6] px-4 py-16 flex justify-center">
      <article className="w-full max-w-2xl text-[var(--text)] leading-relaxed" style={{ fontSize: 'clamp(0.95rem, 3vw, 1.05rem)' }}>

        <h1 className="sec-title text-center mb-8" style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)' }}>
          Política de privacidad
        </h1>

        <p className="mb-4">
          Esta invitación digital pertenece a la boda de Angélica Droguett y Benjamin Román. Aquí explicamos qué datos usamos y para qué.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Datos de los invitados</h2>
        <p className="mb-4">
          Usamos tu código de invitación para mostrarte tu invitación personalizada y guardar tu confirmación de asistencia y el regalo que elegiste. Esta información solo la usamos para organizar la boda.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Fotos y videos</h2>
        <p className="mb-4">
          Las fotos y videos que subas en la sección «Fotos» se guardan en una carpeta privada de Google Drive de los novios. Solo los novios pueden verlos; no se publican ni se comparten con otros invitados ni con terceros. Las fotos se reducen de tamaño antes de subirse.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Acceso a Google Drive</h2>
        <p className="mb-4">
          La invitación usa la API de Google Drive únicamente para guardar los archivos que suben los invitados en la cuenta de los novios. Solo tiene acceso a los archivos y carpetas que ella misma crea, y no accede a ningún otro contenido de Google Drive. No se usa la información para publicidad ni se vende a terceros.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Contacto</h2>
        <p className="mb-4">
          Si quieres que eliminemos alguna foto o video que subiste, o tienes cualquier duda, escríbenos por WhatsApp al +56950596046.
        </p>

      </article>
    </main>
  );
}
