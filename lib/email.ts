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
const SITE_URL = process.env.NEXTAUTH_URL || 'https://create.petcanvas.art'

// ── Shared email layout pieces ──

function emailWrapper(content: string) {
  return `
    <div style="background-color: #f5f3ef; padding: 32px 16px; font-family: 'Georgia', 'Times New Roman', serif;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        ${content}
      </div>
      <!-- Footer -->
      <div style="max-width: 580px; margin: 20px auto 0; text-align: center;">
        <p style="color: #999; font-size: 11px; margin: 0; line-height: 1.6;">
          Pet Canvas — Museum-quality AI pet portraits<br/>
          <a href="https://petcanvas.art" style="color: #999; text-decoration: none;">petcanvas.art</a>
          &nbsp;&middot;&nbsp;
          <a href="mailto:info@petcanvas.art" style="color: #999; text-decoration: none;">info@petcanvas.art</a>
        </p>
      </div>
    </div>
  `
}

function emailHeader() {
  return `
    <div style="padding: 28px 24px 20px; text-align: center; border-bottom: 1px solid #f0ede8;">
      <h1 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; color: #2c2c2c;">
        PET CANVAS
      </h1>
      <p style="margin: 0; font-size: 10px; letter-spacing: 2px; color: #b0a48c; text-transform: uppercase;">
        Museum-Quality AI Portraits
      </p>
    </div>
  `
}

function canvasFrameMockup(imageUrl: string) {
  return `
    <div style="padding: 32px 24px; text-align: center; background: linear-gradient(180deg, #ece8e1 0%, #f5f3ef 40%, #e8e4dd 100%);">
      <!-- Wall shadow behind frame -->
      <div style="display: inline-block; padding: 14px; background: linear-gradient(145deg, #8b7355 0%, #6b5a42 20%, #4a3c2a 80%, #3d3225 100%); box-shadow: 8px 10px 28px rgba(0,0,0,0.35), 2px 2px 8px rgba(0,0,0,0.15); border-radius: 2px;">
        <!-- Inner mat / passepartout -->
        <div style="padding: 6px; background: #f8f6f2; box-shadow: inset 0 0 3px rgba(0,0,0,0.1);">
          <img src="${imageUrl}" alt="Your Portrait" style="display: block; max-width: 100%; width: 320px; height: auto;" />
        </div>
      </div>
    </div>
  `
}

function goldButton(url: string, text: string) {
  return `
    <div style="text-align: center; margin: 0 0 24px 0;">
      <a href="${url}"
         style="display: inline-block; background: #2c2c2c; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: 'Georgia', serif;">
        ${text}
      </a>
    </div>
  `
}

// ── Order Confirmation ──

export async function sendOrderConfirmation(to: string, orderId: number, productName: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Order Confirmed — Pet Canvas #' + orderId,
      html: emailWrapper(`
        ${emailHeader()}
        <div style="padding: 32px 32px 24px; text-align: center;">
          <h2 style="color: #2c2c2c; font-size: 22px; font-weight: 400; margin: 0 0 16px 0;">
            Thank You for Your Order
          </h2>
          <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0;">
            Your order <strong style="color: #2c2c2c;">#${orderId}</strong> for
            <strong style="color: #2c2c2c;">${productName}</strong> has been confirmed.
          </p>
          <div style="background: #faf8f5; border: 1px solid #ede9e3; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6;">
              Your portrait will be delivered to this email address shortly.
            </p>
          </div>
        </div>
      `),
    })
  } catch (error) {
    console.error('Failed to send order confirmation:', error)
  }
}

// ── Digital Download ──

