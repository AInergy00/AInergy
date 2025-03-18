import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('데이터베이스 초기화 중...');
    
    // 데이터베이스 초기화 - 직접 사용자 생성만 진행
    
    // 테스트 사용자 생성
    console.log('테스트 사용자 생성 중...');
    
    // 사용자가 이미 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!existingUser) {
      await prisma.user.create({
        data: {
          name: '테스트 사용자',
          email: 'test@example.com',
          password: await hash('password123', 10),
          image: null,
        },
      });
    } else {
      console.log('테스트 사용자가 이미 존재합니다.');
    }
    
    const existingTeacher = await prisma.user.findUnique({
      where: { email: 'teacher@example.com' }
    });
    
    if (!existingTeacher) {
      await prisma.user.create({
        data: {
          name: '선생님',
          email: 'teacher@example.com',
          password: await hash('password123', 10),
          image: null,
        },
      });
    } else {
      console.log('선생님 사용자가 이미 존재합니다.');
    }

    console.log('데이터베이스 시드가 성공적으로 완료되었습니다.');
  } catch (error) {
    console.error('시드 중 오류 발생:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {}; 