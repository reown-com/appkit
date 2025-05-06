export const googleTagManagerSource = `https://www.googletagmanager.com/gtag/js?id=${process.env['NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID']}`

export function googleTagDataLayer() {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env['NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID']}');
  `
}
