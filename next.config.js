/** @type {import('next').NextConfig} */

// Backend berjalan di HTTP (EC2). Agar tidak kena blokir mixed-content saat
// web di-deploy ke Vercel (HTTPS), browser TIDAK pernah memanggil EC2 langsung.
// Semua panggilan dilakukan ke path relatif /api/... lalu di-proxy oleh server
// Next.js ke backend via rewrites di bawah ini.
const API_BASE = process.env.API_BASE_URL || 'http://18.143.171.142:8080';

const nextConfig = {
  async rewrites() {
    return [
      // Proxy seluruh API sesuai kontrak.
      { source: '/api/:path*', destination: `${API_BASE}/api/:path*` },
      // Health check backend berada di /health (di luar /api) — dipakai untuk smoke test.
      { source: '/health', destination: `${API_BASE}/health` },
    ];
  },
};

module.exports = nextConfig;
