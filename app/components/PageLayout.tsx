'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apolloClient';
import Link from 'next/link';
import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <ApolloProvider client={client}>
      <main className="min-h-screen p-0.5 sm:p-4 md:p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
          <Link 
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            返回首页
          </Link>
        </div>
        
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
          {children}
        </ErrorBoundary>
      </main>
    </ApolloProvider>
  );
} 