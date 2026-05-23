"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n-context"
import { appendSourceToMessage } from "@/lib/traffic-source"

type Status = "idle" | "loading" | "ok" | "err"

type ContactLeadSectionProps = {
  formName?: string
  source?: string | null
  titleKey?: string
  subtitleKey?: string
  pointKeys?: [string, string, string]
}

export function ContactLeadSection({
  formName = "home_contact",
  source = null,
  titleKey = "contact.title",
  subtitleKey = "contact.subtitle",
  pointKeys = ["contact.point0", "contact.point1", "contact.point2"],
}: ContactLeadSectionProps = {}) {
  const { t } = useI18n()
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errMsg, setErrMsg] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrMsg("")
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: name || undefined,
          message: appendSourceToMessage(message || undefined, source),
          form_name: formName,
          source: source || undefined,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setStatus("err")
        setErrMsg(data.error ?? t("contact.errorSubmit"))
        return
      }
      setStatus("ok")
      setPhone("")
      setName("")
      setMessage("")
    } catch {
      setStatus("err")
      setErrMsg(t("contact.errorNetwork"))
    }
  }

  return (
    <section
      id="contact"
      className="border-t py-24"
      style={{
        borderColor: "var(--color-border-default)",
        paddingTop: "var(--layout-section-spacing)",
        paddingBottom: "var(--layout-section-spacing)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 36px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-4)",
              }}
            >
              {t(titleKey)}
            </h2>
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.7,
                color: "var(--color-text-body)",
                marginBottom: "var(--space-6)",
                maxWidth: "520px",
              }}
            >
              {t(subtitleKey)}
            </p>
            <div
              className="rounded-2xl border p-6"
              style={{
                borderColor: "var(--color-border-default)",
                backgroundColor: "var(--color-bg-surface)",
              }}
            >
              <ul className="space-y-3 text-sm" style={{ color: "var(--color-text-body)" }}>
                <li>• {t(pointKeys[0])}</li>
                <li>• {t(pointKeys[1])}</li>
                <li>• {t(pointKeys[2])}</li>
              </ul>
            </div>
          </div>

          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{
              borderColor: "var(--color-border-default)",
              backgroundColor: "var(--color-bg-surface)",
            }}
          >
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">{t("contact.phoneLabel")}</Label>
                <Input
                  id="contact_phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("contact.phonePlaceholder")}
                  required
                  disabled={status === "loading"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">{t("contact.nameLabel")}</Label>
                <Input
                  id="contact_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("contact.namePlaceholder")}
                  disabled={status === "loading"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_message">{t("contact.messageLabel")}</Label>
                <textarea
                  id="contact_message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("contact.messagePlaceholder")}
                  rows={4}
                  disabled={status === "loading"}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Button
                type="submit"
                className="ds-btn-primary h-10 w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? t("contact.submitting") : t("contact.submit")}
              </Button>

              {status === "ok" && (
                <p className="text-sm" style={{ color: "var(--color-success, #16a34a)" }}>
                  {t("contact.success")}
                </p>
              )}
              {status === "err" && (
                <p className="text-sm" style={{ color: "var(--color-danger, #ef4444)" }}>
                  {errMsg}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{t("contact.tip")}</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

