/**
 * @module utils
 */

/**
 * @function assertPalette
 * @param {i32} palette
 * @returns {i32}
 */
export function assertPalette(palette: i32[]): i32 {
  const length: i32 = palette.length;

  if (length == 0) {
    return length;
  }

  if (length < 2 || length > 256 || length & (length - 1)) {
    throw new RangeError('Invalid color length ' + length + ', must be power of 2 and [0, 2 - 256]');
  }

  for (let i = 0; i < length; i++) {
    const color: i32 = palette[i];

    if (color < 0x000000 || color > 0xffffff) {
      throw new RangeError('Invalid color ' + color + ' at ' + i + ', must be [0x000000 - 0xffffff]');
    }
  }

  return length;
}

export function assertBackground(background: i32, palette: i32[]): i32 {
  const max: i32 = palette.length - 1;

  if (background < 0 || background > max) {
    throw new RangeError('Invalid background, must be [0 - ' + max + ']');
  }

  return background;
}

export function assertRepeat(count: i32): i32 {
  if (count < -1 || count > 0xffff) {
    throw new RangeError('Invalid count, must be [-1 - 65535]');
  }

  return count;
}
