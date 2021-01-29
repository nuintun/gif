/**
 * @module utils
 */

/**
 * @function assertPalette
 * @param {u32} palette
 * @returns {i32}
 */
export function assertPalette(palette: u32[]): i32 {
  const length: i32 = palette.length;

  if (length < 2 || length > 256 || length & (length - 1)) {
    throw new RangeError('Invalid color length ' + length + ', must be power of 2 and [2 - 256].');
  }

  for (let i = 0; i < length; i++) {
    const color: u32 = palette[i];

    if (color > 0xffffff) {
      throw new RangeError('Invalid color ' + color + ' at ' + i + ', must be [0x000000 - 0xffffff].');
    }
  }

  return length;
}

export function assertBackground(background: i32, palette: u32[]): i32 {
  const max: i32 = palette.length - 1;

  if (background < 0 || background > max) {
    throw new RangeError('Invalid background, must be power of 2 and [0 - ' + max + '].');
  }

  return background;
}
