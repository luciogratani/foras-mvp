import type { Settings } from '@/content/types'
import settingsData from '@/content/settings.json'
import { Nav } from './Nav'

const settings = settingsData as Settings

/**
 * `<footer>`, contenitore condiviso di `.navbar` (vedi `Nav.tsx`) e della
 * sezione `.footer` ("Let's talk" + contatti/social + watermark SVG) —
 * fedele al mirror, dove sono entrambi figli dello stesso `<footer>`.
 *
 * Deviazione 3a (documentata, vedi anche design-system.css): nel mirror
 * `.footer` è `display:none` di default e viene rivelato via scroll (classe
 * `footer.scroll_footer`, position:fixed, innescata da uno scroll listener
 * JS). Questo è comportamento di scroll/interazione, fuori scope 3a
 * ("niente smooth-scroll"). Qui la sezione è resa staticamente visibile in
 * flusso normale così è verificabile nei Done-when; il pin/reveal via
 * scroll è demandato alla 3c insieme allo smooth-scroll.
 */
export function Footer() {
  const { contact_details, social_links } = settings
  const mailCta = contact_details.find((c) => c.url.startsWith('mailto:'))?.url ?? contact_details[0]?.url

  return (
    <footer>
      <Nav />
      <section className="footer">
        <div className="row h100">
          <div className="container w100 flex h100">
            <div className="cta_area h2">
              <h2 className="heading_2">Let&apos;s talk</h2>
              {mailCta && (
                <a className="sub_l hover_cta" href={mailCta}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <circle cx="4.97656" cy="4.26562" r="4" fill="#1E1E1E" />
                  </svg>
                  Get in Touch
                </a>
              )}
            </div>
            <div className="menu">
              <ul>
                <span className="sub_l">Contact Me</span>
                {contact_details.map((item) => (
                  <li key={item.url} className="hover_cta">
                    <a className="body_1" href={item.url} target={item.target || undefined}>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
              <ul>
                <span className="sub_l">Follow Me</span>
                {social_links.map((item) => (
                  <li key={item.url} className="hover_cta">
                    <a
                      className="body_1"
                      href={item.url}
                      target={item.target || undefined}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="container">
            <div className="vector">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1312 422" fill="none">
                <path
                  d="M1168.51 134.922V477.501H1117.51C1101.01 477.501 1087.49 465.374 1087.01 450.173L1086.4 429.719C1060.45 467.33 1022.06 486.164 971.124 486.164C932.193 486.164 901.812 475.769 879.982 454.98C858.152 434.19 847.176 405.409 847.176 368.692V134.922H931.465V352.038C931.465 395.405 952.811 417.089 995.562 417.089C1022 417.089 1043.35 408.762 1059.66 392.164C1075.97 375.566 1084.16 351.982 1084.16 321.469V134.922H1168.51Z"
                  fill="#1E1E1E"
                  fillOpacity="0.08"
                />
                <path
                  d="M1233.21 0.238037V13.2594H1210.41V70.4863H1194.58V13.2594H1171.66V0.238037H1233.21Z"
                  fill="#1E1E1E"
                  fillOpacity="0.08"
                />
                <path
                  d="M1311.92 0.238037V70.4863H1297.12V44.1642L1298.94 9.85037L1293.67 31.0869L1282.51 70.5422H1266.32L1254.98 30.3604L1249.7 9.7386L1251.52 44.1642V70.4863H1236.85V0.238037H1259.1L1270.99 41.4816L1274.08 55.5089L1277.54 41.4816L1289.18 0.238037H1311.92Z"
                  fill="#1E1E1E"
                  fillOpacity="0.08"
                />
                <path
                  d="M-0.205078 188.459V0.34844H87.0557V189.074M87.0557 260.161V473.42H-0.205078V260.161M87.0557 189.074H322.096V0.34844H409.356V473.42H322.096V338.177C322.096 295.089 284.196 260.161 237.442 260.161H87.0557"
                  fill="#1E1E1E"
                  fillOpacity="0.08"
                />
                <path
                  d="M706.249 449.782L703.46 433.519C675.08 466.324 634.512 482.699 581.634 482.699C542.703 482.699 511.838 473.534 488.977 455.147C466.115 436.761 454.715 411.836 454.715 380.372C454.715 322.81 494.616 287.77 574.418 275.419L690.483 257.48C692.423 257.033 695.758 256.138 700.549 254.797V224.898C700.549 194.776 676.05 179.743 626.993 179.743C603.465 179.743 585.636 183.934 573.63 192.373C561.623 200.812 554.407 214.28 551.981 232.89L472.664 232.219C479.881 158.674 532.031 121.901 629.115 121.901C731.475 121.901 782.655 161.3 782.655 240.155V394.288C782.655 419.995 787.689 446.317 797.815 473.366H736.205C721.227 473.366 708.493 463.362 706.188 449.726L706.249 449.782ZM672.473 401.665C691.21 386.631 700.61 367.798 700.61 345.164V309.286L597.522 325.884C557.621 332.534 537.67 349.356 537.67 376.404C537.67 391.438 543.431 403.229 554.953 411.612C566.474 420.051 582.362 424.242 602.555 424.242C630.449 424.242 653.735 416.698 672.473 401.665Z"
                  fill="#1E1E1E"
                  fillOpacity="0.08"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </footer>
  )
}
