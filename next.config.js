/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  poweredByHeader: false,
  images: {
    domains: ['via.placeholder.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  // 파일 시스템 매핑 설정 (비ASCII 경로 문제 해결)
  output: 'standalone',
  // 외부 패키지 설정 (루트 레벨)
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    '**': ['node_modules/**/*.js', 'prisma/**/*'],
  },
  // 서버 에러 처리를 위한 설정
  onDemandEntries: {
    // 개발 서버에서 컴파일된 페이지를 메모리에 유지하는 시간(ms)
    maxInactiveAge: 60 * 1000,
    // 동시에 메모리에 유지할 페이지 수
    pagesBufferLength: 5,
  },
  
  // 에러 발생 시 서버 로그 세부 정보 표시
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // 실험 기능 활성화
  experimental: {
    // 서버 액션 활성화
    serverActions: true,
  },
}

module.exports = nextConfig 