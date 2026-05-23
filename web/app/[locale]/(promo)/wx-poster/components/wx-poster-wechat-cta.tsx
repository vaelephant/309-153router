"use client"

import Image from "next/image"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n-context"
import {
  getWechatContactUrl,
  WECHAT_QR_FALLBACK,
  WECHAT_QR_PNG,
  WECHAT_QR_PRIMARY,
} from "@/lib/wechat-contact"

const buttonClass =
  "mx-auto mt-6 flex h-[52px] w-full max-w-[340px] items-center justify-center rounded-xl border-2 border-white text-[17px] font-bold text-white transition active:scale-[0.98] active:bg-white/10"

export function WxPosterWechatCta() {
  const { t } = useI18n()
  const contactUrl = getWechatContactUrl()
  const [open, setOpen] = useState(false)
  const [imgSrc, setImgSrc] = useState(WECHAT_QR_PRIMARY)
  const [qrFailed, setQrFailed] = useState(false)

  const label = t("wxPoster.ctaAddWechat")

  if (contactUrl) {
    return (
      <a href={contactUrl} className={buttonClass} rel="noopener noreferrer">
        {label}
      </a>
    )
  }

  return (
    <>
      <button type="button" className={buttonClass} onClick={() => setOpen(true)}>
        {label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[340px] gap-4 rounded-2xl border-0 bg-white p-6">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-lg">{t("wxPoster.wechatDialogTitle")}</DialogTitle>
            <DialogDescription>{t("wxPoster.wechatDialogHint")}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center rounded-xl bg-zinc-100 p-3">
            {!qrFailed ? (
              <Image
                src={imgSrc}
                alt={t("wxPoster.wechatQrAlt")}
                width={280}
                height={380}
                className="h-auto w-full max-w-[260px] rounded-lg object-contain"
                onError={() => {
                  if (imgSrc === WECHAT_QR_PRIMARY) {
                    setImgSrc(WECHAT_QR_PNG)
                    return
                  }
                  if (imgSrc === WECHAT_QR_PNG) {
                    setImgSrc(WECHAT_QR_FALLBACK)
                    return
                  }
                  setQrFailed(true)
                }}
              />
            ) : (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                {t("wxPoster.wechatQrPlaceholder")}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
