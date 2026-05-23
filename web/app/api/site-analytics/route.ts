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
  source?: string;
  campaign?: string;
}

interface PageViewsData {
  views: PageView[];
}

/** 请求被客户端中断（导航/刷新等）时不打 error 日志 */
function isAbortedError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    const code = (error as NodeJS.ErrnoException).code;
    return msg === 'aborted' || code === 'ECONNRESET' || code === 'ECONNABORTED';
  }
  return false;
}

/**
 * POST /api/site-analytics
 * 接收并保存页面访问数据
 */
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    let data: { path?: string; source?: string; campaign?: string };
    try {
      const raw = await request.text();
      data = raw ? (JSON.parse(raw) as { path?: string; source?: string; campaign?: string }) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const pathStr = typeof data?.path === 'string' ? data.path : '';
    if (!pathStr) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    const source =
      typeof data.source === 'string' && data.source.trim() ? data.source.trim() : undefined;
    const campaign =
      typeof data.campaign === 'string' && data.campaign.trim() ? data.campaign.trim() : undefined;

    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'unknown');

    const dataDir = path.dirname(DATA_FILE);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch {
      // 目录已存在
    }

    let fileData: PageViewsData = { views: [] };
    try {
      const content = await fs.readFile(DATA_FILE, 'utf-8');
      fileData = JSON.parse(content) as PageViewsData;
    } catch {
      // 文件不存在或损坏，使用空数组
    }

    fileData.views.push({
      path: pathStr,
      userAgent,
      ipAddress,
      referer,
      timestamp: new Date().toISOString(),
      ...(source ? { source } : {}),
      ...(campaign ? { campaign } : {}),
    });

    await fs.writeFile(DATA_FILE, JSON.stringify(fileData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isAbortedError(error)) {
      return NextResponse.json({ success: false }, { status: 499 });
    }
    console.error('Error recording page view:', error);
    return NextResponse.json({ error: 'Failed to record page view' }, { status: 500 });
  }
}
