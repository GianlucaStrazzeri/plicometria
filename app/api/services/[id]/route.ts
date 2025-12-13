import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAdminCheck } from '@/lib/auth';

export async function GET(req: Request, context: any) {
  try {
    const params = context?.params;
    const id = params?.id;
    const { data, error } = await supabaseAdmin.from('services').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  try {
    const ok = getAdminCheck(req);
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const params = context?.params;
    const id = params?.id;
    const body = await req.json();
    const updates = {
      name: body.name,
      duration: body.duration,
      price: body.price,
      description: body.description,
      status: body.status,
    };
    const { data, error } = await supabaseAdmin.from('services').update(updates).eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ updated: data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const ok = getAdminCheck(req);
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const params = context?.params;
    const id = params?.id;
    const { error } = await supabaseAdmin.from('services').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
