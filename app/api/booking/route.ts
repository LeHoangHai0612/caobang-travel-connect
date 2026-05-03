import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Tạo client trực tiếp thay vì import để tránh lỗi module
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
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
        package_type:   package_type?.trim() || '',
        client_name:    client_name.trim(),
        email:          email?.trim() || '',
        phone:          phone.trim(),
        preferred_date: preferred_date || null,
        message:        message?.trim() || '',
        status:         'pending',
      });

    if (error) {
      console.error('[booking] supabase error:', error);
      return NextResponse.json(
        { error: 'Không thể lưu đặt lịch.', detail: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error('[booking] unexpected error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Lỗi server.', detail: msg },
      { status: 500 }
    );
  }
}
