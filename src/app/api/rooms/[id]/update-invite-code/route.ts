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
    
    // JSON 파싱 오류 처리
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

    if (!inviteCode) {
      return NextResponse.json({ error: '초대 코드가 필요합니다.' }, { status: 400 });
    }

    // 방 존재 확인 및 현재 사용자의 권한 확인
    const roomWithMember = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        members: {
          where: {
            userId: session.user.id,
            role: 'admin', // 관리자 권한을 가진 사용자만 확인
          },
        },
      },
    });

    if (!roomWithMember) {
      return NextResponse.json({ error: '협업 공간을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 권한 확인 (admin 역할을 가진 사용자만 초대 코드 변경 가능)
    if (roomWithMember.members.length === 0) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 초대 코드 업데이트 (password 필드 사용)
    const updatedRoom = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        password: inviteCode,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedRoom.id,
      name: updatedRoom.name,
      description: updatedRoom.description,
      inviteCode: updatedRoom.password, // password를 inviteCode로 매핑
      members: updatedRoom.members,
      createdAt: updatedRoom.createdAt,
      updatedAt: updatedRoom.updatedAt,
    });
  } catch (error) {
    console.error('초대 코드 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '초대 코드 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 