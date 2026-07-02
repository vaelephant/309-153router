import Link from 'next/link'

import { BLOG_CATEGORIES, BLOG_CATEGORY_LABELS } from '@/lib/news/blog-categories'
import type { BlogCategory } from '@/lib/news/article-types'

const FILTERS: (BlogCategory | 'all')[] = ['all', ...BLOG_CATEGORIES]

export function BlogCategoryFilter({
  locale,
  activeCategory,
}: {
  locale: string
  activeCategory: BlogCategory | 'all'
}) {
  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 mb-10">
      {FILTERS.map((c) => {
        const isActive = c === activeCategory
        const href = c === 'all' ? `/${locale}/blog` : `/${locale}/blog?category=${c}`
        const label = c === 'all' ? '全部' : BLOG_CATEGORY_LABELS[c]
        return (
          <Link
            key={c}
            href={href}
            className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors"
            style={
              isActive
                ? { backgroundColor: 'var(--color-brand)', color: '#fff' }
                : {
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-body)',
                    border: '1px solid var(--color-border-default)',
                  }
            }
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
