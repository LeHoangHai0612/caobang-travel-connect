import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, message, user_id } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Vui lòng nhập họ và tên.' }, { status: 400 });
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Vui lòng nhập nội dung tin nhắn.' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      fullname: name.trim(),
      email:    email?.trim()  || '',
      phone:    phone?.trim()  || '',
      message:  message.trim(),
      ...(user_id ? { user_id } : {}),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[contact] insert error:', error);
    return NextResponse.json({ error: 'Không thể lưu tin nhắn: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, contact_id: data.id });
}
