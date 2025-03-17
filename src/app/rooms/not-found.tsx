import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

export default function RoomsNotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-600 mb-4">협업 공간을 찾을 수 없습니다</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            요청하신 협업 공간이 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rooms">
              <Button className="px-6 py-2 bg-primary-600 hover:bg-primary-700">
                협업 공간 목록으로
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="px-6 py-2">
                대시보드로 이동
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 