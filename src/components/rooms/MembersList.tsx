import React from 'react';
import { formatDate } from '@/lib/utils/date';

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
}

interface MembersListProps {
  members: Member[];
  roomId: string;
  currentUserRole: string | null;
}

export function MembersList({ members, roomId, currentUserRole }: MembersListProps) {
  const sortedMembers = [...members].sort((a, b) => {
    // 방장(admin)을 항상 맨 위로 정렬
    if (a.role === 'admin') return -1;
    if (b.role === 'admin') return 1;
    
    // 그 외에는 이름 알파벳 순
    return a.user.name.localeCompare(b.user.name);
  });

  return (
    <div className="space-y-4">
      {sortedMembers.length === 0 ? (
        <div className="text-center p-4 border rounded-md bg-muted/10">
          <p className="text-muted-foreground">멤버가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedMembers.map((member) => (
            <li 
              key={member.id} 
              className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-secondary/5 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                  {member.user.name?.charAt(0) || '?'}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{member.user.name}</p>
                  {member.user.email && (
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground">가입일: {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                {member.role === 'admin' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    방장
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary-foreground">
                    멤버
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 