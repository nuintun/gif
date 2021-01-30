/**
 * @module utils
 */

/**
 * @function calcBestLength
 * @description 计算适合的 ByteArray 长度
 * @param {i32} length 数据字节总大小
 * @param {u16} pageSize 缓冲区页大小
 * @returns {i32}
 */
export function calcBestLength(length: i32, pageSize: u16): i32 {
  if (length > (pageSize as i32)) {
    const pages: i32 = Math.ceil(length / pageSize) as i32;

    return pages * pageSize;
  } else {
    return length;
  }
}

/**
 * @function stringEncode
 * @description 用指定编码编码字符串
 * @param {string} value 需要编码的字符串
 * @param {string} encoding 字符串编码
 * @returns {ArrayBuffer}
 */
export function stringEncode(value: string, encoding: string): ArrayBuffer {
  const formatted = encoding.toUpperCase();

  if (formatted == 'UTF8' || formatted == 'UTF-8') {
    return String.UTF8.encode(value);
  }

  if (formatted == 'UTF16' || formatted == 'UTF-16') {
    return String.UTF16.encode(value);
  }

  throw new TypeError('Unsupported encoding ' + encoding);
}

/**
 * @function stringDecode
 * @description 用指定编码解码字符串数据
 * @param {ArrayBuffer} bytes 需要解码的字符串数据
 * @param {string} encoding 字符串编码
 * @returns {string}
 */
export function stringDecode(bytes: ArrayBuffer, encoding: string): string {
  const formatted = encoding.toUpperCase();

  if (formatted == 'UTF8' || formatted == 'UTF-8') {
    return String.UTF8.decode(bytes);
  }

  if (formatted == 'UTF16' || formatted == 'UTF-16') {
    return String.UTF16.decode(bytes);
  }

  throw new TypeError('Unsupported encoding ' + encoding);
}
