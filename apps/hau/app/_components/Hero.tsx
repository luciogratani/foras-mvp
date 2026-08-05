import type { PageHeroBlock } from '@/content/types'

/**
 * Hero della home (`<section class="hero">`), fedele al mirror
 * (`apps/hau-nuxt-build/index.html`): due righe, `.wrapper.flex.col` con due
 * `.row` — la prima col `.hero_content` (titolo `heading_1` + descrizione
 * `body_2`) dentro un `.container`, la seconda col `.hero_player` full-width
 * (video showreel autoplay). Il `.video_overlay` è incluso come markup
 * statico (invisibile a riposo: `position:fixed;opacity:0;pointer-events:none`).
 *
 * DEFERRAL (Fase 7): il player fullscreen Plyr (click su "Play video" →
 * apre `.video_overlay` con audio + controlli) NON è implementato qui: nessuna
 * dipendenza Plyr, nessun listener. Resta solo il video thumbnail autoplay
 * muto e il markup dell'overlay pronto per essere cablato. La reveal-animation
 * del titolo (`.i_l ... single_line i{translateY(100%)}`) è cablata al
 * loading screen → Fase 3c.
 *
 * Il titolo nel sorgente (`home.json`) è una stringa con `<br />` come
 * separatore di riga: lo splittiamo in una `<span class="single_line"><i>`
 * per riga, come fa l'SSR del mirror.
 */
export function Hero({ block }: { block: PageHeroBlock }) {
  const lines = block.title
    .split(/<br\s*\/?>/i)
    .map((line) => line.replace(/\r?\n/g, ' ').trim())
    .filter((line) => line.length > 0)

  const videoUrl = block.video ? block.video.url : null

  return (
    <section className="hero">
      <div className="wrapper flex col">
        <div className="row">
          <div className="container">
            <div className="hero_content">
              <div className="title_container">
                <h1 className="heading_1">
                  {lines.map((line, i) => (
                    <span key={i} className="single_line">
                      <i>{line}</i>
                    </span>
                  ))}
                </h1>
              </div>
              <div className="description_container">
                <div className="small_text">
                  <p className="body_2">{block.small_description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="hero_player hover_text2 showreel_thumb" data-text="Play video">
            <div className="showreel_player is_video">
              {videoUrl && (
                <video muted autoPlay loop playsInline>
                  <source src={videoUrl} type={block.video ? block.video.mimeType : 'video/mp4'} />
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
      {/*
       * Markup statico dell'overlay fullscreen (Fase 7 lo attiva via Plyr).
       * A riposo è invisibile e non interattivo (vedi `.video_overlay` in
       * design-system.css: opacity:0; pointer-events:none; transform:scale(.75)).
       */}
      <div className="video_overlay">
        <div className="close_video_overlay hover_cta">
          <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="close-svg">
            <circle cx="21" cy="21" r="20.5" fill="#ffffff" stroke="#CCCCCC" />
            <path d="M16.0508 16.0503L25.9503 25.9498" stroke="#1E1D1C" strokeWidth="1.3" />
            <path d="M25.9492 16.0503L16.0497 25.9498" stroke="#1E1D1C" strokeWidth="1.3" />
          </svg>
        </div>
        <div className="video_overlay_inner">
          {videoUrl && (
            <video id="showreel_player" loop playsInline>
              <source src={videoUrl} type={block.video ? block.video.mimeType : 'video/mp4'} />
            </video>
          )}
        </div>
      </div>
    </section>
  )
}
