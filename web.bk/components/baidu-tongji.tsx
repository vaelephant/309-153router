import Script from 'next/script'

/** 百度统计 hm.js 站点密钥（与 tongji.baidu.com 获取的代码一致） */
const HM_QUERY = '74de1357b8b5097a9665e5bfa8d9672a'

/**
 * 百度统计（https://tongji.baidu.com）
 * 可通过 NEXT_PUBLIC_BAIDU_HM_ID 覆盖密钥；设为空字符串则不在页面注入脚本。
 */
export default function BaiduTongji() {
  const id = (process.env.NEXT_PUBLIC_BAIDU_HM_ID ?? HM_QUERY).trim()
  if (!id) return null

  const src = `https://hm.baidu.com/hm.js?${id}`

  return (
    <Script
      id="baidu-hm-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = ${JSON.stringify(src)};
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
        `.trim(),
      }}
    />
  )
}
