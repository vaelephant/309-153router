export function SectionSkeleton({ className = "h-48" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/40 border border-border/50 ${className}`}
      aria-hidden
    />
  )
}
