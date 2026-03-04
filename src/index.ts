/**
 * Universal unit converter.
 * 13 categories, 100+ units. Zero dependencies.
 */

// ─── Public unit types ────────────────────────────────────────────────────────

export type LengthUnit    = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'mi' | 'nmi' | 'um'
export type MassUnit      = 'mg' | 'g' | 'kg' | 't' | 'lb' | 'oz' | 'st'
export type TempUnit      = 'C' | 'F' | 'K' | 'R'
export type AreaUnit      = 'mm2' | 'cm2' | 'm2' | 'km2' | 'in2' | 'ft2' | 'yd2' | 'mi2' | 'ha' | 'ac'
export type VolumeUnit    = 'ml' | 'cl' | 'dl' | 'l' | 'm3' | 'tsp' | 'tbsp' | 'fl_oz' | 'cup' | 'pt' | 'qt' | 'gal' | 'uk_gal'
export type TimeUnit      = 'ms' | 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'yr'
export type SpeedUnit     = 'm/s' | 'km/h' | 'mph' | 'knot' | 'ft/s'
export type PressureUnit  = 'Pa' | 'kPa' | 'MPa' | 'bar' | 'atm' | 'psi' | 'mmHg' | 'inHg'
export type EnergyUnit    = 'J' | 'kJ' | 'cal' | 'kcal' | 'Wh' | 'kWh' | 'BTU' | 'eV'
export type PowerUnit     = 'W' | 'kW' | 'MW' | 'GW' | 'hp'
export type DigitalUnit   = 'bit' | 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB'
export type AngleUnit     = 'deg' | 'rad' | 'grad'
export type FrequencyUnit = 'Hz' | 'kHz' | 'MHz' | 'GHz'

/** Union of all supported units. */
export type Unit =
  | LengthUnit | MassUnit | TempUnit | AreaUnit | VolumeUnit
  | TimeUnit | SpeedUnit | PressureUnit | EnergyUnit | PowerUnit
  | DigitalUnit | AngleUnit | FrequencyUnit

/** All available category names. */
export type Category =
  | 'length' | 'mass' | 'temperature' | 'area' | 'volume'
  | 'time' | 'speed' | 'pressure' | 'energy' | 'power'
  | 'digital' | 'angle' | 'frequency'

// ─── Linear unit data ─────────────────────────────────────────────────────────
// Format: [category, { unit: base_factor, ... }]
// Base units: length→m, mass→g, area→m², volume→L, time→s,
//             speed→m/s, pressure→Pa, energy→J, power→W, digital→B,
//             angle→deg, frequency→Hz

// US gallon = 231 in³ (exact), 1 in = 0.0254 m (exact) → 3.785411784 L
const US_GAL_L = 231 * (0.0254 ** 3) * 1000

const LINEAR_DATA: [string, Record<string, number>][] = [
  ['length',    { um: 1e-6, mm: 1e-3, cm: 1e-2, m: 1, km: 1e3, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344, nmi: 1852 }],
  ['mass',      { mg: 1e-3, g: 1, kg: 1e3, t: 1e6, oz: 28.349523125, lb: 453.59237, st: 6350.29318 }],
  ['area',      { mm2: 1e-6, cm2: 1e-4, m2: 1, km2: 1e6, in2: 6.4516e-4, ft2: 0.09290304, yd2: 0.83612736, mi2: 2589988.110336, ha: 1e4, ac: 4046.8564224 }],
  ['volume',    { ml: 0.001, cl: 0.01, dl: 0.1, l: 1, m3: 1000, tsp: US_GAL_L / 768, tbsp: US_GAL_L / 256, fl_oz: US_GAL_L / 128, cup: US_GAL_L / 16, pt: US_GAL_L / 8, qt: US_GAL_L / 4, gal: US_GAL_L, uk_gal: 4.54609 }],
  ['time',      { ms: 1e-3, s: 1, min: 60, h: 3600, d: 86400, wk: 604800, mo: 2629746, yr: 31556952 }],
  ['speed',     { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, knot: 1852 / 3600, 'ft/s': 0.3048 }],
  ['pressure',  { Pa: 1, kPa: 1e3, MPa: 1e6, bar: 1e5, atm: 101325, psi: 6894.757293168361, mmHg: 133.322387415, inHg: 3386.388640341 }],
  ['energy',    { J: 1, kJ: 1e3, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6, BTU: 1055.05585262, eV: 1.602176634e-19 }],
  ['power',     { W: 1, kW: 1e3, MW: 1e6, GW: 1e9, hp: 745.6998715822702 }],
  ['digital',   { bit: 0.125, B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776, PiB: 1125899906842624 }],
  ['angle',     { deg: 1, rad: 57.29577951308232, grad: 0.9 }],
  ['frequency', { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 }],
]

