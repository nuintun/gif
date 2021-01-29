/**
 * @module Hex
 */

/**
 * @type {string[]}
 * @description 已获得的 hex 映射表
 */
export const mapping: string[] = [];

// 字母映射表
const alphabet: string = '0123456789abcdef';

// 生成映射表
for (let i: u8 = 0; i < 16; ++i) {
  const offset: u8 = i * 16;

  for (let j: u8 = 0; j < 16; ++j) {
    mapping[offset + j] = alphabet.charAt(i) + alphabet.charAt(j);
  }
}
