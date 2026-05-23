"use client"

export function AiGatewayHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-md"
      style={{
        borderColor: "var(--color-border-default)",
        background: "color-mix(in srgb, var(--color-bg-page) 92%, transparent)",
      }}
    >
      <div className="mx-auto max-w-lg">
        <span className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          OptRouter
        </span>
      </div>
    </header>
  )
}
