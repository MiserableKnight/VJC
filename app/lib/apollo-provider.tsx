'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { ReactNode, useState, useEffect } from 'react';
import { ENV } from '../config/env';

// 创建HTTP链接
const httpLink = createHttpLink({
  uri: ENV.GRAPHQL_URL || '/api/graphql',
  // 在开发模式下，如果你使用的是不同的域名或端口，可能需要credentials
  credentials: 'same-origin'
});

// 创建Apollo客户端
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // 防止客户端和服务器端渲染不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 避免服务器端和客户端之间的不匹配
    return null;
  }

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 