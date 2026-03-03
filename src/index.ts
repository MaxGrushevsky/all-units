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

// ─── Internal unit registry ───────────────────────────────────────────────────

type LinearEntry    = { factor: number }
type NonLinearEntry = { toBase: (v: number) => number; fromBase: (v: number) => number }
type UnitEntry      = LinearEntry | NonLinearEntry

function isLinear(e: UnitEntry): e is LinearEntry {
  return 'factor' in e
}

// US gallon = 231 in³ (exact definition), 1 in = 0.0254 m (exact)
const US_GAL_L = 231 * (0.0254 ** 3) * 1000  // 3.785411784 litres

const REGISTRY: Record<string, Record<string, UnitEntry>> = {
  // ── Length (base: metre) ────────────────────────────────────────────────────
  length: {
    um:  { factor: 1e-6        },  // micrometre
    mm:  { factor: 1e-3        },  // millimetre
    cm:  { factor: 1e-2        },  // centimetre
    m:   { factor: 1           },  // metre
    km:  { factor: 1e3         },  // kilometre
    in:  { factor: 0.0254      },  // inch
    ft:  { factor: 0.3048      },  // foot
    yd:  { factor: 0.9144      },  // yard
    mi:  { factor: 1609.344    },  // mile
    nmi: { factor: 1852        },  // nautical mile
  },

  // ── Mass (base: gram) ───────────────────────────────────────────────────────
  mass: {
    mg:  { factor: 1e-3        },  // milligram
    g:   { factor: 1           },  // gram
    kg:  { factor: 1e3         },  // kilogram
    t:   { factor: 1e6         },  // metric ton
    oz:  { factor: 28.349523125},  // ounce
    lb:  { factor: 453.59237   },  // pound
    st:  { factor: 6350.29318  },  // stone
  },

  // ── Temperature (base: Celsius) ─────────────────────────────────────────────
  temperature: {
    C: { toBase: v => v,                    fromBase: v => v                    },
    F: { toBase: v => (v - 32) * 5 / 9,    fromBase: v => v * 9 / 5 + 32      },
    K: { toBase: v => v - 273.15,           fromBase: v => v + 273.15          },
    R: { toBase: v => (v - 491.67) * 5 / 9, fromBase: v => v * 9 / 5 + 491.67 },
  },

  // ── Area (base: square metre) ───────────────────────────────────────────────
  area: {
    mm2:  { factor: 1e-6          },  // mm²
    cm2:  { factor: 1e-4          },  // cm²
    m2:   { factor: 1             },  // m²
    km2:  { factor: 1e6           },  // km²
    in2:  { factor: 6.4516e-4     },  // in²
    ft2:  { factor: 0.09290304    },  // ft²
    yd2:  { factor: 0.83612736    },  // yd²
    mi2:  { factor: 1609.344 ** 2  },  // mi² = (1609.344 m)²
    ha:   { factor: 1e4           },  // hectare
    ac:   { factor: 4046.8564224  },  // acre
  },

  // ── Volume (base: litre) ────────────────────────────────────────────────────
  volume: {
    ml:     { factor: 0.001              },  // millilitre
    cl:     { factor: 0.01               },  // centilitre
    dl:     { factor: 0.1                },  // decilitre
    l:      { factor: 1                  },  // litre
    m3:     { factor: 1000               },  // cubic metre
    // US customary units derived from the gallon to guarantee exact ratios
    // (3 tsp = 1 tbsp, 2 tbsp = 1 fl_oz, 8 fl_oz = 1 cup, 2 cup = 1 pt, etc.)
    tsp:    { factor: US_GAL_L / 768     },  // US teaspoon
    tbsp:   { factor: US_GAL_L / 256     },  // US tablespoon
    fl_oz:  { factor: US_GAL_L / 128     },  // US fluid ounce
    cup:    { factor: US_GAL_L / 16      },  // US cup
    pt:     { factor: US_GAL_L / 8       },  // US pint
    qt:     { factor: US_GAL_L / 4       },  // US quart
    gal:    { factor: US_GAL_L           },  // US gallon
    uk_gal: { factor: 4.54609            },  // UK gallon
  },

  // ── Time (base: second) ─────────────────────────────────────────────────────
  time: {
    ms:  { factor: 1e-3       },  // millisecond
    s:   { factor: 1          },  // second
    min: { factor: 60         },  // minute
    h:   { factor: 3600       },  // hour
    d:   { factor: 86400      },  // day
    wk:  { factor: 604800     },  // week
    mo:  { factor: 2629746    },  // month (avg = 30.4375 days)
    yr:  { factor: 31556952   },  // year  (avg = 365.2425 days)
  },

  // ── Speed (base: metre/second) ──────────────────────────────────────────────
  speed: {
    'm/s':  { factor: 1           },
    'km/h': { factor: 1 / 3.6     },
    mph:    { factor: 0.44704     },
    knot:   { factor: 1852 / 3600 },  // = 0.51̄4̄ m/s (exact)
    'ft/s': { factor: 0.3048      },
  },

  // ── Pressure (base: Pascal) ─────────────────────────────────────────────────
  pressure: {
    Pa:   { factor: 1          },
    kPa:  { factor: 1e3        },
    MPa:  { factor: 1e6        },
    bar:  { factor: 1e5        },
    atm:  { factor: 101325     },
    psi:  { factor: 0.45359237 * 9.80665 / (0.0254 ** 2) },  // lbf/in² → Pa
    mmHg: { factor: 13595.1 * 9.80665 * 0.001  },  // conventional mmHg
    inHg: { factor: 13595.1 * 9.80665 * 0.0254 },  // = mmHg × 25.4  (1 in = 25.4 mm)
  },

  // ── Energy (base: Joule) ────────────────────────────────────────────────────
  energy: {
    J:    { factor: 1            },
    kJ:   { factor: 1e3          },
    cal:  { factor: 4.184        },  // thermochemical calorie
    kcal: { factor: 4184         },  // kilocalorie
    Wh:   { factor: 3600         },
    kWh:  { factor: 3.6e6        },
    BTU:  { factor: 1055.05585262 },  // IT (International Table) BTU
    eV:   { factor: 1.602176634e-19 },
  },

  // ── Power (base: Watt) ──────────────────────────────────────────────────────
  power: {
    W:   { factor: 1        },
    kW:  { factor: 1e3      },
    MW:  { factor: 1e6      },
    GW:  { factor: 1e9      },
    hp:  { factor: 550 * 0.3048 * 0.45359237 * 9.80665 },  // 550 ft·lbf/s → W
  },

  // ── Digital storage (base: byte) ────────────────────────────────────────────
  digital: {
    bit: { factor: 0.125          },  // 1/8 byte
    B:   { factor: 1              },  // byte
    KB:  { factor: 1e3            },  // kilobyte  (SI)
    MB:  { factor: 1e6            },  // megabyte  (SI)
    GB:  { factor: 1e9            },  // gigabyte  (SI)
    TB:  { factor: 1e12           },  // terabyte  (SI)
    PB:  { factor: 1e15           },  // petabyte  (SI)
    KiB: { factor: 1024           },  // kibibyte  (IEC)
    MiB: { factor: 1048576        },  // mebibyte  (IEC)
    GiB: { factor: 1073741824     },  // gibibyte  (IEC)
    TiB: { factor: 1099511627776  },  // tebibyte  (IEC)
    PiB: { factor: 1125899906842624 },// pebibyte  (IEC)
  },

  // ── Angle (base: degree) ────────────────────────────────────────────────────
  angle: {
    deg:  { factor: 1                },  // degree
    rad:  { factor: 180 / Math.PI   },  // radian  → 57.2958°
    grad: { factor: 0.9              },  // gradian (400 grad = 360°)
  },

  // ── Frequency (base: Hertz) ─────────────────────────────────────────────────
  frequency: {
    Hz:  { factor: 1    },
    kHz: { factor: 1e3  },
    MHz: { factor: 1e6  },
    GHz: { factor: 1e9  },
  },
}

