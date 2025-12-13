export async function GET() {
  const payload = {
    name: "Plicometria Homepage API",
    description: "Endpoint simple para metadata o señales de la homepage",
    routes: ["/", "/homepage"],
  };

  return new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
