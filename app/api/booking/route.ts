import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createAuthedClient } from '@/lib/supabase-server';
import { getTier, POINTS_PER_BOOKING } from '@/lib/loyalty';

export async function POST(request: NextRequest) {
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

  // Lưu booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      package_type: package_type?.trim() || '',
      client_name: client_name.trim(),
      email: email?.trim() || '',
      phone: phone.trim(),
      preferred_date: preferred_date || null,
      message: message?.trim() || '',
      status: 'pending',
      user_id: user_id || null,
      guide_id: guide_id || null,
      discount_pct: discount_pct || 0,
      points_earned: user_id ? POINTS_PER_BOOKING : 0,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Không thể lưu đặt lịch. Vui lòng thử lại.' }, { status: 500 });
  }

  // Nếu người dùng đã đăng nhập → cộng điểm
  if (user_id) {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (accessToken) {
      const authedClient = createAuthedClient(accessToken);

      // Lấy điểm hiện tại
      const { data: profile } = await authedClient
        .from('user_profiles')
        .select('points')
        .eq('id', user_id)
        .single();

      const currentPoints = profile?.points ?? 0;
      const newPoints = currentPoints + POINTS_PER_BOOKING;
      const newTier = getTier(newPoints).name;

      // Cập nhật điểm và hạng
      await authedClient
        .from('user_profiles')
        .upsert({ id: user_id, points: newPoints, tier: newTier })
        .eq('id', user_id);

      return NextResponse.json({
        success: true,
        booking_id: booking.id,
        points_earned: POINTS_PER_BOOKING,
        new_points: newPoints,
        new_tier: newTier,
      });
    }
  }

  return NextResponse.json({ success: true, booking_id: booking?.id });
}
