import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminCheck } from '@/lib/auth';

// Simple schedule endpoint: GET available slots (public), POST to reserve (admin protected)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('schedules').select('*').order('starts_at', { ascending: true }).limit(500);
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
      professional_id: body.professional_id,
      starts_at: body.starts_at,
      ends_at: body.ends_at,
      is_booked: body.is_booked ?? false,
      metadata: body.metadata ?? null,
    };
    const { data, error } = await supabaseAdmin.from('schedules').insert([toInsert]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ inserted: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
