/**
 * Unit tests for lib/errors/field-errors.ts
 * Verifies backend messages are mapped to es-AR catalog strings.
 */
import { describe, it, expect } from 'vitest'
import { mapValidationErrors, map409, mapGlobalError } from '@/lib/errors/field-errors'
import { copy } from '@/lib/copy/es-AR'
import type { BackendValidationError } from '@/lib/api/auth'

// All known es-AR catalog values for field errors.
const CATALOG_VALUES = new Set(Object.values(copy.fieldErrors))

function makeBody(messages: unknown[]): BackendValidationError {
  return {
    statusCode: 422,
    message: messages as string[],
    error: 'Unprocessable Entity',
  }
}

describe('mapValidationErrors', () => {
  it('(a) fields and global are disjoint — no key appears in both', () => {
    const result = mapValidationErrors(
      makeBody(['email must be an email', 'unknownfield must be valid']),
    )
    const fieldKeys = Object.keys(result.fields)
    for (const k of fieldKeys) {
      expect(result.global).not.toContain(k)
    }
    expect(result.global.every((g) => !fieldKeys.includes(g))).toBe(true)
  })

  it('(b) every fields[k] is an es-AR catalog value, never raw English', () => {
    const result = mapValidationErrors(
      makeBody([
        'email must be an email',
        'password must be longer than or equal to 8 characters',
        'name must be a string',
      ]),
    )
    for (const val of Object.values(result.fields)) {
      expect(CATALOG_VALUES.has(val)).toBe(true)
    }
  })

  it('(c) unknown field message goes to global as generic error string', () => {
    const result = mapValidationErrors(makeBody(['unknownfield must be valid']))
    expect(result.fields).toEqual({})
    expect(result.global).toContain(copy.globalErrors.generic)
  })

  it('(d) non-empty 422 body yields at least one message total', () => {
    const result = mapValidationErrors(makeBody(['email must be an email']))
    const total = Object.keys(result.fields).length + result.global.length
    expect(total).toBeGreaterThanOrEqual(1)
  })

  it('(e) empty-string and whitespace messages are skipped', () => {
    const result = mapValidationErrors(makeBody(['', '   ', '\t']))
    expect(result.fields).toEqual({})
    // Fallback fires because message array is non-empty but all entries were skipped.
    expect(result.global).toContain(copy.globalErrors.generic)
  })

  it('(f) first message per field wins — second message for same field is ignored', () => {
    const result = mapValidationErrors(
      makeBody([
        'email must be an email',
        'email is invalid',
        'email should not be empty',
      ]),
    )
    const emailEntries = Object.entries(result.fields).filter(([k]) => k === 'email')
    expect(emailEntries).toHaveLength(1)
    expect(result.fields.email).toBe(copy.fieldErrors.email)
  })

  it('empty message array → empty fields and empty global', () => {
    const result = mapValidationErrors(makeBody([]))
    expect(result.fields).toEqual({})
    expect(result.global).toEqual([])
  })

  it('mixed known and unknown fields: known → fields, unknown → global (once)', () => {
    const result = mapValidationErrors(
      makeBody([
        'password must be longer than or equal to 8 characters',
        'unknownfield must be valid',
        'anotherunknown is wrong',
      ]),
    )
    expect(result.fields.password).toBe(copy.fieldErrors.password)
    // generic is deduped by pushedGeneric flag
    expect(result.global.filter((g) => g === copy.globalErrors.generic)).toHaveLength(1)
  })

  it('lastName camelCase field is matched correctly (case-insensitive first token)', () => {
    const result = mapValidationErrors(makeBody(['lastName must be a string']))
    expect(result.fields.lastName).toBe(copy.fieldErrors.lastName)
  })

  it('all 7 known fields map to their correct catalog values', () => {
    const result = mapValidationErrors(
      makeBody([
        'name must be a string',
        'lastName must be a string',
        'email must be an email',
        'phone must match pattern',
        'password must be longer than or equal to 8 characters',
        'role must be one of',
        'trade must be selected',
      ]),
    )
    expect(result.fields.name).toBe(copy.fieldErrors.name)
    expect(result.fields.lastName).toBe(copy.fieldErrors.lastName)
    expect(result.fields.email).toBe(copy.fieldErrors.email)
    expect(result.fields.phone).toBe(copy.fieldErrors.phone)
    expect(result.fields.password).toBe(copy.fieldErrors.password)
    expect(result.fields.role).toBe(copy.fieldErrors.role)
    expect(result.fields.trade).toBe(copy.fieldErrors.trade)
  })
})

describe('map409', () => {
  it('returns { fields: { email: <emailTaken catalog string> } }', () => {
    const result = map409()
    expect(result).toEqual({ fields: { email: copy.emailTaken } })
  })

  it('emailTaken string is es-AR, not raw English', () => {
    const result = map409()
    expect(result.fields.email).toBe(copy.emailTaken)
    expect(result.fields.email).not.toMatch(/already exists/i)
  })
})

describe('mapGlobalError', () => {
  it('bad_request → copy.globalErrors.badRequest', () => {
    const result = mapGlobalError({
      ok: false,
      kind: 'bad_request',
      raw: { message: 'Bad Request' },
    })
    expect(result).toBe(copy.globalErrors.badRequest)
  })

  it('network → copy.globalErrors.network', () => {
    const result = mapGlobalError({ ok: false, kind: 'network' })
    expect(result).toBe(copy.globalErrors.network)
  })

  it('server → copy.globalErrors.server', () => {
    const result = mapGlobalError({ ok: false, kind: 'server', status: 500 })
    expect(result).toBe(copy.globalErrors.server)
  })

  it('validation → null (handled inline)', () => {
    const result = mapGlobalError({
      ok: false,
      kind: 'validation',
      raw: { statusCode: 422, message: [], error: 'Unprocessable Entity' },
    })
    expect(result).toBeNull()
  })

  it('conflict → null (handled inline)', () => {
    const result = mapGlobalError({
      ok: false,
      kind: 'conflict',
      raw: { message: 'An account with this email already exists.' },
    })
    expect(result).toBeNull()
  })
})
