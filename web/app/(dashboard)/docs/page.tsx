"use client"

import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const GATEWAY_EXAMPLE = "http://localhost:9115"

export default function DocsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">文档</h1>
            <p className="text-sm text-muted-foreground">
              API 接口文档与错误代码说明
            </p>
          </div>

          <Tabs defaultValue="api" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="api">接口文档</TabsTrigger>
              <TabsTrigger value="errors">错误代码</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-6 mt-6">
              {/* 快速开始 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">1. 快速开始</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>OptRouter Gateway 为 <strong>OpenAI 兼容</strong>网关，只需将 <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">base_url</code> 改为网关地址即可接入。</p>
                  <p className="text-muted-foreground">网关地址：</p>
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto border border-border">
{`${GATEWAY_EXAMPLE}

# 最简 curl 示例
curl -X POST ${GATEWAY_EXAMPLE}/v1/chat/completions \\
  -H "Authorization: Bearer sk-你的ApiKey" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "你好"}]}'`}
                  </pre>
                </CardContent>
              </Card>

              {/* 鉴权 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">2. 鉴权</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>所有接口需在 Header 中携带 API Key：</p>
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto border border-border">
{`Authorization: Bearer sk-xxxxxxxxxxxxxxxx`}
                  </pre>
                  <p className="text-muted-foreground">API Key 在控制台「API 密钥」页面创建，格式为 <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">sk-</code> 开头。</p>
                </CardContent>
              </Card>

              {/* 接口列表 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">3. 接口列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">方法</th>
                          <th className="text-left py-2 px-3 font-medium">路径</th>
                          <th className="text-left py-2 px-3 font-medium">说明</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">POST</td><td className="py-2 px-3 font-mono">/v1/chat/completions</td><td>对话补全（核心）</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">GET</td><td className="py-2 px-3 font-mono">/v1/models</td><td>获取可用模型列表</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">GET</td><td className="py-2 px-3 font-mono">/v1/models/{`{model}`}/pricing</td><td>查询指定模型单价</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">GET</td><td className="py-2 px-3 font-mono">/health</td><td>健康检查</td></tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* 对话接口 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">4. 对话接口 POST /v1/chat/completions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">主要请求参数：</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">字段</th>
                          <th className="text-left py-2 px-3 font-medium">类型</th>
                          <th className="text-left py-2 px-3 font-medium">必填</th>
                          <th className="text-left py-2 px-3 font-medium">说明</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">model</td><td>string</td><td>✅</td><td>模型名，支持物理模型或虚拟档位 eco/balanced/premium/code/reasoning/longctx/auto</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">messages</td><td>array</td><td>✅</td><td>对话消息，元素含 role（system/user/assistant）和 content</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">stream</td><td>boolean</td><td></td><td>true 为流式 SSE，默认 false 返回完整 JSON</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">temperature</td><td>float</td><td></td><td>0～2，生成随机性</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">max_tokens</td><td>integer</td><td></td><td>最大输出 token 数</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-muted-foreground">成功响应（非流式）示例：</p>
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

              {/* 智能路由 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">5. 智能路由（可选）</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>将 <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">model</code> 设为档位名即可由网关自动选模型：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">eco</code> 简单问答</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">balanced</code> 日常对话</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">premium</code> 复杂任务</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">code</code> 编程相关</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">reasoning</code> 推理/数学</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">longctx</code> 长上下文</li>
                    <li><code className="px-1 rounded bg-muted font-mono text-xs">auto</code> 自动判断</li>
                  </ul>
                  <p>或保留原 model，请求头加 <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">X-Opt-Strategy: intelligent</code> 允许网关在任务简单时降级以节省成本。</p>
                </CardContent>
              </Card>

              {/* 响应头 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">6. 响应头</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">Header</th>
                          <th className="text-left py-2 px-3 font-medium">说明</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">X-Model-Latency-Ms</td><td>端到端延迟（毫秒）</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 px-3 font-mono">X-Cost-Yuan</td><td>本次调用费用（元）</td></tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">错误响应格式</CardTitle>
                  <p className="text-sm text-muted-foreground">所有错误均采用 OpenAI 兼容格式返回</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto border border-border">
{`{
  "error": {
    "message": "具体错误信息",
    "type": "错误类型"
  }
}`}
                  </pre>

                  <CardTitle className="text-base pt-2">错误代码一览</CardTitle>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">HTTP 状态码</th>
                          <th className="text-left py-2 px-3 font-medium">type</th>
                          <th className="text-left py-2 px-3 font-medium">含义</th>
                          <th className="text-left py-2 px-3 font-medium">处理建议</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">401</td>
                          <td className="py-2 px-3 font-mono">authentication_error</td>
                          <td>API Key 缺失或无效</td>
                          <td>检查 Authorization 头、Key 格式及是否有效</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">403</td>
                          <td className="py-2 px-3 font-mono">authorization_error</td>
                          <td>Key 已禁用或过期</td>
                          <td>在控制台重新生成 API Key</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">400</td>
                          <td className="py-2 px-3 font-mono">invalid_request_error</td>
                          <td>请求参数错误</td>
                          <td>检查 model、messages 等必填项及格式</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">402</td>
                          <td className="py-2 px-3 font-mono">insufficient_balance</td>
                          <td>余额不足</td>
                          <td>前往控制台充值后重试</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">429</td>
                          <td className="py-2 px-3 font-mono">rate_limit_error</td>
                          <td>触发限流</td>
                          <td>稍等片刻后重试，可配合指数退避</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">502</td>
                          <td className="py-2 px-3 font-mono">upstream_error</td>
                          <td>上游 Provider 返回错误</td>
                          <td>可稍后重试，或联系管理员</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">500</td>
                          <td className="py-2 px-3 font-mono">internal_error</td>
                          <td>网关内部错误</td>
                          <td>请联系管理员</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground pt-2">针对 429、502 建议实现重试（如指数退避：1s、2s、4s 后重试）。</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
