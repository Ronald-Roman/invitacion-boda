import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { estadoFotos, MAX_FOTO_MB, MAX_VIDEO_MB } from "@/lib/fotos";
import { carpetaInvitado, contarArchivos, crearSesionSubida } from "@/lib/google-drive";

function error(mensaje, status) {
  return NextResponse.json({ error: mensaje }, { status });
}

// Cuántas fotos y videos ha compartido el invitado
export async function GET(request) {

  if (estadoFotos() === "pendiente") {
    return error("La subida de fotos no está disponible en este momento.", 403);
  }

  const codigo = request.nextUrl.searchParams.get("codigo");
  if (!codigo) {
    return error("Falta el código de invitado.", 400);
  }

  const { data: invitado } = await supabase
    .from("invitados")
    .select("codigo")
    .eq("codigo", codigo)
    .single();

  if (!invitado) {
    return error("Código de invitado no válido.", 404);
  }

  try {
    return NextResponse.json(await contarArchivos(codigo));
  } catch (e) {
    console.error(e);
    return error("No pudimos revisar tus fotos.", 502);
  }

}

export async function POST(request) {

  if (estadoFotos() !== "abierta") {
    return error("La subida de fotos no está disponible en este momento.", 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return error("Solicitud inválida.", 400);
  }

  const { codigo, nombre, tipo, tamano, fecha } = body ?? {};

  if (typeof codigo !== "string" || !codigo) {
    return error("Falta el código de invitado.", 400);
  }

  const esVideo = typeof tipo === "string" && tipo.startsWith("video/");
  const esFoto = typeof tipo === "string" && tipo.startsWith("image/");
  if (!esVideo && !esFoto) {
    return error("Solo se pueden subir fotos y videos.", 400);
  }

  const maxMb = esVideo ? MAX_VIDEO_MB : MAX_FOTO_MB;
  if (!Number.isInteger(tamano) || tamano <= 0) {
    return error("Archivo inválido.", 400);
  }
  if (tamano > maxMb * 1024 * 1024) {
    return error(`El archivo supera el máximo de ${maxMb} MB.`, 413);
  }

  const { data: invitado } = await supabase
    .from("invitados")
    .select("nombre")
    .eq("codigo", codigo)
    .single();

  if (!invitado) {
    return error("Código de invitado no válido.", 404);
  }

  const nombreArchivo = (typeof nombre === "string" && nombre.trim().slice(0, 200)) || "archivo";
  const fechaValida = typeof fecha === "string" && !isNaN(Date.parse(fecha)) ? fecha : undefined;

  try {
    const carpeta = await carpetaInvitado(codigo, invitado.nombre);
    const uploadUrl = await crearSesionSubida({
      carpeta,
      nombre: nombreArchivo,
      tipo,
      tamano,
      fecha: fechaValida,
      origin: request.headers.get("origin"),
    });
    return NextResponse.json({ uploadUrl });
  } catch (e) {
    console.error(e);
    return error("No pudimos preparar la subida. Intenta nuevamente.", 502);
  }

}
