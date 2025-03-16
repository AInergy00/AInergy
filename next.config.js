/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXTJS_DIST_DIR || '.next',
  output: 'standalone',
  poweredByHeader: false,
  images: {
    domains: ['via.placeholder.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig 