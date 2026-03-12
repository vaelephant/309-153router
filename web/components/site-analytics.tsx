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
    const recordPageView = async () => {
      try {
        await fetch('/api/site-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname }),
        });
      } catch (error) {
        // 静默失败，不影响用户体验
      }
    };

    recordPageView();
  }, [pathname]);

  return null;
}
