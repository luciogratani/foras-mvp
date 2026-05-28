/**
 * pg-mock-client.ts
 *
 * Thin mock of the PostgREST / Supabase-JS fluent API backed by a real `pg`
 * Pool. Covers only the methods used by packages/supabase/src/services/*.
 *
 * Design: QueryBuilder is a single "mutable builder" object. All methods
 * return `this` for chaining. The distinction between "SELECT for query" vs
 * "SELECT as RETURNING after INSERT/UPDATE" is handled by the _op state.
 *
 * Thenable: `await queryBuilder` calls _execute() via the .then() trap.
 */

import type { Pool, PoolClient } from 'pg'

type AnyRecord = Record<string, unknown>

interface QueryResult<T> {
  data: T | null
  error: { message: string; code?: string } | null
  count?: number | null
}

type FilterOp = {
  type: 'eq' | 'neq' | 'lte' | 'gte' | 'lt' | 'gt' | 'is' | 'in' | 'or'
  column?: string
  value?: unknown
  raw?: string // for 'or'
}

type OrderClause = {
  column: string
  ascending: boolean
  nullsFirst?: boolean
}

class QueryBuilder<T = AnyRecord> {
  private _schema: string
  private _table: string
  private _pool: Pool

  private _op: 'select' | 'insert' | 'update' | 'delete' = 'select'
  /** For SELECT: which columns. For INSERT/UPDATE: the RETURNING columns (set via .select() after mutation). */
  private _selectCols: string = '*'
  private _insertData: AnyRecord | AnyRecord[] | null = null
  private _updateData: AnyRecord | null = null
  private _filters: FilterOp[] = []
  private _orders: OrderClause[] = []
  private _limit: number | null = null
  private _returnSingle: 'single' | 'maybeSingle' | null = null
  private _countOnly = false
  /** True after insert() or update() — the next .select() call is treated as RETURNING */
  private _pendingMutation = false

  constructor(pool: Pool, schema: string, table: string) {
    this._pool = pool
    this._schema = schema
    this._table = table
  }

  // ── operation builders ──────────────────────────────────────────────────

  /**
   * Dual-purpose:
   *   - After from(): start a SELECT query. `cols` sets the column list.
   *   - After insert()/update(): set RETURNING columns (PostgREST chaining pattern).
   *
   * Supports supabase-js two-arg form: select(cols, { count: 'exact', head: true })
   */
  select(cols?: string, opts?: { count?: 'exact'; head?: boolean }): this {
    if (this._pendingMutation) {
      // This is a RETURNING clause after INSERT/UPDATE
      this._pendingMutation = false
      this._selectCols = cols ?? '*'
      return this
    }

    this._op = 'select'
    if (opts?.count === 'exact') {
      this._countOnly = true
      this._selectCols = cols ?? 'id'
    } else {
      this._selectCols = cols ?? '*'
    }
    return this
  }

  insert(data: AnyRecord | AnyRecord[]): this {
    this._op = 'insert'
    this._insertData = data
    this._pendingMutation = true
    return this
  }

  update(data: AnyRecord): this {
    this._op = 'update'
    this._updateData = data
    this._pendingMutation = true
    return this
  }

  delete(): this {
    this._op = 'delete'
    return this
  }

  // ── filters ─────────────────────────────────────────────────────────────

  eq(col: string, val: unknown): this {
    this._filters.push({ type: 'eq', column: col, value: val })
    return this
  }

  neq(col: string, val: unknown): this {
    this._filters.push({ type: 'neq', column: col, value: val })
    return this
  }

  lte(col: string, val: unknown): this {
    this._filters.push({ type: 'lte', column: col, value: val })
    return this
  }

  gte(col: string, val: unknown): this {
    this._filters.push({ type: 'gte', column: col, value: val })
    return this
  }

  is(col: string, val: unknown): this {
    this._filters.push({ type: 'is', column: col, value: val })
    return this
  }

  in(col: string, vals: unknown[]): this {
    this._filters.push({ type: 'in', column: col, value: vals })
    return this
  }

  or(filterStr: string): this {
    this._filters.push({ type: 'or', raw: filterStr })
    return this
  }

