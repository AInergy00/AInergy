import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 클라이언트 요청에 대한 미들웨어 로직
  const { pathname } = request.nextUrl;

  // 에러가 발생한 API 요청 처리
  if (pathname.startsWith('/api/') && request.headers.get('x-middleware-rewrite')) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Internal Server Error',
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  }

  // 유효하지 않은 URL 패턴에 대한 처리
  if (pathname.includes('//') || pathname.endsWith('/.') || pathname.includes('/./', 1)) {
    const url = request.nextUrl.clone();
    url.pathname = '/not-found';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // 미들웨어를 적용할 경로 패턴 정의
  matcher: [
    // 정적 파일 제외
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 