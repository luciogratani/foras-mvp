#!/usr/bin/env node
/**
 * Decodes the Nuxt `__NUXT_DATA__` payload embedded in the
 * `apps/hau-nuxt-build/` mirror (READ-ONLY) and writes clean, typed JSON
 * content into `apps/hau/content/`.
 *
 * The payload is Nuxt's `devalue`-serialized state: a flat JSON array
 * where integers are back-references into the same array. It is decoded
 * with the `devalue` npm package (the exact inverse of
 * `devalue.stringify`), with a reviver for Nuxt's `Reactive` wrapper
 * (the only custom type actually present in these payloads) plus a few
 * defensive no-op revivers in case `Ref`/`ShallowRef`/... ever show up.
 *
 * Every route's `index.html` (`/`, `/work/`, `/about/`, `/contact/`,
 * `/archive/`) embeds the *same* full content for all 5 pages + 20 cases
 * + settings + menus, so the home payload is used as the single source
 * of truth; the other routes are only re-parsed to verify they agree
 * (see `assertRoutesAgreeWithHome`).
 *
 * Media URLs (offland.wedesignwecode.com) are left untouched — mirroring
 * them locally is Phase 6, not this decoder.
 *
 * Output is deterministic (stable key order, 2-space indent, trailing
 * newline): re-running this script must not produce a git diff.
 *
 * Usage: `pnpm --filter hau extract:content` (or `node
 * scripts/extract-content.mjs` from `apps/hau/`).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'devalue';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(__dirname, '..');
const MIRROR_DIR = path.resolve(APP_DIR, '..', 'hau-nuxt-build');
const CONTENT_DIR = path.join(APP_DIR, 'content');

const ROUTES = ['home', 'work', 'about', 'contact', 'archive'];

/** Only `Reactive` actually appears in the captured payloads; the rest
 * are registered defensively (identity / undefined) in case a future
 * re-capture of the mirror introduces them. */
const REVIVERS = {
  Reactive: (v) => v,
  Ref: (v) => v,
  ShallowRef: (v) => v,
  ShallowReactive: (v) => v,
  EmptyRef: () => undefined,
  EmptyShallowRef: () => undefined,
  NuxtError: (v) => v,
};

/* ------------------------------------------------------------------ */
/* Decoding                                                             */
/* ------------------------------------------------------------------ */

function routeHtmlPath(route) {
  return route === 'home' ? path.join(MIRROR_DIR, 'index.html') : path.join(MIRROR_DIR, route, 'index.html');
}

function loadRouteState(route) {
  const html = readFileSync(routeHtmlPath(route), 'utf8');
  const match = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error(`__NUXT_DATA__ script tag not found in ${routeHtmlPath(route)}`);
  }
  const parsed = parse(match[1], REVIVERS);
  return parsed.state;
}

/** The format recon (see prompt 02) says every route's payload embeds
 * identical content for all 5 pages. Verify that instead of assuming it,
 * so a future re-capture of the mirror that breaks the assumption fails
 * loudly instead of silently producing stale/inconsistent JSON. */