  // ── result shaping ───────────────────────────────────────────────────────

  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this._orders.push({
      column: col,
      ascending: opts?.ascending ?? true,
      nullsFirst: opts?.nullsFirst,
    })
    return this
  }

  limit(n: number): this {
    this._limit = n
    return this
  }

  single(): this {
    this._returnSingle = 'single'
    return this
  }

  maybeSingle(): this {
    this._returnSingle = 'maybeSingle'
    return this
  }

  // ── execution (thenable) ─────────────────────────────────────────────────

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this._execute().then(onfulfilled as never, onrejected as never)
  }

  private async _execute(): Promise<QueryResult<T>> {
    const pgClient = await this._pool.connect()
    try {
      return await this._run(pgClient)
    } finally {
      pgClient.release()
    }
  }

  private async _run(pgClient: PoolClient): Promise<QueryResult<T>> {
    const qualified = `"${this._schema}"."${this._table}"`
    const params: unknown[] = []
    let pi = 1

    const addParam = (v: unknown) => {
      params.push(v)
      return `$${pi++}`
    }

    // ── build WHERE ────────────────────────────────────────────────────────
    const whereClauses: string[] = []
    for (const f of this._filters) {
      if (f.type === 'or' && f.raw) {
        const parts = f.raw.split(',').map((part) => {
          const m = part.match(/^([^.]+)\.([^.]+)\.(.*)$/)
          if (!m) return 'true'
          const [, col, op, val] = m
          const qc = `"${col}"`
          if (op === 'is' && val === 'null') return `${qc} IS NULL`
          if (op === 'gte') return `${qc} >= ${addParam(val)}`
          if (op === 'lte') return `${qc} <= ${addParam(val)}`
          if (op === 'eq') return `${qc} = ${addParam(val)}`
          return 'true'
        })
        whereClauses.push(`(${parts.join(' OR ')})`)
      } else {
        const qc = `"${f.column}"`
        if (f.type === 'eq') {
          whereClauses.push(f.value === null ? `${qc} IS NULL` : `${qc} = ${addParam(f.value)}`)
        } else if (f.type === 'neq') {
          whereClauses.push(f.value === null ? `${qc} IS NOT NULL` : `${qc} != ${addParam(f.value)}`)
        } else if (f.type === 'lte') {
          whereClauses.push(`${qc} <= ${addParam(f.value)}`)
        } else if (f.type === 'gte') {
          whereClauses.push(`${qc} >= ${addParam(f.value)}`)
        } else if (f.type === 'lt') {
          whereClauses.push(`${qc} < ${addParam(f.value)}`)
        } else if (f.type === 'gt') {
          whereClauses.push(`${qc} > ${addParam(f.value)}`)
        } else if (f.type === 'is') {
          whereClauses.push(f.value === null ? `${qc} IS NULL` : `${qc} IS ${String(f.value)}`)
        } else if (f.type === 'in') {
          const arr = f.value as unknown[]
          if (arr.length === 0) {
            whereClauses.push('false')
          } else {
            const placeholders = arr.map((v) => addParam(v)).join(', ')
            whereClauses.push(`${qc} IN (${placeholders})`)
          }
        }
      }
    }
    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // ── ORDER BY ───────────────────────────────────────────────────────────
    const orderParts = this._orders.map((o) => {
      const dir = o.ascending !== false ? 'ASC' : 'DESC'
      const nulls =
        o.nullsFirst === true ? 'NULLS FIRST' : o.nullsFirst === false ? 'NULLS LAST' : ''
      return `"${o.column}" ${dir} ${nulls}`.trim()
    })
    const orderSQL = orderParts.length > 0 ? `ORDER BY ${orderParts.join(', ')}` : ''

    // ── LIMIT ──────────────────────────────────────────────────────────────
    const limitSQL = this._limit !== null ? `LIMIT ${this._limit}` : ''

    try {
      if (this._op === 'select') {
        if (this._countOnly) {
          const sql = `SELECT COUNT(*) AS cnt FROM ${qualified} ${whereSQL}`
          const result = await pgClient.query(sql, params as never[])
          const count = parseInt(result.rows[0]?.cnt ?? '0', 10)
          return { data: null, error: null, count }
        }

        const { selectSQL, joinSQL } = parseSelectCols(this._selectCols, this._schema, this._table)
        const sql = `SELECT ${selectSQL} FROM ${qualified} ${joinSQL} ${whereSQL} ${orderSQL} ${limitSQL}`
        const result = await pgClient.query(sql, params as never[])
        const rows = mapRows(result.rows, this._selectCols, this._table)

        if (this._returnSingle === 'single') {
          if (rows.length === 0) return { data: null, error: { message: 'No rows found' } }
          return { data: rows[0] as T, error: null }
        }
        if (this._returnSingle === 'maybeSingle') {
          return { data: (rows[0] as T) ?? null, error: null }
        }
        return { data: rows as unknown as T, error: null }
      }

      if (this._op === 'insert') {
        const rows = Array.isArray(this._insertData) ? this._insertData : [this._insertData!]
        const firstRow = rows[0]
        const cols = Object.keys(firstRow)
        const colList = cols.map((c) => `"${c}"`).join(', ')
        const valuePlaceholders = rows
          .map((row) => `(${cols.map((c) => addParam(row[c])).join(', ')})`)
          .join(', ')

        const hasReturning = this._selectCols && this._selectCols !== '*' && !this._pendingMutation
        const returningSQL = hasReturning
          ? ` RETURNING ${this._selectCols
              .split(',')
              .map((c) => `"${c.trim()}"`)
              .join(', ')}`
          : ''

        const sql = `INSERT INTO ${qualified} (${colList}) VALUES ${valuePlaceholders}${returningSQL}`
        const result = await pgClient.query(sql, params as never[])

        if (hasReturning) {
          if (this._returnSingle === 'single') return { data: (result.rows[0] as T) ?? null, error: null }
          if (this._returnSingle === 'maybeSingle') return { data: (result.rows[0] as T) ?? null, error: null }
          return { data: result.rows as unknown as T, error: null }
        }
        return { data: null, error: null }
      }

      if (this._op === 'update') {
        const data = this._updateData!
        const setCols = Object.keys(data)
          .map((c) => `"${c}" = ${addParam(data[c])}`)
          .join(', ')

        const hasReturning = this._selectCols && this._selectCols !== '*' && !this._pendingMutation
        const returningSQL = hasReturning
          ? ` RETURNING ${this._selectCols
              .split(',')
              .map((c) => `"${c.trim()}"`)
              .join(', ')}`
          : ''

        const sql = `UPDATE ${qualified} SET ${setCols} ${whereSQL}${returningSQL}`
        const result = await pgClient.query(sql, params as never[])

        if (hasReturning) {
          if (this._returnSingle === 'single') return { data: (result.rows[0] as T) ?? null, error: null }
          if (this._returnSingle === 'maybeSingle') return { data: (result.rows[0] as T) ?? null, error: null }
          return { data: result.rows as unknown as T, error: null }
        }
        return { data: null, error: null }
      }

      if (this._op === 'delete') {
        const sql = `DELETE FROM ${qualified} ${whereSQL}`
        await pgClient.query(sql, params as never[])
        return { data: null, error: null }
      }

      return { data: null, error: { message: 'Unknown operation' } }
    } catch (err: unknown) {
      const pgErr = err as { message?: string; code?: string }
      return { data: null, error: { message: pgErr.message ?? String(err), code: pgErr.code } }
    }
  }
}

