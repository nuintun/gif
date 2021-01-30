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
for (let i: i32 = 0; i < 16; ++i) {
  const offset: i32 = i * 16;

  for (let j: i32 = 0; j < 16; ++j) {
    mapping[offset + j] = alphabet.charAt(i) + alphabet.charAt(j);
  }
}
