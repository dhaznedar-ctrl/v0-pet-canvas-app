import 'server-only'
import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  }
  return _resend
}

const FROM_EMAIL = 'Pet Canvas <noreply@petcanvas.art>'

export async function sendOrderConfirmation(to: string, orderId: number, productName: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Pet Canvas order is confirmed! 🎨',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px;">Thank you for your order!</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Your order <strong>#${orderId}</strong> for <strong>${productName}</strong> has been confirmed.
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            We're generating your pet portrait now. You'll receive another email when it's ready for download.
          </p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">
            Pet Canvas — Museum-quality AI pet portraits<br/>
            <a href="mailto:info@petcanvas.art">info@petcanvas.art</a>
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send order confirmation:', error)
  }
}

export async function sendGenerationComplete(to: string, jobId: number, downloadUrl: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your pet portrait is ready! 🖼️',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px;">Your portrait is ready!</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Your AI pet portrait has been generated and is ready for download.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}"
               style="background: #1a1a1a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px;">
              View & Download Your Portrait
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            This link will be available for 24 hours. Please download your portrait before it expires.
          </p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">
            Pet Canvas — Museum-quality AI pet portraits<br/>
            <a href="mailto:info@petcanvas.art">info@petcanvas.art</a>
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send generation complete email:', error)
  }
}

export async function sendPrintOrderConfirmation(to: string, orderId: number, productName: string, size: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your canvas print order has been placed! 🖼️',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px;">Print order confirmed!</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Your order <strong>#${orderId}</strong> for a <strong>${size} ${productName}</strong> has been sent to our printing partner.
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            You'll receive a shipping confirmation with tracking info once your print ships (typically 3-5 business days).
          </p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">
            Pet Canvas — Museum-quality AI pet portraits<br/>
            <a href="mailto:info@petcanvas.art">info@petcanvas.art</a>
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send print order confirmation:', error)
  }
}
