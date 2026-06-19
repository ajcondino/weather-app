import type { WeatherCondition } from '#/api/types';
import { WEATHER_VISUALS } from './weatherVisuals';

// ─── Base Palettes ────────────────────────────────────────────────────────
// Each is a 3-stop gradient (top, middle, bottom of screen), tuned for a
// clear sky. Overcast/fog/rain etc. don't get their own hand-picked palette —
// they're derived by blending the relevant base toward a gray, controlled by
// `overcastAmount`. This is what gives continuous variation instead of one
// fixed look per condition.

const DAY_CLEAR = ['#4FA8E8', '#7FC4F0', '#B8E0F5'] as const;
const NIGHT_CLEAR = ['#0B1026', '#1B2440', '#2E3A5C'] as const;

// Gray target each palette desaturates toward as overcastAmount increases.
const DAY_OVERCAST_TARGET = '#8E97A3';
const NIGHT_OVERCAST_TARGET = '#1C1F26';

export type SkyGradient = readonly [string, string, string];

// ─── Color Blending ───────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Linear-interpolates between two hex colors. t = 0 → a, t = 1 → b. */
function blendHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Returns a 3-stop sky gradient for a given condition + time of day.
 * Stops go top → bottom, suitable for expo-linear-gradient's `colors` prop.
 */
export function getSkyGradient(condition: WeatherCondition, isDay: boolean): SkyGradient {
  const base = isDay ? DAY_CLEAR : NIGHT_CLEAR;
  const grayTarget = isDay ? DAY_OVERCAST_TARGET : NIGHT_OVERCAST_TARGET;
  const { overcastAmount } = WEATHER_VISUALS[condition];

  return base.map((stop) => blendHex(stop, grayTarget, overcastAmount)) as unknown as SkyGradient;
}
