import { NextResponse } from 'next/server';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

/**
 * 에러 메시지와 코드를 스트링 형태로 변환
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  return String(error);
}

/**
 * API 에러 응답 객체 생성
 */
export function createErrorResponse(error: unknown, status = 500) {
  console.error('API Error:', error);
  
  let message = 'Internal Server Error';
  let code = 'internal_server_error';
  let responseStatus = status;
  
  if (error instanceof Error) {
    message = error.message;
    
    if ('code' in error && typeof (error as ApiError).code === 'string') {
      code = (error as ApiError).code as string;
    }
    
    if ('status' in error && typeof (error as ApiError).status === 'number') {
      responseStatus = (error as ApiError).status || responseStatus;
    }
  }
  
  return NextResponse.json(
    { error: { message, code } },
    { status: responseStatus }
  );
}

/**
 * 사용자 정의 에러 생성
 */
export function createApiError(message: string, code: string, status = 400): ApiError {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.status = status;
  return error;
}

/**
 * 데이터베이스 오류 처리
 */
export function handleDatabaseError(error: unknown): ApiError {
  console.error('Database error:', error);
  
  if (error instanceof Error) {
    // 특정 DB 오류 패턴에 맞는 사용자 친화적 메시지 반환
    if (error.message.includes('duplicate key')) {
      return createApiError('이미 존재하는 데이터입니다.', 'duplicate_entry', 409);
    }
    
    if (error.message.includes('not found')) {
      return createApiError('요청한 데이터를 찾을 수 없습니다.', 'not_found', 404);
    }
  }
  
  // 기본 에러
  return createApiError('데이터베이스 오류가 발생했습니다.', 'database_error', 500);
} 