import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Lo llama el cron diario de Vercel (vercel.json) para que Supabase no pause el proyecto por inactividad
export const dynamic = "force-dynamic";

export async function GET() {
  const { count, error } = await supabase
    .from("invitados")
    .select("codigo", { count: "exact", head: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true, invitados: count });
}
