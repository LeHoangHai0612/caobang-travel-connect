import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { package_type, client_name, email, phone, preferred_date, message } = body;

  if (!client_name?.trim()) {
    return NextResponse.json({ error: 'Vui lòng nhập họ và tên.' }, { status: 400 });
  }
  if (!phone?.trim()) {
    return NextResponse.json({ error: 'Vui lòng nhập số điện thoại.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('bookings')
    .insert({
      package_type: package_type?.trim() || '',
      client_name: client_name.trim(),
      email: email?.trim() || '',
      phone: phone.trim(),
      preferred_date: preferred_date || null,
      message: message?.trim() || '',
      status: 'pending',
    });

  if (error) {
    return NextResponse.json({ error: 'Không thể lưu đặt lịch. Vui lòng thử lại.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