export async function sendDigitalDownloadEmail(
  to: string,
  orderId: number,
  previewUrl: string,
) {
  const downloadUrl = `${SITE_URL}/api/download/${orderId}`

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Masterpiece is Ready — Download Now',
      html: emailWrapper(`
        ${emailHeader()}

        <!-- Canvas frame mockup -->
        ${canvasFrameMockup(previewUrl)}

        <!-- Quality Notice Banner -->
        <div style="margin: 0 24px; padding: 12px 16px; background: linear-gradient(135deg, #fef9e7 0%, #fdf6d8 100%); border: 1px solid #e8d48b; border-radius: 4px; text-align: center;">
          <p style="color: #8b6914; font-size: 12px; font-weight: 600; margin: 0; line-height: 1.5;">
            ⚠ The image above is a low-resolution email preview. Your full print-ready portrait is available via the download button below.
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 28px 32px 8px; text-align: center;">
          <h2 style="color: #2c2c2c; font-size: 22px; font-weight: 400; margin: 0 0 8px 0;">
            Your Masterpiece is Ready
          </h2>
          <p style="color: #888; font-size: 13px; line-height: 1.7; margin: 0 0 28px 0;">
            Your high-resolution, watermark-free portrait is ready for download.
          </p>

          <!-- Large Download Button -->
          <div style="text-align: center; margin: 0 0 12px 0;">
            <a href="${downloadUrl}"
               style="display: inline-block; background: #2c2c2c; color: #ffffff; padding: 18px 44px; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Georgia', serif;">
              DOWNLOAD YOUR 4K HD PORTRAIT
            </a>
          </div>

          <!-- Resolution Badge -->
          <div style="text-align: center; margin: 0 0 28px 0;">
            <span style="display: inline-block; background: #f0ede8; color: #8b7355; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;">
              4K &middot; 300 DPI &middot; PRINT-READY
            </span>
          </div>

          <!-- Order details -->
          <div style="background: #faf8f5; border: 1px solid #ede9e3; border-radius: 4px; padding: 16px; margin-bottom: 24px; text-align: left;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #999; font-size: 12px; padding: 5px 0;">Order</td>
                <td style="color: #444; font-size: 12px; padding: 5px 0; text-align: right;">#${orderId}</td>
              </tr>
              <tr>
                <td style="color: #999; font-size: 12px; padding: 5px 0;">Format</td>
                <td style="color: #444; font-size: 12px; padding: 5px 0; text-align: right;">High-Resolution JPG</td>
              </tr>
              <tr>
                <td style="color: #999; font-size: 12px; padding: 5px 0;">Resolution</td>
                <td style="color: #444; font-size: 12px; padding: 5px 0; text-align: right;">Email Preview: 72 DPI → Your Download: 300 DPI (print-ready 4K)</td>
              </tr>
              <tr>
                <td style="color: #999; font-size: 12px; padding: 5px 0;">Download Link</td>
                <td style="color: #444; font-size: 12px; padding: 5px 0; text-align: right;">Valid for 7 days</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Upsell -->
        <div style="padding: 0 32px 28px; text-align: center; border-top: 1px solid #f0ede8; margin: 0 32px;">
          <p style="color: #b0a48c; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 20px 0 8px 0;">
            Bring it to life
          </p>
          <p style="color: #888; font-size: 13px; margin: 0 0 12px 0;">
            Order a museum-quality canvas or poster print.
          </p>
          <a href="${SITE_URL}" style="color: #2c2c2c; font-size: 13px; text-decoration: underline; font-weight: 600;">
            Shop Prints
          </a>
        </div>
      `),
    })
  } catch (error) {
    console.error('Failed to send digital download email:', error)
  }
}

// ── Generation Complete (free preview notification) ──

export async function sendGenerationComplete(to: string, jobId: number, downloadUrl: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Pet Portrait is Ready',
      html: emailWrapper(`
        ${emailHeader()}
        <div style="padding: 32px 32px 28px; text-align: center;">
          <h2 style="color: #2c2c2c; font-size: 22px; font-weight: 400; margin: 0 0 12px 0;">
            Your Portrait is Ready
          </h2>
          <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0 0 28px 0;">
            Your AI pet portrait has been generated. View your watermarked preview and unlock the full resolution.
          </p>
          ${goldButton(downloadUrl, 'View Your Portrait')}
          <p style="color: #bbb; font-size: 12px; margin: 0;">
            This preview link is available for 24 hours.
          </p>
        </div>
      `),
    })
  } catch (error) {
    console.error('Failed to send generation complete email:', error)
  }
}

// ── Print Order Confirmation ──

export async function sendPrintOrderConfirmation(to: string, orderId: number, productName: string, size: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Print Order Confirmed — Pet Canvas #' + orderId,
      html: emailWrapper(`
        ${emailHeader()}
        <div style="padding: 32px 32px 28px; text-align: center;">
          <h2 style="color: #2c2c2c; font-size: 22px; font-weight: 400; margin: 0 0 12px 0;">
            Print Order Confirmed
          </h2>
          <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0;">
            Your order <strong style="color: #2c2c2c;">#${orderId}</strong> for a
            <strong style="color: #2c2c2c;">${size} ${productName}</strong>
            has been sent to our printing partner.
          </p>
          <div style="background: #faf8f5; border: 1px solid #ede9e3; border-radius: 4px; padding: 16px; margin-bottom: 24px; text-align: left;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #999; font-size: 12px; padding: 5px 0;">Order</td>
                <td style="color: #444; font-size: 12px; padding: 5px 0; text-align: right;">#${orderId}</td>
              </tr>
              <tr>
                <td style="color: #999; font-size: 12px; padding: 5px 0;">Size</td>
                <td style="color: #444; font-size: 12px; padding: 5px 0; text-align: right;">${size}</td>
              </tr>
              <tr>
                <td style="color: #999; font-size: 12px; padding: 5px 0;">Shipping</td>
                <td style="color: #444; font-size: 12px; padding: 5px 0; text-align: right;">3–5 business days</td>
              </tr>
            </table>
          </div>
          <p style="color: #888; font-size: 13px; margin: 0;">
            You'll receive a tracking email once your print ships.
          </p>
        </div>
      `),
    })
  } catch (error) {
    console.error('Failed to send print order confirmation:', error)
  }
}

