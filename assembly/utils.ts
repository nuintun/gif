/**
 * @module utils
 */

/**
 * @function paletteAssert
 * @param {u32} palette
 * @returns {i32}
 */
export function paletteAssert(palette: u32[]): i32 {
  const { length } = palette;

  if (length < 2 || length > 256 || length & (length - 1)) {
    throw new RangeError('Invalid color length ' + length + ', must be power of 2 and [2 - 256].');
  }

  for (let i = 0; i < length; i++) {
    const color = palette[i];

    if (color > 0xffffff) {
      throw new RangeError('Invalid color ' + color + ' at ' + i + ', must be [0x000000 - 0xffffff].');
    }
  }

  return length;
}
