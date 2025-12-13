import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminCheck } from '@/lib/auth';

export async function GET(req: Request, context: any) {
  try {
    const params = context?.params;
    const id = params?.id;
    const { data, error } = await supabaseAdmin.from('clients').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT: update client (admin-only)
export async function PUT(req: Request, context: any) {
  try {
    const ok = getAdminCheck(req);
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const params = context?.params;
    const id = params?.id;
    const body = await req.json();
    const updates = {
      first_name: body.first_name,
      last_name: body.last_name,
      dni: body.dni,
      email: body.email,
      phone: body.phone,
      birth_date: body.birth_date,
      sex: body.sex,
      pathology: body.pathology,
      notes: body.notes,
      status: body.status,
    };

    const { data, error } = await supabaseAdmin.from('clients').update(updates).eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ updated: data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE: delete client (admin-only)
export async function DELETE(req: Request, context: any) {
  try {
    const ok = getAdminCheck(req);
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const params = context?.params;
    const id = params?.id;
    const { error } = await supabaseAdmin.from('clients').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
