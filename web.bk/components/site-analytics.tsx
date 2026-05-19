'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 网站访问统计埋点组件
 *
 * 自动监听路由变化并记录访问数据到 /api/site-analytics
 * 在根 layout.tsx 中引入即可，不渲染任何内容
 */
export default function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const ac = new AbortController();
    const recordPageView = async () => {
      try {
        const res = await fetch('/api/site-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname }),
          signal: ac.signal,
        });
        if (!res.ok && res.status !== 499) {
          // 499 表示服务端已识别为客户端中断，不记日志
        }
      } catch (_) {
        // 用户导航离开导致的中断等，静默忽略
      }
    };

    recordPageView();
    return () => ac.abort();
  }, [pathname]);

  return null;
}
