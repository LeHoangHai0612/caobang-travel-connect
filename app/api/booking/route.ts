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

  // Thử insert đầy đủ (bao gồm cột từ update_v3.sql)
  const fullPayload = {
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

  let bookingId: string | null = null;

  const { data: bookingFull, error: errorFull } = await supabase
    .from('bookings')
    .insert(fullPayload)
    .select('id')
    .single();

  if (errorFull) {
    // Fallback: insert chỉ với các cột cơ bản (nếu chưa chạy update_v3.sql)
    const basicPayload = {
      package_type:   package_type?.trim() || '',
      client_name:    client_name.trim(),
      email:          email?.trim() || '',
      phone:          phone.trim(),
      preferred_date: preferred_date || null,
      message:        message?.trim() || '',
      status:         'pending',
    };

    const { data: bookingBasic, error: errorBasic } = await supabase
      .from('bookings')
      .insert(basicPayload)
      .select('id')
      .single();

    if (errorBasic) {
      console.error('[booking] insert error:', errorBasic);
      return NextResponse.json(
        { error: 'Không thể lưu đặt lịch. Vui lòng thử lại.' },
        { status: 500 }
      );
    }
    bookingId = bookingBasic?.id ?? null;
    // Không cộng điểm khi dùng fallback (thiếu cột)
    return NextResponse.json({ success: true, booking_id: bookingId });
  }

  bookingId = bookingFull?.id ?? null;

  // Cộng điểm nếu người dùng đã đăng nhập
  if (user_id) {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (accessToken) {
      try {
        const authedClient = createAuthedClient(accessToken);

        const { data: profile } = await authedClient
          .from('user_profiles')
          .select('points')
          .eq('id', user_id)
          .single();

        const currentPoints = profile?.points ?? 0;
        const newPoints     = currentPoints + POINTS_PER_BOOKING;
        const newTier       = getTier(newPoints).name;

        // Fix: dùng update thay vì upsert().eq() (upsert không hỗ trợ .eq filter)
        await authedClient
          .from('user_profiles')
          .update({ points: newPoints, tier: newTier })
          .eq('id', user_id);

        return NextResponse.json({
          success:       true,
          booking_id:    bookingId,
          points_earned: POINTS_PER_BOOKING,
          new_points:    newPoints,
          new_tier:      newTier,
        });
      } catch (err) {
        console.error('[booking] points update error:', err);
        // Vẫn trả về success vì booking đã được lưu
        return NextResponse.json({ success: true, booking_id: bookingId });
      }
    }
  }

  return NextResponse.json({ success: true, booking_id: bookingId });
}
