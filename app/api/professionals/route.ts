import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminCheck } from '@/lib/auth';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('professionals').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ok = getAdminCheck(req);
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const toInsert = {
      name: body.name ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      bio: body.bio ?? null,
      specialties: body.specialties ?? [],
      hours: body.hours ?? null,
      status: body.status ?? 'active',
    };
    const { data, error } = await supabaseAdmin.from('professionals').insert([toInsert]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ inserted: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
