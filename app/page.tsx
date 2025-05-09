'use client';

import Link from 'next/link';
import { ApolloProvider } from '@apollo/client';
import client from './lib/apolloClient';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function Home() {
  const modules = [
    { name: '运行指标', path: '/operational-metrics', icon: '📊' },
    { name: '飞机技术状态', path: '/aircraft-technical-status', icon: '🔧' },
    { name: '飞机运行状态', path: '/aircraft-operational-status', icon: '✈️' },
    { name: '经济性数据', path: '/economic-data', icon: '💹' },
    { name: '天气状况', path: '/weather-conditions', icon: '🌤️' },
  ];

  return (
    <ApolloProvider client={client}>
      <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
        <ErrorBoundary
          fallback={
            <div className="max-w-3xl mx-auto p-6 bg-red-50 rounded-lg border border-red-200 text-center">
              <h2 className="text-2xl font-bold text-red-700 mb-4">应用出错</h2>
              <p className="text-red-600 mb-6">应用程序发生了意外错误，已记录此问题。</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md"
              >
                刷新页面
              </button>
            </div>
          }
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-center my-6 sm:my-10 text-gray-800">越捷湿租项目运营数据看板</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {modules.map((module) => (
                <Link 
                  key={module.path} 
                  href={module.path}
                  className="bg-white hover:bg-blue-50 border border-gray-200 rounded-xl p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl mb-4">{module.icon}</div>
                    <h2 className="text-xl font-semibold text-gray-800">{module.name}</h2>
                    <p className="mt-2 text-gray-600">点击查看详细数据</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </ErrorBoundary>
      </main>
    </ApolloProvider>
  );
}