function assertRoutesAgreeWithHome(homeState) {
  for (const route of ROUTES) {
    if (route === 'home') continue;
    const state = loadRouteState(route);
    const ownPage = state.$spages.find((p) => p.slug === route);
    const homePage = homeState.$spages.find((p) => p.slug === route);
    if (!ownPage || !homePage || JSON.stringify(ownPage) !== JSON.stringify(homePage)) {
      throw new Error(
        `Route "${route}" own __NUXT_DATA__ payload disagrees with the home payload's copy of the same page. ` +
          'The "home payload is the single source of truth" assumption from the format recon no longer holds — stop and investigate.',
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Trimming helpers                                                    */
/* ------------------------------------------------------------------ */

/** Trims a raw WP attachment object down to what rendering needs.
 * Returns `false` unchanged (ACF's "empty media field" sentinel). */
function trimMedia(raw) {
  if (!raw || typeof raw !== 'object') return false;

  const media = {
    id: raw.id,
    url: raw.url,
    filename: raw.filename ?? '',
    alt: raw.alt ?? '',
    mimeType: raw.mime_type ?? '',
    width: raw.width,
    height: raw.height,
  };

  // WP flattens size variants as `<name>`, `<name>-width`, `<name>-height`
  // (videos never have a `sizes` map at all).
  if (raw.sizes && typeof raw.sizes === 'object') {
    const sizeNames = Object.keys(raw.sizes).filter((k) => !k.endsWith('-width') && !k.endsWith('-height'));
    const sizes = {};
    for (const name of sizeNames) {
      sizes[name] = {
        url: raw.sizes[name],
        width: raw.sizes[`${name}-width`],
        height: raw.sizes[`${name}-height`],
      };
    }
    media.sizes = sizes;
  }

  return media;
}

/** Reduces any `cta`-shaped ACF sub-field to `{ title, url, target }`. */
function trimCta(raw) {
  return {
    title: raw?.title ?? '',
    url: raw?.url ?? '',
    target: raw?.target ?? '',
  };
}

/** Flattens ACF repeater rows of the form `{ item: string }[]` to plain
 * `string[]` — the `{ item }` wrapper carries no information beyond the
 * ACF repeater-row convention. */
function trimItemRepeater(rows) {
  return (rows ?? []).map((row) => row.item ?? '');
}

/* ------------------------------------------------------------------ */
/* Block builders (one per `acf_fc_layout`)                            */
/* ------------------------------------------------------------------ */

const BLOCK_BUILDERS = {
  page_hero: (raw) => ({
    acf_fc_layout: 'page_hero',
    title: raw.title ?? '',
    large_description: raw.large_description ?? '',
    small_description: raw.small_description ?? '',
    small_description2: raw.small_description2 ?? '',
    video_thumbnale: trimMedia(raw.video_thumbnale),
    video: trimMedia(raw.video),
    popup_video: trimMedia(raw.popup_video),
    double_row: !!raw.double_row,
  }),

  selected_works: (raw) => ({
    acf_fc_layout: 'selected_works',
    title: raw.title ?? '',
    add_counter: !!raw.add_counter,
    cta: trimCta(raw.cta),
    // The raw payload embeds full-but-content-less WP post stubs here
    // (no ACF/image data) — only the slug is useful; resolve down to a
    // reference into cases.json.
    selected_cases: (raw.selected_cases ?? []).map((c) => c.post_name),
  }),

  works_filter: () => ({
    acf_fc_layout: 'works_filter',
  }),

  list: (raw) => ({
    acf_fc_layout: 'list',
    title: raw.title ?? '',
    add_counter: !!raw.add_counter,
    description: raw.description ?? '',
    list_title_1: raw.list_title_1 ?? '',
    list_title_2: raw.list_title_2 ?? '',
    list_1: trimItemRepeater(raw.list_1),
    list_2: Array.isArray(raw.list_2) ? trimItemRepeater(raw.list_2) : false,
    background_color: raw.background_color ?? '',
    fade_out_list_items: !!raw.fade_out_list_items,
  }),

  text_module: (raw) => ({
    acf_fc_layout: 'text_module',
    text: raw.text ?? '',
  }),

  testimonials: (raw) => ({
    acf_fc_layout: 'testimonials',
    title: raw.title ?? '',
    add_counter: !!raw.add_counter,
    testimonial: (raw.testimonial ?? []).map((t) => ({
      description: t.description ?? '',
      name: t.name ?? '',
      position: t.position ?? '',
      company: t.company ?? '',
    })),
  }),

  contact_hero: (raw) => ({
    acf_fc_layout: 'contact_hero',
    title: raw.title ?? '',
    description: raw.description ?? '',
    cta: trimCta(raw.cta),
    hero_image: trimMedia(raw.hero_image),
  }),

  archive: (raw) => ({
    acf_fc_layout: 'archive',
    images: (raw.images ?? []).map((im) => ({
      archive_img: trimMedia(im.archive_img),
      archive_title: im.archive_title ?? '',
      archive_desc: im.archive_desc ?? '',
    })),
  }),
};

function buildBlock(raw) {
  const builder = BLOCK_BUILDERS[raw.acf_fc_layout];
  if (!builder) {
    throw new Error(`Unknown acf_fc_layout "${raw.acf_fc_layout}" — the block map from the format recon is out of date.`);
  }
  return builder(raw);
}

/* ------------------------------------------------------------------ */
/* Page / settings / menus / cases builders                            */
/* ------------------------------------------------------------------ */

function buildPage(raw) {
  return {
    slug: raw.slug,
    title: raw.title?.rendered ?? '',
    meta: {
      title: raw.yoast_head_json?.title ?? '',
      description: raw.yoast_head_json?.description ?? '',
    },
    blocks: (raw.acf?.content ?? []).map(buildBlock),
  };
}

function buildSettings(raw) {
  return {
    contact_details: (raw.contact_details ?? []).map((row) => trimCta(row.cta)),
    social_links: (raw.social_links ?? []).map((row) => trimCta(row.cta)),
  };
}

/** Strips WP's `/wp` sub-path prefix so the URL's pathname can be used
 * directly as a Next `<Link href>` for internal nav (e.g.
 * `https://offland.../wp/work/` -> `/work/`). The raw `url` is kept
 * as-is alongside it — this only *adds* a derived field, it does not
 * rewrite the source value. */
function derivePath(url) {
  try {
    const { pathname } = new URL(url);
    const stripped = pathname.replace(/^\/wp(\/|$)/, '/');
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  } catch {
    return url;
  }
}

/** `$smenus` turned out to be a single flat, already-ordered list of
 * top-level nav items (not several named menus, as the initial format
 * recon assumed — see report). Sorted by `menu_order` defensively even
 * though the source array is already in order. */
function buildMenus(raw) {
  const items = [...raw].sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0));
  return {
    main: items.map((item) => ({
      label: item.title ?? '',
      url: item.url ?? '',
      path: derivePath(item.url ?? ''),
    })),
  };
}

function buildCase(raw, index) {
  return {
    slug: raw.slug,
    title: raw.acf?.case_title ?? raw.title?.rendered ?? '',
    description: raw.acf?.case_description ?? '',
    category: Array.isArray(raw.acf?.case_category) ? raw.acf.case_category : [],
    image: trimMedia(raw.acf?.case_image),
    order: index,
  };
}

/* ------------------------------------------------------------------ */
/* IO                                                                   */
/* ------------------------------------------------------------------ */

function writeJson(relativePath, data) {
  const filePath = path.join(CONTENT_DIR, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  // Stable key order (insertion order, fixed by the builders above) +
  // 2-space indent + trailing newline => deterministic, diff-free reruns.
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`wrote content/${relativePath}`);
}

/* ------------------------------------------------------------------ */
/* Main                                                                 */
/* ------------------------------------------------------------------ */

function main() {
  const homeState = loadRouteState('home');
  assertRoutesAgreeWithHome(homeState);

  const rawPages = homeState.$spages;
  const rawCases = homeState.$scases;
  const rawSettings = homeState.$ssettings;
  const rawMenus = homeState.$smenus;

  if (rawPages.length !== 5) throw new Error(`Expected 5 pages in $spages, got ${rawPages.length}`);
  if (rawCases.length !== 20) throw new Error(`Expected 20 cases in $scases, got ${rawCases.length}`);

  for (const route of ROUTES) {
    const raw = rawPages.find((p) => p.slug === route);
    if (!raw) throw new Error(`Missing page for route "${route}" in $spages`);
    writeJson(`pages/${route}.json`, buildPage(raw));
  }

  writeJson('settings.json', buildSettings(rawSettings));
  writeJson('menus.json', buildMenus(rawMenus));
  writeJson(
    'cases.json',
    rawCases.map((raw, index) => buildCase(raw, index)),
  );

  console.log('extract:content done.');
}

main();
