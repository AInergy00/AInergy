import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // 서버 에러 처리를 위한 기본적인 미들웨어 로직
    return NextResponse.next();
  } catch (error) {
    console.error('Rooms middleware error:', error);
    
    // 에러 페이지로 리다이렉션 또는 에러 응답 반환
    return new NextResponse(JSON.stringify({ 
      error: '서버에 문제가 발생했습니다.',
      message: error instanceof Error ? error.message : '알 수 없는 오류'
    }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' }
    });
  }
}

// 이 미들웨어가 적용될 경로 패턴 지정
export const config = {
  matcher: '/rooms/:path*',
}; 