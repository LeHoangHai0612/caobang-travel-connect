import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTier, POINTS_PER_BOOKING } from '@/lib/loyalty';

// Server-side client dùng service role key (bypass RLS)
function getAdminClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      package_type, client_name, email, phone,
      preferred_date, message,
      user_id, guide_id, discount_pct,
    } = body;

    if (!client_name?.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập họ và tên.' }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập số điện thoại.' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Insert booking
    const payload: Record<string, unknown> = {
      package_type:   package_type?.trim() || '',
      client_name:    client_name.trim(),
      email:          email?.trim() || '',
      phone:          phone.trim(),
      preferred_date: preferred_date || null,
      message:        message?.trim() || '',
      status:         'pending',
      user_id:        user_id || null,
      guide_id:       guide_id || null,
      discount_pct:   discount_pct || 0,
      points_earned:  user_id ? POINTS_PER_BOOKING : 0,
    };

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      // Thử insert không có cột mở rộng nếu thiếu cột
      if (error.code === '42703') {
        const { error: e2 } = await supabase.from('bookings').insert({
          package_type: package_type?.trim() || '',
          client_name:  client_name.trim(),
          email:        email?.trim() || '',
          phone:        phone.trim(),
          preferred_date: preferred_date || null,
          message:      message?.trim() || '',
          status:       'pending',
        });
        if (e2) {
          console.error('[booking] fallback error:', e2);
          return NextResponse.json({ error: 'Không thể lưu đặt lịch.', detail: e2.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }
      console.error('[booking] insert error:', error);
      return NextResponse.json({ error: 'Không thể lưu đặt lịch.', detail: error.message }, { status: 500 });
    }

    // Cộng điểm nếu đã đăng nhập
    if (user_id && booking) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('points')
        .eq('id', user_id)
        .single();

      const newPoints = (profile?.points ?? 0) + POINTS_PER_BOOKING;
      const newTier   = getTier(newPoints).name;

      await supabase
        .from('user_profiles')
        .update({ points: newPoints, tier: newTier })
        .eq('id', user_id);

      return NextResponse.json({
        success:       true,
        booking_id:    booking.id,
        points_earned: POINTS_PER_BOOKING,
        new_points:    newPoints,
        new_tier:      newTier,
      });
    }

    return NextResponse.json({ success: true, booking_id: booking?.id });

  } catch (err: unknown) {
    console.error('[booking] unexpected error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Lỗi server.', detail: msg }, { status: 500 });
  }
}
