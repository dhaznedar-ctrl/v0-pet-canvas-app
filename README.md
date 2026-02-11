# Pet Canvas

AI-powered portrait generation platform. Upload a photo, choose an art style, and receive a museum-quality portrait in minutes.

**Live:** [create.petcanvas.art](https://create.petcanvas.art)

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **AI:** Fal.ai (nano-banana-pro)
- **Database:** Neon PostgreSQL (serverless)
- **Storage:** Cloudflare R2
- **Payments:** iyzico
- **Email:** Resend
- **Print:** Printful
- **Security:** Cloudflare Turnstile, rate limiting, CSRF, CSP

## Development

```bash
pnpm install
pnpm dev
```

## Deployment

Push to `main` branch — Vercel auto-deploys.
