'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/layout/Layout';
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState({
    apiKeys: false,
    aiModels: false,
    account: false,
    deleteAccount: false,
  });

  // API 키 상태
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    gemini: '',
  });
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showGemini, setShowGemini] = useState(false);

  // AI 모델 설정 상태
  const [aiModelSettings, setAiModelSettings] = useState({
    defaultModel: 'openai',
    temperature: 0.7,
    maxTokens: 1000,
    responseStyle: 'balanced',
  });

  // 계정 설정 상태
  const [accountSettings, setAccountSettings] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 계정 삭제 확인 상태
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    password: '',
  });

  // API 키 마스킹 함수
  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '********';
    return `${key.substring(0, 4)}${'*'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (session) {
      fetchApiKeys();
      fetchAiModelSettings();
      fetchAccountSettings();
    }
  }, [session]);

  // API 키 조회
  const fetchApiKeys = async () => {
    try {
      setLoading((prev) => ({ ...prev, apiKeys: true }));
      const response = await fetch('/api/settings/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys({
          openai: data.openai || '',
          gemini: data.gemini || '',
        });
      }
    } catch (error) {
      console.error('API 키 조회 오류:', error);
      alert('API 키를 조회하는 중 오류가 발생했습니다.');
    } finally {
      setLoading((prev) => ({ ...prev, apiKeys: false }));
    }
  };

  // AI 모델 설정 조회
  const fetchAiModelSettings = async () => {
    try {
      setLoading((prev) => ({ ...prev, aiModels: true }));
      const response = await fetch('/api/settings/ai-models');
      if (response.ok) {
        const data = await response.json();
        setAiModelSettings({
          defaultModel: data.defaultModel || 'openai',
          temperature: data.temperature || 0.7,
          maxTokens: data.maxTokens || 1000,
          responseStyle: data.responseStyle || 'balanced',
        });
      }
    } catch (error) {
      console.error('AI 모델 설정 조회 오류:', error);
      alert('AI 모델 설정을 조회하는 중 오류가 발생했습니다.');
    } finally {
      setLoading((prev) => ({ ...prev, aiModels: false }));
    }
  };

  // 계정 설정 조회
  const fetchAccountSettings = async () => {
    try {
      setLoading((prev) => ({ ...prev, account: true }));
      const response = await fetch('/api/settings/account');
      if (response.ok) {
        const data = await response.json();
        setAccountSettings((prev) => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
        }));
      }
    } catch (error) {
      console.error('계정 정보 조회 오류:', error);
      alert('계정 정보를 조회하는 중 오류가 발생했습니다.');
    } finally {
      setLoading((prev) => ({ ...prev, account: false }));
    }
  };

  // API 키 저장
  const saveApiKeys = async () => {
    try {
      setLoading((prev) => ({ ...prev, apiKeys: true }));
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiKeys),
      });

      if (response.ok) {
        alert('API 키가 저장되었습니다.');
      } else {
        const data = await response.json();
        alert(data.error || 'API 키 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('API 키 저장 오류:', error);
      alert('API 키를 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading((prev) => ({ ...prev, apiKeys: false }));
    }
  };

  // AI 모델 설정 저장
  const saveAiModelSettings = async () => {
    try {
      setLoading((prev) => ({ ...prev, aiModels: true }));
      const response = await fetch('/api/settings/ai-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiModelSettings),
      });

      if (response.ok) {
        alert('AI 모델 설정이 저장되었습니다.');
      } else {
        const data = await response.json();
        alert(data.error || 'AI 모델 설정 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('AI 모델 설정 저장 오류:', error);
      alert('AI 모델 설정을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading((prev) => ({ ...prev, aiModels: false }));
    }
  };

  // 계정 설정 저장
  const saveAccountSettings = async () => {
    // 비밀번호 확인 검증
    if (accountSettings.newPassword && accountSettings.newPassword !== accountSettings.confirmPassword) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, account: true }));
      const response = await fetch('/api/settings/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: accountSettings.name,
          email: accountSettings.email,
          currentPassword: accountSettings.currentPassword,
          newPassword: accountSettings.newPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('계정 정보가 업데이트되었습니다.');
        
        // 세션 업데이트
        if (session) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: accountSettings.name,
              email: accountSettings.email,
            },
          });
        }

        // 비밀번호 필드 초기화
        setAccountSettings((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        const data = await response.json();
        alert(data.error || '계정 정보 업데이트 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('계정 정보 업데이트 오류:', error);
      alert('계정 정보를 업데이트하는 중 오류가 발생했습니다.');
    } finally {
      setLoading((prev) => ({ ...prev, account: false }));
    }
  };

  // 계정 삭제
  const deleteAccount = async () => {
    if (!deleteConfirmation.password) {
      alert('계정 삭제를 위해 비밀번호를 입력해주세요.');
      return;
    }

    if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, deleteAccount: true }));
      const response = await fetch('/api/settings/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deleteConfirmation.password,
        }),
      });

      if (response.ok) {
        alert('계정이 성공적으로 삭제되었습니다. 로그아웃됩니다.');
        window.location.href = '/';
      } else {
        const data = await response.json();
        alert(data.error || '계정 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      alert('계정을 삭제하는 중 오류가 발생했습니다.');
    } finally {
      setLoading((prev) => ({ ...prev, deleteAccount: false }));
      setDeleteConfirmation({ show: false, password: '' });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">설정</h1>
        
        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="api-keys">API 키 관리</TabsTrigger>
            <TabsTrigger value="ai-models">AI 모델 설정</TabsTrigger>
            <TabsTrigger value="account">계정 설정</TabsTrigger>
          </TabsList>
          
          {/* API 키 관리 */}
          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle>API 키 관리</CardTitle>
                <CardDescription>
                  OpenAI와 Google Gemini API 키를 설정하여 AI 기능을 사용할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="openai-api-key" className="block text-sm font-medium">OpenAI API 키</label>
                  <div className="flex">
                    <Input
                      id="openai-api-key"
                      type={showOpenAI ? "text" : "password"}
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                      placeholder="sk-..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowOpenAI(!showOpenAI)}
                      className="ml-2"
                    >
                      {showOpenAI ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    OpenAI API 키는 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI 대시보드</a>에서 생성할 수 있습니다.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="gemini-api-key" className="block text-sm font-medium">Google Gemini API 키</label>
                  <div className="flex">
                    <Input
                      id="gemini-api-key"
                      type={showGemini ? "text" : "password"}
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                      placeholder="AIza..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowGemini(!showGemini)}
                      className="ml-2"
                    >
                      {showGemini ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Gemini API 키는 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>에서 생성할 수 있습니다.
                  </p>
                </div>
                
                <Button onClick={saveApiKeys} disabled={loading.apiKeys}>
                  {loading.apiKeys ? '저장 중...' : 'API 키 저장'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AI 모델 설정 */}
          <TabsContent value="ai-models">
            <Card>
              <CardHeader>
                <CardTitle>AI 모델 설정</CardTitle>
                <CardDescription>
                  AI 모델의 기본 설정을 조정하여 응답 생성 방식을 맞춤화할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">기본 AI 제공자</label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="openai"
                        name="defaultModel"
                        value="openai"
                        checked={aiModelSettings.defaultModel === 'openai'}
                        onChange={(e) => setAiModelSettings({ ...aiModelSettings, defaultModel: e.target.value })}
                        className="h-4 w-4"
                      />
                      <label htmlFor="openai" className="text-sm">OpenAI</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="gemini"
                        name="defaultModel"
                        value="gemini"
                        checked={aiModelSettings.defaultModel === 'gemini'}
                        onChange={(e) => setAiModelSettings({ ...aiModelSettings, defaultModel: e.target.value })}
                        className="h-4 w-4"
                      />
                      <label htmlFor="gemini" className="text-sm">Google Gemini</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="block text-sm font-medium">온도 (Temperature): {aiModelSettings.temperature.toFixed(1)}</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiModelSettings.temperature}
                    onChange={(e) => setAiModelSettings({ ...aiModelSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    낮은 값은 더 일관된 응답을, 높은 값은 더 창의적인 응답을 생성합니다.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="block text-sm font-medium">최대 토큰 수: {aiModelSettings.maxTokens}</label>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={aiModelSettings.maxTokens}
                    onChange={(e) => setAiModelSettings({ ...aiModelSettings, maxTokens: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    AI가 생성할 수 있는 최대 텍스트 길이를 제한합니다.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">응답 스타일</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        id="creative"
                        name="responseStyle"
                        value="creative"
                        checked={aiModelSettings.responseStyle === 'creative'}
                        onChange={(e) => setAiModelSettings({ ...aiModelSettings, responseStyle: e.target.value })}
                        className="h-4 w-4"
                      />
                      <label htmlFor="creative" className="text-sm">창의적 (Creative)</label>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        id="balanced"
                        name="responseStyle"
                        value="balanced"
                        checked={aiModelSettings.responseStyle === 'balanced'}
                        onChange={(e) => setAiModelSettings({ ...aiModelSettings, responseStyle: e.target.value })}
                        className="h-4 w-4"
                      />
                      <label htmlFor="balanced" className="text-sm">균형 (Balanced)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="precise"
                        name="responseStyle"
                        value="precise"
                        checked={aiModelSettings.responseStyle === 'precise'}
                        onChange={(e) => setAiModelSettings({ ...aiModelSettings, responseStyle: e.target.value })}
                        className="h-4 w-4"
                      />
                      <label htmlFor="precise" className="text-sm">정확함 (Precise)</label>
                    </div>
                  </div>
                </div>
                
                <Button onClick={saveAiModelSettings} disabled={loading.aiModels}>
                  {loading.aiModels ? '저장 중...' : 'AI 모델 설정 저장'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 계정 설정 */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>계정 설정</CardTitle>
                <CardDescription>
                  계정 정보를 관리하고 비밀번호를 변경할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">이름</label>
                  <Input
                    id="name"
                    value={accountSettings.name}
                    onChange={(e) => setAccountSettings({ ...accountSettings, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">이메일</label>
                  <Input
                    id="email"
                    type="email"
                    value={accountSettings.email}
                    onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">비밀번호 변경</h3>
                  
                  <div className="space-y-2 mb-4">
                    <label htmlFor="current-password" className="block text-sm font-medium">현재 비밀번호</label>
                    <Input
                      id="current-password"
                      type="password"
                      value={accountSettings.currentPassword}
                      onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <label htmlFor="new-password" className="block text-sm font-medium">새 비밀번호</label>
                    <Input
                      id="new-password"
                      type="password"
                      value={accountSettings.newPassword}
                      onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="block text-sm font-medium">비밀번호 확인</label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={accountSettings.confirmPassword}
                      onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                
                <Button onClick={saveAccountSettings} disabled={loading.account}>
                  {loading.account ? '저장 중...' : '계정 정보 저장'}
                </Button>
                
                <div className="pt-6 mt-6 border-t border-red-200">
                  <h3 className="text-lg font-medium mb-4 text-red-600">계정 삭제</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  
                  {deleteConfirmation.show ? (
                    <div className="space-y-4 p-4 border border-red-300 rounded-md bg-red-50">
                      <p className="text-sm font-medium text-red-600">
                        계정 삭제를 확인하려면 비밀번호를 입력하세요.
                      </p>
                      <div className="space-y-2">
                        <label htmlFor="delete-password" className="block text-sm font-medium">비밀번호</label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deleteConfirmation.password}
                          onChange={(e) => setDeleteConfirmation({ ...deleteConfirmation, password: e.target.value })}
                          className="border-red-300"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="destructive" 
                          onClick={deleteAccount} 
                          disabled={loading.deleteAccount}
                        >
                          {loading.deleteAccount ? '처리 중...' : '계정 삭제 확인'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setDeleteConfirmation({ show: false, password: '' })}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="destructive" 
                      onClick={() => setDeleteConfirmation({ ...deleteConfirmation, show: true })}
                    >
                      계정 삭제
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 