// ── SQL helpers ─────────────────────────────────────────────────────────────

/**
 * Parses PostgREST-style select column strings into SQL SELECT + JOIN clauses.
 * Handles: "col1, col2" and "col1, related_table(col1, col2)".
 *
 * The relation join uses: table.${relTable_singular}_id → relTable.id
 * This covers the only join used in the service layer:
 *   bookings.time_slot_id → time_slots.id
 */
function parseSelectCols(
  rawCols: string,
  schema: string,
  table: string
): { selectSQL: string; joinSQL: string } {
  if (!rawCols.includes('(')) {
    const cols = rawCols === '*' ? `"${table}".*` : rawCols
    return { selectSQL: cols, joinSQL: '' }
  }

  const topCols: string[] = []
  const joinSpecs: Array<{ relTable: string; cols: string[] }> = []

  let depth = 0
  let current = ''
  for (const ch of rawCols + ',') {
    if (ch === '(') { depth++; current += ch }
    else if (ch === ')') { depth--; current += ch }
    else if (ch === ',' && depth === 0) {
      const trimmed = current.trim()
      if (trimmed) {
        const m = trimmed.match(/^(\w+)\((.+)\)$/)
        if (m) joinSpecs.push({ relTable: m[1], cols: m[2].split(',').map((c) => c.trim()) })
        else topCols.push(trimmed)
      }
      current = ''
    } else {
      current += ch
    }
  }

  const selectParts: string[] =
    topCols.length > 0 ? topCols.map((c) => `"${table}"."${c}"`) : [`"${table}".*`]
  const joinParts: string[] = []

  for (const js of joinSpecs) {
    const relTable = js.relTable
    const alias = `__j_${relTable}`
    // Derive the FK column from the related table name:
    // "time_slots" → table should have "time_slot_id" (drop trailing 's', add _id)
    const fkCol = relTable.replace(/s$/, '') + '_id'
    joinParts.push(
      `LEFT JOIN "${schema}"."${relTable}" "${alias}" ON "${table}"."${fkCol}" = "${alias}"."id"`
    )
    for (const col of js.cols) {
      selectParts.push(`"${alias}"."${col}" AS "__j_${relTable}__${col}"`)
    }
  }

  return { selectSQL: selectParts.join(', '), joinSQL: joinParts.join(' ') }
}

/**
 * Reconstruct flat SQL rows into the nested shape PostgREST returns for
 * embedded resources: `{..., time_slots: {label, time}}`.
 */
function mapRows(rows: AnyRecord[], rawCols: string, _table: string): AnyRecord[] {
  if (!rawCols.includes('(')) return rows

  return rows.map((row) => {
    const result: AnyRecord = {}
    for (const [key, val] of Object.entries(row)) {
      const m = key.match(/^__j_(\w+)__(.+)$/)
      if (m) {
        const relTable = m[1]
        const col = m[2]
        if (!result[relTable]) result[relTable] = {}
        ;(result[relTable] as AnyRecord)[col] = val
      } else {
        result[key] = val
      }
    }
    // Null-out joined table if all columns are null (LEFT JOIN with no match)
    for (const key of Object.keys(result)) {
      const v = result[key]
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        if (Object.values(v as AnyRecord).every((x) => x === null)) {
          result[key] = null
        }
      }
    }
    return result
  })
}

// ── factory ──────────────────────────────────────────────────────────────────

/**
 * Creates a mock client compatible with `TenantClient` for the given schema.
 * Cast to `unknown` then `TenantClient` at the call site — we only cover the
 * subset of the API that the service layer actually uses.
 */
export function createPgMockClient(pool: Pool, schema: string) {
  return {
    from: (table: string) => new QueryBuilder(pool, schema, table),
  }
}
