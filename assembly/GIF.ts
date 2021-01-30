/**
 * @module GIF
 */

import ByteArray from './ByteArray';
import { assertBackground, assertPalette, assertRepeat } from './utils';

function calcColorsInfo(palette: i32[]): i32[] {
  let size: i32 = 0;
  let length: i32 = palette.length;

  while ((length >>= 1)) ++size;

  length = 1 << size--;

  return [length, size];
}

export default class GIF {
  public readonly width: u16;
  public readonly height: u16;

  private _repeat: i32 = -1;
  private _buffer: ByteArray;
  private _background: i32 = 0;
  private _palette: i32[] = [0x000000, 0xffffff];

  constructor(width: u16, height: u16) {
    this.width = width;
    this.height = height;
    this._buffer = new ByteArray(width * height * 9);
  }

  public set repeat(count: i32) {
    assertRepeat(count);

    this._repeat = count;
  }

  public get repeat(): i32 {
    return this._repeat;
  }

  public set palette(palette: i32[]) {
    assertPalette(palette);

    this._palette = palette;
  }

  public get palette(): i32[] {
    return this._palette;
  }

  public set background(index: i32) {
    assertBackground(index, this._palette);

    this._background = index;
  }

  public get background(): i32 {
    return this._background;
  }

  private writeHeader() {
    const buffer: ByteArray = this._buffer;

    buffer.writeUint8(0x47); // G
    buffer.writeUint8(0x49); // I
    buffer.writeUint8(0x46); // F
    buffer.writeUint8(0x38); // 8
    buffer.writeUint8(0x39); // 9
    buffer.writeUint8(0x61); // a
  }

  private writeLSD() {
    const buffer: ByteArray = this._buffer;

    buffer.writeUint16(this.width, true);
    buffer.writeUint16(this.height, true);
    buffer.writeUint8();
    buffer.writeUint8(this._background);
  }

  private writeGCT() {}

  private writeImageDesc() {}
}