// ─── Build unit→category lookup (computed once at startup) ───────────────────

const UNIT_CATEGORY: Record<string, string> = {}
for (const [category, units] of Object.entries(REGISTRY)) {
  for (const unit of Object.keys(units)) {
    UNIT_CATEGORY[unit] = category
  }
}

// ─── Core conversion logic ────────────────────────────────────────────────────

function convertValue(value: number, from: string, to: string): number {
  if (from === to) return value

  const category = UNIT_CATEGORY[from]
  if (!category) throw new Error(`Unknown unit: "${from}"`)
  if (!UNIT_CATEGORY[to]) throw new Error(`Unknown unit: "${to}"`)
  if (UNIT_CATEGORY[to] !== category) {
    throw new Error(
      `Cannot convert "${from}" (${category}) to "${to}" (${UNIT_CATEGORY[to]})`
    )
  }

  const units = REGISTRY[category]
  const fromDef = units[from]
  const toDef   = units[to]

  // Convert to base unit
  const base = isLinear(fromDef)
    ? value * fromDef.factor
    : fromDef.toBase(value)

  // Convert from base unit
  return isLinear(toDef)
    ? base / toDef.factor
    : toDef.fromBase(base)
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
    const units = REGISTRY[category]
    if (!units) throw new Error(`Unknown category: "${category}"`)
    return Object.keys(units)
  }
  const result = {} as Record<Category, string[]>
  for (const [cat, units] of Object.entries(REGISTRY)) {
    result[cat as Category] = Object.keys(units)
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
  const cat = UNIT_CATEGORY[from]
  return cat !== undefined && UNIT_CATEGORY[to] === cat
}

/**
 * Returns the category name for a given unit, or `undefined` if unknown.
 *
 * @example
 * getCategory('km')  // 'length'
 * getCategory('K')   // 'temperature'
 */
export function getCategory(unit: string): Category | undefined {
  return UNIT_CATEGORY[unit] as Category | undefined
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
  const cat = UNIT_CATEGORY[unit as string]
  if (!cat) throw new Error(`Unknown unit: "${unit}"`)
  return Object.keys(REGISTRY[cat])
}
