'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface DeleteTaskButtonProps {
  taskId: string;
  backLink: string;
}

export default function DeleteTaskButton({ taskId, backLink }: DeleteTaskButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/tasks/${taskId}/delete`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 성공적으로 삭제되면 목록 페이지로 이동
        router.push(backLink);
      } else {
        console.error('삭제 실패:', data);
        alert(data.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('삭제 중 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </Button>
  );
} 