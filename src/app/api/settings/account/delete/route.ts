import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// 계정 삭제
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 });
    }

    // 현재 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 400 });
    }

    // 사용자 관련 데이터 삭제 (트랜잭션 사용)
    await prisma.$transaction(async (tx) => {
      // 사용자가 소유한 방의 멤버 삭제
      await tx.roomMember.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      // 사용자가 소유한 방 삭제
      await tx.room.deleteMany({
        where: {
          members: {
            some: {
              userId: session.user.id,
              role: 'OWNER',
            },
          },
        },
      });

      // 사용자의 태스크 삭제
      await tx.task.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      // 사용자의 캘린더 삭제
      await tx.calendar.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      // 사용자 계정 삭제 (관련 설정은 cascade로 자동 삭제됨)
      await tx.user.delete({
        where: {
          id: session.user.id,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('계정 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '계정을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 