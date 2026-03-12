import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'pageViews.json');

interface PageView {
  path: string;
  ipAddress: string;
  timestamp: string;
}

/**
 * GET /api/site-analytics/stats
 * 获取访问统计数据
 */
export async function GET() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(content);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    const stats = {
      today: { views: 0, uniqueVisitors: new Set<string>() },
      yesterday: { views: 0, uniqueVisitors: new Set<string>() },
      last7Days: { views: 0, uniqueVisitors: new Set<string>() },
      last30Days: { views: 0, uniqueVisitors: new Set<string>() },
    };

    const pageStats: any[] = [];
    const dailyStats: { [key: string]: { views: number; uniqueVisitors: Set<string> } } = {};

    (data.views || []).forEach((view: PageView) => {
      const viewDate = new Date(view.timestamp);
      const dateStr = viewDate.toISOString().split('T')[0];

      if (viewDate >= today) {
        stats.today.views++;
        stats.today.uniqueVisitors.add(view.ipAddress);
      }
      if (viewDate >= yesterday && viewDate < today) {
        stats.yesterday.views++;
        stats.yesterday.uniqueVisitors.add(view.ipAddress);
      }
      if (viewDate >= last7Days) {
        stats.last7Days.views++;
        stats.last7Days.uniqueVisitors.add(view.ipAddress);
      }
      if (viewDate >= last30Days) {
        stats.last30Days.views++;
        stats.last30Days.uniqueVisitors.add(view.ipAddress);
      }

      // 每日统计
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = { views: 0, uniqueVisitors: new Set<string>() };
      }
      dailyStats[dateStr].views++;
      dailyStats[dateStr].uniqueVisitors.add(view.ipAddress);

      // 页面统计
      const existingPageStat = pageStats.find(
        (stat) => stat.date === dateStr && stat.path === view.path
      );
      if (existingPageStat) {
        existingPageStat.views++;
        existingPageStat.uniqueVisitors.add(view.ipAddress);
      } else {
        pageStats.push({
          date: dateStr,
          path: view.path,
          views: 1,
          uniqueVisitors: new Set([view.ipAddress]),
        });
      }
    });

    // Set → 数量
    const processedStats = {
      today: { views: stats.today.views, uniqueVisitors: stats.today.uniqueVisitors.size },
      yesterday: { views: stats.yesterday.views, uniqueVisitors: stats.yesterday.uniqueVisitors.size },
      last7Days: { views: stats.last7Days.views, uniqueVisitors: stats.last7Days.uniqueVisitors.size },
      last30Days: { views: stats.last30Days.views, uniqueVisitors: stats.last30Days.uniqueVisitors.size },
    };

    const chartData = Object.entries(dailyStats)
      .map(([date, stat]) => ({
        date,
        views: stat.views,
        uniqueVisitors: stat.uniqueVisitors.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const processedPageStats = pageStats
      .map((stat) => ({
        date: stat.date,
        path: stat.path,
        views: stat.views,
        uniqueVisitors: stat.uniqueVisitors.size,
      }))
      .sort((a, b) => {
        if (a.date === b.date) return b.views - a.views;
        return b.date.localeCompare(a.date);
      });

    return NextResponse.json({
      pageStats: processedPageStats,
      chartData,
      stats: processedStats,
    });
  } catch (error) {
    console.error('Error reading analytics:', error);
    return NextResponse.json({
      pageStats: [],
      chartData: [],
      stats: {
        today: { views: 0, uniqueVisitors: 0 },
        yesterday: { views: 0, uniqueVisitors: 0 },
        last7Days: { views: 0, uniqueVisitors: 0 },
        last30Days: { views: 0, uniqueVisitors: 0 },
      },
    });
  }
}
