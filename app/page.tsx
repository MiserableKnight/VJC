'use client';

import { ChartsContainer } from './components/charts/ChartsContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChartDataProvider } from './context/ChartDataContext';
import { ApolloProvider } from '@apollo/client';
import client from './lib/apolloClient';

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <main className="min-h-screen p-0.5 sm:p-4 md:p-6 bg-gray-50">
        <h1 className="text-xl sm:text-2xl font-bold text-center my-3 sm:my-8 text-gray-800">飞行运营数据可视化平台</h1>
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
          <ChartDataProvider>
            <ChartsContainer />
          </ChartDataProvider>
        </ErrorBoundary>
      </main>
    </ApolloProvider>
  );
}


