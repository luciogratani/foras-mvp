---
status: LIVE
updated: 2026-05-29
area: docs
type: status
tags: [foras-mvp, docs, status]
owner: master-chat
---

# STATUS — stato vivo del progetto

> **Questo è l'unico file con stato vivo datato in `docs/`.** Se diverge dalla auto-memory o da altri doc, **QUESTO vince**. Aggiornare a ogni sessione che cambia lo stato.

## Fase attuale

🔒 **Template FROZEN** (2026-05-27) · ✅ **CI interamente verde** (2026-05-29). Stream A completo: RLS owner-scope (`is_tenant_owner`), schema-extras, `end_time`, `closed_dates`, timezone via helper TS, trigger DB anti-overbooking (002).

## Ultimo evento

**2026-05-29** — Chiuso l'intermezzo audit-04b: CI verde su tutti i job (Static `tsc`+lint+build · RLS-isolation SQL · Vitest service-layer 17/17). Rete di sicurezza pre-cliente in piedi (runner `scripts/migrate.sh` + `public.tenant_migrations` + isolamento RLS in CI).

## Prossimo passo

**Stream C — onboarding cliente #1.** ⛔ Bloccato da dipendenze esterne: **non c'è ancora un cliente reale né un dominio**. Stream B (email) è costruito ma DORMIENTE (`BOOKING_EMAIL_ENABLED=false`); B1 dominio/Resend differito.

## Da aprire (per una master fresca)

- [[backlog]] — cosa fare / cronaca degli sprint e intermezzi
- [[decisioni]] — il perché (decisioni architetturali e di prodotto)
- [[architettura-fullstack]] — il sistema (multi-tenancy, auth, deploy)
- `CHANGELOG.md` (root del repo) — elenco autorevole delle migrazioni schema tenant

## Watch aperti (non bloccanti)

- **Audit punto G** — backup automatico + connection pooler: non eseguito, operativo, non bloccante per cliente #1.
- **Audit punto E** — network-failure dnd: rimandato.
- **Anomalia `menu_*` svuotate** (2026-05-27) — tabelle `menu_*` del template trovate vuote, causa ignota; se si ripete → audit trigger + check pre-freeze A4.
