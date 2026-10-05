export function database(): D1Database {
  throw new Error('Legacy Cloudflare D1 endpoint is disabled on the Vercel build. The Vectta UI uses Supabase.');
}
