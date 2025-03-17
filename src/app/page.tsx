import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <main className="flex-1">
        <section className="py-12 md:py-20 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                >
                  AI로 더 스마트한 <span className="text-primary">학교생활</span>을 경험하세요
                </h1>
                
                <p 
                  className="text-xl text-muted-foreground"
                >
                  AI 어시스트는 학생과 교사를 위한 지능형 업무 관리 플랫폼입니다. 
                  일정 관리, 과제 추적, 협업 기능을 통해 학교생활을 더 효율적으로 만들어 드립니다.
                </p>
                
                <div 
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Link 
                    href="/register" 
                    className="btn btn-primary px-8 py-3 rounded-md text-lg font-medium"
                  >
                    시작하기
                  </Link>
                  <Link 
                    href="/login" 
                    className="btn btn-outline px-8 py-3 rounded-md text-lg font-medium"
                  >
                    로그인
                  </Link>
                </div>
              </div>
              
              <div 
                className="flex-1"
              >
                <div className="bg-card rounded-xl shadow-lg overflow-hidden border">
                  <div className="p-1 bg-gradient-to-r from-primary/20 to-primary/10">
                    <div className="flex items-center px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="mx-auto text-xs font-medium">AI 어시스트 대시보드</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 bg-background/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">오늘의 일정</h3>
                        <div className="space-y-2">
                          <div className="flex items-center p-2 rounded bg-primary/5">
                            <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                            <span className="text-sm">수학 과제 제출</span>
                            <span className="ml-auto text-xs text-muted-foreground">오후 3:00</span>
                          </div>
                          <div className="flex items-center p-2 rounded bg-primary/5">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-sm">영어 발표 준비</span>
                            <span className="ml-auto text-xs text-muted-foreground">오후 5:00</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">진행 중인 과제</h3>
                        <div className="space-y-1">
                          <div className="text-sm">과학 리포트</div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                          <div className="text-xs text-right text-muted-foreground">70%</div>
                        </div>
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">협업 공간</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            3A
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium">
                            과학
                          </div>
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium">
                            수학
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">스마트 업무 관리</h3>
                <p className="text-muted-foreground">AI가 우선순위를 분석하고 마감일을 추적하여 중요한 업무를 놓치지 않도록 도와줍니다.</p>
              </div>
              
              <div className="bg-card p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">협업 공간</h3>
                <p className="text-muted-foreground">학급, 동아리, 프로젝트별로 협업 공간을 만들어 효율적인 협업과 소통이 가능합니다.</p>
              </div>
              
              <div className="bg-card p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI 학습 분석</h3>
                <p className="text-muted-foreground">학습 패턴을 분석하여 개인화된 학습 계획과 개선 방안을 제안합니다.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
