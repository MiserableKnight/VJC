import { NextResponse } from 'next/server';

/**
 * 创建统一的API错误响应
 * @param message 错误消息
 * @param status HTTP状态码，默认为500
 * @returns NextResponse对象
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * 创建统一的API成功响应
 * @param data 响应数据
 * @param status HTTP状态码，默认为200
 * @returns NextResponse对象
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * 创建统一的API未找到响应
 * @param message 未找到消息
 * @returns NextResponse对象
 */
export function notFoundResponse(message: string = '未找到请求的资源') {
  return NextResponse.json({ message }, { status: 404 });
}

/**
 * 创建统一的API无效请求响应
 * @param message 无效请求消息
 * @returns NextResponse对象
 */
export function badRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
} 