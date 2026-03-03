import { describe, it, expect } from 'vitest'
import { convert, canConvert, getCategory, listUnits, possibilities } from './index'

// Helpers
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps

// ─── Fluent API ───────────────────────────────────────────────────────────────

describe('API styles', () => {
  it('fluent: convert(v).from(u).to(u)', () => {
    expect(convert(100).from('cm').to('m')).toBe(1)
  })

  it('direct: convert(v, from, to)', () => {
    expect(convert(100, 'cm', 'm')).toBe(1)
  })

  it('same unit returns same value', () => {
    expect(convert(42).from('kg').to('kg')).toBe(42)
    expect(convert(100).from('C').to('C')).toBe(100)
  })

  it('throws on unknown unit', () => {
    // @ts-expect-error testing runtime guard
    expect(() => convert(1).from('xyz').to('m')).toThrow(/Unknown unit/)
    // @ts-expect-error testing runtime guard
    expect(() => convert(1).from('m').to('xyz')).toThrow(/Unknown unit/)
  })

  it('throws on cross-category conversion', () => {
    // @ts-expect-error testing runtime guard
    expect(() => convert(1).from('m').to('kg')).toThrow(/Cannot convert/)
  })
})

// ─── Length ───────────────────────────────────────────────────────────────────

describe('length', () => {
  it('cm → m', () => expect(convert(100, 'cm', 'm')).toBe(1))
  it('m → km', () => expect(convert(1000, 'm', 'km')).toBe(1))
  it('km → mi', () => expect(near(convert(1, 'km', 'mi'), 0.621371)).toBe(true))
  it('in → cm', () => expect(near(convert(1, 'in', 'cm'), 2.54)).toBe(true))
  it('ft → m', () => expect(near(convert(1, 'ft', 'm'), 0.3048)).toBe(true))
  it('mi → km', () => expect(near(convert(1, 'mi', 'km'), 1.609344)).toBe(true))
  it('nmi → km', () => expect(convert(1, 'nmi', 'km')).toBe(1.852))
  it('um → mm', () => expect(convert(1000, 'um', 'mm')).toBe(1))
  it('round-trip ft → m → ft', () => expect(near(convert(convert(5, 'ft', 'm'), 'm', 'ft'), 5)).toBe(true))
})

// ─── Mass ─────────────────────────────────────────────────────────────────────

describe('mass', () => {
  it('kg → g', () => expect(convert(1, 'kg', 'g')).toBe(1000))
  it('g → mg', () => expect(convert(1, 'g', 'mg')).toBe(1000))
  it('kg → lb', () => expect(near(convert(1, 'kg', 'lb'), 2.204623)).toBe(true))
  it('lb → kg', () => expect(near(convert(1, 'lb', 'kg'), 0.453592)).toBe(true))
  it('oz → g', () => expect(near(convert(1, 'oz', 'g'), 28.349523)).toBe(true))
  it('t → kg', () => expect(convert(1, 't', 'kg')).toBe(1000))
  it('st → kg', () => expect(near(convert(1, 'st', 'kg'), 6.350293)).toBe(true))
})

// ─── Temperature ─────────────────────────────────────────────────────────────

describe('temperature', () => {
  it('0°C → 32°F', () => expect(convert(0, 'C', 'F')).toBe(32))
  it('100°C → 212°F', () => expect(convert(100, 'C', 'F')).toBe(212))
  it('32°F → 0°C', () => expect(convert(32, 'F', 'C')).toBe(0))
  it('-40°C = -40°F', () => expect(convert(-40, 'C', 'F')).toBe(-40))
  it('0°C → 273.15K', () => expect(convert(0, 'C', 'K')).toBe(273.15))
  it('100K → -173.15°C', () => expect(near(convert(100, 'K', 'C'), -173.15)).toBe(true))
  it('212°F → 373.15K', () => expect(near(convert(212, 'F', 'K'), 373.15)).toBe(true))
  it('0K → -459.67°F', () => expect(near(convert(0, 'K', 'F'), -459.67)).toBe(true))
  it('0°C → 491.67R', () => expect(near(convert(0, 'C', 'R'), 491.67)).toBe(true))
  it('round-trip F → C → F', () => expect(near(convert(convert(75, 'F', 'C'), 'C', 'F'), 75)).toBe(true))
})

// ─── Area ─────────────────────────────────────────────────────────────────────

describe('area', () => {
  it('m2 → cm2', () => expect(convert(1, 'm2', 'cm2')).toBe(10000))
  it('km2 → ha', () => expect(convert(1, 'km2', 'ha')).toBe(100))
  it('ha → ac', () => expect(near(convert(1, 'ha', 'ac'), 2.471054)).toBe(true))
  it('ft2 → m2', () => expect(near(convert(1, 'ft2', 'm2'), 0.0929030)).toBe(true))
  it('mi2 → km2', () => expect(near(convert(1, 'mi2', 'km2'), 2.589988)).toBe(true))
  it('in2 → cm2', () => expect(near(convert(1, 'in2', 'cm2'), 6.4516)).toBe(true))
})

