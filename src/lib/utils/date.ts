import { format, formatDistance, parseISO, isValid, differenceInDays, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜를 포맷팅하는 함수
 * @param date 날짜 (Date 객체, 문자열, 숫자)
 * @param formatStr 포맷 문자열 (기본값: 'PPP')
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(date: Date | string, formatStr = 'PPP') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ko });
}

/**
 * 시간을 포맷팅하는 함수
 * @param time 시간 문자열
 * @returns 포맷팅된 시간 문자열 (HH:mm)
 */
export function formatTime(time: Date | string): string {
  if (typeof time === 'string') {
    // ISO 문자열이 아닌 경우 (예: "14:30") 그대로 반환
    if (!time.includes('T') && !time.includes('Z')) {
      return time;
    }
    // ISO 문자열인 경우 파싱
    return format(parseISO(time), 'HH:mm');
  }
  
  return format(time, 'HH:mm');
}

export function parseDateTime(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  
  try {
    const datePart = parseISO(dateStr);
    
    if (!isValid(datePart)) return null;
    
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      datePart.setHours(hours || 0, minutes || 0);
    }
    
    return datePart;
  } catch (error) {
    console.error('날짜 파싱 오류:', error);
    return null;
  }
}

export function isDeadlineApproaching(dueDate: Date | string): boolean {
  const today = new Date();
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  
  if (!isValid(dueDateObj)) return false;
  
  // 마감일이 오늘이거나 내일, 모레인 경우
  return (
    differenceInDays(dueDateObj, today) <= 2 && 
    !isBefore(dueDateObj, today)
  );
}

export function isOverdue(dueDate: Date | string): boolean {
  const today = new Date();
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  
  if (!isValid(dueDateObj)) return false;
  
  return isBefore(dueDateObj, today);
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const day = date.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
  
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function formatRelativeDate(date: Date | string) {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: ko });
} 