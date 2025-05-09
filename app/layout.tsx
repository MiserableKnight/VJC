import type { Metadata, Viewport } from "next";
import "./globals.css";
import { systemFont, monoFont } from "./fonts";

export const metadata: Metadata = {
  title: "越捷湿租项目运营数据看板",
  description: "展示飞行运营相关数据的可视化分析平台",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 0.5,
  maximumScale: 5,
  minimumScale: 0.5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className="antialiased system-font"
        style={systemFont.style}
      >
        {children}
      </body>
    </html>
  );
}
