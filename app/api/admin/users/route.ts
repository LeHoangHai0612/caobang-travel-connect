import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const supabase = getAdminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('id', user.id).single();
  return profile?.is_admin ? user : null;
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminClient();
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: profiles } = await supabase.from('user_profiles').select('*');
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const { data: bookingCounts } = await supabase.from('bookings').select('user_id').not('user_id', 'is', null);
  const countMap: Record<string, number> = {};
  (bookingCounts ?? []).forEach((b) => {
    if (b.user_id) countMap[b.user_id] = (countMap[b.user_id] ?? 0) + 1;
  });

  const combined = users.map((u) => ({
    id:              u.id,
    email:           u.email ?? '',
    email_confirmed: !!u.email_confirmed_at,
    created_at:      u.created_at,
    full_name:       profileMap[u.id]?.full_name  ?? '',
    phone:           profileMap[u.id]?.phone      ?? '',
    points:          profileMap[u.id]?.points     ?? 0,
    tier:            profileMap[u.id]?.tier       ?? 'bronze',
    is_admin:        profileMap[u.id]?.is_admin   ?? false,
    is_blocked:      profileMap[u.id]?.is_blocked ?? false,
    booking_count:   countMap[u.id] ?? 0,
  }));

  return NextResponse.json({ users: combined });
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { user_id, is_admin, is_blocked } = await request.json();
  if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });

  const supabase = getAdminClient();
  const update: Record<string, boolean> = {};
  if (is_admin   !== undefined) update.is_admin   = !!is_admin;
  if (is_blocked !== undefined) update.is_blocked = !!is_blocked;

  const { error } = await supabase.from('user_profiles').update(update).eq('id', user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
