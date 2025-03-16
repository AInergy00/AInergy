/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  distDir: 'C:/temp/.next-aissist',
  output: 'standalone',
  poweredByHeader: false,
  images: {
    domains: ['via.placeholder.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig 