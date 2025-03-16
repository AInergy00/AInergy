// @ts-ignore - Prisma 스키마 업데이트 예정
import { TaskCategory, TaskPriority } from '@prisma/client';

export const categoryColors: Record<TaskCategory, string> = {
  MEETING: '#3b82f6', // 파란색
  BUSINESS_TRIP: '#8b5cf6', // 보라색
  TRAINING: '#10b981', // 초록색
  EVENT: '#f59e0b', // 주황색
  CLASSROOM: '#ef4444', // 빨간색
  TASK: '#6b7280', // 회색
  OTHER: '#9ca3af', // 연한 회색
};

export const priorityColors: Record<TaskPriority, string> = {
  LOW: '#9ca3af', // 연한 회색
  MEDIUM: '#60a5fa', // 파란색
  HIGH: '#f59e0b', // 주황색
  URGENT: '#ef4444', // 빨간색
};

export const categoryLabels: Record<TaskCategory, string> = {
  MEETING: '회의',
  BUSINESS_TRIP: '출장',
  TRAINING: '연수',
  EVENT: '행사',
  CLASSROOM: '담임',
  TASK: '업무',
  OTHER: '기타',
};

export const priorityLabels: Record<TaskPriority, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
  URGENT: '긴급',
};

/**
 * 업무 분류에 따른 색상을 반환하는 함수
 * @param category 업무 분류
 * @returns 색상 코드
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'MEETING':
      return '#3B82F6'; // 파란색
    case 'EVENT':
      return '#10B981'; // 초록색
    case 'TASK':
      return '#F59E0B'; // 주황색
    case 'EDUCATION':
      return '#8B5CF6'; // 보라색
    case 'PERSONAL':
      return '#EC4899'; // 분홍색
    case 'OTHER':
      return '#6B7280'; // 회색
    default:
      return '#6B7280'; // 기본 회색
  }
}

/**
 * 업무 분류에 따른 라벨을 반환하는 함수
 * @param category 업무 분류
 * @returns 라벨 문자열
 */
export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'MEETING':
      return '회의';
    case 'EVENT':
      return '행사';
    case 'TASK':
      return '업무';
    case 'EDUCATION':
      return '교육';
    case 'PERSONAL':
      return '개인';
    case 'OTHER':
      return '기타';
    default:
      return '기타';
  }
}

/**
 * 업무 중요도에 따른 라벨을 반환하는 함수
 * @param priority 업무 중요도
 * @returns 라벨 문자열
 */
export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'HIGH':
      return '높음';
    case 'MEDIUM':
      return '보통';
    case 'LOW':
      return '낮음';
    default:
      return '보통';
  }
}

/**
 * 업무 중요도에 따른 배지 색상 클래스를 반환하는 함수
 * @param priority 업무 중요도
 * @returns 배지 색상 클래스명
 */
export function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'LOW':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
} 