import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

// 방 목록 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    // 내가 방장인 방 (역할이 'admin'인 방)
    const myRooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: 'admin'
          }
        }
      },
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            role: true
          }
        },
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // 내가 참여한 방 (역할이 'admin'이 아닌 방)
    const joinedRooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: { not: 'admin' }
          }
        }
      },
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            role: true
          }
        },
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ myRooms, joinedRooms });
  } catch (error) {
    console.error('방 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '방 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 방 생성
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { name, description, password } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '방 이름은 필수입니다.' }, { status: 400 });
    }

    // 트랜잭션으로 방 생성 및 사용자를 관리자로 추가
    const result = await prisma.$transaction(async (prismaClient) => {
      // 방 생성
      const room = await prismaClient.room.create({
        data: {
          name,
          description,
          password
        }
      });

      // 방을 생성한 사용자를 admin 역할로 추가
      await prismaClient.roomMember.create({
        data: {
          role: 'admin',
          userId: session.user.id,
          roomId: room.id
        }
      });

      return room;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('방 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '방을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 