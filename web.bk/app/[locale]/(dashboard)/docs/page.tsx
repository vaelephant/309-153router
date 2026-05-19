"use client"

import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n-context"

const GATEWAY_EXAMPLE = "http://localhost:9115"

export default function DocsPage() {
  const { t } = useI18n()
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">{t("dashboard.docsTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.docsDesc")}
            </p>
          </div>

          <Tabs defaultValue="api" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="api">{t("dashboard.docsTabApi")}</TabsTrigger>
              <TabsTrigger value="errors">{t("dashboard.docsTabErrors")}</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-6 mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">1. {t("docs.quickStart")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p dangerouslySetInnerHTML={{ __html: t("docs.gatewayIntro") }} />
                  <p className="text-muted-foreground">{t("docs.gatewayAddress")}</p>
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto border border-border">
{`${GATEWAY_EXAMPLE}

${t("docs.curlExample")}
curl -X POST ${GATEWAY_EXAMPLE}/v1/chat/completions \\
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]}'`}
                  </pre>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">2. {t("docs.auth")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>{t("docs.authDesc")}</p>
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto border border-border">
{`Authorization: Bearer sk-xxxxxxxxxxxxxxxx`}
                  </pre>
                  <p className="text-muted-foreground">{t("docs.apiKeyCreateHint")}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">3. {t("docs.apiList")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">{t("docs.method")}</th>
                          <th className="text-left py-2 px-3 font-medium">{t("docs.path")}</th>
                          <th className="text-left py-2 px-3 font-medium">{t("docs.desc")}</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">POST</td><td className="py-2 px-3 font-mono">/v1/chat/completions</td><td>{t("docs.chatCompletion")}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">GET</td><td className="py-2 px-3 font-mono">/v1/models</td><td>{t("docs.getModels")}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">GET</td><td className="py-2 px-3 font-mono">/v1/models/{`{model}`}/pricing</td><td>{t("docs.getPricing")}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">GET</td><td className="py-2 px-3 font-mono">/health</td><td>{t("docs.health")}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">4. {t("docs.chatApiTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">{t("docs.mainParams")}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">{t("docs.field")}</th>
                          <th className="text-left py-2 px-3 font-medium">{t("docs.type")}</th>
                          <th className="text-left py-2 px-3 font-medium">{t("docs.required")}</th>
                          <th className="text-left py-2 px-3 font-medium">{t("docs.desc")}</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">model</td><td>string</td><td>✅</td><td>{t("docs.modelDesc")}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">messages</td><td>array</td><td>✅</td><td>{t("docs.messagesDesc")}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">stream</td><td>boolean</td><td></td><td>{t("docs.streamDesc")}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">temperature</td><td>float</td><td></td><td>{t("docs.tempDesc")}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">max_tokens</td><td>integer</td><td></td><td>{t("docs.maxTokensDesc")}</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-muted-foreground">{t("docs.successResponse")}</p>
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto border border-border">
{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gpt-4o-mini",
  "choices": [{ "index": 0, "message": { "role": "assistant", "content": "你好！" }, "finish_reason": "stop" }],
  "usage": { "prompt_tokens": 12, "completion_tokens": 18, "total_tokens": 30 }
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">5. {t("docs.smartRouting")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{t("docs.smartRoutingDesc")}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">eco</code> {t("docs.eco")}</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">balanced</code> {t("docs.balanced")}</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">premium</code> {t("docs.premium")}</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">code</code> {t("docs.code")}</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">reasoning</code> {t("docs.reasoning")}</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">longctx</code> {t("docs.longctx")}</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">auto</code> {t("docs.auto")}</li>
                  </ul>
                  <p>{t("docs.strategyHint")}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">6. {t("docs.responseHeaders")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">Header</th>
                          <th className="text-left py-2 px-3 font-medium">{t("docs.desc")}</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">X-Model-Latency-Ms</td><td>{t("docs.latencyHeader")}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">X-Cost-Yuan</td><td>{t("docs.costHeader")}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">{t("docs.errorFormat")}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t("docs.errorFormatDesc")}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto border border-border">
{`{
  "error": {
    "message": "...",
    "type": "..."
  }
}`}
                  </pre>

                  <CardTitle className="text-base pt-2">{t("docs.errorCodes")}</CardTitle>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">{t("docs.httpCode")}</th>
                          <th className="text-left py-2 px-3 font-medium">type</th>
                          <th className="text-left py-2 px-3 font-medium">{t("docs.meaning")}</th>
                          <th className="text-left py-2 px-3 font-medium">{t("docs.suggestion")}</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">401</td>
                          <td className="py-2 px-3 font-mono">authentication_error</td>
                          <td>{t("docs.err401")}</td>
                          <td>{t("docs.err401Suggestion")}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">403</td>
                          <td className="py-2 px-3 font-mono">authorization_error</td>
                          <td>{t("docs.err403")}</td>
                          <td>{t("docs.err403Suggestion")}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">400</td>
                          <td className="py-2 px-3 font-mono">invalid_request_error</td>
                          <td>{t("docs.err400")}</td>
                          <td>{t("docs.err400Suggestion")}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">402</td>
                          <td className="py-2 px-3 font-mono">insufficient_balance</td>
                          <td>{t("docs.err402")}</td>
                          <td>{t("docs.err402Suggestion")}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">429</td>
                          <td className="py-2 px-3 font-mono">rate_limit_error</td>
                          <td>{t("docs.err429")}</td>
                          <td>{t("docs.err429Suggestion")}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">502</td>
                          <td className="py-2 px-3 font-mono">upstream_error</td>
                          <td>{t("docs.err502")}</td>
                          <td>{t("docs.err502Suggestion")}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">500</td>
                          <td className="py-2 px-3 font-mono">internal_error</td>
                          <td>{t("docs.err500")}</td>
                          <td>{t("docs.err500Suggestion")}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground pt-2">{t("docs.retrySuggestion")}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
