import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dir = path.join(process.cwd(), "data");
    const file = path.join(dir, "leads.json");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let leads: any[] = [];
    if (fs.existsSync(file)) {
      try {
        const raw = fs.readFileSync(file, "utf8");
        leads = JSON.parse(raw || "[]");
      } catch (e) {
        leads = [];
      }
    }

    const entry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...body,
    };

    leads.push(entry);

    fs.writeFileSync(file, JSON.stringify(leads, null, 2), "utf8");

    return NextResponse.json({ ok: true, lead: entry }, { status: 201 });
  } catch (err) {
    console.error("Error saving lead:", err);
    return NextResponse.json({ ok: false, error: "Could not save lead" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "data");
    const file = path.join(dir, "leads.json");

    if (!fs.existsSync(file)) {
      return NextResponse.json({ ok: true, leads: [] });
    }

    const raw = fs.readFileSync(file, "utf8");
    const leads = JSON.parse(raw || "[]");

    return NextResponse.json({ ok: true, leads }, { status: 200 });
  } catch (err) {
    console.error("Error reading leads:", err);
    return NextResponse.json({ ok: false, error: "Could not read leads" }, { status: 500 });
  }
}
