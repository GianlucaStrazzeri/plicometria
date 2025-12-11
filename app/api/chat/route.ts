import { NextResponse } from "next/server";

// Server-side chat proxy endpoint.
// This endpoint proxies a user message + client-provided context to OpenAI's
// Chat Completions API. To enable it, set the environment variable
// `OPENAI_API_KEY` in your deployment or local `.env`.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context } = body as { message?: string; context?: any };

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set. Set it to enable AI responses." }, { status: 501 });
    }

    if (!message) return NextResponse.json({ reply: "No message provided" });

    // Build prompt including a concise summary of client-provided context.
    const summaryParts: string[] = [];
    try {
      if (context?.clients) summaryParts.push(`Clientes: ${Array.isArray(context.clients) ? context.clients.length + ' registros' : '---'}`);
      if (context?.services) summaryParts.push(`Servicios: ${Array.isArray(context.services) ? context.services.length + ' registros' : '---'}`);
      if (context?.bills) summaryParts.push(`Facturas: ${Array.isArray(context.bills) ? context.bills.length + ' registros' : '---'}`);
      if (context?.appointments) summaryParts.push(`Citas: ${Array.isArray(context.appointments) ? context.appointments.length + ' registros' : '---'}`);
    } catch (e) {
      // ignore
    }

    // instruct model to optionally emit client actions in a machine-readable form
      // Provide an explicit list of valid routes so the model doesn't guess incorrect paths.
      const validRoutes = [
        "/",
        "/professionals",
        "/training-planner",
        "/exercise",
        "/plicometria",
        "/listoffoods",
        "/services",
        "/clients",
        "/chat",
        "/calendar",
        "/billing",
      ];

      const systemPrompt = `Eres un asistente técnico que conoce la app Plicometria. Usa la información del usuario con prudencia. Contexto: ${summaryParts.join(' | ')}.\n\n` +
        `RUTAS DISPONIBLES: ${validRoutes.join(', ')}. \n` +
        `Si quieres que el cliente realice una acción en la interfaz (por ejemplo navegar a una ruta), añade al final de tu respuesta una línea que comience exactamente con: ACTION_JSON: y a continuación un objeto JSON con la forma {"action":"navigate","path":"/clients"}. ` +
        `IMPORTANTE: Solo usa una ruta contenida en la lista "RUTAS DISPONIBLES" y proporciona el path exactamente como aparece allí. No inventes rutas ni uses rutas relativas.\n\n` +
        `Ejemplo de acción al final de la respuesta:\nACTION_JSON: {"action":"navigate","path":"/clients"}\n\n` +
        `Si no hay acción, no incluyas la línea ACTION_JSON.`;

    // call OpenAI - Chat Completions (gpt-4o-mini or your preferred model)
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: String(message) },
        ],
        max_tokens: 600,
        temperature: 0.1,
      }),
    });

    if (!openaiRes.ok) {
      const txt = await openaiRes.text();
      return NextResponse.json({ error: `OpenAI error: ${txt}` }, { status: 502 });
    }

    const json = await openaiRes.json();
    const reply = json?.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
