/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  poweredByHeader: false,
  images: {
    domains: ['via.placeholder.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig 