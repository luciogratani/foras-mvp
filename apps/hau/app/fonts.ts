import localFont from 'next/font/local'

/**
 * Helvetica Now Display — self-hosted.
 *
 * Riproduce fedelmente le 20 dichiarazioni `@font-face` inline del mirror
 * Nuxt (`apps/hau-nuxt-build/index.html`): ogni file display-cut è mappato
 * su un peso CSS (100/300/400/500/700/900) × stile (normal/italic), con
 * `font-display: swap`. Il mirror collassa piu tagli display sullo stesso
 * peso CSS (Hairline/ExtLt/Light -> 300, ExtraBold/ExtBlk/Black -> 900):
 * la mappatura NON e reinventata, e copiata 1:1.
 *
 * Solo `.woff2` (sufficiente per i browser 2026; il mirror serviva anche
 * `.woff` come fallback ma qui e omesso di proposito).
 *
 * Espone la CSS variable `--font-hnd`, cablata in `globals.css` come
 * `--font-display` (token Tailwind v4).
 */
export const helveticaNowDisplay = localFont({
  src: [
    // --- normal ---
    { path: './fonts/HelveticaNowDisplay-Thin.uW2UInC8.woff2', weight: '100', style: 'normal' },
    { path: './fonts/HelveticaNowDisplay-Hairline.co7ELTVR.woff2', weight: '300', style: 'normal' },
    { path: './fonts/HelveticaNowDisplay-ExtLt.Dhq3HGAa.woff2', weight: '300', style: 'normal' },
    { path: './fonts/HelveticaNowDisplay-Light.CW8q9EOc.woff2', weight: '300', style: 'normal' },
    { path: './fonts/HelveticaNowDisplay-Regular.mi78V0iH.woff2', weight: '400', style: 'normal' },
    { path: './fonts/HelveticaNowDisplay-Medium.BhZCYiSO.woff2', weight: '500', style: 'normal' },
    { path: './fonts/HelveticaNowDisplay-Bold.Cmhab6ke.woff2', weight: '700', style: 'normal' },
    { path: './fonts/HelveticaNowDisplay-ExtraBold.DmNo9J7D.woff2', weight: '900', style: 'normal' },
    { path: './fonts/HelveticaNowDisplay-ExtBlk.Dusb0V3m.woff2', weight: '900', style: 'normal' },
    { path: './fonts/HelveticaNowDisplay-Black.CLr8vw21.woff2', weight: '900', style: 'normal' },
    // --- italic ---
    { path: './fonts/HelveticaNowDisplay-ThinIta.Cs-64dFM.woff2', weight: '100', style: 'italic' },
    { path: './fonts/HelveticaNowDisplay-HairlineI.Bv_04OwK.woff2', weight: '300', style: 'italic' },
    { path: './fonts/HelveticaNowDisplay-ExtLtIta.QH7uAbgX.woff2', weight: '300', style: 'italic' },
    { path: './fonts/HelveticaNowDisplay-LightIta.NMTBuvQD.woff2', weight: '300', style: 'italic' },
    { path: './fonts/HelveticaNowDisplay-RegIta.CVbO53A-.woff2', weight: '400', style: 'italic' },
    { path: './fonts/HelveticaNowDisplay-MedIta.CybRqOc7.woff2', weight: '500', style: 'italic' },
    { path: './fonts/HelveticaNowDisplay-BoldIta.PFNgf_qf.woff2', weight: '700', style: 'italic' },
    { path: './fonts/HelveticaNowDisplay-ExtBdIta.ti5S83ry.woff2', weight: '900', style: 'italic' },
    { path: './fonts/HelveticaNowDisplay-ExtBlkIta.Ds1EfQ-F.woff2', weight: '900', style: 'italic' },
    { path: './fonts/HelveticaNowDisplay-BlackIta.BbiyXieN.woff2', weight: '900', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-hnd',
})