// ─── Volume ───────────────────────────────────────────────────────────────────

describe('volume', () => {
  it('l → ml', () => expect(convert(1, 'l', 'ml')).toBe(1000))
  it('m3 → l', () => expect(convert(1, 'm3', 'l')).toBe(1000))
  it('gal → l', () => expect(near(convert(1, 'gal', 'l'), 3.785412)).toBe(true))
  it('uk_gal → l', () => expect(near(convert(1, 'uk_gal', 'l'), 4.54609)).toBe(true))
  it('cup → ml', () => expect(near(convert(1, 'cup', 'ml'), 236.5882365, 1e-6)).toBe(true))
  it('fl_oz → ml', () => expect(near(convert(1, 'fl_oz', 'ml'), 29.5735295625, 1e-9)).toBe(true))
  it('tsp → tbsp', () => expect(near(convert(3, 'tsp', 'tbsp'), 1, 1e-4)).toBe(true))
  it('pt → qt', () => expect(near(convert(2, 'pt', 'qt'), 1, 1e-9)).toBe(true))
})

// ─── Time ─────────────────────────────────────────────────────────────────────

describe('time', () => {
  it('min → s', () => expect(convert(1, 'min', 's')).toBe(60))
  it('h → min', () => expect(convert(1, 'h', 'min')).toBe(60))
  it('d → h', () => expect(convert(1, 'd', 'h')).toBe(24))
  it('wk → d', () => expect(convert(1, 'wk', 'd')).toBe(7))
  it('yr → d', () => expect(near(convert(1, 'yr', 'd'), 365.2425)).toBe(true))
  it('ms → s', () => expect(convert(1000, 'ms', 's')).toBe(1))
})

// ─── Speed ───────────────────────────────────────────────────────────────────

describe('speed', () => {
  it('km/h → m/s', () => expect(near(convert(3.6, 'km/h', 'm/s'), 1)).toBe(true))
  it('mph → km/h', () => expect(near(convert(1, 'mph', 'km/h'), 1.609344, 1e-4)).toBe(true))
  it('knot → km/h', () => expect(near(convert(1, 'knot', 'km/h'), 1.852, 1e-9)).toBe(true))
  it('ft/s → m/s', () => expect(near(convert(1, 'ft/s', 'm/s'), 0.3048)).toBe(true))
  it('0 m/s = 0 km/h', () => expect(convert(0, 'm/s', 'km/h')).toBe(0))
})

// ─── Pressure ────────────────────────────────────────────────────────────────

describe('pressure', () => {
  it('1 atm → Pa', () => expect(convert(1, 'atm', 'Pa')).toBe(101325))
  it('1 bar → kPa', () => expect(convert(1, 'bar', 'kPa')).toBe(100))
  it('1 psi → Pa', () => expect(near(convert(1, 'psi', 'Pa'), 6894.757293168, 1e-3)).toBe(true))
  it('1 atm → bar', () => expect(near(convert(1, 'atm', 'bar'), 1.01325)).toBe(true))
  it('1 atm → mmHg', () => expect(near(convert(1, 'atm', 'mmHg'), 760, 0.01)).toBe(true))
})

// ─── Energy ───────────────────────────────────────────────────────────────────

describe('energy', () => {
  it('1 kWh → J', () => expect(convert(1, 'kWh', 'J')).toBe(3.6e6))
  it('1 kcal → kJ', () => expect(near(convert(1, 'kcal', 'kJ'), 4.184)).toBe(true))
  it('1 BTU → J', () => expect(near(convert(1, 'BTU', 'J'), 1055.05585262, 1e-7)).toBe(true))
  it('1 Wh → kJ', () => expect(near(convert(1, 'Wh', 'kJ'), 3.6)).toBe(true))
  it('1 cal → J', () => expect(convert(1, 'cal', 'J')).toBe(4.184))
})

// ─── Power ───────────────────────────────────────────────────────────────────

describe('power', () => {
  it('1 kW → W', () => expect(convert(1, 'kW', 'W')).toBe(1000))
  it('1 MW → kW', () => expect(convert(1, 'MW', 'kW')).toBe(1000))
  it('1 hp → W', () => expect(near(convert(1, 'hp', 'W'), 745.6998715822702, 1e-9)).toBe(true))
  it('1 GW → MW', () => expect(convert(1, 'GW', 'MW')).toBe(1000))
})

