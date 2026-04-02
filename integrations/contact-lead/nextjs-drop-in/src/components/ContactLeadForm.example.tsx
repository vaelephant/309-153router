"use client";

/**
 * 示例：最小联系表单 → POST /api/lead
 * 复制为 ContactLeadForm.tsx 后按你站样式改 UI；或只参考 submit 逻辑。
 */

import { useState } from "react";

export function ContactLeadFormExample() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: name || undefined,
          message: message || undefined,
          form_name: "your_site_contact",
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setStatus("err");
        setErrMsg(data.error ?? "提交失败");
        return;
      }
      setStatus("ok");
      setPhone("");
      setName("");
      setMessage("");
    } catch {
      setStatus("err");
      setErrMsg("网络错误");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-3">
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="手机（必填）"
        required
        className="rounded border px-3 py-2"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="姓名"
        className="rounded border px-3 py-2"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="留言"
        rows={4}
        className="rounded border px-3 py-2"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {status === "loading" ? "提交中…" : "提交"}
      </button>
      {status === "ok" && <p className="text-green-600">已提交</p>}
      {status === "err" && <p className="text-red-600">{errMsg}</p>}
    </form>
  );
}
