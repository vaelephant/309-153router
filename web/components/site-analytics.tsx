'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { resolveTrafficSource } from '@/lib/traffic-source';

function SiteAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.toString();

  useEffect(() => {
    const ac = new AbortController();
    const source = resolveTrafficSource(searchParams);
    const campaign = searchParams.get('campaign')?.trim() || undefined;

    const recordPageView = async () => {
      try {
        const res = await fetch('/api/site-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            source: source || undefined,
            campaign,
          }),
          signal: ac.signal,
        });
        if (!res.ok && res.status !== 499) {
          // 499 = client aborted
        }
      } catch {
        // navigation abort, ignore
      }
    };

    recordPageView();
    return () => ac.abort();
    // 勿把 searchParams 对象放进依赖（引用常变会重复打点）；用 toString 即可
  }, [pathname, search]);

  return null;
}

/**
 * 网站访问统计埋点：记录 path、来源 source、活动 campaign
 */
export default function SiteAnalytics() {
  return (
    <Suspense fallback={null}>
      <SiteAnalyticsInner />
    </Suspense>
  );
}
