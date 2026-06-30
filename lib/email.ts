import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOrderConfirmation(
  email: string,
  name: string,
  orderId: string,
  items: { name: string; downloadUrl: string }[],
  total: number,
  locale: string = 'en'
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const itemsList = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;">${item.name}</td>
          <td style="padding:8px 0;text-align:right;">
            <a href="${appUrl}/${locale}/orders/${orderId}" style="color:#00F5FF;">Download</a>
          </td>
        </tr>`
    )
    .join('')

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Order Confirmed — ${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:sans-serif;background:#0A0F1E;color:#fff;padding:40px;">
        <div style="max-width:600px;margin:0 auto;background:#0D1526;border:1px solid #1E293B;border-radius:12px;padding:40px;">
          <h1 style="color:#00F5FF;margin-bottom:8px;">Payment Confirmed ✓</h1>
          <p style="color:#94A3B8;">Hi ${name}, your order has been processed.</p>
          
          <div style="margin:24px 0;padding:24px;background:#0A0F1E;border-radius:8px;">
            <p style="color:#64748B;margin:0 0 4px;">Order ID</p>
            <p style="font-family:monospace;color:#fff;margin:0;">${orderId}</p>
          </div>
          
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid #1E293B;">
                <th style="text-align:left;padding:8px 0;color:#64748B;">Product</th>
                <th style="text-align:right;padding:8px 0;color:#64748B;">Download</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>
          
          <div style="margin-top:24px;padding-top:24px;border-top:1px solid #1E293B;">
            <p style="color:#64748B;margin:0 0 4px;">Total Paid</p>
            <p style="font-size:24px;color:#00F5FF;margin:0;">$${total.toFixed(2)}</p>
          </div>
          
          <a href="${appUrl}/${locale}/orders/${orderId}" 
             style="display:inline-block;margin-top:24px;padding:12px 24px;background:#00F5FF;color:#0A0F1E;border-radius:8px;text-decoration:none;font-weight:600;">
            View My Order
          </a>
          
          <p style="margin-top:32px;color:#475569;font-size:14px;">
            Download links expire in 48 hours. Contact us if you have any issues.
          </p>
        </div>
      </body>
      </html>
    `,
  })
}
