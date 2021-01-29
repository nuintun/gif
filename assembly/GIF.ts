/**
 * @module GIF
 */

import ByteArray from './ByteArray';
import { assertBackground, assertPalette } from './utils';

export default class GIF {
  public readonly width: u16;
  public readonly height: u16;
  private _buffer: ByteArray;
  private _backgroundIndex: i32 = 0;
  private _palette: u32[] = [0x000000, 0xffffff];

  constructor(width: u16, height: u16) {
    this.width = width;
    this.height = height;
    this._buffer = new ByteArray(width * height);
  }

  public set palette(palette: u32[]) {
    assertPalette(palette);

    this._palette = palette;
  }

  public get palette(): u32[] {
    return this._palette;
  }

  public set background(index: i32) {
    assertBackground(index, this._palette);

    this._backgroundIndex = index;
  }

  public get background(): i32 {
    return this._backgroundIndex;
  }
}
