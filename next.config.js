/** @type {import('next').NextConfig} */
const nextConfig = {
  // Task 3: Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; img-src 'self' cdn.wspanelas.com https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" 
          },
        ],
      },
    ]
  },
  // Task 5: Image hotlink protection
  images: {
    // Note: CDN-level Referer restriction should also be configured for wspanelas.com domain only.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.wspanelas.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