// ─── Digital storage ──────────────────────────────────────────────────────────

describe('digital', () => {
  it('1 B → 8 bit', () => expect(convert(1, 'B', 'bit')).toBe(8))
  it('1 KB → 1000 B (SI)', () => expect(convert(1, 'KB', 'B')).toBe(1000))
  it('1 KiB → 1024 B (IEC)', () => expect(convert(1, 'KiB', 'B')).toBe(1024))
  it('1 GB → 1e9 B', () => expect(convert(1, 'GB', 'B')).toBe(1e9))
  it('1 GiB → bytes', () => expect(convert(1, 'GiB', 'B')).toBe(1073741824))
  it('1 TB → GB', () => expect(convert(1, 'TB', 'GB')).toBe(1000))
  it('1 TiB → GiB', () => expect(convert(1, 'TiB', 'GiB')).toBe(1024))
  it('1 PiB → TiB', () => expect(convert(1, 'PiB', 'TiB')).toBe(1024))
})

// ─── Angle ────────────────────────────────────────────────────────────────────

describe('angle', () => {
  it('180 deg → π rad', () => expect(near(convert(180, 'deg', 'rad'), Math.PI)).toBe(true))
  it('π rad → 180 deg', () => expect(near(convert(Math.PI, 'rad', 'deg'), 180)).toBe(true))
  it('360 deg → 400 grad', () => expect(convert(360, 'deg', 'grad')).toBe(400))
  it('90 deg → 100 grad', () => expect(convert(90, 'deg', 'grad')).toBe(100))
  it('round-trip deg → rad → deg', () => expect(near(convert(convert(45, 'deg', 'rad'), 'rad', 'deg'), 45)).toBe(true))
})

// ─── Frequency ───────────────────────────────────────────────────────────────

describe('frequency', () => {
  it('1 kHz → 1000 Hz', () => expect(convert(1, 'kHz', 'Hz')).toBe(1000))
  it('1 MHz → 1000 kHz', () => expect(convert(1, 'MHz', 'kHz')).toBe(1000))
  it('1 GHz → 1e6 kHz', () => expect(convert(1, 'GHz', 'kHz')).toBe(1e6))
})

// ─── Utilities ────────────────────────────────────────────────────────────────

describe('canConvert', () => {
  it('same category → true', () => {
    expect(canConvert('cm', 'm')).toBe(true)
    expect(canConvert('C', 'F')).toBe(true)
    expect(canConvert('KB', 'MiB')).toBe(true)
  })

  it('different category → false', () => {
    expect(canConvert('cm', 'kg')).toBe(false)
    expect(canConvert('C', 's')).toBe(false)
  })

  it('unknown unit → false', () => {
    expect(canConvert('xyz', 'm')).toBe(false)
  })
})

describe('getCategory', () => {
  it('returns correct category', () => {
    expect(getCategory('km')).toBe('length')
    expect(getCategory('C')).toBe('temperature')
    expect(getCategory('GiB')).toBe('digital')
    expect(getCategory('knot')).toBe('speed')
    expect(getCategory('ha')).toBe('area')
  })

  it('returns undefined for unknown unit', () => {
    expect(getCategory('xyz')).toBeUndefined()
  })
})

describe('possibilities', () => {
  it('returns all units in the same category', () => {
    const p = possibilities('km')
    expect(p).toContain('m')
    expect(p).toContain('mi')
    expect(p).toContain('km')
    expect(p).toContain('nmi')
    expect(p).not.toContain('kg')
  })

  it('temperature possibilities', () => {
    expect(possibilities('F')).toEqual(['C', 'F', 'K', 'R'])
  })

  it('digital possibilities includes both SI and IEC', () => {
    const p = possibilities('GB')
    expect(p).toContain('MB')
    expect(p).toContain('GiB')
    expect(p).toContain('bit')
  })

  it('throws on unknown unit', () => {
    // @ts-expect-error testing runtime guard
    expect(() => possibilities('xyz')).toThrow(/Unknown unit/)
  })
})

describe('listUnits', () => {
  it('returns all categories', () => {
    const all = listUnits()
    expect(Object.keys(all)).toContain('length')
    expect(Object.keys(all)).toContain('temperature')
    expect(Object.keys(all)).toContain('digital')
    expect(all.length).toContain('km')
    expect(all.temperature).toContain('F')
  })

  it('returns units for a specific category', () => {
    const lengthUnits = listUnits('length')
    expect(lengthUnits).toContain('m')
    expect(lengthUnits).toContain('mi')
    expect(lengthUnits).toContain('nmi')
  })

  it('throws for unknown category', () => {
    // @ts-expect-error testing runtime guard
    expect(() => listUnits('xyz')).toThrow(/Unknown category/)
  })
})
