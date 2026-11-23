/** URL interno da API Nest (sem /api). O browser só fala com o Next: o cookie de refresh fica no mesmo domínio. */
const API_URL = process.env.API_URL ?? 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] },
  /** Os emails da API apontam para estes caminhos; a UI vive em português. */
  async redirects() {
    return [
      { source: '/register/verify', destination: '/registar/verificar', permanent: false },
      { source: '/reset-password', destination: '/redefinir', permanent: false },
      { source: '/events/:id', destination: '/eventos/:id', permanent: false },
      { source: '/certificates/verify/:id', destination: '/verificar/:id', permanent: false },
    ];
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        // HTTPS apenas (ignorado em http). Diretivas de CSP sem risco para scripts/estilos do Next.
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};
export default config;
