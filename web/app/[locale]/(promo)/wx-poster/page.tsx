"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import { useTrafficSource } from "@/lib/use-traffic-source"
import { WxPosterWechatCta } from "./components/wx-poster-wechat-cta"

const POSTER_VISUAL = "/materials/wechat-moments-visual.png"
const POSTER_VISUAL_FALLBACK = "/materials/wechat-moments-poster.png"

function WxPosterContent() {
  useTrafficSource()
  const [visualSrc, setVisualSrc] = useState(POSTER_VISUAL)

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-col bg-[#1e40af] sm:my-4 sm:overflow-hidden sm:rounded-2xl sm:shadow-xl">
      {/* 上：按裁切图原始比例完整展示（与素材图一致，不裁切、不缩小） */}
      <section className="w-full shrink-0 bg-[#060d18] leading-[0]">
        <Image
          src={visualSrc}
          alt="一个接口，接入多个大模型"
          width={576}
          height={552}
          priority
          className="block h-auto w-full"
          sizes="100vw"
          onError={() => setVisualSrc(POSTER_VISUAL_FALLBACK)}
        />
      </section>

      {/* 下：仅包住文案 + 按钮，高度随内容（不抢上半空间） */}
      <footer
        className="shrink-0 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-center"
        style={{
          background: "linear-gradient(180deg, #1d4ed8 0%, #1e40af 55%, #1e3a8a 100%)",
        }}
      >
        <p className="text-[24px] font-bold tracking-tight text-white">OptRouter</p>
        <p className="mx-auto mt-2 max-w-[300px] text-[13px] font-medium leading-snug tracking-wide text-white/90">
          兼容 OpenAI API，一处接入多个大模型
          <br />
          智能路由与自动容灾，接入更省心
        </p>

        <WxPosterWechatCta />
      </footer>
    </main>
  )
}

export default function WxPosterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-[#1e40af] text-sm text-white/70">
          加载中…
        </div>
      }
    >
      <WxPosterContent />
    </Suspense>
  )
}
