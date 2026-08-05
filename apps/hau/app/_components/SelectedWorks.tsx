import type { Case, SelectedWorksBlock } from '@/content/types'

/**
 * Sezione "Selected work" della home (`<section class="selected_works pt104">`),
 * fedele al mirror: header `.selected_works_top` (titolo `heading_2.counter`
 * con `data-count` + CTA "View all" `.sub_l`) e la griglia `.works.grid` con
 * le card dei case selezionati.
 *
 * `selected_cases` in `home.json` è una lista di slug: qui sono già risolti
 * (in `page.tsx`) contro `cases.json` e passati come `cases`.
 *
 * DEFERRAL: nel mirror alcune card hanno un `.case_showreel` (video mp4 che
 * appare in hover / auto su mobile). Quei video NON sono nel payload estratto
 * (`cases.json` porta solo `image`), quindi la card mostra la sola immagine —
 * il markup `.case_showreel` è omesso perché non c'è una sorgente. La
 * hover-reveal del video è comunque comportamento di interazione → Fase 3c/6.
 * I link `/works/<slug>/` puntano a pagine ancora inesistenti (fuori scope):
 * resi come `<a href>` non funzionanti, come nel mirror.
 */
export function SelectedWorks({ block, cases }: { block: SelectedWorksBlock; cases: Case[] }) {
  const count = cases.length

  return (
    <section className="selected_works pt104">
      <div className="wrapper flex col">
        <div className="row">
          <div className="container flex fdc">
            <div className="selected_works_top">
              <div className="title_container">
                <h2
                  className={block.add_counter ? 'counter heading_2' : 'heading_2'}
                  data-count={block.add_counter ? String(count) : undefined}
                >
                  {block.title}
                </h2>
              </div>
              <div className="cta_container">
                <a href={block.cta.url} className="sub_l hover_cta" target={block.cta.target || undefined}>
                  {block.cta.title}
                </a>
              </div>
            </div>
            <div className="works grid">
              {cases.map((c) => (
                <a
                  key={c.slug}
                  href={`/works/${c.slug}/`}
                  className="single_case hover_text"
                  data-text="View"
                >
                  <div className="case_image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image.url} alt={c.title} title={c.title} />
                  </div>
                  <div className="case_details">
                    <span className="sub_l">{c.title}</span>
                    <span className="body_2">{c.description}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
