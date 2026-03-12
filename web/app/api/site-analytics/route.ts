import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'pageViews.json');

interface PageView {
  path: string;
  userAgent: string;
  ipAddress?: string;
  referer: string;
  timestamp: string;
}

interface PageViewsData {
  views: PageView[];
}

/**
 * POST /api/site-analytics
 * 接收并保存页面访问数据
 */
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const data = await request.json();

    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'unknown');

    // 确保 data 目录存在
    const dataDir = path.dirname(DATA_FILE);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (_) {
      // 目录已存在
    }

    // 读取现有数据
    let fileData: PageViewsData = { views: [] };
    try {
      const content = await fs.readFile(DATA_FILE, 'utf-8');
      fileData = JSON.parse(content) as PageViewsData;
    } catch (_) {
      // 文件不存在或损坏，使用空数组
    }

    // 添加新记录
    fileData.views.push({
      path: data.path,
      userAgent,
      ipAddress,
      referer,
      timestamp: new Date().toISOString(),
    });

    // 写入文件
    await fs.writeFile(DATA_FILE, JSON.stringify(fileData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording page view:', error);
    return NextResponse.json({ error: 'Failed to record page view' }, { status: 500 });
  }
}