// ── Abandoned Cart Reminder (24h) ──

export async function sendAbandonedCartEmail(
  to: string,
  jobId: number,
  previewUrl: string,
) {
  const recoveryUrl = `${SITE_URL}/?jobId=${jobId}`

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Masterpiece is Waiting...',
      html: emailWrapper(`
        ${emailHeader()}

        <!-- Canvas frame mockup -->
        ${canvasFrameMockup(previewUrl)}

        <!-- Content -->
        <div style="padding: 28px 32px 8px; text-align: center;">
          <h2 style="color: #2c2c2c; font-size: 22px; font-weight: 400; margin: 0 0 8px 0;">
            Your Masterpiece is Waiting
          </h2>
          <p style="color: #888; font-size: 13px; line-height: 1.7; margin: 0 0 6px 0;">
            You created a beautiful portrait but haven't downloaded it yet.
          </p>
          <p style="color: #888; font-size: 13px; line-height: 1.7; margin: 0 0 28px 0;">
            Unlock the watermark-free, high-resolution version before it expires.
          </p>

          ${goldButton(recoveryUrl, 'Complete Your Purchase')}

          <!-- What you get -->
          <div style="background: #faf8f5; border: 1px solid #ede9e3; border-radius: 4px; padding: 16px; margin-bottom: 24px; text-align: left;">
            <p style="color: #b0a48c; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px 0; font-weight: 600;">
              What you'll get
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #666; font-size: 12px; padding: 4px 0;">High-resolution digital file</td>
                <td style="color: #2c2c2c; font-size: 12px; padding: 4px 0; text-align: right; font-weight: 600;">Included</td>
              </tr>
              <tr>
                <td style="color: #666; font-size: 12px; padding: 4px 0;">Watermark removed</td>
                <td style="color: #2c2c2c; font-size: 12px; padding: 4px 0; text-align: right; font-weight: 600;">Included</td>
              </tr>
              <tr>
                <td style="color: #666; font-size: 12px; padding: 4px 0;">Print-ready quality</td>
                <td style="color: #2c2c2c; font-size: 12px; padding: 4px 0; text-align: right; font-weight: 600;">Included</td>
              </tr>
            </table>
          </div>

          <p style="color: #bbb; font-size: 12px; margin: 0 0 24px 0;">
            This preview will expire soon. Don't miss your unique creation.
          </p>
        </div>
      `),
    })
  } catch (error) {
    console.error('Failed to send abandoned cart email:', error)
  }
}

// ── Support Ticket Confirmation ──

export async function sendSupportTicketConfirmation(to: string, ticketNumber: string, subject: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `We Got Your Message — Ticket ${ticketNumber}`,
      html: emailWrapper(`
        ${emailHeader()}
        <div style="padding: 32px 32px 28px; text-align: center;">
          <h2 style="color: #2c2c2c; font-size: 22px; font-weight: 400; margin: 0 0 12px 0;">
            We Got Your Message
          </h2>
          <div style="background: #faf8f5; border: 1px solid #ede9e3; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #b0a48c; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0; font-weight: 600;">
              Ticket Number
            </p>
            <p style="color: #2c2c2c; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin: 0;">
              ${ticketNumber}
            </p>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0 0 8px 0;">
            <strong>Subject:</strong> ${subject}
          </p>
          <p style="color: #888; font-size: 13px; line-height: 1.7; margin: 0 0 24px 0;">
            Our team will review your request and get back to you within 24 hours. Please keep this ticket number for your reference.
          </p>
          <p style="color: #bbb; font-size: 12px; margin: 0;">
            If you need to follow up, reply to this email or contact <a href="mailto:info@petcanvas.art" style="color: #b0a48c;">info@petcanvas.art</a>.
          </p>
        </div>
      `),
    })
  } catch (error) {
    console.error('Failed to send support ticket confirmation:', error)
  }
}

// ── OTP Email ──

export async function sendOTPEmail(to: string, code: string) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Pet Canvas Verification Code: ${code}`,
      html: emailWrapper(`
        ${emailHeader()}
        <div style="padding: 32px 32px 28px; text-align: center;">
          <h2 style="color: #2c2c2c; font-size: 22px; font-weight: 400; margin: 0 0 12px 0;">
            Your Verification Code
          </h2>
          <div style="background: #faf8f5; border: 1px solid #ede9e3; border-radius: 4px; padding: 24px; margin-bottom: 20px;">
            <p style="color: #2c2c2c; font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: monospace;">
              ${code}
            </p>
          </div>
          <p style="color: #888; font-size: 13px; line-height: 1.7; margin: 0 0 8px 0;">
            Use this code to access your order history. It expires in 10 minutes.
          </p>
          <p style="color: #bbb; font-size: 12px; margin: 0;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `),
    })
  } catch (error) {
    console.error('Failed to send OTP email:', error)
  }
}
