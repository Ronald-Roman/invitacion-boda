import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MAX_AUTOR, MAX_MENSAJE, MAX_MENSAJES_POR_INVITACION, mensajesAbiertos } from "@/lib/fotos";
import { guardarMensaje, leerMensajes } from "@/lib/google-drive";

function error(mensaje, status) {
  return NextResponse.json({ error: mensaje }, { status });
}

async function buscarInvitado(codigo) {
  if (typeof codigo !== "string" || !codigo) return null;
  const { data } = await supabase.from("invitados").select("nombre").eq("codigo", codigo).single();
  return data;
}

// Los mensajes que ya dejó la invitación (para mostrarlos y poder editarlos)
export async function GET(request) {
  const codigo = request.nextUrl.searchParams.get("codigo");
  if (!(await buscarInvitado(codigo))) return error("Código de invitado no válido.", 404);

  try {
    return NextResponse.json({ mensajes: await leerMensajes(codigo) });
  } catch (e) {
    console.error(e);
    return error("No pudimos revisar tus mensajes.", 502);
  }
}

// Crea un mensaje nuevo, o edita uno existente si viene `id`
export async function POST(request) {
  if (!mensajesAbiertos()) return error("Ya no se pueden dejar mensajes.", 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return error("Solicitud inválida.", 400);
  }

  const { codigo, id } = body ?? {};
  const mensaje = typeof body?.mensaje === "string" ? body.mensaje.replace(/\r\n/g, "\n").trim() : "";
  const autor = typeof body?.autor === "string" ? body.autor.replace(/\s+/g, " ").trim() : "";

  if (!mensaje) return error("Escribe tu mensaje antes de enviarlo.", 400);
  if (mensaje.length > MAX_MENSAJE) return error(`El mensaje puede tener hasta ${MAX_MENSAJE} caracteres.`, 413);
  if (autor.length > MAX_AUTOR) return error(`El nombre puede tener hasta ${MAX_AUTOR} caracteres.`, 413);
  if (id !== undefined && (typeof id !== "string" || !/^[\w-]+$/.test(id))) return error("Mensaje inválido.", 400);

  const invitado = await buscarInvitado(codigo);
  if (!invitado) return error("Código de invitado no válido.", 404);

  try {
    const guardado = await guardarMensaje({
      codigo,
      nombreInvitado: invitado.nombre,
      autor,
      mensaje,
      id,
      maximo: MAX_MENSAJES_POR_INVITACION,
    });
    if (!guardado) return error("No encontramos ese mensaje.", 404);
    return NextResponse.json({ id: guardado });
  } catch (e) {
    if (e.limite) return error(`Cada invitación puede dejar hasta ${MAX_MENSAJES_POR_INVITACION} mensajes.`, 429);
    console.error(e);
    return error("No pudimos guardar tu mensaje. Intenta nuevamente.", 502);
  }
}
