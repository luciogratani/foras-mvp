/**
 * Content types for the hau.studio rebuild.
 *
 * These shapes describe the JSON produced by
 * `apps/hau/scripts/extract-content.mjs` from the Nuxt `__NUXT_DATA__`
 * payload (see `apps/hau-nuxt-build/`). They are the contract the
 * components of later phases (loading screen, navbar, home, archive, ...)
 * import from `apps/hau/content/*.json`.
 *
 * Media URLs are left untouched (still pointing at
 * `offland.wedesignwecode.com`) — rewriting them to a local mirror is
 * Phase 6, not this decoder.
 */

/** A single registered WordPress image size (thumbnail, medium, ...). */
export interface MediaSize {
  url: string;
  width: number;
  height: number;
}

/** A trimmed WordPress attachment (image or video). `sizes` is only
 * present for images — WP never registers size variants for videos. */
export interface Media {
  id: number;
  url: string;
  filename: string;
  alt: string;
  mimeType: string;
  width: number;
  height: number;
  sizes?: Record<string, MediaSize>;
}

/** A generic link/CTA, reduced from ACF's `cta` sub-field(s) to the
 * fields every call site actually uses. */
export interface CtaLink {
  title: string;
  url: string;
  target: string;
}

/* ------------------------------------------------------------------ */
/* ACF flexible-content blocks (`acf_fc_layout`)                       */
/* ------------------------------------------------------------------ */

export interface PageHeroBlock {
  acf_fc_layout: 'page_hero';
  title: string;
  large_description: string;
  small_description: string;
  small_description2: string;
  /** Static poster/thumbnail shown behind the hero video (field name
   * `video_thumbnale` is the source ACF field's actual spelling). */
  video_thumbnale: Media | false;
  video: Media | false;
  popup_video: Media | false;
  double_row: boolean;
}

export interface SelectedWorksBlock {
  acf_fc_layout: 'selected_works';
  title: string;
  add_counter: boolean;
  cta: CtaLink;
  /** Slugs into `cases.json`, in display order. The source payload embeds
   * full (but content-less — no ACF/image data) WP post stubs here; only
   * the slug is useful, so it is resolved down to a reference. */
  selected_cases: string[];
}

export interface WorksFilterBlock {
  acf_fc_layout: 'works_filter';
}

export interface ListBlock {
  acf_fc_layout: 'list';
  title: string;
  add_counter: boolean;
  description: string;
  list_title_1: string;
  list_title_2: string;
  /** Flattened from ACF repeater rows `{ item: string }[]`. */
  list_1: string[];
  list_2: string[] | false;
  background_color: string;
  fade_out_list_items: boolean;
}

export interface TextModuleBlock {
  acf_fc_layout: 'text_module';
  text: string;
}

export interface Testimonial {
  description: string;
  name: string;
  position: string;
  company: string;
}

export interface TestimonialsBlock {
  acf_fc_layout: 'testimonials';
  title: string;
  add_counter: boolean;
  testimonial: Testimonial[];
}

export interface ContactHeroBlock {
  acf_fc_layout: 'contact_hero';
  title: string;
  description: string;
  cta: CtaLink;
  hero_image: Media;
}

export interface ArchiveImage {
  archive_img: Media;
  archive_title: string;
  archive_desc: string;
}

export interface ArchiveBlock {
  acf_fc_layout: 'archive';
  images: ArchiveImage[];
}

export type Block =
  | PageHeroBlock
  | SelectedWorksBlock
  | WorksFilterBlock
  | ListBlock
  | TextModuleBlock
  | TestimonialsBlock
  | ContactHeroBlock
  | ArchiveBlock;

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

export type PageSlug = 'home' | 'work' | 'about' | 'contact' | 'archive';

export interface PageMeta {
  title: string;
  description: string;
}

export interface Page {
  slug: PageSlug;
  title: string;
  meta: PageMeta;
  blocks: Block[];
}

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

export interface Settings {
  contact_details: CtaLink[];
  social_links: CtaLink[];
}

/* ------------------------------------------------------------------ */
/* Menus                                                                */
/* ------------------------------------------------------------------ */

export interface MenuItem {
  label: string;
  /** Raw URL as stored on the WP side (still `offland.wedesignwecode.com`). */
  url: string;
  /** Site-relative pathname derived from `url` (WP's `/wp` prefix
   * stripped), ready to use as a Next `<Link href>` for internal nav. */
  path: string;
}

/** The source payload (`$smenus`) is a single flat, already-ordered list
 * of top-level nav items (Home/Work/Archive/About/Contact) — not several
 * named menus as the initial format recon assumed. Modelled as a
 * single-entry map (`main`) so a future second menu (e.g. footer) has
 * somewhere to go without a breaking shape change. */
export interface Menus {
  main: MenuItem[];
}

/* ------------------------------------------------------------------ */
/* Cases (case studies)                                                */
/* ------------------------------------------------------------------ */

export interface Case {
  slug: string;
  title: string;
  /** Short subtitle/excerpt (ACF `case_description`). */
  description: string;
  /** Category tags, used by the `/work/` listing filter. */
  category: string[];
  /** Cover/thumbnail image (ACF `case_image` — `featured_media` is
   * unset on every case and unusable). */
  image: Media;
  /** 0-based position in the source `$scases` order. */
  order: number;
}
