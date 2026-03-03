# all-units

> Universal unit converter — 13 categories, 100+ units. Zero dependencies. TypeScript-first.

[![npm](https://img.shields.io/npm/v/all-units)](https://www.npmjs.com/package/all-units)
[![license](https://img.shields.io/npm/l/all-units)](./LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/MaxGrushevsky/all-units/ci.yml)](https://github.com/MaxGrushevsky/all-units/actions)

## Features

- **13 categories**: length, mass, temperature, area, volume, time, speed, pressure, energy, power, digital storage, angle, frequency
- **100+ units** with precise conversion factors
- **Fluent API**: `convert(100).from('cm').to('m')` — readable and chainable
- **Direct API**: `convert(100, 'cm', 'm')` — compact one-liner
- Full **TypeScript types** with IDE autocomplete for all unit names
- Throws a clear error when units are incompatible (different categories)
- **Zero runtime dependencies**
- Works in Node.js, Deno, Bun, and modern browsers
- ESM + CommonJS dual build

## Install

```bash
npm install all-units
# or
pnpm add all-units
# or
yarn add all-units
```

## Usage

```ts
import { convert } from 'all-units'

// Fluent API (recommended)
convert(100).from('cm').to('m')          // 1
convert(1).from('km').to('mi')           // 0.621371
convert(0).from('C').to('F')             // 32
convert(100).from('C').to('F')           // 212
convert(1).from('kg').to('lb')           // 2.204623
convert(1).from('kWh').to('J')           // 3600000
convert(1).from('GB').to('MB')           // 1000   (SI)
convert(1).from('GiB').to('MiB')         // 1024   (IEC)
convert(180).from('deg').to('rad')       // 3.14159 (π)
convert(1).from('atm').to('bar')         // 1.01325

// Direct API
convert(1000, 'm', 'km')                 // 1
convert(32, 'F', 'C')                    // 0
```

CommonJS (require) is also supported:

```js
const { convert } = require('all-units')

convert(1, 'mi', 'km')  // 1.609344
```

## API

### `convert(value, from, to)`

**Direct style** — pass value, source unit and target unit in one call.

```ts
convert(value: number, from: Unit, to: Unit): number
```

### `convert(value).from(unit).to(unit)`

**Fluent style** — build the conversion step by step.

```ts
convert(value: number): FromStep
// .from(unit).to(unit) → number
```

Both styles throw `Error` if:
- A unit string is unknown
- The two units belong to different categories (e.g. `'cm'` → `'kg'`)

### `canConvert(from, to)`

Returns `true` if the two units are in the same category.

```ts
canConvert('cm', 'm')    // true
canConvert('cm', 'kg')   // false
canConvert('xyz', 'm')   // false
```

### `getCategory(unit)`

Returns the category name of a unit, or `undefined` if unknown.

```ts
getCategory('km')    // 'length'
getCategory('C')     // 'temperature'
getCategory('GiB')   // 'digital'
```

### `possibilities(unit)`

Returns all units that are compatible with the given unit (same category). Useful for populating UI dropdowns.

```ts
possibilities('km')  // ['um', 'mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi', 'nmi']
possibilities('C')   // ['C', 'F', 'K', 'R']
possibilities('GB')  // ['bit', 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
```

### `listUnits()`

Returns all units grouped by category, or just the list for one category.

```ts
listUnits()            // { length: ['mm', 'cm', 'm', ...], temperature: [...], ... }
listUnits('length')    // ['um', 'mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi', 'nmi']
```

## Supported units

### Length
| Unit | Name |
|---|---|
| `um` | Micrometre |
| `mm` | Millimetre |
| `cm` | Centimetre |
| `m` | Metre |
| `km` | Kilometre |
| `in` | Inch |
| `ft` | Foot |
| `yd` | Yard |
| `mi` | Mile |
| `nmi` | Nautical mile |

### Mass
| Unit | Name |
|---|---|
| `mg` | Milligram |
| `g` | Gram |
| `kg` | Kilogram |
| `t` | Metric ton |
| `oz` | Ounce |
| `lb` | Pound |
| `st` | Stone |

### Temperature
| Unit | Name |
|---|---|
| `C` | Celsius |
| `F` | Fahrenheit |
| `K` | Kelvin |
| `R` | Rankine |

### Area
`mm2` `cm2` `m2` `km2` `in2` `ft2` `yd2` `mi2` `ha` (hectare) `ac` (acre)

### Volume
`ml` `cl` `dl` `l` `m3` `tsp` `tbsp` `fl_oz` `cup` `pt` `qt` `gal` (US) `uk_gal` (UK)

### Time
`ms` `s` `min` `h` `d` `wk` `mo` `yr`

### Speed
`m/s` `km/h` `mph` `knot` `ft/s`

### Pressure
`Pa` `kPa` `MPa` `bar` `atm` `psi` `mmHg` `inHg`

### Energy
`J` `kJ` `cal` `kcal` `Wh` `kWh` `BTU` `eV`

### Power
`W` `kW` `MW` `GW` `hp`

### Digital storage
| Unit | Standard | Size |
|---|---|---|
| `bit` | — | 1 bit |
| `B` | — | 1 byte |
| `KB` `MB` `GB` `TB` `PB` | SI (powers of 10) | 10³ … 10¹⁵ bytes |
| `KiB` `MiB` `GiB` `TiB` `PiB` | IEC (powers of 2) | 2¹⁰ … 2⁵⁰ bytes |

### Angle
`deg` (degree) `rad` (radian) `grad` (gradian)

### Frequency
`Hz` `kHz` `MHz` `GHz`

## Development

```bash
git clone https://github.com/MaxGrushevsky/unit-convert.git
cd unit-convert
npm install

npm run build         # compile to dist/
npm test              # run tests once
npm run test:watch    # run tests in watch mode
npm run typecheck     # TypeScript type-check only
```

## License

[MIT](./LICENSE)
