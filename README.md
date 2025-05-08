# 飞行运营数据可视化平台

## 项目概述
该项目是一个飞行运营数据可视化平台，用于展示航空公司的飞行运营数据，包括空时数据、日利用率和飞行循环等关键指标。通过直观的图表展示，帮助航空公司管理人员快速了解运营状况，做出决策。

## 特点
- 直观展示飞行空时数据、日利用率和飞行循环
- 支持当日和累计数据对比分析
- 响应式设计，适配各种设备尺寸
- 错误处理机制，确保应用稳定性
- 懒加载技术，提高页面加载性能

## 技术栈
- Next.js 13+ (App Router)
- TypeScript
- Recharts (图表库)
- Tailwind CSS (样式)

## 项目结构

```
/
├── app/
│   ├── api/                # API 端点
│   │   └── logs/
│   │       └── error/
│   │           └── route.ts # 错误日志API
│   ├── components/         # UI组件
│   │   ├── ErrorBoundary.tsx
│   │   └── charts/
│   │       ├── AirTimeChart.tsx
│   │       ├── BaseChart.tsx
│   │       ├── ChartCard.tsx
│   │       ├── ChartsContainer.tsx
│   │       ├── FlightCycleChart.tsx
│   │       ├── LazyChart.tsx
│   │       └── UtilizationChart.tsx
│   ├── hooks/              # 自定义Hooks
│   │   ├── useIntersectionObserver.ts
│   │   └── useResponsive.ts
│   ├── utils/              # 工具函数
│   │   ├── chartUtils.ts
│   │   ├── errorLogger.ts
│   │   └── responsiveChartConfig.ts
│   ├── data/               # 数据服务
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 布局组件
│   └── page.tsx            # 主页面
│
├── config/                 # 配置文件目录
│   ├── next/               # Next.js配置
│   │   └── next.config.js
│   ├── postcss/            # PostCSS配置
│   │   └── postcss.config.mjs
│   └── tsconfig/           # TypeScript配置
│       ├── base.json
│       └── nextjs.json
│
├── docs/                   # 项目文档
│   ├── OPTIMIZATION.md     # 优化详细记录
│   └── 优化建议.md
│
├── public/                 # 静态资源
├── next.config.js          # Next.js配置引用
├── package.json            # 项目依赖
└── tsconfig.json           # TypeScript配置引用
```

## 使用说明
1. 安装依赖: 
   ```bash
   npm install
   ```

2. 开发运行: 
   ```bash
   npm run dev
   ```

3. 构建项目: 
   ```bash
   npm run build
   ```

4. 生产运行: 
   ```bash
   npm start
   ```

## 项目文档
- [优化记录](./docs/OPTIMIZATION.md) - 项目优化详细记录
- [优化建议](./docs/优化建议.md) - 项目优化建议 