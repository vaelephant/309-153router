export function AiGatewaySectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-5">
      <h2
        className="text-[18px] font-semibold tracking-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          {subtitle}
        </p>
      ) : null}
      <div
        className="mt-3 h-0.5 w-10 rounded-full"
        style={{ background: "var(--color-accent-primary)" }}
        aria-hidden
      />
    </div>
  )
}
