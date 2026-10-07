import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://pldxmxgrgyfwtnhxqaji.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://pldxmxgrgyfwtnhxqaji.supabase.co wss://pldxmxgrgyfwtnhxqaji.supabase.co",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {key:"Content-Security-Policy", value:csp},
  {key:"Referrer-Policy", value:"strict-origin-when-cross-origin"},
  {key:"X-Content-Type-Options", value:"nosniff"},
  {key:"X-Frame-Options", value:"DENY"},
  {key:"Permissions-Policy", value:"camera=(), microphone=(), geolocation=(), payment=(), usb=()"},
  {key:"Cross-Origin-Opener-Policy", value:"same-origin"},
  {key:"Cross-Origin-Resource-Policy", value:"same-origin"},
  {key:"Strict-Transport-Security", value:"max-age=31536000"},
];

const nextConfig: NextConfig = {
  poweredByHeader:false,
  async headers(){
    return [{source:"/:path*",headers:securityHeaders}];
  },
};

export default nextConfig;
