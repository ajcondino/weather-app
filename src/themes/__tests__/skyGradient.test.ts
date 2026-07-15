import { getSkyGradient } from '../skyGradient';

// Normalizes case so hex color comparisons don't fail on #ABC vs #abc
function normalizeColors(colors: readonly string[]): string[] {
  return colors.map((c) => c.toLowerCase());
}

describe('getSkyGradient', () => {
  describe('clear conditions (no blending)', () => {
    it('returns the exact day palette unchanged', () => {
      expect(normalizeColors(getSkyGradient('clear', true))).toEqual([
        '#4fa8e8',
        '#7fc4f0',
        '#b8e0f5',
      ]);
    });

    it('returns the exact night palette unchanged', () => {
      expect(normalizeColors(getSkyGradient('clear', false))).toEqual([
        '#0b1026',
        '#1b2440',
        '#2e3a5c',
      ]);
    });
  });

  describe('overcast blending (day)', () => {
    it('blends partly_cloudy slightly toward gray', () => {
      expect(normalizeColors(getSkyGradient('partly_cloudy', true))).toEqual([
        '#5ca5da',
        '#82bbe1',
        '#b0d1e5',
      ]);
    });

    it('blends thunderstorm heavily toward gray', () => {
      expect(normalizeColors(getSkyGradient('thunderstorm', true))).toEqual([
        '#8899aa',
        '#8d9cab',
        '#929eab',
      ]);
    });
  });

  describe('overcast blending (night)', () => {
    it('blends drizzle toward the night gray target', () => {
      expect(getSkyGradient('drizzle', false)).toEqual(['#151926', '#1c2130', '#232a3c']);
    });
  });

  describe('general behavior', () => {
    it('always returns exactly 3 color stops', () => {
      const result = getSkyGradient('rain', true);
      expect(result).toHaveLength(3);
    });

    it('always returns valid 6-digit hex colors', () => {
      const result = getSkyGradient('fog', false);
      result.forEach((stop) => {
        expect(stop).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('produces different results as overcastAmount increases', () => {
      const clear = getSkyGradient('clear', true);
      const partlyCloudy = getSkyGradient('partly_cloudy', true);
      const overcast = getSkyGradient('overcast', true);

      expect(partlyCloudy).not.toEqual(clear);
      expect(overcast).not.toEqual(partlyCloudy);
    });

    it('uses a different base palette for day vs night, same condition', () => {
      const day = getSkyGradient('snow', true);
      const night = getSkyGradient('snow', false);

      expect(day).not.toEqual(night);
    });
  });
});