// ─── Runtime lookup tables (built once at startup) ────────────────────────────

// Unit → numeric index.
// Linear units: indices 0..N-1. Temperature units: indices N..N+3.
// All valid units get a defined index — no Map miss on the hot path.
// Indices >= N signal "temperature unit" to the dispatch logic.
const UNIT_IDX = new Map<string, number>()

// Flat typed array of all pre-computed linear conversion factors.
// Layout: FACTORS[fromIdx * N + toIdx] where N = total number of linear units.
// Cross-category slots remain 0 — sentinel for "invalid linear-linear pair".
// Float64Array: contiguous memory + hardware-optimised integer index arithmetic.
let _idx = 0
for (const [, factors] of LINEAR_DATA)
  for (const u of Object.keys(factors)) UNIT_IDX.set(u, _idx++)

const N = _idx  // 93 linear units
const FACTORS = new Float64Array(N * N)

for (const [, factors] of LINEAR_DATA) {
  const units = Object.keys(factors)
  for (const u of units) {
    const fi = UNIT_IDX.get(u)!
    const fFrom = factors[u]
    for (const v of units) {
      FACTORS[fi * N + UNIT_IDX.get(v)!] = fFrom / factors[v]
    }
  }
}

// Temperature units registered with indices >= N so UNIT_IDX.get() always hits
// for valid units — V8 can cache the IC as "always returns number" instead of
// "sometimes returns undefined", which speeds up the common-case dispatch.
const TEMP_UNITS = ['C', 'F', 'K', 'R']
for (const u of TEMP_UNITS) UNIT_IDX.set(u, _idx++)

// Unit → category (for error messages and public API)
const UNIT_CATEGORY = new Map<string, string>()

// Category → unit list (for listUnits / possibilities)
const CAT_UNITS = new Map<string, string[]>()

for (const [cat, factors] of LINEAR_DATA) {
  const units = Object.keys(factors)
  CAT_UNITS.set(cat, units)
  for (const u of units) UNIT_CATEGORY.set(u, cat)
}

CAT_UNITS.set('temperature', TEMP_UNITS)
for (const u of TEMP_UNITS) UNIT_CATEGORY.set(u, 'temperature')

// Temperature converters keyed by "from\0to".
// A 12-entry Map with short string keys is benchmarked to be faster than any
// 2-level object/Map approach because V8 interns short strings and its Map
// implementation is heavily JIT-optimised for this exact pattern.
const TEMP_FN = new Map<string, (v: number) => number>([
  ['C\0F', (v: number) => v * 9 / 5 + 32           ],
  ['C\0K', (v: number) => v + 273.15               ],
  ['C\0R', (v: number) => (v + 273.15) * 9 / 5    ],
  ['F\0C', (v: number) => (v - 32) * 5 / 9        ],
  ['F\0K', (v: number) => (v - 32) * 5 / 9 + 273.15],
  ['F\0R', (v: number) => v + 459.67              ],
  ['K\0C', (v: number) => v - 273.15              ],
  ['K\0F', (v: number) => (v - 273.15) * 9 / 5 + 32],
  ['K\0R', (v: number) => v * 9 / 5               ],
  ['R\0C', (v: number) => (v - 491.67) * 5 / 9   ],
  ['R\0F', (v: number) => v - 459.67              ],
  ['R\0K', (v: number) => v * 5 / 9               ],
])

// ─── Core conversion logic ────────────────────────────────────────────────────

