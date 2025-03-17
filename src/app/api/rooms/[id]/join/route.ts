import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const roomId = context.params.id;
    
    // JSON 파싱 시 오류 처리를 위한 별도 try-catch
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return NextResponse.json(
        { error: '잘못된 요청 데이터 형식입니다.' },
        { status: 400 }
      );
    }
    
    const { inviteCode } = requestData;

    // 방 존재 확인
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      return NextResponse.json({ error: '협업 공간을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이미 참여한 멤버인지 확인
    const existingMember = await prisma.roomMember.findFirst({
      where: {
        userId: session.user.id,
        roomId,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: '이미 참여한 협업 공간입니다.' }, { status: 400 });
    }

    // 초대 코드 확인 (비공개 방인 경우)
    if (room.password && room.password !== inviteCode) {
      return NextResponse.json({ error: '유효하지 않은 초대 코드입니다.' }, { status: 403 });
    }

    // 방에 참여
    const newMember = await prisma.roomMember.create({
      data: {
        userId: session.user.id,
        roomId,
        role: 'member', // 소문자로 수정 (스키마에 맞게)
      },
    });

    return NextResponse.json(newMember);
  } catch (error) {
    console.error('협업 공간 참여 중 오류 발생:', error);
    return NextResponse.json(
      { error: '협업 공간 참여 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 