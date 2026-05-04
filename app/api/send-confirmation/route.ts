import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { to, client_name, package_type, preferred_date, booking_id } = await request.json();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ skipped: true, reason: 'RESEND_API_KEY not configured' });

  if (!to) return NextResponse.json({ skipped: true, reason: 'No email address' });

  const dateStr = preferred_date
    ? new Date(preferred_date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Sẽ được thông báo sau';

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f4;font-family:Arial,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <!-- Header -->
    <div style="background:#265C59;padding:36px 32px;text-align:center">
      <p style="color:rgba(255,255,255,.7);margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Cao Bằng Eco Tour</p>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800">Lịch tour đã được xác nhận!</h1>
      <p style="color:rgba(255,255,255,.75);margin:10px 0 0;font-size:14px">Chúng tôi rất vui được đồng hành cùng bạn</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <p style="color:#334155;font-size:15px;margin:0 0 20px">Xin chào <strong>${client_name}</strong>,</p>
      <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 24px">
        Yêu cầu đặt lịch của bạn đã được <strong style="color:#265C59">xác nhận thành công</strong>.
        Đội ngũ hướng dẫn viên Cao Bằng Eco Tour sẽ liên hệ với bạn trong thời gian sớm nhất để trao đổi chi tiết chuyến đi.
      </p>

      <!-- Booking details -->
      <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 14px;font-size:12px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em">Thông tin đặt lịch</p>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;width:40%">Gói tour</td>
            <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700">${package_type || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b">Ngày mong muốn</td>
            <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b">Mã đặt lịch</td>
            <td style="padding:6px 0;font-size:13px;color:#265C59;font-weight:700;font-family:monospace">#${(booking_id ?? '').toString().slice(0, 8).toUpperCase()}</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#166534;line-height:1.6">
          <strong>Bước tiếp theo:</strong> HDV sẽ gọi điện xác nhận lịch trình cụ thể trong vòng <strong>24 giờ</strong>.
          Nếu bạn cần hỗ trợ gấp, hãy liên hệ qua Zalo hoặc gọi trực tiếp.
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">
        Cảm ơn bạn đã tin tưởng Cao Bằng Eco Tour ❤️<br>
        Email này được gửi tự động, vui lòng không trả lời.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="margin:0;font-size:11px;color:#94a3b8">© 2026 Cao Bằng Eco Tour · Cao Bằng, Việt Nam</p>
    </div>
  </div>
</body>
</html>`;

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@caobangecotour.vn';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `Cao Bằng Eco Tour <${fromEmail}>`, to: [to], subject: `✅ Xác nhận đặt lịch - ${package_type || 'Tour'}`, html }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[send-confirmation] Resend error:', err);
    return NextResponse.json({ error: 'Email failed', detail: (err as { message?: string }).message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
