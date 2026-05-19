"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { LocaleLink } from "@/components/locale-link"

const SESSION_KEY = "optrouter_playground_api_key"

interface ModelOption {
  name: string
}

export function PlaygroundForm() {
  const { t } = useI18n()
  const [apiKey, setApiKey] = useState("")
  const [rememberKey, setRememberKey] = useState(true)
  const [models, setModels] = useState<ModelOption[]>([])
  const [model, setModel] = useState("")
  const [prompt, setPrompt] = useState("")
  const [stream, setStream] = useState(false)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ latency?: string; cost?: string; requestId?: string }>({})

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) setApiKey(saved)
  }, [])

  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch("/api/models")
        const data = await res.json()
        const list = (data.models || []) as ModelOption[]
        setModels(list)
        if (list.length > 0) {
          setModel((prev) => prev || list[0].name)
        }
      } catch {
        setModels([])
      }
    }
    loadModels()
  }, [])

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setError(t("playground.apiKeyRequired"))
      return
    }
    if (!model || !prompt.trim()) {
      setError(t("playground.promptRequired"))
      return
    }

    if (rememberKey) {
      sessionStorage.setItem(SESSION_KEY, apiKey.trim())
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }

    setLoading(true)
    setError(null)
    setOutput("")
    setMeta({})

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt.trim() }],
          stream,
        }),
      })

      setMeta({
        requestId: res.headers.get("X-Request-Id") || undefined,
        latency: res.headers.get("X-Model-Latency-Ms") || undefined,
        cost: res.headers.get("X-Cost-Yuan") || undefined,
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        setError(
          errJson?.error?.message ||
            `${t("playground.requestFailed")} (${res.status})`
        )
        return
      }

      if (stream && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let text = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ") || line === "data: [DONE]") continue
            try {
              const json = JSON.parse(line.slice(6))
              const delta = json?.choices?.[0]?.delta?.content
              if (typeof delta === "string") {
                text += delta
                setOutput(text)
              }
            } catch {
              // ignore partial SSE lines
            }
          }
        }
      } else {
        const data = await res.json()
        const content = data?.choices?.[0]?.message?.content
        setOutput(
          typeof content === "string" ? content : JSON.stringify(data, null, 2)
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("playground.requestFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold mb-1">{t("playground.title")}</h1>
        <p className="text-xs text-muted-foreground">{t("playground.desc")}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("playground.inputTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">{t("playground.apiKeyLabel")}</label>
            <input
              type="password"
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              {t("playground.apiKeyHint")}{" "}
              <LocaleLink href="/keys" className="text-primary underline">
                {t("playground.keysLink")}
              </LocaleLink>
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => setRememberKey(e.target.checked)}
              className="rounded"
            />
            {t("playground.rememberKey")}
          </label>
          <div>
            <label className="text-xs text-muted-foreground">{t("playground.modelLabel")}</label>
            <select
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {models.length === 0 ? (
                <option value="">{t("playground.noModels")}</option>
              ) : (
                models.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t("playground.promptLabel")}</label>
            <textarea
              className="mt-1 w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-xs resize-y"
              placeholder={t("playground.promptPlaceholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={stream}
              onChange={(e) => setStream(e.target.checked)}
              className="rounded"
            />
            {t("playground.streamLabel")}
          </label>
          <div className="flex gap-2">
            <Button size="sm" className="h-8 gap-1 text-xs" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
              {t("playground.send")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs"
              onClick={() => {
                setOutput("")
                setError(null)
                setMeta({})
              }}
              disabled={loading}
            >
              <Trash2 className="size-3" />
              {t("playground.clear")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">{t("playground.outputTitle")}</CardTitle>
          {(meta.requestId || meta.latency || meta.cost) && (
            <div className="flex flex-wrap gap-1">
              {meta.requestId && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  ID: {meta.requestId.slice(0, 8)}…
                </Badge>
              )}
              {meta.latency && (
                <Badge variant="secondary" className="text-[10px]">
                  {meta.latency}ms
                </Badge>
              )}
              {meta.cost && (
                <Badge variant="secondary" className="text-[10px]">
                  ¥{meta.cost}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          <pre className="min-h-[280px] max-h-[480px] overflow-auto rounded-lg bg-muted/50 border border-border p-4 text-xs whitespace-pre-wrap font-mono text-foreground/90">
            {output || (loading ? t("playground.loading") : t("playground.outputEmpty"))}
          </pre>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
