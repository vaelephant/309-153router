import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function NewsMarkdown({ content }: { content: string }) {
  const cleaned = content.replace(/\r\n/g, '\n').trim()
  return (
    <div className="news-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleaned}</ReactMarkdown>
    </div>
  )
}