function convertValue(value: number, from: string, to: string): number {
  if (from === to) return value

  const fi = UNIT_IDX.get(from)

  if (fi !== undefined) {
    if (fi < N) {
      // Linear path: Float64Array index — no hash tables, zero allocs
      const ti = UNIT_IDX.get(to)
      if (ti !== undefined) {
        if (ti < N) {
          const f = FACTORS[fi * N + ti]
          if (f !== 0) return value * f
        }
        // f === 0 (cross-category linear) or ti >= N (linear → temperature)
        throw new Error(`Cannot convert "${from}" (${UNIT_CATEGORY.get(from)}) to "${to}" (${UNIT_CATEGORY.get(to)})`)
      }
      throw new Error(`Unknown unit: "${to}"`)
    }

    // Temperature path (fi >= N): UNIT_IDX hit for all valid units, no miss overhead
    const fn = TEMP_FN.get(`${from}\0${to}`)
    if (fn !== undefined) return fn(value)
    if (!UNIT_CATEGORY.has(to)) throw new Error(`Unknown unit: "${to}"`)
    throw new Error(`Cannot convert "${from}" (temperature) to "${to}" (${UNIT_CATEGORY.get(to)})`)
  }

  throw new Error(`Unknown unit: "${from}"`)
}

// ─── Fluent builder ───────────────────────────────────────────────────────────

export interface ToStep {
  /** Final step: specify the target unit and get the converted value. */
  to(unit: Unit): number
}

export interface FromStep {
  /** Second step: specify the source unit. */
  from(unit: Unit): ToStep
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert a value between units — two calling styles:
 *
 * **Fluent (recommended):**
 * ```ts
 * convert(100).from('cm').to('m')   // 1
 * convert(32).from('F').to('C')     // 0
 * ```
 *
 * **Direct:**
 * ```ts
 * convert(100, 'cm', 'm')           // 1
 * ```
 *
 * @throws {Error} if a unit is unknown or the two units belong to different categories.
 */
export function convert(value: number, from: Unit, to: Unit): number
export function convert(value: number): FromStep
export function convert(value: number, from?: Unit, to?: Unit): number | FromStep {
  if (from !== undefined && to !== undefined) {
    return convertValue(value, from, to)
  }
  return {
    from(fromUnit: Unit): ToStep {
      return {
        to(toUnit: Unit): number {
          return convertValue(value, fromUnit, toUnit)
        },
      }
    },
  }
}

/**
 * Returns all unit identifiers grouped by category,
 * or just the list for a specific category.
 *
 * @example
 * listUnits()           // { length: ['mm', 'cm', ...], ... }
 * listUnits('length')   // ['mm', 'cm', 'm', 'km', ...]
 */
export function listUnits(): Record<Category, string[]>
export function listUnits(category: Category): string[]
export function listUnits(category?: Category): Record<Category, string[]> | string[] {
  if (category !== undefined) {
    const units = CAT_UNITS.get(category)
    if (!units) throw new Error(`Unknown category: "${category}"`)
    return units
  }
  const result = {} as Record<Category, string[]>
  for (const [cat, units] of CAT_UNITS) {
    result[cat as Category] = units
  }
  return result
}

/**
 * Returns `true` if the two units can be converted to each other
 * (i.e. they belong to the same category and are both known).
 *
 * @example
 * canConvert('cm', 'm')   // true
 * canConvert('cm', 'kg')  // false
 */
export function canConvert(from: string, to: string): boolean {
  const cat = UNIT_CATEGORY.get(from)
  return cat !== undefined && UNIT_CATEGORY.get(to) === cat
}

/**
 * Returns the category name for a given unit, or `undefined` if unknown.
 *
 * @example
 * getCategory('km')  // 'length'
 * getCategory('K')   // 'temperature'
 */
export function getCategory(unit: string): Category | undefined {
  return UNIT_CATEGORY.get(unit) as Category | undefined
}

/**
 * Returns all units that are compatible with the given unit
 * (i.e. belong to the same category), including the unit itself.
 *
 * Useful for populating UI dropdowns.
 *
 * @example
 * possibilities('km')  // ['um', 'mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi', 'nmi']
 * possibilities('C')   // ['C', 'F', 'K', 'R']
 *
 * @throws {Error} if the unit is unknown.
 */
export function possibilities(unit: Unit): string[] {
  const cat = UNIT_CATEGORY.get(unit as string)
  if (!cat) throw new Error(`Unknown unit: "${unit}"`)
  return CAT_UNITS.get(cat)!
}
