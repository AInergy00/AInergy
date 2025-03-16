import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const roomId = params.id;
    const { inviteCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json({ error: '초대 코드가 필요합니다.' }, { status: 400 });
    }

    // 방 존재 확인
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 권한 확인 (방장만 초대 코드 변경 가능)
    if (room.ownerId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 초대 코드 업데이트
    const updatedRoom = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        inviteCode,
        isPrivate: true, // 초대 코드를 설정하면 비공개 방으로 자동 전환
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('초대 코드 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '초대 코드 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 