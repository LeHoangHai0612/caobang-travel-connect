import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, message } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Vui lòng nhập nội dung tin nhắn.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('contacts')
    .insert({ name: name?.trim(), email: email?.trim(), phone: phone?.trim(), message: message.trim() });

  if (error) {
    return NextResponse.json({ error: 'Không thể lưu tin nhắn. Vui lòng thử lại.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
