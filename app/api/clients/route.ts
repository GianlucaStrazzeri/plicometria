import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminCheck } from '@/lib/auth';

// GET: list clients (server-side)
export async function GET(req: Request) {
  try {
    const { data, error } = await supabaseAdmin.from('clients').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST: create client (admin-only)
export async function POST(req: Request) {
  try {
    const ok = getAdminCheck(req);
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const toInsert = {
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      dni: body.dni ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      birth_date: body.birth_date ?? null,
      sex: body.sex ?? null,
      pathology: body.pathology ?? null,
      notes: body.notes ?? null,
      status: body.status ?? 'active',
    };

    const { data, error } = await supabaseAdmin.from('clients').insert([toInsert]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ inserted: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
